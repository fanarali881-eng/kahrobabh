import { useState, useEffect, useRef } from "react";
import { socket, visitor } from "@/lib/store";

interface Message {
  id: string;
  text: string;
  sender: "visitor" | "admin";
  timestamp: Date;
}

export default function AmerChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [hasNewAdminMessage, setHasNewAdminMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isOpenRef = useRef(isOpen);

  // Keep ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleAkAHIveli8QABmT6NmTQgAAE5Hv4pVGAAAOjvDknEsAAAmK8OWgUAAABYbw5qRUAAABgvDnp1gAAP198OsA");
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear notification when chat is opened
  useEffect(() => {
    if (isOpen) {
      setHasNewAdminMessage(false);
    }
  }, [isOpen]);

  // Listen for messages from admin
  useEffect(() => {
    const handleAdminMessage = (data: { message: string; timestamp: string }) => {
      const newMsg: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: "admin",
        timestamp: new Date(data.timestamp),
      };
      setMessages((prev) => [...prev, newMsg]);
      
      // Show notification and play sound only if chat is NOT open
      if (!isOpenRef.current) {
        setHasNewAdminMessage(true);
        // Play notification sound
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    socket.value.on("chat:fromAdmin", handleAdminMessage);

    return () => {
      socket.value.off("chat:fromAdmin", handleAdminMessage);
    };
  }, []);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const msg: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: "visitor",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, msg]);
    
    // Send to server
    socket.value.emit("chat:fromVisitor", {
      visitorSocketId: visitor.value.socketId,
      message: newMessage,
      timestamp: new Date().toISOString(),
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        #amer-chat-trigger {
          position: fixed;
          z-index: 50;
          cursor: pointer;
          right: 24px;
          bottom: 4px;
          left: auto !important;
          width: auto !important;
          max-width: fit-content !important;
          display: inline-flex !important;
        }
        #amer-chat-trigger .chat-inner {
          display: inline-flex;
          align-items: center;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          border: 1px solid #e5e7eb;
          overflow: hidden;
          width: auto;
        }
        #amer-chat-trigger .chat-text {
          padding: 6px 8px;
          color: #374151;
          font-size: 14px;
          font-weight: bold;
          white-space: nowrap;
        }
        #amer-chat-trigger .chat-icon-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6px 12px;
        }
        #amer-chat-trigger .chat-icon-wrap svg {
          width: 28px;
          height: 28px;
        }
        @media (max-width: 768px) {
          #amer-chat-trigger {
            right: 8px !important;
            bottom: 2px !important;
            left: auto !important;
            width: auto !important;
            max-width: 65vw !important;
          }
          #amer-chat-trigger .chat-text {
            padding: 5px 7px !important;
            font-size: 11px !important;
          }
          #amer-chat-trigger .chat-icon-wrap {
            padding: 5px 6px !important;
          }
          #amer-chat-trigger .chat-icon-wrap svg {
            width: 18px !important;
            height: 18px !important;
          }
        }
      `}} />

      {/* Chat Button */}
      <div
        id="amer-chat-trigger"
        onClick={() => setIsOpen(true)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* New Message Notification */}
        {hasNewAdminMessage && (
          <div className="absolute -top-10 right-0 bg-[#e4042c] text-white text-xs px-2 py-1 rounded-lg shadow-lg animate-bounce whitespace-nowrap">
            رسالة من الدعم
            <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-[#e4042c]"></div>
          </div>
        )}
        
        <div className={`chat-inner ${hasNewAdminMessage ? "animate-bounce" : ""}`} dir="ltr">
          <div className="chat-text">
            Chat now
          </div>
          <div className="chat-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 2h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H10l-4 4V4c0-1.1.9-2 2-2z" stroke="#e4042c" strokeWidth="2" fill="none"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md h-[500px] flex flex-col overflow-hidden">
            {/* Header */}
            <div style={{ background: '#0444c4' }} className="text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
src="/favicon.png"
              alt="هيئة الكهرباء والماء"
              className="w-10 h-10 object-contain bg-white rounded-full p-1"
            />
                <div>
                  <h3 className="font-bold text-sm">هيئة الكهرباء والماء</h3>
                  <p className="text-xs text-white/80">خدمة العملاء</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                  <img
                    src="/favicon.png"
                    alt="هيئة الكهرباء والماء"
                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                  />
                  <p>مرحباً بك في هيئة الكهرباء والماء</p>
                  <p className="text-sm">كيف يمكننا مساعدتك؟</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "visitor" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        msg.sender === "visitor"
                          ? "text-white rounded-br-none"
                          : "bg-white text-gray-800 shadow rounded-bl-none"
                      }`}
                      style={msg.sender === "visitor" ? { background: '#0444c4' } : undefined}
                    >
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "visitor" ? "text-white/70" : "text-gray-400"}`}>
                        {msg.timestamp.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="اكتب رسالتك..."
                  className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-[#0444c4]"
                  dir="rtl"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="text-white p-2 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#0444c4' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#0333a3')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#0444c4')}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
