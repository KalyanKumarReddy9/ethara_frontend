'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ChatMessage from '@/components/ChatMessage';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft, Send, Wifi, WifiOff } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuthStore();
  const {
    messages,
    isConnected,
    typingUser,
    connectSocket,
    disconnectSocket,
    joinRoom,
    leaveRoom,
    sendMessage,
    fetchMessages,
    emitTyping,
    emitStopTyping
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    connectSocket();
    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket]);

  useEffect(() => {
    if (isConnected && projectId) {
      joinRoom(projectId);
      fetchMessages(projectId);
    }
    return () => {
      if (projectId) leaveRoom(projectId);
    };
  }, [isConnected, projectId, joinRoom, leaveRoom, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !user) return;

    sendMessage(projectId, user._id, user.name, inputMessage.trim());
    setInputMessage('');
    emitStopTyping(projectId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    if (user) {
      emitTyping(projectId, user.name);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        emitStopTyping(projectId);
      }, 2000);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href={`/project/${projectId}`} className="text-slate-500 hover:text-slate-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h2 className="text-lg font-semibold text-slate-900">Project Chat</h2>
          </div>
          <div className="flex items-center gap-1 text-sm">
            {isConnected ? (
              <span className="flex items-center gap-1 text-green-600">
                <Wifi className="h-4 w-4" /> Connected
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-600">
                <WifiOff className="h-4 w-4" /> Disconnected
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => <ChatMessage key={msg._id} message={msg} />)
          )}
          {typingUser && (
            <div className="text-sm text-slate-500 italic">{typingUser} is typing...</div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-slate-200 px-4 py-3">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="flex items-center gap-1 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
