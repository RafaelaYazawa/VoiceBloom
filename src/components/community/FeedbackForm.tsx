import React, { useState } from 'react';
import { useStore, Recording } from '../../store/store';

interface FeedbackFormProps {
  recordingId: string;
  onClose: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ recordingId, onClose }) => {
  const { user, recordings, updateRecording } = useStore();
  const recording = recordings.find((r) => r.id === recordingId);
  
  const [content, setContent] = useState('');
  const [tips, setTips] = useState('');
  
  if (!recording || !user) return null;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFeedback = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.username,
      content,
      tips: tips || undefined,
      createdAt: new Date().toISOString(),
    };
    
    updateRecording(recordingId, {
      feedback: [...(recording.feedback || []), newFeedback],
    });
    
    onClose();
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Leave Feedback</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Share your thoughts and encouragement with this person.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Encouragement
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full rounded-md border border-input p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="What did you like about this recording?"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">
            Tips (Optional)
          </label>
          <textarea
            value={tips}
            onChange={(e) => setTips(e.target.value)}
            className="w-full rounded-md border border-input p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Do you have any helpful tips to share?"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="btn-outline flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary flex-1"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default FeedbackForm;