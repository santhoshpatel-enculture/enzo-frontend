import { create } from 'zustand';
import type { ChatMessageType } from '../services/api';

interface ChatState {
  messages: ChatMessageType[];
  conversationId: string | null;
  isStreaming: boolean;
  streamingContent: string;
  addMessage: (msg: ChatMessageType) => void;
  setConversationId: (id: string | null) => void;
  setStreaming: (val: boolean) => void;
  appendStreamChunk: (chunk: string) => void;
  finalizeStream: (fullReply: string) => void;
  clearMessages: () => void;
  loadMessages: (msgs: ChatMessageType[], convId: string) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  conversationId: null,
  isStreaming: false,
  streamingContent: '',

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),

  setConversationId: (id) => set({ conversationId: id }),

  setStreaming: (val) => set({ isStreaming: val, streamingContent: val ? '' : get().streamingContent }),

  appendStreamChunk: (chunk) => set((s) => ({ streamingContent: s.streamingContent + chunk })),

  finalizeStream: (fullReply) => set((s) => ({
    isStreaming: false,
    streamingContent: '',
    messages: [...s.messages, { role: 'assistant', content: fullReply }],
  })),

  clearMessages: () => set({ messages: [], conversationId: null, streamingContent: '' }),

  loadMessages: (msgs, convId) => set({ messages: msgs, conversationId: convId }),
}));
