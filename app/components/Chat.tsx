"use client";
import { useState, useRef, useEffect } from "react";
import styles from "./Chat.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BotIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const SendIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const ShopIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 01-8 0" />
  </svg>
);

const TypingDots = () => (
  <div className={styles.typingDots}>
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className={styles.typingDot}
        style={{ animationDelay: `${i * 0.2}s`, animation: "bounce 1.2s ease-in-out infinite" }}
      />
    ))}
  </div>
);

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? "Something went wrong. Please try again.",
        },
      ]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Network error. Please check your connection." },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const suggestions = ["Best laptops under $1000", "Wireless headphones", "Gaming chairs", "Smart home devices"];

  return (
    <div className={styles.chatWrapper}>
      <div className={`${styles.bgOrb} ${styles.orb1}`} />
      <div className={`${styles.bgOrb} ${styles.orb2}`} />

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <ShopIcon />
        </div>
        <div className={styles.headerText}>
          <h1>ShopAI Assistant</h1>
          <p><span className={styles.onlineDot} />Online &nbsp;·&nbsp; Powered by GPT-4o mini</p>
        </div>
      </header>

      {/* Messages */}
      <div className={styles.messagesArea}>
        {messages.length === 0 && !isLoading ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🛍️</div>
            <h2>What are you shopping for?</h2>
            <p>Ask me anything — I'll find the best products just for you.</p>
            <div className={styles.suggestions}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  className={styles.suggestionChip}
                  onClick={() => { setInput(s); inputRef.current?.focus(); }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i} className={`${styles.messageRow} ${styles[msg.role]}`}>
                <div className={`${styles.avatar} ${msg.role === "user" ? styles.user : styles.bot}`}>
                  {msg.role === "user" ? <UserIcon /> : <BotIcon />}
                </div>
                <div className={`${styles.bubble} ${styles[msg.role]}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className={styles.messageRow}>
                <div className={`${styles.avatar} ${styles.bot}`}><BotIcon /></div>
                <div className={styles.typingBubble}><TypingDots /></div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <input
            ref={inputRef}
            className={styles.chatInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about products, deals, recommendations…"
            disabled={isLoading}
          />
          <button
            className={styles.sendBtn}
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
        <p className={styles.footerHint}>Press Enter to send &nbsp;·&nbsp; ShopAI may make mistakes</p>
      </div>
    </div>
  );
}