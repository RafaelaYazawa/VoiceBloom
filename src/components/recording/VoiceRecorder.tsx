import React, { useState, useRef, useEffect } from "react";
import { Mic, Square, Save, Trash2, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";
import { useStore } from "../../store/store";

interface VoiceRecorderProps {
  onSave: (blob: Blob, prompt: string) => void;
  audioUrl: string | null;
  onRecordingComplete?: (blob: Blob, url: string) => void;
  prompt: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onSave,
  audioUrl,
  onRecordingComplete,
  prompt,
}) => {
  const { isRecording, setIsRecording, setCurrentAudioBlob, currentAudioBlob } =
    useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const effectiveAudioUrl = audioUrl ?? localAudioUrl;
  const [customPrompt, setCustomPrompt] = useState("");
  const [promptMode, setPromptMode] = useState<"daily" | "custom">(
    prompt ? "daily" : "custom"
  );
  const finalPrompt = promptMode === "daily" ? prompt ?? "" : customPrompt;

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        window.clearInterval(timerIntervalRef.current);
      }
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [localAudioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
        chunksRef.current.push(e.data);
      });

      mediaRecorderRef.current.addEventListener("stop", () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setLocalAudioUrl(url);
        setCurrentAudioBlob(blob);
        chunksRef.current = [];

        if (onRecordingComplete) {
          onRecordingComplete(blob, url);
        }
      });

      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert(
        "Could not access your microphone. Please check permissions and try again."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
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
      const cleanCustomPrompt = customPrompt.trim();
      const effectivePrompt =
        promptMode === "custom" && cleanCustomPrompt !== ""
          ? cleanCustomPrompt
          : prompt ?? "";
      onSave(currentAudioBlob, effectivePrompt);
      reset();
      setCustomPrompt("");
    }
  };

  const handleDiscard = () => {
    reset();
  };

  const reset = () => {
    setRecordingTime(0);
    setLocalAudioUrl(null);
    setCurrentAudioBlob(null);
    if (localAudioUrl) {
      URL.revokeObjectURL(localAudioUrl);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <div className="space-y-6">
        <div className="p-4 bg-muted rounded-md">
          <div className="flex items-center justify-between gap-4 mb-3">
            <h3 className="text-lg font-medium mb-2">Today's Prompt:</h3>

            <label className="inline-flex items-center cursor-pointer select-none relative">
              <span className="mr-2 text-sm font-medium text-gray-700">
                Daily
              </span>

              <input
                type="checkbox"
                checked={promptMode === "custom"}
                disabled={!prompt}
                onChange={() =>
                  setPromptMode((prev) =>
                    prev === "daily" ? "custom" : "daily"
                  )
                }
                className="sr-only peer"
              />

              <div
                className="w-11 h-6 rounded-full bg-gray-300 peer-checked:bg-purple-600
                relative after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                after:bg-white after:border after:rounded-full after:h-5 after:w-5
                after:transition-transform peer-checked:after:translate-x-full peer-checked:after:border-white"
              ></div>

              <span className="ml-2 text-sm font-medium text-gray-700">
                Custom
              </span>
            </label>
          </div>
          {promptMode === "daily" && prompt ? (
            <p className="text-gray text-lg italic">{prompt}</p>
          ) : promptMode === "custom" ? (
            <input
              autoFocus
              spellCheck={false}
              className="w-full min-h-10 rounded border border-gray-400 bg-gray-100 rounded-lg p-2 text-gray-900"
              placeholder="Type your custom prompt here..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          ) : null}
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
          ) : effectiveAudioUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <audio
                ref={audioRef}
                src={effectiveAudioUrl}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="text-center">
                <div className="text-lg font-medium mb-2">
                  {formatTime(recordingTime)}
                </div>
                <button
                  onClick={handlePlayPause}
                  className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
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
          {!isRecording && !effectiveAudioUrl ? (
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
