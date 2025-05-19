import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/store';
import ActivityCalendar from '../components/progress/ActivityCalendar';
import ProgressChart from '../components/progress/ProgressChart';
import { format, parseISO } from 'date-fns';

const ProfilePage: React.FC = () => {
  const { user, recordings } = useStore();
  
  if (!user) return null;
  
  const stats = {
    totalRecordings: recordings.length,
    publicRecordings: recordings.filter(r => r.isPublic).length,
    privateRecordings: recordings.filter(r => !r.isPublic).length,
    currentStreak: user.streakCount || 0,
  };
  
  return (
    <div className="max-w-4xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Track your progress and see how far you've come.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border h-full">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-medium">{user.username}</h2>
                  <p className="text-sm text-muted-foreground">
                    Joined {format(parseISO(user.joinedDate), 'MMMM yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Total Recordings</span>
                  <span className="font-medium">{stats.totalRecordings}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Public Recordings</span>
                  <span className="font-medium">{stats.publicRecordings}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Private Recordings</span>
                  <span className="font-medium">{stats.privateRecordings}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Current Streak</span>
                  <span className="font-medium">{stats.currentStreak} days</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <ActivityCalendar />
          </div>
        </div>
        
        <div className="mb-8">
          <ProgressChart />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-medium mb-4">Recent Achievements</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-muted/30 p-4 rounded-md border border-muted">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                🎯
              </div>
              <h3 className="font-medium mb-1">First Recording</h3>
              <p className="text-sm text-muted-foreground">
                Made your first voice recording
              </p>
            </div>
            
            {stats.publicRecordings > 0 && (
              <div className="bg-muted/30 p-4 rounded-md border border-muted">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                  🌟
                </div>
                <h3 className="font-medium mb-1">Community Contributor</h3>
                <p className="text-sm text-muted-foreground">
                  Shared a recording with the community
                </p>
              </div>
            )}
            
            {stats.totalRecordings >= 5 && (
              <div className="bg-muted/30 p-4 rounded-md border border-muted">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                  🔥
                </div>
                <h3 className="font-medium mb-1">Practice Makes Perfect</h3>
                <p className="text-sm text-muted-foreground">
                  Completed 5+ recordings
                </p>
              </div>
            )}
          </div>
          
          {stats.totalRecordings === 0 && (
            <div className="mt-4 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't earned any achievements yet. Start recording to unlock them!
              </p>
              <a
                href="/record"
                className="btn-primary inline-flex"
              >
                Start Recording
              </a>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;