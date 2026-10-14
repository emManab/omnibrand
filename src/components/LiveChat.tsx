import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
}

const quickResponses = [
  { q: "What are your delivery times?", a: "We offer standard delivery (5-7 business days) and express delivery (2-3 business days). All orders are dispatched within 24 hours of design approval." },
  { q: "Do you offer bulk discounts?", a: "Yes! We offer volume discounts: 50+ (5% off), 100+ (10% off), 250+ (15% off), 500+ (20% off), 1000+ (25% off). Bulk pricing is automatically applied at checkout." },
  { q: "Can I see a proof before printing?", a: "Absolutely! You'll receive a digital proof for approval before we start printing. You can request changes until you're completely satisfied." },
  { q: "What file formats do you accept?", a: "We accept PDF, PNG, JPG, AI, PSD, and SVG files. For best results, use high-resolution images (at least 300 DPI) and vector formats when possible." },
];

export function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! 👋 I'm here to help. Ask me about products, pricing, delivery, or design tips!",
      sender: 'bot',
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender: 'user',
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const response = generateResponse(text);
      const botMsg: Message = {
        id: crypto.randomUUID(),
        text: response,
        sender: 'bot',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 800);
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();

    for (const { q, a } of quickResponses) {
      if (lowerQuery.includes(q.toLowerCase().split(' ').slice(0, 2).join(' '))) {
        return a;
      }
    }

    if (lowerQuery.includes('price') || lowerQuery.includes('cost')) {
      return "Prices vary by product, quantity, and options. Use our instant price calculator on any product page for exact quotes. Volume discounts apply automatically!";
    }

    if (lowerQuery.includes('design') || lowerQuery.includes('help')) {
      return "We offer free design templates and an easy-to-use online editor. Need professional help? Our design team can create custom artwork for you (additional fees may apply).";
    }

    if (lowerQuery.includes('track') || lowerQuery.includes('order')) {
      return "You can track your order anytime from your account dashboard. You'll also receive email updates at each stage of production and shipping.";
    }

    return "Thanks for your question! For detailed assistance, please email support@calcuttapress.com or call us at 1800-PRINT-NOW. Our team is available Mon-Fri, 9 AM - 6 PM IST.";
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0875f5] text-white shadow-lg transition hover:scale-105 hover:bg-[#075fd0]"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[360px] flex-col overflow-hidden rounded-2xl border border-[#e6eaf2] bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-[#0875f5] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <div>
                <h3 className="text-sm font-bold">Calcuttapress Support</h3>
                <p className="text-xs opacity-90">Online now</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} aria-label="Close chat">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e6f1ff] text-[#0875f5]">
                    <Bot size={14} />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'user' ? 'bg-[#0875f5] text-white' : 'bg-[#f5f7fa] text-[#182b48]'}`}>
                  {msg.text}
                </div>
                {msg.sender === 'user' && (
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e6eaf2] text-[#34445e]">
                    <User size={14} />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="border-t border-[#edf0f5] p-3">
              <p className="mb-2 text-xs font-semibold text-[#66758b]">Quick questions:</p>
              <div className="space-y-1">
                {quickResponses.slice(0, 3).map((item, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(item.q)}
                    className="w-full rounded-lg bg-[#f5f7fa] px-3 py-2 text-left text-xs text-[#34445e] transition hover:bg-[#e6eaf2]"
                  >
                    {item.q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="border-t border-[#edf0f5] p-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 rounded-lg border border-[#d5dde8] px-3 py-2 text-sm outline-none focus:border-[#0875f5] focus:ring-2 focus:ring-[#0875f5]/20"
              />
              <button
                type="submit"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0875f5] text-white transition hover:bg-[#075fd0]"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
