'use client';

import { useAuthStore } from '@/store/authStore';

interface ChatMessageProps {
  message: {
    _id: string;
    sender: { _id: string; name: string };
    message: string;
    timestamp: string;
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuthStore();
  const isMe = user?._id === message.sender._id;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs rounded-lg px-4 py-2 sm:max-w-sm md:max-w-md ${
          isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-900'
        }`}
      >
        <div className="mb-1 text-xs font-medium opacity-90">{message.sender.name}</div>
        <div className="text-sm">{message.message}</div>
        <div className={`mt-1 text-right text-xs ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
