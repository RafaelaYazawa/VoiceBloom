import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VoiceRecorder from '../components/recording/VoiceRecorder';
import { useStore } from '../store/store';

const RecordPage: React.FC = () => {
  const { dailyPrompt, addRecording, addToast } = useStore();
  const [isPublic, setIsPublic] = useState(false);
  
  const handleSaveRecording = (blob: Blob) => {
    // In a real app, we would upload the blob to a server
    // For demo purposes, we create a fake URL
    const fakeUrl = URL.createObjectURL(blob);
    
    addRecording({
      prompt: dailyPrompt,
      audioUrl: fakeUrl,
      isPublic,
      date: new Date().toISOString(),
    });
    
    addToast({
      title: 'Recording saved',
      description: isPublic ? 'Your recording is now public' : 'Your recording has been saved privately',
      type: 'success',
    });
  };
  
  return (
    <div className="max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Daily Practice</h1>
          <p className="text-muted-foreground">
            Record yourself speaking to the prompt below. Take your time and speak naturally.
          </p>
        </div>
        
        <VoiceRecorder 
          onSave={handleSaveRecording} 
          prompt={dailyPrompt}
        />
        
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Sharing Options</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Share with Community</p>
              <p className="text-sm text-muted-foreground">
                Make your recording available for others to hear and provide feedback.
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={() => setIsPublic(!isPublic)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-muted after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          
          {isPublic && (
            <div className="mt-4 p-3 bg-accent/10 rounded-md text-sm">
              <p className="text-accent">
                Your recording will be shared anonymously. No personal information will be visible to others.
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Tips for Better Recordings</h3>
          
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Find a quiet space with minimal background noise.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Speak at a comfortable pace - there's no rush.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              It's okay to make mistakes! This is a practice space.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Try to express emotions through your voice.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Record multiple times if needed until you're satisfied.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default RecordPage;