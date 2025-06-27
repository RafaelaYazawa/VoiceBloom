import React from "react";
import { formatDistanceToNow } from "date-fns";
import Button from "../ui/Button";
import FeedbackForm from "./FeedbackForm";
import type { Recording } from "../../store/store";
import { useStore } from "../../store/store";
import { deletingOwnComments, loadFeedbacks } from "../../utils/api";
import { Trash2, X } from "lucide-react";

interface FeedbackPanelProps {
  selectedRecording: Recording;
  activeTab: "general" | "encouragement" | "tips" | "add";
  setActiveTab: (tab: "general" | "encouragement" | "tips" | "add") => void;
  groupedFeedbacks: { [key: string]: any[] };
  handleFeedbackSubmit: (
    currentUserId: string | null,
    recording: Recording,
    commentType: string,
    comment: string
  ) => Promise<void>;
  onFeedbackChange: (recording: Recording) => Promise<void>;
  onClose: () => void;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  currentUserId,
  selectedRecording,
  activeTab,
  setActiveTab,
  groupedFeedbacks,
  handleFeedbackSubmit,
  onFeedbackChange,
  onClose,
}) => {
  const addToast = useStore((state) => state.addToast);

  if (!selectedRecording) return null;

  const handleDeleteComment = async (feedbackId: string) => {
    try {
      const success = await deletingOwnComments(feedbackId);
      console.log("deleting", feedbackId);

      if (success) {
        addToast({
          title: "Feedback deleted",
          type: "success",
        });
        await onFeedbackChange(selectedRecording);
      } else {
        addToast({
          title: "Failed to delete feedback",
          description: "An error occurred during deletion.",
          type: "error",
        });
      }
    } catch (error: any) {
      addToast({
        title: "Failed to delete feedback",
        type: "error",
      });
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 my-4 shadow-md">
      <div className="flex justify-between align-center">
        <h3 className="text-lg font-semibold mb-3">Feedback</h3>

        <Button
          onClick={onClose}
          className="ml-auto p-2 hover:bg-gray-100 rounded"
          aria-label="Close feedback panel"
        >
          <X size={20} className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex gap-4 border-b mb-4">
        {["General", "Encouragement", "Tips"].map((tab) => {
          const lower = tab.toLowerCase() as
            | "general"
            | "encouragement"
            | "tips";
          return (
            <Button
              key={tab}
              onClick={() => setActiveTab(lower)}
              className={`py-2 px-4 text-sm font-medium border-b-2 ${
                lower === activeTab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground"
              }`}
            >
              {tab[0].toUpperCase() + tab.slice(1)}
            </Button>
          );
        })}
      </div>

      {activeTab === "add" ? (
        <FeedbackForm
          recording={selectedRecording}
          onClose={() => setActiveTab("general")}
          onSubmitFeedback={async (type, comment) => {
            await handleFeedbackSubmit(selectedRecording!, type, comment);
            await onFeedbackChange(selectedRecording);
            setActiveTab(type as "general" | "encouragement" | "tips");
          }}
        />
      ) : (
        <div className="space-y-4 max-h-60 overflow-y-auto mb-6 text-sm">
          {(groupedFeedbacks[activeTab] || []).length ? (
            <>
              {(groupedFeedbacks[activeTab] || []).map((fb, i) => {
                const name =
                  fb.profile?.username || fb.user?.email || "Anonymous";
                const time = formatDistanceToNow(new Date(fb.created_at), {
                  addSuffix: true,
                });
                return (
                  <div
                    key={fb.id || i}
                    className="bg-gray-50 p-3 rounded-md border shadow-sm flex gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="w-full">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{name}</p>
                        <span className="text-xs text-muted-foreground">
                          {time}
                        </span>
                      </div>
                      <div className="flex justify-between align-center">
                        <p className="mt-1 text-sm">{fb.comment}</p>
                        {fb.user_id === currentUserId && (
                          <Trash2
                            size={16}
                            onClick={() => handleDeleteComment(fb.id)}
                            className="cursor-pointer hover:text-red-600"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="pt-4">
                <Button
                  onClick={() => setActiveTab("add")}
                  className="py-2 px-4 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary/10 transition"
                >
                  + Add Feedback
                </Button>
              </div>
            </>
          ) : (
            <div>
              <p className="text-muted-foreground">
                No feedback in this tab yet.
              </p>
              <div>
                <div className="pt-4">
                  <Button
                    onClick={() => setActiveTab("add")}
                    className="py-2 px-4 text-sm font-medium border border-primary text-primary rounded-md hover:bg-primary/10 transition"
                  >
                    + Add Feedback
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FeedbackPanel;
