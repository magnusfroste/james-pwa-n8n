
import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, MicOff, Smile, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "./MessageBubble";
import ChatHeader from "./ChatHeader";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

// Generate a unique session ID when the component loads
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const ChatInterface = () => {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [communicationMethod, setCommunicationMethod] = useState("both");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const micButtonRef = useRef<HTMLButtonElement>(null);
  
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load communication method from localStorage
    const savedMethod = localStorage.getItem("harmony-communication-method");
    if (savedMethod) {
      setCommunicationMethod(savedMethod);
    }

    // Listen for storage changes to update method in real time
    const handleStorageChange = () => {
      const method = localStorage.getItem("harmony-communication-method");
      if (method) {
        setCommunicationMethod(method);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        sendAudioMessage();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    startRecording();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  const handleTouchCancel = (e: React.TouchEvent) => {
    e.preventDefault();
    stopRecording();
  };

  const sendAudioMessage = async () => {
    if (audioChunksRef.current.length === 0) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('timestamp', new Date().toISOString());
    formData.append('user_id', 'chat_user');
    formData.append('session_id', sessionId);
    formData.append('message_type', 'audio');

    // Add a user message indicating audio was sent
    const userMessage: Message = {
      id: Date.now().toString(),
      text: "🎤 Voice message sent",
      isUser: true,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      console.log("Sending audio to n8n webhook");
      console.log("Session ID:", sessionId);
      
      const response = await fetch("https://agent.froste.eu/webhook/d2f1481f-eaa9-4508-bc3d-35d209ab53c7", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle text response
      const responseText = await response.text();
      console.log("Response from n8n:", responseText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending audio to webhook:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble processing your voice message. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Audio Processing Error",
        description: "Failed to process voice message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInputValue("");
    setIsTyping(true);

    try {
      console.log("Sending message to n8n webhook:", textToSend);
      console.log("Session ID:", sessionId);
      
      const response = await fetch("https://agent.froste.eu/webhook/d2f1481f-eaa9-4508-bc3d-35d209ab53c7", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: textToSend,
          timestamp: new Date().toISOString(),
          user_id: "chat_user",
          session_id: sessionId,
          message_type: "text",
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle text response
      const responseText = await response.text();
      console.log("Response from n8n:", responseText);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message to webhook:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to send message to the webhook. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleHappyClick = () => {
    handleSendMessage("😊 I'm feeling good!");
  };

  const handleSadClick = () => {
    handleSendMessage("😔 I'm feeling down...");
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const showTextInput = communicationMethod === "both" || communicationMethod === "text";
  const showVoiceInput = communicationMethod === "both" || communicationMethod === "voice";

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl">
      <ChatHeader />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording {formatRecordingTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="border-t border-gray-100 px-4 py-4 bg-white space-y-3">
        {/* Text Input Row */}
        {showTextInput && (
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isRecording}
                className="pr-14 py-3 rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isRecording}
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Send className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        )}

        {/* Voice Input Row with Smiley Icons */}
        {showVoiceInput && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={handleHappyClick}
              disabled={isTyping || isRecording}
              size="icon"
              className="w-12 h-12 rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 transition-colors"
            >
              <Smile className="h-6 w-6 text-white" />
            </Button>

            <Button
              ref={micButtonRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isTyping}
              size="icon"
              className={`w-16 h-16 rounded-full transition-colors touch-manipulation select-none ${
                isRecording 
                  ? "bg-red-500 hover:bg-red-600" 
                  : "bg-green-500 hover:bg-green-600"
              } disabled:bg-gray-300`}
              style={{ 
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              {isRecording ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </Button>

            <Button
              onClick={handleSadClick}
              disabled={isTyping || isRecording}
              size="icon"
              className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
            >
              <Frown className="h-6 w-6 text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
