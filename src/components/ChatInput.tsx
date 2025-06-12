
import { useState } from "react";
import { Send, Mic, MicOff, Smile, Frown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

interface ChatInputProps {
  onSendMessage: (messageText?: string, inputValue?: string, setInputValue?: (value: string) => void) => Promise<void>;
  sendAudioMessage: (audioChunksRef: React.MutableRefObject<Blob[]>) => Promise<void>;
  isTyping: boolean;
  communicationMethod: string;
}

const ChatInput = ({ onSendMessage, sendAudioMessage, isTyping, communicationMethod }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");
  
  const {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    formatRecordingTime,
  } = useVoiceRecording(sendAudioMessage);

  const handleSendMessage = async (messageText?: string) => {
    await onSendMessage(messageText, inputValue, setInputValue);
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

  const showTextInput = communicationMethod === "both" || communicationMethod === "text";
  const showVoiceInput = communicationMethod === "both" || communicationMethod === "voice";

  return (
    <div className="flex-shrink-0 w-full">
      {/* Recording Indicator */}
      {isRecording && (
        <div className="px-3 py-2 bg-red-50 border-t border-red-100">
          <div className="flex items-center justify-center space-x-2 text-red-600">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Recording {formatRecordingTime(recordingTime)}</span>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="border-t border-gray-100 px-3 py-3 bg-white space-y-3 w-full">
        {/* Text Input Row */}
        {showTextInput && (
          <div className="flex items-center space-x-2 w-full">
            <div className="flex-1 relative min-w-0">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                disabled={isRecording}
                className="pr-12 py-2.5 text-sm rounded-2xl border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors disabled:opacity-50 w-full"
              />
              
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isRecording}
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
              >
                <Send className="h-3 w-3 text-white" />
              </Button>
            </div>
          </div>
        )}

        {/* Voice Input Row with Smiley Icons */}
        {showVoiceInput && (
          <div className="flex items-center justify-center space-x-3 w-full">
            <Button
              onClick={handleHappyClick}
              disabled={isTyping || isRecording}
              size="icon"
              className="w-10 h-10 rounded-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 transition-colors touch-manipulation"
            >
              <Smile className="h-5 w-5 text-white" />
            </Button>

            <Button
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={handleTouchCancel}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isTyping}
              size="icon"
              className={`w-14 h-14 rounded-full transition-colors touch-manipulation ${
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
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-5 w-5 text-white" />
              )}
            </Button>

            <Button
              onClick={handleSadClick}
              disabled={isTyping || isRecording}
              size="icon"
              className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 transition-colors touch-manipulation"
            >
              <Frown className="h-5 w-5 text-white" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
