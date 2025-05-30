'use client';

import { useEffect, useState } from 'react';
import ChatBox from './ChatBox';
import axios from 'axios';
import UsernamePopup from './UsernamePopup';

const API_BASE_URL = 'https://localhost:7055';
const API_URL = `${API_BASE_URL}/api/ChatMessage`;
const HUB_URL = `${API_BASE_URL}/chathub`;

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  useEffect(() => {
    const startSignalR = async () => {
      try {
        setConnectionStatus('connecting');
        const signalR = await import('@microsoft/signalr');

        const conn = new signalR.HubConnectionBuilder()
          .withUrl(HUB_URL, {
            withCredentials: false,
            transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling
          })
          .withAutomaticReconnect({
            nextRetryDelayInMilliseconds: retryContext => {
              if (retryContext.previousRetryCount === 0) {
                return 0;
              }
              return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount - 1), 30000);
            }
          })
          .configureLogging(signalR.LogLevel.Information)
          .build();

        conn.on('ReceiveMessage', (sender, message, sentiment) => {
          setMessages((prev) => [...prev, { 
            sender, 
            text: message, 
            sentiment: sentiment || 'neutral' 
          }]);
        });

        conn.onclose(() => {
          setConnectionStatus('disconnected');
          console.log('SignalR connection closed');
        });

        conn.onreconnecting(() => {
          setConnectionStatus('reconnecting');
          console.log('SignalR reconnecting...');
        });

        conn.onreconnected(() => {
          setConnectionStatus('connected');
          console.log('SignalR reconnected');
        });

        await conn.start();
        setConnection(conn);
        setConnectionStatus('connected');
        console.log('SignalR connection established');
      } catch (error) {
        console.error('SignalR connection failed:', error);
        setConnectionStatus('error');
      }
    };

    const loadMessages = async () => {
      try {
        const response = await axios.get(API_URL, {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
        
        const loaded = response.data.map((msg) => ({
          sender: msg.username,
          text: msg.message,
          sentiment: msg.sentiment || 'neutral'
        }));
        setMessages(loaded);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // You can add Toast notification here
      }
    };

    loadMessages();
    startSignalR();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, []);

  const handleSendMessage = async (text) => {
    if (!connection || connectionStatus !== 'connected') {
      console.error('No connection available');
      alert('Connection unavailable. Please try again later.');
      return;
    }

    if (!username.trim()) {
      alert('Please enter your username');
      return;
    }

    const message = { username: username.trim(), message: text.trim() };
    
    try {
      await connection.invoke('SendMessage', message);
    } catch (err) {
      console.error('Send error:', err);
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <>
      <UsernamePopup onUsernameSet={setUsername} />
      <div>
        {connectionStatus !== 'connected' && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: connectionStatus === 'error' ? '#ffebee' : '#fff3e0',
            color: connectionStatus === 'error' ? '#c62828' : '#f57c00',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'reconnecting' && 'Reconnecting...'}
            {connectionStatus === 'disconnected' && 'Disconnected from chat'}
            {connectionStatus === 'error' && 'Chat connection error'}
          </div>
        )}
        <ChatBox 
          messages={messages} 
          onSendMessage={handleSendMessage}
          disabled={connectionStatus !== 'connected'}
        />
      </div>
    </>
  );
}