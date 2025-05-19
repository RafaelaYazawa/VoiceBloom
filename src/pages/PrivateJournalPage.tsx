import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useStore } from '../store/store';
import RecordingCard from '../components/community/RecordingCard';
import PrivateNoteForm from '../components/recording/PrivateNoteForm';

const PrivateJournalPage: React.FC = () => {
  const { recordings } = useStore();
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  
  // Get only private recordings
  const privateRecordings = recordings.filter(r => !r.isPublic);
  
  const selectedRecording = selectedRecordingId 
    ? recordings.find(r => r.id === selectedRecordingId)
    : null;
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Private Journal</h1>
          <p className="text-muted-foreground">
            Your personal space to review recordings and reflect on your progress.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-medium mb-4">My Recordings</h2>
            
            {privateRecordings.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
                <p className="text-muted-foreground mb-4">
                  You don't have any private recordings yet.
                </p>
                <a
                  href="/record"
                  className="btn-primary inline-flex"
                >
                  Create Your First Recording
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {privateRecordings.map((recording) => (
                  <div
                    key={recording.id}
                    onClick={() => setSelectedRecordingId(recording.id)}
                    className={`cursor-pointer transition-all ${
                      selectedRecordingId === recording.id
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    }`}
                  >
                    <RecordingCard recording={recording} />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-medium mb-4">Self-Reflection</h2>
            
            {selectedRecording ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">
                    Recording from {format(parseISO(selectedRecording.date), 'MMMM d, yyyy')}
                  </p>
                </div>
                
                <PrivateNoteForm recordingId={selectedRecording.id} />
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <p className="text-muted-foreground text-center">
                  Select a recording to add notes and rate your performance.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivateJournalPage;