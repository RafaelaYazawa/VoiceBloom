import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Recording } from "../store/store";
import { getCommunityRecordings } from "../utils/api";
import RecordingCard from "../components/community/RecordingCard";
import FeedbackForm from "../components/community/FeedbackForm";
import supabase from "../utils/supabaseClient";
import { useStore } from "../store/store";

const CommunityPage: React.FC = () => {
  const addToast = useStore((state) => state.addToast);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );

  // Load recordings on mount
  useEffect(() => {
    async function fetchRecordings() {
      const res = await getCommunityRecordings();
      setRecordings(res);
    }
    fetchRecordings();
  }, []);

  // Load feedbacks for selected recording
  const loadFeedbacks = async (recording: Recording) => {
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("*")
      .eq("recording_id", recording.id);
    if (!error) {
      setSelectedRecording({ ...recording, feedback: feedbacks });
    } else {
      addToast({
        title: "Failed to load feedback",
        type: "error",
      });
    }
  };

  const handleOpenFeedback = (recording: Recording) => {
    loadFeedbacks(recording);
  };

  const handleCloseFeedback = () => {
    setSelectedRecording(null);
  };

  // Called by FeedbackForm after successful submit to refresh feedback list
  const handleFeedbackSubmit = async (
    recording: Recording,
    commentType: string,
    comment: string
  ) => {
    if (!recording || !comment.trim()) {
      addToast({
        title: "Please enter feedback",
        type: "error",
      });
      return;
    }
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      addToast({
        title: "User authentication error",
        description: userError.message,
        type: "error",
      });
      return;
    }

    const { error } = await supabase.from("feedbacks").insert({
      recording_id: recording.id,
      comment_type: commentType,
      comment,
      user_id: user?.id || null,
    });

    if (error) {
      addToast({
        title: "Failed to submit feedback",
        description: error.message,
        type: "error",
      });
    } else {
      addToast({
        title: "Feedback submitted!",
        type: "success",
      });
    }
    await loadFeedbacks(recording);
  };

  const publicRecordings = recordings.filter(
    (r) => r.visibility === "public" || r.visibility === "anonymous"
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-semibold mb-4">Community</h1>
        <p className="mb-8 text-muted-foreground">
          Listen to recordings from other members and provide supportive
          feedback.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {publicRecordings.map((recording) => {
            const displayName =
              recording.visibility === "anonymous"
                ? "Anonymous"
                : recording.username || recording.email || "Unknown User";

            const isSelected = selectedRecording?.id === recording.id;

            return (
              <div key={recording.id} className="space-y-4">
                <RecordingCard
                  recording={recording}
                  displayName={displayName}
                  onOpenFeedback={() => handleOpenFeedback(recording)}
                />

                {isSelected && selectedRecording && (
                  <div className="bg-white border rounded-lg p-4 shadow-md">
                    <h3 className="text-lg font-semibold mb-3">Feedback</h3>

                    {selectedRecording.feedback?.length ? (
                      <ul className="space-y-2 max-h-40 overflow-y-auto mb-4 text-sm">
                        {selectedRecording.feedback.map((fb, i) => (
                          <li
                            key={i}
                            className="border rounded p-2 break-words"
                          >
                            <strong className="capitalize">
                              {fb.comment_type}:
                            </strong>{" "}
                            {fb.comment}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mb-4 text-muted-foreground">
                        Be the first to give feedback.
                      </p>
                    )}

                    <FeedbackForm
                      recording={selectedRecording}
                      onClose={handleCloseFeedback}
                      onSubmitFeedback={handleFeedbackSubmit}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
