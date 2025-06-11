
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';

export const InstallPrompt = () => {
  const [isDismissed, setIsDismissed] = useState(false);
  const { isInstallable, installApp } = usePWA();

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <Download className="h-5 w-5" />
        <div>
          <p className="font-medium">Install Chat Assistant</p>
          <p className="text-sm opacity-90">Get the full app experience</p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          onClick={installApp}
          variant="ghost"
          size="sm"
          className="text-white hover:bg-blue-600"
        >
          Install
        </Button>
        <Button
          onClick={() => setIsDismissed(true)}
          variant="ghost"
          size="icon"
          className="text-white hover:bg-blue-600 h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
