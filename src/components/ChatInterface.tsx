
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import ChatInput from "./ChatInput";
import { useChatLogic } from "@/hooks/useChatLogic";

const ChatInterface = () => {
  const {
    messages,
    isTyping,
    communicationMethod,
    handleSendMessage,
    sendAudioMessage,
  } = useChatLogic();

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl overflow-hidden">
      <ChatHeader />
      
      <MessagesList 
        messages={messages} 
        isTyping={isTyping} 
      />

      <ChatInput
        onSendMessage={handleSendMessage}
        sendAudioMessage={sendAudioMessage}
        isTyping={isTyping}
        communicationMethod={communicationMethod}
      />
    </div>
  );
};

export default ChatInterface;
