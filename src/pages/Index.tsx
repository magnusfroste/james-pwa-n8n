
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

    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  return (
    <div className="h-screen-mobile w-full bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      <ChatInterface />
    </div>
  );
};

export default Index;
