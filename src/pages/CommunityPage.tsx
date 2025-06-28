import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Recording, Visibility } from "../store/store";
import { getCommunityRecordings } from "../utils/api";
import RecordingCard from "../components/community/RecordingCard";
import supabase from "../utils/supabaseClient";
import { useStore } from "../store/store";
import Button from "../components/ui/Button";
import FeedbackPanel from "../components/community/FeedbackPanel";
import { ScaleLoader } from "react-spinners";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import { useAuth } from "../store/AuthContext";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const addToast = useStore((state) => state.addToast);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(
    null
  );
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "general" | "encouragement" | "tips" | "add"
  >("general");
  const [groupedFeedbacks, setGroupedFeedbacks] = useState<{
    [key: string]: any[];
  }>({
    general: [],
    encouragement: [],
    tips: [],
  });

  const addRecordingButton = () => {
    navigate("/record");
  };

  useEffect(() => {
    const fetchRecordings = async () => {
      setLoading(true);
      try {
        const res = await getCommunityRecordings();
        setRecordings(res);
      } catch (error) {
        console.error(
          "CommunityPage: Error fetching community recordings:",
          error
        );
        addToast({
          title: "Error fetching community recordings",
          description: "Please try again later.",
          type: "error",
        });
        setRecordings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecordings();
  }, [addToast]);

  const loadFeedbacks = async (recording: Recording) => {
    if (!recording?.id) return null;
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("*, profile:profiles(email,username)")
      .eq("recording_id", recording.id);

    if (!error && feedbacks) {
      const grouped: { [key: string]: any[] } = {
        general: [],
        encouragement: [],
        tips: [],
      };
      feedbacks.forEach((fb) => {
        if (
          fb.comment_type &&
          grouped[fb.comment_type as keyof typeof grouped]
        ) {
          grouped[fb.comment_type as keyof typeof grouped].push(fb);
        }
      });
      const updatedRecording = { ...recording, feedback: feedbacks };
      setGroupedFeedbacks(grouped);
      setSelectedRecording(updatedRecording);

      setRecordings((prevRecordings) =>
        prevRecordings.map((rec) =>
          rec.id === updatedRecording.id ? updatedRecording : rec
        )
      );
      return updatedRecording;
    } else {
      addToast({
        title: "Failed to load feedback",
        description: error?.message || "An unexpected error occurred.",
        type: "error",
      });
      return null;
    }
  };

  const handleOpenFeedback = (recording: Recording) => {
    handleCloseFeedback();
    setSelectedRecording(recording);
    loadFeedbacks(recording);
  };

  const handleCloseFeedback = () => {
    setSelectedRecording(null);
    setGroupedFeedbacks({
      general: [],
      encouragement: [],
      tips: [],
    });
    setActiveTab("general");
  };

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
    if (authLoading || !user) {
      console.log("user???", user);

      addToast({
        title: "Authentication required",
        description: "Please log in to submit feedback.",
        type: "error",
      });
      return;
    }

    try {
      const { error } = await supabase.from("feedbacks").insert({
        recording_id: recording.id,
        comment_type: commentType,
        comment,
        user_id: user.id,
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
      const updatedRecording = await loadFeedbacks(recording);

      if (updatedRecording) {
        setRecordings((prevRecordings) =>
          prevRecordings.map((rec) =>
            rec.id === updatedRecording.id ? updatedRecording : rec
          )
        );
      }
    } catch (error: any) {
      console.error("Failed to submit feedback:", error.message);
      addToast({
        title: "Failed to submit feedback",
        description: error.message || "An unexpected error occurred.",
        type: "error",
      });
    }
  };

  const publicRecordings = recordings.filter(
    (r) =>
      r.visibility === Visibility.PUBLIC ||
      r.visibility === Visibility.ANONYMOUS
  );

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
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

        {loading ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <ScaleLoader color="#9333ea" height={23} />
            <p>Loading shared recordings</p>
          </div>
        ) : publicRecordings.length === 0 ? (
          <div className="text-center text-muted-foreground py-12 col-span-full">
            <p>No shared recordings yet</p>
            <Button
              className="mt-4 px-6 py-2 bg-primary text-white text-sm font-medium rounded-md"
              onClick={addRecordingButton}
            >
              Be the first to contribute!
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full min-w-0 lg:w-2/3 overflow-hidden">
              <Swiper
                modules={[Navigation, Grid]}
                spaceBetween={15}
                slidesPerView={2}
                slidesPerGroup={2}
                grid={{ rows: 2, fill: "row" }}
                navigation
                breakpoints={{
                  0: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    grid: { rows: 1 },
                  },
                  425: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    grid: { rows: 1 },
                  },
                  640: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    grid: { rows: 2 },
                  },
                  768: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    grid: { rows: 2, fill: "row" },
                  },
                  1024: {
                    slidesPerView: 2,
                    slidesPerGroup: 2,
                    grid: { rows: 2, fill: "row" },
                    speed: 700,
                  },
                }}
                speed={1000}
                className="mySwiper"
              >
                {publicRecordings.map((recording) => {
                  console.log(
                    "Recording USERNAME:",
                    recording.user_id?.username
                  );
                  console.log("Recording EMAIL:", recording.user_id?.email);
                  const isSelected = selectedRecording?.id === recording.id;

                  const displayName =
                    recording.visibility === Visibility.ANONYMOUS
                      ? "Anonymous"
                      : recording.user_id?.username
                      ? recording.user_id?.username
                      : recording.email || "Unknown User";
                  return (
                    <SwiperSlide key={recording.id}>
                      <div
                        className={`space-y-4 rounded-md p-2 cursor-pointer ${
                          isSelected
                            ? "border-2 border-purple-600 shadow-lg bg-purple-50"
                            : "border border-transparent"
                        }`}
                        onClick={() => handleOpenFeedback(recording)}
                      >
                        <RecordingCard
                          recording={recording}
                          displayName={displayName}
                          feedbackCount={recording.feedback?.length || 0}
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            <div className="w-full min-w-0 lg:w-1/3 overflow-hidden">
              {selectedRecording ? (
                <FeedbackPanel
                  currentUserId={user ? user.id : null}
                  selectedRecording={selectedRecording}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  groupedFeedbacks={groupedFeedbacks}
                  handleFeedbackSubmit={handleFeedbackSubmit}
                  onFeedbackChange={loadFeedbacks}
                  onClose={handleCloseFeedback}
                />
              ) : (
                <div className="p-6 text-center text-muted-foreground border rounded-md">
                  Select a recording to see feedback
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CommunityPage;
