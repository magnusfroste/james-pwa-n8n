
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
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 safe-area-inset-top">
        <ChatHeader />
      </div>
      
      {/* Messages - Constrained height to ensure input is visible */}
      <div className="flex-1 min-h-0 max-h-[calc(100vh-200px)] overflow-hidden">
        <MessagesList 
          messages={messages} 
          isTyping={isTyping} 
        />
      </div>

      {/* Input - Fixed at bottom with guaranteed space */}
      <div className="flex-shrink-0 h-auto min-h-[120px] safe-area-inset-bottom bg-white border-t">
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
