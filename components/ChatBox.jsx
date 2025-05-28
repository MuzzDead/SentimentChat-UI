'use client';

import { useEffect, useRef, useState } from 'react';
import { Box, TextField, Button, Paper, Typography } from '@mui/material';

export default function ChatBox({ messages, onSendMessage }) {
  const [input, setInput] = useState('');
  const [username, setUsername] = useState('');
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Зчитуємо username з sessionStorage один раз після монтування компонента
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = sessionStorage.getItem('username') || '';
      setUsername(storedName);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      if (!username) {
        alert('Будь ласка, введіть ім’я перед відправкою повідомлень.');
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
        Ім’я користувача не встановлено. Будь ласка, введіть ім’я.
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
          autoFocus
          sx={{ mr: 2 }}
        />
        <Button
          variant="contained"
          type="submit"
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
