'use client';

import { useEffect, useState } from 'react';
import ChatBox from './ChatBox';
import axios from 'axios';
import UsernamePopup from './UsernamePopup';

const API_URL = 'https://localhost:7055/api/ChatMessage';

export default function ChatContainer() {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const startSignalR = async () => {
      const signalR = await import('@microsoft/signalr');

      const conn = new signalR.HubConnectionBuilder()
        .withUrl('https://localhost:7055/chathub')
        .withAutomaticReconnect()
        .build();

      conn.on('ReceiveMessage', (sender, message) => {
        setMessages((prev) => [...prev, { sender, text: message }]);
      });

      await conn.start();
      setConnection(conn);
    };

    axios.get(API_URL).then((res) => {
      const loaded = res.data.map((msg) => ({
        sender: msg.username,
        text: msg.message,
      }));
      setMessages(loaded);
    });

    startSignalR();

    return () => {
      if (connection) connection.stop();
    };
  }, []);

  const handleSendMessage = async (text) => {
    const message = { username, message: text };
    try {
      await connection.invoke('SendMessage', message);
    } catch (err) {
      console.error('Send error:', err);
    }
  };

  return (
    <>
      <UsernamePopup onUsernameSet={setUsername} />
      <ChatBox messages={messages} onSendMessage={handleSendMessage} />
    </>
  );
}
