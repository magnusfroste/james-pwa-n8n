
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
    <div className="flex flex-col h-full w-full max-w-full mx-auto bg-white shadow-xl overflow-hidden safe-area-inset-top safe-area-inset-bottom">
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
