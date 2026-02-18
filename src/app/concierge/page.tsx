"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Plus,
  Phone,
  Clock,
  CheckCircle2,
  Circle,
} from "lucide-react";

type Conversation = {
  id: string;
  subject: string;
  status: "open" | "closed" | "whatsapp";
  updatedAt: string;
  latestMessage?: { content: string; senderRole: string };
};

type Message = {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
};

/** Persistent guest ID — stored in localStorage so returning guests keep their history */
function getGuestId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem("tedlyns_guest_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("tedlyns_guest_id", id);
  }
  return id;
}

export default function ConciergePage() {
  const { data: session, status } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showNewConvo, setShowNewConvo] = useState(false);
  const [sending, setSending] = useState(false);
  const [guestId, setGuestId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isLoggedIn = status === "authenticated";
  const isAdmin = session?.user?.role === "admin";
  const userId = isLoggedIn ? session.user.id : `guest-${guestId}`;

  // Initialize guest ID on mount
  useEffect(() => {
    if (!isLoggedIn) {
      setGuestId(getGuestId());
    }
  }, [isLoggedIn]);

  /** Headers to attach to every API call — includes guest ID for unauthenticated users */
  const apiHeaders = useCallback((): HeadersInit => {
    const h: HeadersInit = { "Content-Type": "application/json" };
    if (!isLoggedIn && guestId) {
      h["x-guest-id"] = guestId;
    }
    return h;
  }, [isLoggedIn, guestId]);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/chat", { headers: apiHeaders() });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch {
      /* silent */
    }
  }, [apiHeaders]);

  const fetchMessages = useCallback(async () => {
    if (!activeConvo) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${activeConvo}`, {
        headers: apiHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {
      /* silent */
    }
  }, [activeConvo, apiHeaders]);

  useEffect(() => {
    // Guests need guestId to be resolved first
    if (!isLoggedIn && !guestId) return;
    if (status === "loading") return;
    fetchConversations();
  }, [status, isLoggedIn, guestId, fetchConversations]);

  useEffect(() => {
    if (activeConvo) {
      fetchMessages();
      pollRef.current = setInterval(fetchMessages, 5000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeConvo, fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleCreateConvo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ subject: newSubject }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewConvo(false);
        setNewSubject("");
        setActiveConvo(data.conversation.id);
        fetchConversations();
      }
    } catch {
      /* silent */
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;
    setSending(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({
          conversationId: activeConvo,
          content: newMessage,
        }),
      });
      if (res.ok) {
        setNewMessage("");
        fetchMessages();
        fetchConversations();
      }
    } catch {
      /* silent */
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (
    convoId: string,
    newStatus: "open" | "closed" | "whatsapp"
  ) => {
    try {
      await fetch("/api/chat/messages", {
        method: "PATCH",
        headers: apiHeaders(),
        body: JSON.stringify({ conversationId: convoId, status: newStatus }),
      });
      fetchConversations();
    } catch {
      /* silent */
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
      </div>
    );
  }

  const statusIcon = (s: string) => {
    switch (s) {
      case "open":
        return <Circle size={10} className="text-teal fill-teal/30" />;
      case "closed":
        return <CheckCircle2 size={10} className="text-ivory/20" />;
      case "whatsapp":
        return <Phone size={10} className="text-green-400" />;
      default:
        return null;
    }
  };

  // ─── DESKTOP SPLIT VIEW ───
  // On lg+, show conversations list on left and active chat on right
  // On mobile, show one at a time

  const conversationsList = (
    <div className={cn(
      activeConvo ? "hidden lg:block" : "block",
      "lg:w-[360px] lg:shrink-0 lg:border-r lg:border-gold/10"
    )}>
      <div className="px-5 py-6 lg:pr-5">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-gold/60">
              Live Concierge
            </p>
            <h1 className="mt-1 font-serif text-2xl font-bold text-ivory">
              {isAdmin ? "All Conversations" : "Your Chats"}
            </h1>
            <p className="mt-1 text-xs text-ivory/30">
              {isAdmin
                ? "Manage all customer conversations"
                : "Talk to us about anything — we're here to help"}
            </p>
          </div>
          {!isAdmin && (
            <button
              onClick={() => setShowNewConvo(!showNewConvo)}
              className="flex items-center gap-1.5 rounded-full border border-gold/20 px-3 py-1.5 text-xs text-gold hover:bg-gold/5 transition-colors"
            >
              <Plus size={14} />
              New
            </button>
          )}
        </div>

        {showNewConvo && (
          <form onSubmit={handleCreateConvo} className="mb-6 flex gap-2">
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder='e.g. "Birthday cake for 50 guests"'
              className={cn(
                "h-10 flex-1 rounded-lg border bg-transparent px-3 text-sm text-ivory",
                "border-gold/15 placeholder:text-ivory/20",
                "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
              )}
            />
            <button
              type="submit"
              className="h-10 rounded-lg bg-gold px-4 text-sm font-medium text-obsidian hover:bg-gold-300 transition-colors"
            >
              Start
            </button>
          </form>
        )}

        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gold/10 py-20 text-center">
            <MessageCircle size={32} className="mb-3 text-gold/20" />
            <p className="text-sm text-ivory/30">No conversations yet</p>
            <p className="mt-1 text-xs text-ivory/15">
              Start a chat to speak with our concierge
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {conversations.map((convo) => (
              <button
                key={convo.id}
                onClick={() => setActiveConvo(convo.id)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-left transition-all hover:border-gold/20 hover:bg-gold/[0.04]",
                  activeConvo === convo.id
                    ? "border-gold/25 bg-gold/[0.05]"
                    : "border-gold/8 bg-gold/[0.02]"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {statusIcon(convo.status)}
                    <p className="truncate text-sm font-medium text-ivory">
                      {convo.subject}
                    </p>
                  </div>
                  {convo.latestMessage && (
                    <p className="mt-1 truncate text-xs text-ivory/30">
                      {convo.latestMessage.senderRole === "admin" ? "Concierge: " : "You: "}
                      {convo.latestMessage.content}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Clock size={10} className="text-ivory/15" />
                  <p className="text-[9px] text-ivory/15 tabular-nums">
                    {new Date(convo.updatedAt).toLocaleDateString("en-NG", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const chatView = activeConvo ? (
    <div className={cn(
      "flex flex-1 flex-col",
      activeConvo ? "block" : "hidden lg:block"
    )} style={{ height: "calc(100vh - 10rem)" }}>
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-gold/10 px-5 py-3">
        <button
          onClick={() => {
            setActiveConvo(null);
            setMessages([]);
          }}
          className="text-ivory/40 hover:text-ivory transition-colors lg:hidden"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium text-ivory">
            {conversations.find((c) => c.id === activeConvo)?.subject || "Conversation"}
          </p>
          <div className="flex items-center gap-1.5">
            {statusIcon(conversations.find((c) => c.id === activeConvo)?.status || "open")}
            <p className="text-[10px] uppercase tracking-wider text-ivory/30">
              {conversations.find((c) => c.id === activeConvo)?.status}
            </p>
          </div>
        </div>
        {isAdmin && conversations.find((c) => c.id === activeConvo)?.status === "open" && (
          <div className="flex gap-1.5">
            <button
              onClick={() => handleStatusChange(activeConvo, "whatsapp")}
              className="rounded-full border border-green-500/20 px-2.5 py-1 text-[10px] text-green-400 hover:bg-green-500/10 transition-colors"
            >
              WhatsApp
            </button>
            <button
              onClick={() => handleStatusChange(activeConvo, "closed")}
              className="rounded-full border border-ivory/10 px-2.5 py-1 text-[10px] text-ivory/30 hover:bg-ivory/5 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <MessageCircle size={28} className="mx-auto mb-2 text-gold/20" />
              <p className="text-sm text-ivory/20">Start the conversation</p>
              <p className="mt-1 text-xs text-ivory/10">
                Tell us what you need — we&apos;re listening
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => {
              const isOwn = msg.senderId === userId;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 lg:max-w-[60%]",
                      isOwn
                        ? "rounded-br-md bg-gold/15 text-ivory"
                        : "rounded-bl-md bg-ivory/5 text-ivory/80"
                    )}
                  >
                    {!isOwn && (
                      <p className="mb-0.5 text-[10px] font-medium text-gold/50">
                        {msg.senderRole === "admin" ? "Tedlyns Concierge" : "Client"}
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={cn("mt-1 text-[9px]", isOwn ? "text-gold/30" : "text-ivory/15")}>
                      {new Date(msg.createdAt).toLocaleTimeString("en-NG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      {conversations.find((c) => c.id === activeConvo)?.status !== "closed" &&
        conversations.find((c) => c.id === activeConvo)?.status !== "whatsapp" && (
          <form onSubmit={handleSendMessage} className="border-t border-gold/10 px-5 py-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className={cn(
                  "h-10 flex-1 rounded-full border bg-transparent px-4 text-sm text-ivory",
                  "border-gold/15 placeholder:text-ivory/20",
                  "focus:border-gold/40 focus:outline-none focus:ring-1 focus:ring-gold/20"
                )}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                  newMessage.trim()
                    ? "bg-gold text-obsidian hover:bg-gold-300"
                    : "bg-ivory/5 text-ivory/20"
                )}
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        )}

      {conversations.find((c) => c.id === activeConvo)?.status === "whatsapp" && (
        <div className="border-t border-green-500/10 px-5 py-3 text-center">
          <p className="text-xs text-green-400/60">
            This conversation has moved to WhatsApp
          </p>
          <a
            href="https://wa.me/2349000000000"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-xs text-green-400 underline hover:no-underline"
          >
            Continue on WhatsApp →
          </a>
        </div>
      )}

      {conversations.find((c) => c.id === activeConvo)?.status === "closed" && (
        <div className="border-t border-ivory/5 px-5 py-3 text-center">
          <p className="text-xs text-ivory/20">This conversation has been closed</p>
        </div>
      )}
    </div>
  ) : (
    <div className="hidden flex-1 items-center justify-center lg:flex">
      <div className="text-center">
        <MessageCircle size={40} className="mx-auto mb-3 text-gold/10" />
        <p className="text-sm text-ivory/20">Select a conversation</p>
        <p className="mt-1 text-xs text-ivory/10">
          Or start a new one to chat with our team
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto flex max-w-6xl lg:h-[calc(100vh-5rem)]">
      {conversationsList}
      {chatView}
    </div>
  );
}
