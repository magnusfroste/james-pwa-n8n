import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecording = (sendAudioMessage: (audioChunksRef: React.MutableRefObject<Blob[]>, mimeType: string) => Promise<void>) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('');
  
  const { toast } = useToast();

  // Clean up recording timer on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    if (isRecording) {
      console.log("Already recording");
      return;
    }

    try {
      console.log("Starting recording...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/webm',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        console.error("No supported MIME type found for MediaRecorder");
        toast({
          title: "Recording Error",
          description: "Your browser does not support the required audio format.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Using MIME type:", supportedMimeType);
      mimeTypeRef.current = supportedMimeType;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: supportedMimeType
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
        
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        const hasAudioData = audioChunksRef.current.length > 0;
        const isLongEnough = recordingTime >= 1;

        if (isLongEnough && hasAudioData) {
          sendAudioMessage(audioChunksRef, mimeTypeRef.current);
        } else if (isLongEnough && !hasAudioData) {
            console.error("Recording was long enough, but no audio data was captured.");
            toast({
                title: "Recording Failed",
                description: "No audio was captured. Please try again.",
                variant: "destructive",
            });
        } else {
          console.log("Recording too short, not sending");
          toast({
            title: "Recording Too Short",
            description: "Please record for at least 1 second.",
            variant: "destructive",
          });
        }
      };
      
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start recording timer
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
    }
  };

  const stopRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) {
      console.log("Not currently recording");
      return;
    }

    if (mediaRecorderRef.current.state === "recording") {
        console.log("Stopping recording...");
        // Explicitly request data before stopping. This can help on browsers like Safari.
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
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
