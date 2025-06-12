
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useChatLogic = () => {
  const [sessionId] = useState(generateSessionId());
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const communicationMethod = "both"; // Always both text and voice
  
  const { toast } = useToast();

  const handleSendMessage = async (messageText?: string, inputValue?: string, setInputValue?: (value: string) => void) => {
    const textToSend = messageText || inputValue;
    if (!textToSend?.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText && setInputValue) setInputValue("");
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

  const sendAudioMessage = async (audioChunksRef: React.MutableRefObject<Blob[]>) => {
    if (audioChunksRef.current.length === 0) return;

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    const formData = new FormData();
    
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('timestamp', new Date().toISOString());
    formData.append('user_id', 'chat_user');
    formData.append('session_id', sessionId);
    formData.append('message_type', 'audio');

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

  return {
    messages,
    isTyping,
    communicationMethod,
    handleSendMessage,
    sendAudioMessage,
    sessionId,
  };
};

export type { Message };
