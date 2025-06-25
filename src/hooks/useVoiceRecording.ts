
import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

export const useVoiceRecording = (sendAudioMessage: (audioChunksRef: React.MutableRefObject<Blob[]>, mimeType: string) => Promise<void>) => {
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Simplified state management - use single state enum instead of multiple booleans
  const [recordingState, setRecordingState] = useState<'idle' | 'initializing' | 'recording' | 'stopping'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('');
  const recordingStartTimeRef = useRef<number>(0);
  
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

  const resetRecordingState = useCallback(() => {
    console.log("Resetting recording state");
    setRecordingState('idle');
    setRecordingTime(0);
    recordingStartTimeRef.current = 0;
    
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    console.log("startRecording called - current state:", recordingState);

    // Atomic state check and update
    if (recordingState !== 'idle') {
      console.log("Not in idle state, ignoring call. Current state:", recordingState);
      return;
    }

    // Immediately set to initializing to prevent race conditions
    setRecordingState('initializing');

    try {
      console.log("Starting recording initialization...");
      
      // Clean up any existing resources first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      console.log("Microphone access granted");
      streamRef.current = stream;
      
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/mp4',
        'audio/webm',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        console.error("No supported MIME type found for MediaRecorder");
        resetRecordingState();
        toast({
          title: "Recording Error",
          description: "Your browser does not support the required audio format.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Using MIME type:", supportedMimeType);
      mimeTypeRef.current = supportedMimeType;
      
      // Add delay for browser compatibility
      await new Promise(resolve => setTimeout(resolve, 200));
      
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
        
        // Calculate actual recording duration
        const actualDuration = recordingStartTimeRef.current > 0 
          ? (Date.now() - recordingStartTimeRef.current) / 1000 
          : recordingTime;
        
        console.log("Actual recording duration:", actualDuration, "seconds");
        
        const hasAudioData = audioChunksRef.current.length > 0;
        const isLongEnough = actualDuration >= 1;

        if (isLongEnough && hasAudioData) {
          console.log("Recording is valid, sending audio message");
          sendAudioMessage(audioChunksRef, mimeTypeRef.current);
        } else if (isLongEnough && !hasAudioData) {
            console.error("Recording was long enough, but no audio data was captured.");
            toast({
                title: "Recording Failed",
                description: "No audio was captured. Please try again.",
                variant: "destructive",
            });
        } else {
          console.log("Recording too short, not sending. Duration:", actualDuration);
          toast({
            title: "Recording Too Short",
            description: "Please record for at least 1 second.",
            variant: "destructive",
          });
        }
        
        // Clean up after recording stops
        resetRecordingState();
      };
      
      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        resetRecordingState();
        toast({
          title: "Recording Error",
          description: "An error occurred during recording. Please try again.",
          variant: "destructive",
        });
      };
      
      // Ensure MediaRecorder is ready and start recording
      if (mediaRecorder.state === 'inactive') {
        console.log("Starting MediaRecorder...");
        mediaRecorder.start(100); // Collect data every 100ms
        
        // Record the actual start time
        recordingStartTimeRef.current = Date.now();
        
        // Update state to recording only after successful start
        setRecordingState('recording');
        setRecordingTime(0);
        
        console.log("Recording started successfully at:", recordingStartTimeRef.current);
        
        // Start recording timer
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime(prev => {
            const newTime = prev + 1;
            console.log("Recording time:", newTime);
            return newTime;
          });
        }, 1000);
      } else {
        console.error("MediaRecorder is not in inactive state:", mediaRecorder.state);
        resetRecordingState();
      }
      
    } catch (error) {
      console.error("Error accessing microphone:", error);
      resetRecordingState();
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [recordingState, recordingTime, resetRecordingState, sendAudioMessage, toast]);

  const stopRecording = useCallback(() => {
    console.log("stopRecording called - current state:", recordingState);

    if (recordingState !== 'recording' || !mediaRecorderRef.current) {
      console.log("Not currently recording or no media recorder. State:", recordingState);
      return;
    }

    // Set to stopping state to prevent multiple stops
    setRecordingState('stopping');

    if (mediaRecorderRef.current.state === "recording") {
        console.log("Stopping recording...");
        // Explicitly request data before stopping for better browser compatibility
        mediaRecorderRef.current.requestData();
        mediaRecorderRef.current.stop();
    } else {
      console.log("MediaRecorder not in recording state:", mediaRecorderRef.current.state);
      resetRecordingState();
    }
  }, [recordingState, resetRecordingState]);

  const formatRecordingTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording: recordingState === 'recording' || recordingState === 'initializing',
    recordingTime,
    startRecording,
    stopRecording,
    formatRecordingTime,
  };
};
