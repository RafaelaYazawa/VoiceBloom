import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Visibility, Recording } from "../store/store";
import PrivateNoteForm from "../components/recording/PrivateNoteForm";
import Tab from "../components/layout/Tab";
import { getRecordings } from "../utils/api";

const PrivateJournalPage: React.FC = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState<Visibility>(Visibility.PRIVATE);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const loadRecordings = async () => {
      const recs = await getRecordings(activeTab);
      setRecordings(recs);
    };
    loadRecordings();
  }, [activeTab]);

  const selectedRecording = selectedRecordingId
    ? recordings.find((r) => r.id === selectedRecordingId)
    : null;

  const handleRecordingUpdated = (updatedRecording: Recording) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === updatedRecording.id ? updatedRecording : r))
    );
  };

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
            Your personal space to review recordings and reflect on your
            progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-xl font-medium mb-4">My Recordings</h2>
            <Tab
              recordings={recordings}
              selectedRecordingId={selectedRecordingId}
              setSelectedRecordingId={setSelectedRecordingId}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>

          <div>
            <h2 className="text-xl font-medium mb-4">Self-Reflection</h2>

            {selectedRecording ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-muted-foreground">
                    Recording from{" "}
                    {format(
                      parseISO(selectedRecording.created_at),
                      "MMMM d, yyyy"
                    )}
                  </p>
                </div>

                <PrivateNoteForm
                  recording={selectedRecording}
                  onRecordingUpdate={handleRecordingUpdated}
                />
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
