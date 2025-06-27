import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { Visibility, Recording } from "../store/store";
import PrivateNoteForm from "../components/recording/PrivateNoteForm";
import Tab from "../components/layout/Tab";
import { getRecordings } from "../utils/api";
import Button from "../components/ui/Button";
import { X } from "lucide-react";
import { useAuth } from "../store/AuthContext";

const PrivateJournalPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [activeTab, setActiveTab] = useState<Visibility>(Visibility.PRIVATE);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(
    null
  );
  const [loadingRecordings, setLoadingRecordings] = useState(true);

  useEffect(() => {
    const loadRecordings = async () => {
      if (authLoading) {
        setLoadingRecordings(true);
        return;
      }

      if (!user) {
        setRecordings([]);
        setLoadingRecordings(false);
        console.warn(
          "PrivateJournalPage: No authenticated user. Cannot fetch recordings."
        );
        return;
      }
      try {
        const recs = await getRecordings(user, activeTab);
        setRecordings(recs);
      } catch (error) {
        console.error("PrivateJournalPage: Error loading recordings:", error);
        setRecordings([]); // Clear recordings on error
      } finally {
        setLoadingRecordings(false); // End loading for this component's data fetch
      }
    };

    loadRecordings();
  }, [activeTab, user, authLoading, setRecordings]);

  const selectedRecording = selectedRecordingId
    ? recordings.find((r) => r.id === selectedRecordingId)
    : null;

  const handleRecordingUpdated = (updatedRecording: Recording) => {
    setRecordings((prev) =>
      prev.map((r) => (r.id === updatedRecording.id ? updatedRecording : r))
    );
  };

  const onClose = () => {
    setSelectedRecordingId(null);
  };

  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Tab
                recordings={recordings}
                selectedRecordingId={selectedRecordingId}
                setSelectedRecordingId={setSelectedRecordingId}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isLoading={loadingRecordings}
              />
            </motion.div>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-4">Self-Reflection</h2>

            {selectedRecording ? (
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="mb-4 pb-2 border-b flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Recording from{" "}
                    {format(parseISO(selectedRecording.date), "MMMM d, yyyy")}
                  </p>
                  <Button
                    onClick={onClose}
                    className="ml-auto p-2 hover:bg-gray-100 rounded"
                    aria-label="Close feedback panel"
                  >
                    <X size={24} className="w-4 h-4" />
                  </Button>
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
