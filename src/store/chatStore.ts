import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { messageService } from '@/services/messageService';

interface ChatMessage {
  _id: string;
  projectId: string;
  sender: { _id: string; name: string; email: string };
  message: string;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  socket: Socket | null;
  isConnected: boolean;
  typingUser: string | null;
  connectSocket: () => void;
  disconnectSocket: () => void;
  joinRoom: (projectId: string) => void;
  leaveRoom: (projectId: string) => void;
  sendMessage: (projectId: string, sender: string, senderName: string, message: string) => void;
  addMessage: (message: ChatMessage) => void;
  fetchMessages: (projectId: string) => Promise<void>;
  setTypingUser: (name: string | null) => void;
  emitTyping: (projectId: string, senderName: string) => void;
  emitStopTyping: (projectId: string) => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  socket: null,
  isConnected: false,
  typingUser: null,

  connectSocket: () => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      set({ isConnected: true });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('receive-message', (message: ChatMessage) => {
      set((state) => ({ messages: [...state.messages, message] }));
    });

    socket.on('typing', ({ senderName }: { senderName: string }) => {
      set({ typingUser: senderName });
    });

    socket.on('stop-typing', () => {
      set({ typingUser: null });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false });
    }
  },

  joinRoom: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('join-room', projectId);
    }
  },

  leaveRoom: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('leave-room', projectId);
    }
  },

  sendMessage: (projectId, sender, senderName, message) => {
    const { socket } = get();
    if (socket) {
      socket.emit('send-message', { projectId, sender, senderName, message });
    }
  },

  addMessage: (message) => {
    set((state) => ({ messages: [...state.messages, message] }));
  },

  fetchMessages: async (projectId) => {
    const response = await messageService.getMessages(projectId);
    set({ messages: response.data.messages });
  },

  setTypingUser: (name) => set({ typingUser: name }),

  emitTyping: (projectId, senderName) => {
    const { socket } = get();
    if (socket) {
      socket.emit('typing', { projectId, senderName });
    }
  },

  emitStopTyping: (projectId) => {
    const { socket } = get();
    if (socket) {
      socket.emit('stop-typing', { projectId });
    }
  }
}));
