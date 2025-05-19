import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Save, Trash2, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/store';

interface VoiceRecorderProps {
  onSave: (blob: Blob) => void;
  prompt: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSave, prompt }) => {
  const { isRecording, setIsRecording, setCurrentAudioBlob, currentAudioBlob } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.addEventListener('dataavailable', (e) => {
        chunksRef.current.push(e.data);
      });
      
      mediaRecorderRef.current.addEventListener('stop', () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setCurrentAudioBlob(blob);
        chunksRef.current = [];
      });
      
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access your microphone. Please check permissions and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      setIsRecording(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    if (currentAudioBlob) {
      onSave(currentAudioBlob);
      reset();
    }
  };

  const handleDiscard = () => {
    reset();
  };

  const reset = () => {
    setRecordingTime(0);
    setAudioUrl(null);
    setCurrentAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-md">
          <h3 className="text-lg font-medium mb-2">Today's Prompt:</h3>
          <p className="text-foreground">{prompt}</p>
        </div>
        
        <div className="audio-visualizer bg-muted rounded-lg flex items-center justify-center">
          {isRecording ? (
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="w-16 h-16 bg-error/80 rounded-full flex items-center justify-center"
            >
              <Mic className="h-8 w-8 text-white" />
            </motion.div>
          ) : audioUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
              <div className="text-center">
                <div className="text-lg font-medium mb-2">{formatTime(recordingTime)}</div>
                <button 
                  onClick={handlePlayPause}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">
              <p>Press record to start</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-center">
          {!isRecording && !audioUrl ? (
            <button
              onClick={startRecording}
              className="btn-primary flex items-center"
              disabled={isRecording}
            >
              <Mic className="mr-2 h-4 w-4" />
              Start Recording
            </button>
          ) : isRecording ? (
            <button
              onClick={stopRecording}
              className="btn-outline border-error text-error hover:bg-error/10 flex items-center"
            >
              <Square className="mr-2 h-4 w-4" />
              Stop Recording ({formatTime(recordingTime)})
            </button>
          ) : (
            <div className="flex space-x-4">
              <button
                onClick={handleDiscard}
                className="btn-outline flex items-center"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Discard
              </button>
              <button
                onClick={handleSave}
                className="btn-primary flex items-center"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Recording
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;