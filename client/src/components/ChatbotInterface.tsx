import React, { useState, useEffect, useRef } from "react";

// Types for our API responses
interface ChatMessage {
  id: string;
  type: "user" | "ai" | "system";
  message: string;
  timestamp: Date;
  action?: string;
  result?: any;
}

interface HederaTransaction {
  id: string;
  type: "chatbot_action" | "session_log";
  action?: string;
  transactionId: string;
  hash?: string;
  timestamp: Date;
  status: "success" | "error";
  details?: any;
}

interface ApiResponse {
  success: boolean;
  type?: "hedera_action" | "conversation";
  action?: string;
  result?: any;
  response?: string;
  error?: string;
  timestamp: string;
}

interface SessionLogResponse {
  success: boolean;
  transactionId: string;
  hash: string;
  topicId: string;
  timestamp: string;
  error?: string;
  verification?: {
    verified: boolean;
    sequenceNumber?: number;
  };
}

const ChatbotInterface: React.FC = () => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<HederaTransaction[]>([]);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = "http://localhost:4000";

  // Auto-scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check server health on mount
  useEffect(() => {
    checkServerHealth();

    // Add welcome message
    setMessages([
      {
        id: "1",
        type: "system",
        message:
          "Welcome to SafeGuard AI Assistant. I can help you with Hedera blockchain operations and provide support. All sessions are securely logged to the blockchain for your protection.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Check if backend server is available
  const checkServerHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      const data = await response.json();
      setServerStatus(data.status === "healthy" ? "online" : "offline");
    } catch (error) {
      console.error("Health check failed:", error);
      setServerStatus("offline");
    }
  };

  // Start a new session
  const startSession = () => {
    setSessionActive(true);
    setSessionStartTime(new Date());

    const systemMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "system",
      message:
        "🔒 Session started. All interactions will be securely logged to Hedera blockchain.",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, systemMessage]);
  };

  // End session and log to Hedera
  const endSession = async () => {
    if (!sessionActive || !sessionStartTime) return;

    try {
      // Generate session summary
      const sessionSummary = generateSessionSummary();

      // Log session to Hedera
      const response = await fetch(`${API_BASE_URL}/log-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionSummary,
          enableVerification: true,
        }),
      });

      const logResult: SessionLogResponse = await response.json();

      if (logResult.success) {
        // Add session logged message
        const loggedMessage: ChatMessage = {
          id: Date.now().toString(),
          type: "system",
          message: `✅ Session securely logged to Hedera blockchain. Transaction ID: ${logResult.transactionId}`,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, loggedMessage]);

        // Add to transaction log
        const transaction: HederaTransaction = {
          id: Date.now().toString(),
          type: "session_log",
          transactionId: logResult.transactionId,
          hash: logResult.hash,
          timestamp: new Date(),
          status: "success",
          details: {
            topicId: logResult.topicId,
            verification: logResult.verification,
          },
        };

        setTransactions((prev) => [transaction, ...prev]);
      } else {
        throw new Error(logResult.error || "Session logging failed");
      }
    } catch (error) {
      console.error("Session logging error:", error);

      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: "system",
        message: `❌ Session logging failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSessionActive(false);
      setSessionStartTime(null);
    }
  };

  // Generate session summary for logging
  const generateSessionSummary = (): string => {
    const sessionMessages = messages.filter((m) => m.type !== "system");
    const hederaActions = transactions.filter(
      (t) => t.type === "chatbot_action"
    );

    const summary = `
SafeGuard AI Session Summary
===========================
Session Start: ${sessionStartTime?.toISOString()}
Session End: ${new Date().toISOString()}
Duration: ${Math.round(
      (Date.now() - (sessionStartTime?.getTime() || 0)) / 1000
    )} seconds

User Interactions: ${sessionMessages.filter((m) => m.type === "user").length}
AI Responses: ${sessionMessages.filter((m) => m.type === "ai").length}
Hedera Actions: ${hederaActions.length}

Messages:
${sessionMessages
  .map(
    (msg, i) =>
      `${i + 1}. [${msg.type.toUpperCase()}] ${msg.message.substring(0, 100)}${
        msg.message.length > 100 ? "..." : ""
      }`
  )
  .join("\n")}

Hedera Transactions:
${hederaActions
  .map((tx, i) => `${i + 1}. ${tx.action} - ${tx.transactionId} - ${tx.status}`)
  .join("\n")}

This session summary contains user interactions and blockchain transaction records for audit purposes.
Generated by SafeGuard AI Platform - Women Safety & Support System
    `.trim();

    return summary;
  };

  // Send message to chatbot
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      message: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputMessage.trim(),
        }),
      });

      const data: ApiResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to get response");
      }

      let aiMessage: ChatMessage;

      if (data.type === "hedera_action") {
        // Hedera action executed
        aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          message: `✅ Hedera action completed: ${
            data.action
          }\nResult: ${JSON.stringify(data.result, null, 2)}`,
          timestamp: new Date(),
          action: data.action,
          result: data.result,
        };

        // Add to transaction log
        const transaction: HederaTransaction = {
          id: Date.now().toString(),
          type: "chatbot_action",
          action: data.action,
          transactionId: data.result?.transactionId || "N/A",
          timestamp: new Date(),
          status: "success",
          details: data.result,
        };

        setTransactions((prev) => [transaction, ...prev]);
      } else {
        // Normal conversation
        aiMessage = {
          id: (Date.now() + 1).toString(),
          type: "ai",
          message: data.response || "No response received",
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        message: `❌ Sorry, I encountered an error: ${
          error instanceof Error ? error.message : String(error)
        }. Please try again.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Message component
  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.type === "user";
    const isSystem = message.type === "system";

    return (
      <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isSystem
              ? "bg-blue-50 border border-blue-200 text-blue-800"
              : isUser
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          <div className="text-sm whitespace-pre-wrap">{message.message}</div>
          <div
            className={`text-xs mt-1 ${
              isUser ? "text-blue-200" : "text-gray-500"
            }`}
          >
            {message.timestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  // Transaction log component
  const TransactionLog: React.FC = () => (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Hedera Blockchain Log
      </h3>

      {transactions.length === 0 ? (
        <p className="text-xs text-gray-500">No blockchain transactions yet</p>
      ) : (
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="bg-white p-2 rounded border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="text-xs font-medium text-gray-800">
                    {tx.type === "chatbot_action"
                      ? "🤖 AI Action"
                      : "📝 Session Log"}
                  </div>
                  {tx.action && (
                    <div className="text-xs text-gray-600">{tx.action}</div>
                  )}
                  <div className="text-xs text-gray-500 font-mono">
                    {tx.transactionId}
                  </div>
                </div>
                <div
                  className={`text-xs px-2 py-1 rounded ${
                    tx.status === "success"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tx.status}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {tx.timestamp.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  SafeGuard AI
                </h1>
                <p className="text-sm text-gray-500">
                  Women Safety & Support Platform
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    serverStatus === "online"
                      ? "bg-green-500"
                      : serverStatus === "offline"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                ></div>
                <span className="text-sm text-gray-600">
                  {serverStatus === "online"
                    ? "Connected"
                    : serverStatus === "offline"
                    ? "Offline"
                    : "Connecting..."}
                </span>
              </div>

              {!sessionActive ? (
                <button
                  onClick={startSession}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Start Session
                </button>
              ) : (
                <button
                  onClick={endSession}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  End & Log Session
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Chat Interface - Main Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-800">
                  AI Assistant Chat
                </h2>
                <p className="text-sm text-gray-600">
                  Ask me anything about Hedera blockchain operations or get
                  support.
                  {sessionActive && (
                    <span className="text-green-600 font-medium">
                      {" "}
                      Session active - all interactions are being logged
                      securely.
                    </span>
                  )}
                </p>
              </div>

              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}

                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 rounded-lg px-4 py-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          AI is thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t bg-white">
                <div className="flex space-x-4">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      sessionActive
                        ? "Type your message..."
                        : "Start a session to begin chatting..."
                    }
                    disabled={!sessionActive || isLoading}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={
                      !inputMessage.trim() || !sessionActive || isLoading
                    }
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>

                {/* Example prompts */}
                {!isLoading && sessionActive && messages.length <= 2 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">
                      Try these example commands:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Create a new topic called CaseReports",
                        "Check balance of 0.0.6915283",
                        "What is Hedera Hashgraph?",
                        'Send message "Evidence logged" to topic 0.0.123456',
                      ].map((example, i) => (
                        <button
                          key={i}
                          onClick={() => setInputMessage(example)}
                          className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Transaction Log */}
          <div className="lg:col-span-1">
            <TransactionLog />

            {/* Session Info */}
            <div className="mt-6 bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">
                Session Information
              </h3>

              {sessionActive ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Status:</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Started:</span>
                    <span className="text-gray-800">
                      {sessionStartTime?.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Messages:</span>
                    <span className="text-gray-800">
                      {messages.filter((m) => m.type !== "system").length}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">No active session</p>
              )}
            </div>

            {/* Platform Info */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                🔒 Blockchain Security
              </h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                All sessions are automatically logged to Hedera blockchain using
                SHA-256 hashing for immutable audit trails while protecting your
                privacy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotInterface;
