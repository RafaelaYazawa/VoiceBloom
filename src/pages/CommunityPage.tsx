import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import RecordingCard from '../components/community/RecordingCard';
import FeedbackForm from '../components/community/FeedbackForm';

const CommunityPage: React.FC = () => {
  const { recordings } = useStore();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  
  // Get only public recordings
  const publicRecordings = recordings.filter(r => r.isPublic);
  
  const handleOpenFeedback = (id: string) => {
    setSelectedRecordingId(id);
  };
  
  const handleCloseFeedback = () => {
    setSelectedRecordingId(null);
  };
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Community</h1>
          <p className="text-muted-foreground">
            Listen to recordings from other members and provide supportive feedback.
          </p>
        </div>
        
        {publicRecordings.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
            <p className="text-muted-foreground mb-4">
              There are no public recordings yet. Be the first to share!
            </p>
            <a
              href="/record"
              className="btn-primary inline-flex"
            >
              Record and Share
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {publicRecordings.map((recording) => (
              <RecordingCard
                key={recording.id}
                recording={recording}
                onOpenFeedback={handleOpenFeedback}
              />
            ))}
          </div>
        )}
        
        {selectedRecordingId && (
          <div className="fixed inset-0 bg-foreground/30 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <FeedbackForm
                  recordingId={selectedRecordingId}
                  onClose={handleCloseFeedback}
                />
              </div>
            </motion.div>
          </div>
        )}
        
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-medium mb-4">Community Guidelines</h2>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Be encouraging and supportive in your feedback.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Focus on positive aspects of the recording.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              If offering suggestions, do so constructively and kindly.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Remember everyone is at a different stage in their journey.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Report any inappropriate content to moderators.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;