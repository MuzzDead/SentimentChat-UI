'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

export default function ChatBox({ messages, onSendMessage, disabled }) {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Check for username changes periodically or on focus
  const checkUsername = () => {
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('username') || '';
      setUsername(storedName);
    }
  };

  // Initial username load and setup interval to check for changes
  useEffect(() => {
    checkUsername();
    
    // Check for username changes every second
    const interval = setInterval(checkUsername, 1000);
    
    // Also check when window gains focus
    const handleFocus = () => checkUsername();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (username && inputRef.current) {
      inputRef.current.focus();
    }
  }, [username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      if (!username) {
        alert('Please enter your name before sending messages.');
        return;
      }
      onSendMessage(input.trim());
      setInput('');
      inputRef.current?.focus();
    }
  };

  if (!username) {
    return (
      <Paper
        elevation={3}
        sx={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 18,
          color: '#555',
        }}
      >
        Username not set. Please enter your name.
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        margin: '16px auto',
        maxWidth: 600,
        width: '100%',
        backgroundColor: '#f9f9f9',
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      {/* Chat messages */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((msg, index) => {
          const isMine = msg.sender === username;

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  backgroundColor: isMine ? '#0D92F4' : '#e0e0e0',
                  color: isMine ? '#fff' : '#000',
                  borderRadius: 3,
                  padding: '8px 12px',
                  maxWidth: '70%',
                  boxShadow: 1,
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {msg.sender}
                </Typography>
                <Typography variant="body1">{msg.text}</Typography>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      {/* Message input */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          borderTop: '1px solid #ccc',
          padding: 2,
          backgroundColor: '#fff',
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          inputRef={inputRef}
          disabled={disabled}
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          type="submit"
          disabled={disabled}
          sx={{
            backgroundColor: '#0D92F4',
            '&:hover': { backgroundColor: '#0a76c9' },
            borderRadius: '8px',
            paddingX: 3,
          }}
        >
          Send
        </Button>
      </Box>
    </Paper>
  );
}