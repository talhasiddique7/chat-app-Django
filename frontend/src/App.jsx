import React, { useState, useEffect, useRef, useCallback } from 'react';
import Login from './components/Login';
import ChatWindow from './components/ChatWindow';

function App() {
    const [messages, setMessages] = useState([]);
    const [username, setUsername] = useState('');
    const [room] = useState('general');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const ws = useRef(null);

    const fetchMessages = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8002/api/messages/${room}/`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    }, [room]);

    const connectWebSocket = useCallback(() => {
        ws.current = new WebSocket(`ws://localhost:8002/ws/chat/${room}/`);

        ws.current.onopen = () => console.log('WebSocket connected');
        ws.current.onclose = () => console.log('WebSocket disconnected');
        ws.current.onerror = (error) => console.error('WebSocket error:', error);

        ws.current.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setMessages(prevMessages => [...prevMessages, data]);
        };
    }, [room]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchMessages();
            connectWebSocket();
        }
        return () => {
            if (ws.current) {
                ws.current.close();
            }
        };
    }, [isLoggedIn, fetchMessages, connectWebSocket]);

    const handleLogin = (name) => {
        setUsername(name);
        setIsLoggedIn(true);
    };

    const handleSendMessage = (message) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messageData = {
                message: message,
                sender: username,
            };
            ws.current.send(JSON.stringify(messageData));
        }
    };

    return (
        <div className="app-container">
            {!isLoggedIn ? (
                <Login onLogin={handleLogin} />
            ) : (
                <ChatWindow
                    messages={messages}
                    username={username}
                    room={room}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    );
}

export default App;
