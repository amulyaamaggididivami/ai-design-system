import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
} from 'react';
import './enterpriseChat.css';
import plusIcon from '../../assets/icons/plus.svg';
import clockIcon from '../../assets/icons/clock-rewind.svg';

/* ── Types ───────────────────────────────────────────────── */

type PageMode = 'landing' | 'thread';

interface ChatMessage {
  id: string;
  question: string;
  answer: string | null;
  loading: boolean;
  timestamp: string;
}

interface HistorySession {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
}

/* ── Utilities ───────────────────────────────────────────── */

function getInitials(name: string): string {
  return name
    .trim()
    .split(/[\s._@-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let _msgCounter = 0;
function nextId(): string {
  _msgCounter += 1;
  return `msg-${Date.now()}-${_msgCounter}`;
}

/* ── GlobalHeader ────────────────────────────────────────── */

interface GlobalHeaderProps {
  historyActive: boolean;
  profileMenuOpen: boolean;
  onNewChat: () => void;
  onHistory: () => void;
  onToggleProfile: () => void;
  onSignOut: () => void;
}

function GlobalHeader({
  historyActive,
  profileMenuOpen,
  onNewChat,
  onHistory,
  onToggleProfile,
  onSignOut,
}: GlobalHeaderProps) {
  const initials = getInitials('Nishant');

  return (
    <div className="ec-workspace-tools" data-testid="ec-global-header">
      <div className="ec-workspace-tools-left">
        <div className="ec-workspace-brand">Enterprise Brain</div>
      </div>
      <div className="ec-workspace-tools-right">
        <button
          className="ec-tool-btn"
          type="button"
          title="New Chat"
          onClick={onNewChat}
          data-testid="ec-new-chat-btn"
        >
          <img src={plusIcon} alt="" className="ec-header-icon" />
        </button>

        <button
          className={`ec-tool-btn${historyActive ? ' ec-active' : ''}`}
          type="button"
          title="History"
          onClick={onHistory}
          data-testid="ec-history-btn"
        >
          <img src={clockIcon} alt="" className="ec-header-icon" />
        </button>

        <div className="ec-header-divider" />

        <div className="ec-profile-wrap">
          <button
            className="ec-tool-btn ec-profile-btn"
            type="button"
            aria-label="Profile"
            onClick={onToggleProfile}
            data-testid="ec-profile-btn"
          >
            <div className="ec-profile-avatar">{initials}</div>
          </button>

          {profileMenuOpen && (
            <div
              className="ec-profile-menu"
              data-testid="ec-profile-menu"
            >
              <button type="button" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Landing view ────────────────────────────────────────── */

interface LandingViewProps {
  onSubmit: (value: string) => void;
}

function LandingView({ onSubmit }: LandingViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? '';
    if (!value) return;
    if (inputRef.current) inputRef.current.value = '';
    onSubmit(value);
  }

  return (
    <div className="ec-landing-wrapper" data-testid="ec-landing-view">
      <section className="ec-landing-hero">
        <div className="ec-landing-orb-zone">
          <div className="ec-landing-head" />

          <div className="ec-landing-prompt-area" data-testid="ec-landing-prompt-area">
            <form
              className="ec-landing-prompt"
              onSubmit={handleSubmit}
              data-testid="ec-landing-form"
            >
              <input
                ref={inputRef}
                className="ec-landing-prompt-input"
                type="text"
                autoComplete="off"
                placeholder="Choose a question or start your own workspace thread"
                data-testid="ec-landing-input"
              />
              <button
                className="ec-landing-prompt-send"
                type="submit"
                aria-label="Start conversation"
                data-testid="ec-landing-send-btn"
              >
                →
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ── Thread view ─────────────────────────────────────────── */

interface ThreadViewProps {
  messages: ChatMessage[];
}

function ThreadView({ messages }: ThreadViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  return (
    <section
      className="ec-main-scroll-area"
      ref={scrollRef}
      data-testid="ec-thread-view"
    >
      <div className="ec-page-content">
        <div className="ec-conversation" data-testid="ec-conversation">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="ec-message-group"
              data-testid={`ec-message-${msg.id}`}
            >
              <h2 className="ec-user-bubble" data-testid="ec-user-bubble">
                {msg.question}
              </h2>

              <div className="ec-assistant-card" data-testid="ec-assistant-card">
                <div className="ec-assistant-label">Assistant</div>
                <div className="ec-assistant-text">
                  {msg.loading ? (
                    <div
                      className="ec-loading-dots"
                      aria-label="Loading response"
                      data-testid="ec-loading-dots"
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  ) : (
                    msg.answer
                  )}
                </div>
              </div>

              {!msg.loading && (
                <div className="ec-message-meta">{msg.timestamp}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Bottom chat input bar ───────────────────────────────── */

interface ChatInputBarProps {
  hasSheet: boolean;
  onSubmit: (value: string) => void;
}

function ChatInputBar({ hasSheet, onSubmit }: ChatInputBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const value = inputRef.current?.value.trim() ?? '';
    if (!value) return;
    if (inputRef.current) inputRef.current.value = '';
    onSubmit(value);
  }

  return (
    <div
      className={`ec-chat-input-zone${hasSheet ? ' ec-with-sheet' : ''}`}
      data-testid="ec-chat-input-zone"
    >
      <form
        className="ec-chat-input-form"
        onSubmit={handleSubmit}
        data-testid="ec-chat-input-form"
      >
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          placeholder="Ask me anything..."
          data-testid="ec-chat-input"
        />
        <button
          className="ec-submit-btn"
          type="submit"
          aria-label="Send"
          data-testid="ec-submit-btn"
        >
          →
        </button>
      </form>
    </div>
  );
}

/* ── History side panel ──────────────────────────────────── */

interface HistorySheetProps {
  isOpen: boolean;
  sessions: HistorySession[];
  onClose: () => void;
}

function HistorySheet({ isOpen, sessions, onClose }: HistorySheetProps) {
  return (
    <aside
      className={`ec-side-drawer${isOpen ? ' ec-open' : ''}`}
      data-testid="ec-history-sheet"
      aria-hidden={!isOpen}
    >
      <div className="ec-panel-inner">
        <div className="ec-panel-header">
          <div className="ec-panel-title">Recent Chats</div>
          <button
            className="ec-close-btn"
            type="button"
            aria-label="Close history"
            onClick={onClose}
            data-testid="ec-history-close-btn"
          >
            ×
          </button>
        </div>

        <div className="ec-panel-body" data-testid="ec-history-body">
          {sessions.length === 0 ? (
            <div className="ec-history-empty" data-testid="ec-history-empty">
              No history yet.
              <br />
              Your conversations will appear here once you start chatting.
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                className="ec-history-item"
                type="button"
                data-testid={`ec-history-item-${s.id}`}
              >
                <div className="ec-history-title">{s.title}</div>
                <div className="ec-history-preview">{s.preview}</div>
                <div className="ec-history-meta">{s.timestamp}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

/* ── Main page component ─────────────────────────────────── */

export function EnterpriseChatPage() {
  const [mode, setMode] = useState<PageMode>('landing');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Close profile menu when clicking outside
  useEffect(() => {
    if (!profileMenuOpen) return;
    function handleOutsideClick() {
      setProfileMenuOpen(false);
    }
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [profileMenuOpen]);

  const handleNewChat = useCallback(() => {
    setMode('landing');
    setMessages([]);
    setHistoryOpen(false);
  }, []);

  const handleHistory = useCallback(() => {
    setHistoryOpen((prev) => !prev);
  }, []);

  const handleToggleProfile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setProfileMenuOpen((prev) => !prev);
  }, []);

  const handleSignOut = useCallback(() => {
    setProfileMenuOpen(false);
  }, []);

  const handleSubmit = useCallback((value: string) => {
    if (!value.trim()) return;

    const id = nextId();
    const now = formatTime(new Date());

    const newMsg: ChatMessage = {
      id,
      question: value,
      answer: null,
      loading: true,
      timestamp: now,
    };

    setMessages((prev) => [...prev, newMsg]);
    setMode('thread');

    // Simulate a brief loading state
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                loading: false,
                answer:
                  'This is a demo response. Connect to a real backend to get AI-powered answers.',
              }
            : m,
        ),
      );
    }, 1200);
  }, []);

  const isThread = mode === 'thread';
  const hasSheet = historyOpen;

  // Empty sessions — replace with real data from a backend hook
  const sessions: HistorySession[] = [];

  return (
    <div
      className={`ec-page${isThread ? ' ec-thread-mode' : ''}`}
      data-testid="ec-page"
    >
      <GlobalHeader
        historyActive={historyOpen}
        profileMenuOpen={profileMenuOpen}
        onNewChat={handleNewChat}
        onHistory={handleHistory}
        onToggleProfile={handleToggleProfile}
        onSignOut={handleSignOut}
      />

      <main className="ec-workspace" data-testid="ec-workspace">
        <div className="ec-page-shell">
          {/* Landing mode */}
          {!isThread && <LandingView onSubmit={handleSubmit} />}

          {/* Thread mode */}
          {isThread && <ThreadView messages={messages} />}

          {/* Bottom chat input — only in thread mode */}
          {isThread && (
            <ChatInputBar hasSheet={hasSheet} onSubmit={handleSubmit} />
          )}

          {/* History side panel */}
          <HistorySheet
            isOpen={historyOpen}
            sessions={sessions}
            onClose={() => {
              setHistoryOpen(false);
            }}
          />
        </div>
      </main>
    </div>
  );
}
