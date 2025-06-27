import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, MessageSquare, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format, formatDate, parseISO } from "date-fns";
import { Recording } from "../../store/store";
import Button from "../ui/Button";
import { useAuth } from "../../store/AuthContext";
import supabase from "../../utils/supabaseClient";

interface RecordingCardProps {
  recording: Recording;
  displayName: string;
  feedbackCount: number;
  onOpenFeedback?: () => void;
}

const RecordingCard: React.FC<RecordingCardProps> = ({
  recording,
  displayName,
  feedbackCount,
}) => {
  const { user, loading } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (user && user.id === recording.user_id) {
      setIsOwner(true);
    } else {
      setIsOwner(false);
    }
  }, [user, loading, recording.user_id]);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!recording.audio_url) return;

      const { data, error } = await supabase.storage
        .from(import.meta.env.VITE_SUPABASE_BUCKET!)
        .createSignedUrl(recording.audio_url, 3600);
      if (error) {
        console.error("Error getting signed URL:", error);
        return;
      }
      setSignedUrl(data.signedUrl);
    };
    fetchSignedUrl();
  }, [recording.audio_url]);

  useEffect(() => {
    if (!audioRef.current) return;
    console.log("Recording props:", recording);

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audioRef.current?.addEventListener("play", onPlay);
    audioRef.current?.addEventListener("pause", onPause);
    audioRef.current?.addEventListener("ended", onEnded);

    return () => {
      audioRef.current?.removeEventListener("play", onPlay);
      audioRef.current?.removeEventListener("pause", onPause);
      audioRef.current?.removeEventListener("ended", onEnded);
    };
  }, []);

  const handlePlayPause = () => {
    console.log("button clicked?");
    const audio = audioRef.current;
    if (!audio) return;

    if (audioRef.current?.paused) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-lg shadow-sm border"
    >
      <div className="space-y-4 borderRadius ">
        <div className="flex justify-between">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {recording.date ? (
              <span>{format(parseISO(recording.date), "MMM d, yyyy")}</span>
            ) : (
              <span className="italic text-gray-400">No date</span>
            )}
          </div>

          {recording.feedback && (
            <div>
              <div className="flex items-center text-muted-foreground text-xs space-x-1">
                <MessageSquare className="h-4 w-4" />
                <span>{feedbackCount}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-muted p-3 rounded-md">
          <div className="text-sm text-muted-foreground mb-2">
            {displayName}
          </div>
          <p className="text-sm italic">"{recording.prompt}"</p>
        </div>
        {isOwner && recording.title && (
          <div className="bg-muted px-4 py-2 rounded-md border-l-4 border-primary italic text-sm mb-2">
            {recording.title}
          </div>
        )}
        <div className="audio-visualizer bg-muted/50 rounded-md flex items-center justify-center p-4">
          <audio
            ref={audioRef}
            src={signedUrl ?? undefined}
            onEnded={() => setIsPlaying(false)}
          />
          <Button
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? (
              <Pause className="h-6 w-6" />
            ) : (
              <Play className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default RecordingCard;
