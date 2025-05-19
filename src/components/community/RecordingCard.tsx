import React, { useState, useRef } from 'react';
import { Play, Pause, MessageSquare, Calendar, ThumbsUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useStore, Recording } from '../../store/store';

interface RecordingCardProps {
  recording: Recording;
  onOpenFeedback?: (id: string) => void;
}

const RecordingCard: React.FC<RecordingCardProps> = ({ recording, onOpenFeedback }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [liked, setLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
  
  const handleLike = () => {
    setLiked(!liked);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-5 rounded-lg shadow-sm border"
    >
      <div className="space-y-4">
        <div className="flex justify-between">
          <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            <span>{format(parseISO(recording.date), 'MMM d, yyyy')}</span>
          </div>
          
          <button 
            onClick={handleLike}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
              liked ? 'text-error' : 'text-muted-foreground'
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            <span>{liked ? 'Liked' : 'Like'}</span>
          </button>
        </div>
        
        <div className="bg-muted p-3 rounded-md">
          <p className="text-sm italic">"{recording.prompt}"</p>
        </div>
        
        <div className="audio-visualizer bg-muted/50 rounded-md flex items-center justify-center p-4">
          <audio 
            ref={audioRef} 
            src={recording.audioUrl} 
            onEnded={() => setIsPlaying(false)} 
          />
          <button
            onClick={handlePlayPause}
            className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </button>
        </div>
        
        {onOpenFeedback && (
          <button
            onClick={() => onOpenFeedback(recording.id)}
            className="w-full btn-outline flex items-center justify-center"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>
              {recording.feedback && recording.feedback.length > 0
                ? `View Feedback (${recording.feedback.length})`
                : 'Leave Feedback'}
            </span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RecordingCard;