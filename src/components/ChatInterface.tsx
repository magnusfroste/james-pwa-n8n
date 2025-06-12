
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
    <div className="flex flex-col h-full w-full max-w-full mx-auto bg-white shadow-xl overflow-hidden">
      <div className="safe-area-inset-top">
        <ChatHeader />
      </div>
      
      <div className="flex-1 min-h-0 overflow-hidden">
        <MessagesList 
          messages={messages} 
          isTyping={isTyping} 
        />
      </div>

      <div className="flex-shrink-0 safe-area-inset-bottom">
        <ChatInput
          onSendMessage={handleSendMessage}
          sendAudioMessage={sendAudioMessage}
          isTyping={isTyping}
          communicationMethod={communicationMethod}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
