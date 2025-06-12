
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecording = (sendAudioMessage: (audioChunksRef: React.MutableRefObject<Blob[]>) => Promise<void>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isStartingRef = useRef(false);
  
  const { toast } = useToast();

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    // Prevent multiple simultaneous starts
    if (isStartingRef.current || isRecording) {
      console.log("Recording already starting or in progress");
      return;
    }

    isStartingRef.current = true;

    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log("Data available:", event.data.size);
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        console.log("Recording stopped, chunks:", audioChunksRef.current.length);
        stream.getTracks().forEach(track => track.stop());
        
        // Only send if we have enough data (at least 1 second of recording)
        if (recordingTime >= 1) {
          sendAudioMessage(audioChunksRef);
        } else {
          console.log("Recording too short, not sending");
          toast({
            title: "Recording Too Short",
            description: "Please hold the button for at least 1 second to record.",
            variant: "destructive",
          });
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer with slower interval
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          console.log("Recording time:", newTime);
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    } finally {
      isStartingRef.current = false;
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isStartingRef.current) {
      console.log("Stopping recording...");
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    isRecording,
    recordingTime,
    startRecording,
    stopRecording,
    formatRecordingTime,
  };
};
