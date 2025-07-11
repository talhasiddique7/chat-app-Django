import React from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ messages, username, room, onSendMessage }) => {
    return (
        <div className="chat-container">
            <div className="chat-header">
                <h2>Chat Room: {room}</h2>
                <span>Welcome, {username}</span>
            </div>
            <MessageList messages={messages} username={username} />
            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatWindow;
