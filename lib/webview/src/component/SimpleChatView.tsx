import React, { useState, useRef, useEffect } from 'react';
import { webviewApi, personality } from '@rubberduck/common';
import ReactMarkdown from 'react-markdown';

const { CHARACTERS } = personality;
type Character = personality.Character;

interface SimpleChatViewProps {
    conversation: webviewApi.Conversation;
    character?: Character;
    onSendMessage: (message: string) => void;
}

export const SimpleChatView: React.FC<SimpleChatViewProps> = ({
    conversation,
    character,
    onSendMessage,
}) => {
    const [inputText, setInputText] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const content = conversation.content;

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [content]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    if (content.type !== 'messageExchange') {
        return null;
    }

    const charInfo = character ? CHARACTERS[character] : null;
    const isWaiting = content.state.type === 'waitingForBotAnswer';
    const isStreaming = content.state.type === 'botAnswerStreaming';
    const canReply = content.state.type === 'userCanReply';

    return (
        <div className="simple-chat-container">
            {/* Chat Header */}
            {charInfo && (
                <div className="chat-header">
                    <img
                        src={`${(window as any).assetBaseUri}/${charInfo.image}`}
                        alt={charInfo.name}
                        className="chat-header-avatar"
                    />
                    <div className="chat-header-info">
                        <span className="chat-header-name">{charInfo.name}</span>
                        <span className="chat-header-status">
                            {isWaiting || isStreaming ? 'Typing...' : 'Online'}
                        </span>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="chat-messages">
                {content.messages.map((message, i) => (
                    <div
                        key={i}
                        className={`chat-bubble ${message.author === 'user' ? 'user' : 'bot'}`}
                    >
                        {message.author === 'bot' && charInfo && (
                            <img
                                src={`${(window as any).assetBaseUri}/${charInfo.image}`}
                                alt={charInfo.name}
                                className="bubble-avatar"
                            />
                        )}
                        <div className="bubble-content">
                            {message.author === 'user' ? (
                                message.content
                            ) : (
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            )}
                        </div>
                    </div>
                ))}

                {/* Streaming/Waiting state */}
                {isStreaming && (
                    <div className="chat-bubble bot">
                        {charInfo && (
                            <img
                                src={`${(window as any).assetBaseUri}/${charInfo.image}`}
                                alt={charInfo.name}
                                className="bubble-avatar"
                            />
                        )}
                        <div className="bubble-content">
                            <ReactMarkdown>
                                {(content.state as any).partialAnswer ?? ''}
                            </ReactMarkdown>
                            <span className="typing-indicator">●●●</span>
                        </div>
                    </div>
                )}

                {isWaiting && (
                    <div className="chat-bubble bot">
                        {charInfo && (
                            <img
                                src={`${(window as any).assetBaseUri}/${charInfo.image}`}
                                alt={charInfo.name}
                                className="bubble-avatar"
                            />
                        )}
                        <div className="bubble-content typing">
                            <span className="typing-indicator">●●●</span>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form className="chat-input-area" onSubmit={handleSubmit}>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!canReply}
                />
                <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!canReply || !inputText.trim()}
                >
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </form>
        </div>
    );
};

export default SimpleChatView;
