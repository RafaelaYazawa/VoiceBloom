import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Recording } from "../store/store";
import { getCommunityRecordings } from "../utils/api";
import RecordingCard from "../components/community/RecordingCard";
import supabase from "../utils/supabaseClient";
import { useStore } from "../store/store";
import Button from "../components/ui/Button";
import FeedbackPanel from "../components/community/FeedbackPanel";
import { ScaleLoader } from "react-spinners";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
      const res = await getCommunityRecordings();
      setRecordings(res);
      setLoading(false);
    };
    fetchRecordings();
  }, []);

  useEffect(() => {
    const fetchUserId = async () => {
      const { data } = await supabase.auth.getUser();
      console.log("current user");

      setCurrentUserId(data.user?.id ?? null);
    };
    fetchUserId();
  }, []);

  const loadFeedbacks = async (recording: Recording) => {
    const { data: feedbacks, error } = await supabase
      .from("feedbacks")
      .select("*, profile:profiles(email,username)")
      .eq("recording_id", recording.id);
    if (!error) {
      const grouped = {
        general: [],
        encouragement: [],
        tips: [],
      };
      feedbacks.forEach((fb) => {
        if (grouped[fb.comment_type]) {
          grouped[fb.comment_type].push(fb);
        }
      });
      setGroupedFeedbacks(grouped);
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
            <div className="lg:w-2/3">
              <Swiper
                modules={[Navigation, Grid]}
                spaceBetween={15}
                slidesPerView={2}
                slidesPerGroup={2}
                grid={{ rows: 2, fill: "row" }}
                navigation
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    slidesPerGroup: 1,
                    grid: { rows: 2, fill: "row" },
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
                  const isSelected = selectedRecording?.id === recording.id;

                  const displayName =
                    recording.visibility === "anonymous" ||
                    recording.username === "Anonymous"
                      ? "Anonymous"
                      : recording.username && recording.username !== "Anonymous"
                      ? recording.username
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
                        />
                      </div>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            </div>

            <div className="lg:w-1/3">
              {selectedRecording ? (
                <FeedbackPanel
                  currentUserId={currentUserId}
                  selectedRecording={selectedRecording}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  groupedFeedbacks={groupedFeedbacks}
                  handleFeedbackSubmit={handleFeedbackSubmit}
                  refreshFeedbacks={loadFeedbacks}
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
