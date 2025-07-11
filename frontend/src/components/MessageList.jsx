import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

const MessageList = ({ messages, username }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div className="messages-area">
            {messages.map((msg, index) => (
                <div key={index} className={`message-wrapper ${msg.sender === username ? 'sent' : 'received'}`}>
                    <div className="message">
                        <div className="message-sender">{msg.sender === 'AI' ? 'AI Assistant' : msg.sender}</div>
                        <div className="message-content">
                            <ReactMarkdown>{String(msg.content || msg.message || '')}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;
