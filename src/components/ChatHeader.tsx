
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

const ChatHeader = () => {
  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">H</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Harmony</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
