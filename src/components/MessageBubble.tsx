
import { format } from "date-fns";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { text, isUser, timestamp } = message;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate-fade-in`}>
      <div className="max-w-xs lg:max-w-md">
        <div
          className={`
            px-4 py-3 rounded-2xl shadow-sm
            ${
              isUser
                ? "bg-blue-500 text-white rounded-br-md"
                : "bg-gray-100 text-gray-900 rounded-bl-md"
            }
          `}
        >
          <p className="text-sm leading-relaxed">{text}</p>
        </div>
        
        <div className={`mt-1 text-xs text-gray-500 ${isUser ? "text-right" : "text-left"}`}>
          {format(timestamp, "HH:mm")}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
