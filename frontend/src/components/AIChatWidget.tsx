import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const FOOD_KEYWORDS = [
  "food", "meal", "store", "storage", "refrigerate", "freeze", "preserve",
  "safe", "safety", "spoil", "expire", "expiry", "container", "package",
  "pack", "temperature", "hygiene", "clean", "bacteria", "fresh", "leftover",
  "donate", "donation", "eat", "cook", "cooked", "raw", "vegetable", "fruit",
  "rice", "bread", "roti", "dal", "curry", "meat", "fish", "dairy", "milk"
];

const QUICK_REPLIES = [
  "How long can I store cooked rice?",
  "What's the best way to pack rotis?",
  "Is it safe to donate yesterday's food?",
];

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your Meal-Mitra assistant. Ask me anything about food safety, storage, or packaging for donations! 🍲",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isRelatedToFood = (text: string) => {
    const lowerText = text.toLowerCase();
    return FOOD_KEYWORDS.some((keyword) => lowerText.includes(keyword));
  };

  const generateResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    if (!isRelatedToFood(userMessage)) {
      return "I'm here to help with food safety, storage, and packaging questions only. Please ask something related to food donations! 🙏";
    }

    if (lowerMessage.includes("rice")) {
      return "Cooked rice can be safely stored for 4-6 hours at room temperature, or up to 3-4 days if refrigerated within 1 hour of cooking. For donations, pack in airtight containers and mention the cooking time.";
    }
    if (lowerMessage.includes("roti") || lowerMessage.includes("bread")) {
      return "Rotis stay fresh for 6-8 hours at room temperature. Wrap them in aluminum foil or a clean cloth to keep them soft. For donations, stack them and wrap tightly!";
    }
    if (lowerMessage.includes("pack") || lowerMessage.includes("container")) {
      return "Use clean, airtight containers. Label with food type and preparation time. Separate dry and wet items. For hot foods, let them cool before sealing.";
    }
    if (lowerMessage.includes("yesterday") || lowerMessage.includes("day old")) {
      return "Day-old food can be donated if properly refrigerated. Check for any off smells or texture changes. Always mention the preparation date to the NGO.";
    }
    if (lowerMessage.includes("safe") || lowerMessage.includes("safety")) {
      return "Key safety tips: Keep hot foods hot (above 60°C) and cold foods cold (below 5°C). Donate within 4 hours of cooking. Avoid cross-contamination between raw and cooked items.";
    }
    if (lowerMessage.includes("store") || lowerMessage.includes("storage")) {
      return "Store food in clean containers at safe temperatures. Refrigerate perishables immediately. Keep raw and cooked foods separate. Label everything with dates!";
    }

    return "Great question about food! For specific guidance, consider the type of food, how long ago it was prepared, and storage conditions. Fresh, properly stored food is best for donations.";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const response = generateResponse(userMessage.content);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: response,
    };

    setIsTyping(false);
    setMessages((prev) => [...prev, assistantMessage]);
  };

  const handleQuickReply = (reply: string) => {
    setInput(reply);
  };

  return (
    <>
      {/* Chat Bubble */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="icon-lg"
              variant="hero"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            {/* Notification dot */}
            <span className="absolute top-0 right-0 w-3 h-3 bg-secondary rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden"
          >
            {/* Header */}
            <div className="gradient-primary p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary-foreground">
                    Meal-Mitra Assistant
                  </h3>
                  <p className="text-xs text-primary-foreground/70">
                    Food safety & packaging help
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="h-[300px] overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-secondary" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-muted p-3 rounded-2xl rounded-bl-md">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.1s]" />
                      <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleQuickReply(reply)}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-muted rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about food safety..."
                  className="flex-1 rounded-xl"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isTyping}
                  className="rounded-xl"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
