
import { Settings, Info, Smartphone, Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">H</span>
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">James</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <Info className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Add to iPhone Home Screen</h2>
                <div className="space-y-3 text-base">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">1</div>
                    <p className="text-gray-700">Tap the Share button at the bottom of Safari</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">2</div>
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-700">Tap "Add to Home Screen"</p>
                      <Plus className="h-4 w-4 text-gray-500" />
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">3</div>
                    <p className="text-gray-700">Tap "Add" to confirm</p>
                  </div>
                  <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
                    <Home className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-gray-600">James will appear on your home screen like a regular app!</p>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSettingsClick}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
