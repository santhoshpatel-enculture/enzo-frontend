import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Send,
  Plus,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowDown,
  X,
  User,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import ChatMarkdown from '../components/ChatMarkdown';
import type { ConversationSummary, ChatMessageType } from '../services/api';
import {
  getChatHistory,
  getConversation,
  sendChatMessage,
  submitChatFeedback,
} from '../services/api';
import { useChatStore } from '../store/chatStore';

const ENZO_BOT_AVATAR = '/enzo-bot.png';

function BotAvatar({ className = '' }: { className?: string }) {
  return (
    <img
      src={ENZO_BOT_AVATAR}
      alt="Enzo"
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover shrink-0 border border-outline-variant/20 ${className}`}
    />
  );
}

function UserAvatar({ className = '' }: { className?: string }) {
  return (
    <div
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container border border-outline-variant/30 flex items-center justify-center shrink-0 ${className}`}
      aria-hidden
    >
      <User className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-on-surface-variant" />
    </div>
  );
}

const BOT_BUBBLE =
  'flex-1 min-w-0 w-full max-w-full rounded-2xl rounded-tl-sm px-3 py-3 sm:px-4 sm:py-3.5 bg-surface-container-low border border-outline-variant/30 text-on-surface shadow-sm';
const USER_BUBBLE =
  'max-w-[min(100%,18rem)] sm:max-w-md shrink-0 rounded-2xl rounded-tr-sm px-3.5 py-2.5 sm:px-4 sm:py-3 text-body-sm leading-relaxed bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-glow-primary';

const TABLET_BREAKPOINT_PX = 768;

const PROMPTS = [
  { label: 'Show my critical tasks', value: 'What are my critical tasks for this week?' },
  { label: 'My programs', value: 'What programs am I enrolled in? Remind me they are anonymous.' },
  { label: 'Summarize my week', value: 'Summarize my work and tasks for this week.' },
  { label: 'Draft an update', value: 'Help me draft a short team status update.' },
];

function ConversationSidebar({
  history,
  conversationId,
  isOverlay,
  onClose,
  onSelect,
  onNewChat,
}: {
  history: ConversationSummary[];
  conversationId: string | null;
  isOverlay: boolean;
  onClose?: () => void;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}) {
  return (
    <aside
      className={`flex flex-col h-full min-h-0 bg-surface-container-low/90 border-outline-variant/20 ${
        isOverlay
          ? 'w-[min(288px,88vw)] max-w-full border-r shadow-2xl'
          : 'w-full md:w-[260px] lg:w-[280px] shrink-0 border-r'
      }`}
    >
      <div className="shrink-0 px-3 py-3 sm:px-4 border-b border-outline-variant/20 flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
          History
        </span>
        {isOverlay && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-ezo-lg bg-surface-container border border-outline-variant/30 text-on-surface-variant touch-manipulation"
            aria-label="Close history"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="shrink-0 p-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-ezo-lg text-sm font-semibold border border-primary/15 bg-primary/5 hover:bg-primary/10 text-primary transition-colors touch-manipulation"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-2 pb-4 space-y-1">
        {history.length === 0 ? (
          <p className="text-center p-6 text-xs text-on-surface-variant">No conversations yet</p>
        ) : (
          history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full flex items-center gap-2.5 p-3 rounded-ezo-lg text-left transition-colors touch-manipulation ${
                conversationId === item.id
                  ? 'bg-primary/10 border border-primary/15'
                  : 'hover:bg-surface-container border border-transparent'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-on-surface-variant shrink-0" />
              <div className="min-w-0 overflow-hidden">
                <p className="text-sm font-medium truncate text-[var(--ezo-fg)]">{item.title}</p>
                <p className="text-xs text-on-surface-variant truncate mt-0.5">
                  {item.lastMessage || 'Empty chat'}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}

export default function Chat() {
  const {
    messages,
    conversationId,
    isStreaming,
    streamingContent,
    addMessage,
    setConversationId,
    setStreaming,
    appendStreamChunk,
    finalizeStream,
    clearMessages,
    loadMessages,
  } = useChatStore();

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<ConversationSummary[]>([]);
  const [isCompact, setIsCompact] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < TABLET_BREAKPOINT_PX,
  );
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= TABLET_BREAKPOINT_PX,
  );
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [feedbackPending, setFeedbackPending] = useState<string | null>(null);

  const handleFeedback = async (messageId: string, rating: 'up' | 'down') => {
    if (!conversationId || feedbackPending) return;
    setFeedbackPending(messageId);
    try {
      await submitChatFeedback({
        conversation_id: conversationId,
        message_id: messageId,
        rating,
      });
      loadMessages(
        messages.map((m) =>
          m.messageId === messageId
            ? { ...m, feedback: { rating, at: new Date().toISOString() } }
            : m,
        ),
        conversationId,
      );
    } catch {
      /* ignore */
    } finally {
      setFeedbackPending(null);
    }
  };

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      const compact = window.innerWidth < TABLET_BREAKPOINT_PX;
      setIsCompact(compact);
      if (!compact) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = () => {
    getChatHistory().then(setHistory).catch(console.error);
  };

  useEffect(() => {
    fetchHistory();
  }, [conversationId]);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    chatEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [messages]);

  useEffect(() => {
    if (isStreaming) scrollToBottom('smooth');
  }, [streamingContent, isStreaming]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 200);
  };

  const handleSelectConversation = async (id: string) => {
    try {
      const data = await getConversation(id);
      loadMessages(data.messages, data.id);
      if (isCompact) setSidebarOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartNewChat = () => {
    clearMessages();
    if (isCompact) setSidebarOpen(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    const userMessage = input.trim();
    setInput('');

    addMessage({ role: 'user', content: userMessage } as ChatMessageType);
    setStreaming(true);

    try {
      await sendChatMessage(
        userMessage,
        conversationId,
        (chunk) => appendStreamChunk(chunk),
        (fullReply, convId) => {
          finalizeStream(fullReply);
          setConversationId(convId);
          fetchHistory();
        },
      );
    } catch (err: unknown) {
      setStreaming(false);
      const msg = err instanceof Error ? err.message : 'Error sending message';
      addMessage({
        role: 'assistant',
        content: `Sorry, I encountered an error: ${msg}. Please try again.`,
      });
    }
  };

  const showInlineSidebar = sidebarOpen && !isCompact;

  return (
    <div className="flex flex-col flex-1 min-h-0 h-full w-full overflow-hidden bg-surface-container-low/20">
      {/* Chat toolbar — replaces overlapping absolute controls on mobile */}
      <div className="shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b border-outline-variant/15 bg-[var(--ezo-glass-bg)] backdrop-blur-[12px]">
        <button
          type="button"
          onClick={() => setSidebarOpen((open) => !open)}
          className="w-9 h-9 rounded-ezo-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-[var(--ezo-fg)] touch-manipulation shrink-0"
          aria-label={sidebarOpen ? 'Hide conversation history' : 'Show conversation history'}
        >
          {sidebarOpen && !isCompact ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeftOpen className="w-4 h-4" />
          )}
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-headline font-semibold text-[var(--ezo-fg)] truncate">Enzo</p>
          <p className="text-[11px] text-on-surface-variant truncate">AI assistant</p>
        </div>
        {isCompact && (
          <button
            type="button"
            onClick={handleStartNewChat}
            className="shrink-0 px-3 py-2 rounded-ezo-lg text-xs font-semibold border border-primary/20 bg-primary/5 text-primary touch-manipulation"
          >
            New
          </button>
        )}
      </div>

      <div className="flex flex-1 min-h-0 relative">
        {/* Mobile / narrow: drawer overlay */}
        <AnimatePresence>
          {isCompact && sidebarOpen && (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-20 bg-black/50 backdrop-blur-[2px] md:hidden"
                aria-label="Close history"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                className="absolute inset-y-0 left-0 z-30 md:hidden"
              >
                <ConversationSidebar
                  history={history}
                  conversationId={conversationId}
                  isOverlay
                  onClose={() => setSidebarOpen(false)}
                  onSelect={handleSelectConversation}
                  onNewChat={handleStartNewChat}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Tablet+: inline history */}
        {showInlineSidebar && (
          <ConversationSidebar
            history={history}
            conversationId={conversationId}
            isOverlay={false}
            onSelect={handleSelectConversation}
            onNewChat={handleStartNewChat}
          />
        )}

        {/* Main thread */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0 relative">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain px-3 sm:px-5 md:px-6 py-4 space-y-4 sm:space-y-5"
          >
            <div className="w-full max-w-3xl mx-auto min-h-full flex flex-col">
              {messages.length === 0 && !isStreaming ? (
                <div className="flex flex-1 flex-col items-center justify-center text-center py-6 sm:py-10 gap-5">
                  <img
                    src={ENZO_BOT_AVATAR}
                    alt="Enzo"
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-ezo-xl object-cover border border-primary/15 shadow-sm"
                  />
                  <div className="px-2">
                    <h3 className="text-headline-md text-[var(--ezo-fg)]">Ask Enzo</h3>
                    <p className="text-body-sm text-on-surface-variant mt-2 leading-relaxed max-w-sm mx-auto">
                      Review actions, check deadlines, see your team, and learn about anonymous
                      Enculture programs.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-2 w-full max-w-md px-1">
                    {PROMPTS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setInput(p.value)}
                        className="w-full sm:w-auto px-3.5 py-2.5 rounded-ezo-lg text-xs font-medium border border-outline-variant/30 bg-surface-container-low hover:bg-primary/10 hover:border-primary/30 text-on-surface-variant hover:text-primary transition-colors touch-manipulation text-left sm:text-center"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-5 pb-2">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 sm:gap-2.5 w-full ${
                        msg.role === 'user'
                          ? 'items-end justify-end'
                          : 'items-start justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && <BotAvatar className="mt-0.5 shrink-0" />}
                      <div className={msg.role === 'user' ? USER_BUBBLE : BOT_BUBBLE}>
                        {msg.role === 'assistant' ? (
                          <>
                            <ChatMarkdown content={msg.content} />
                            {msg.messageId && (
                              <div className="flex gap-1.5 mt-2 pt-2 border-t border-outline-variant/20">
                                <button
                                  type="button"
                                  disabled={!!msg.feedback || feedbackPending === msg.messageId}
                                  onClick={() => handleFeedback(msg.messageId!, 'up')}
                                  className={`p-2 rounded-lg touch-manipulation ${
                                    msg.feedback?.rating === 'up'
                                      ? 'text-primary bg-primary/10'
                                      : 'text-on-surface-variant hover:text-primary'
                                  }`}
                                  aria-label="Helpful"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  disabled={!!msg.feedback || feedbackPending === msg.messageId}
                                  onClick={() => handleFeedback(msg.messageId!, 'down')}
                                  className={`p-2 rounded-lg touch-manipulation ${
                                    msg.feedback?.rating === 'down'
                                      ? 'text-error bg-error-container/30'
                                      : 'text-on-surface-variant hover:text-error'
                                  }`}
                                  aria-label="Not helpful"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                      </div>
                      {msg.role === 'user' && <UserAvatar className="shrink-0" />}
                    </div>
                  ))}

                  {isStreaming && streamingContent && (
                    <div className="flex gap-2 sm:gap-2.5 items-start w-full">
                      <BotAvatar className="mt-0.5 shrink-0" />
                      <div className={BOT_BUBBLE}>
                        <ChatMarkdown content={streamingContent} />
                      </div>
                    </div>
                  )}

                  {isStreaming && !streamingContent && (
                    <div className="flex gap-2 sm:gap-2.5 items-start w-full">
                      <BotAvatar className="shrink-0" />
                      <div className="glass-card px-4 py-3 flex gap-1.5 items-center">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={chatEndRef} className="h-px shrink-0" aria-hidden />
            </div>
          </div>

          {showScrollBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom()}
              className="absolute z-20 right-3 sm:right-5 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] w-10 h-10 rounded-full bg-primary text-on-primary shadow-lg flex items-center justify-center active:scale-95 transition-transform touch-manipulation"
              aria-label="Scroll to latest messages"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
          )}

          <div className="shrink-0 border-t border-outline-variant/20 bg-[var(--ezo-bg)]/95 backdrop-blur-sm px-3 sm:px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
            <form onSubmit={handleSend} className="w-full max-w-3xl mx-auto">
              <div className="flex items-end gap-2 bg-[var(--ezo-input-bg)] border border-outline-variant/40 rounded-2xl p-1.5 sm:p-2 focus-within:border-primary/50 focus-within:shadow-[var(--shadow-focus)] transition-shadow">
                <input
                  type="text"
                  placeholder="Message Enzo..."
                  className="flex-1 min-w-0 bg-transparent border-none outline-none py-2.5 px-2.5 text-base sm:text-sm text-[var(--ezo-fg)] placeholder:text-on-surface-variant/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isStreaming}
                  maxLength={250}
                  enterKeyHint="send"
                  autoComplete="off"
                />
                <span className="hidden sm:block text-[10px] text-on-surface-variant/70 pb-2.5 pr-0.5 tabular-nums shrink-0">
                  {input.length}/250
                </span>
                <button
                  type="submit"
                  disabled={!input.trim() || isStreaming}
                  className="p-2.5 sm:p-3 rounded-ezo-lg bg-gradient-to-r from-primary to-primary-container text-on-primary shrink-0 disabled:opacity-40 transition-opacity touch-manipulation"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-center text-[10px] sm:text-[11px] text-on-surface-variant/60 mt-2 hidden sm:block">
                Ezo can make mistakes. Verify important information.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
