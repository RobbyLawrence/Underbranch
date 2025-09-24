import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

// IMPORTANT: Connect to the backend server's port (3001)
const socket = io('http://localhost:3001');

function App() {
  const [text, setText] = useState('');
  const skipEmit = useRef(false);

  useEffect(() => {
    // Listen for text updates from the server
    socket.on('text-update', (newText) => {
      skipEmit.current = true;
      setText(newText);
    });
    // Cleanup on unmount
    return () => socket.off('text-update');
  }, []);

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    if (!skipEmit.current) {
      socket.emit('text-changed', newText);
    }
    skipEmit.current = false;
  };

  return (
    <div style={{ margin: 40 }}>
      <h2>Collaborative Text Editor Demo</h2>
      <textarea
        value={text}
        onChange={handleChange}
        rows={12}
        cols={70}
        style={{ fontSize: 16 }}
      />
      <p>Open this page in two browser windows or tabs to see real-time collaboration.</p>
    </div>
  );
}

export default App;
