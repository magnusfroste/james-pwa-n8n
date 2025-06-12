
import { useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";

const Index = () => {
  useEffect(() => {
    // Set CSS custom property for viewport height on mobile
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // Force a resize after orientation change on mobile
    const handleOrientationChange = () => {
      setTimeout(setVH, 100);
      setTimeout(setVH, 500);
    };

    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden" style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
      <ChatInterface />
    </div>
  );
};

export default Index;
