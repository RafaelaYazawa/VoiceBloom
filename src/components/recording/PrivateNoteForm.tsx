import React, { useEffect, useState } from "react";
import { useStore } from "../../store/store";
import { updateRecording as updateRecordingAPI } from "../../utils/api";
import Button from "../ui/Button";
import { useAuth } from "../../store/AuthContext";

type PrivateNoteFormProps = {
  recording: Recording | null;
  onRecordingUpdate: (updated: Recording) => void;
};

const PrivateNoteForm: React.FC<PrivateNoteFormProps> = ({
  recording,
  onRecordingUpdate,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { addToast } = useStore();
  const [reflection, setReflection] = useState(recording?.reflection || "");
  const [title, setTitle] = useState(recording?.title || "");
  const [metrics, setMetrics] = useState({
    tone: recording?.metrics?.tone || 5,
    confidence: recording?.metrics?.confidence || 5,
    fluency: recording?.metrics?.fluency || 5,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setReflection(recording?.reflection || "");
    setTitle(recording?.title || "");
    setMetrics({
      confidence: recording?.metrics?.confidence || 5,
      fluency: recording?.metrics?.fluency || 5,
      tone: recording?.metrics?.tone || 5,
    });
  }, [recording]);

  const handleSave = async () => {
    if (!recording) {
      addToast({
        title: "No recording selected",
        description: "Please select a recording to save notes.",
        type: "error",
      });
      return;
    }

    if (authLoading || !user) {
      addToast({
        title: "Authentication Error",
        description: "Please wait for authentication or log in again.",
        type: "error",
      });
      return;
    }

    const hasChanged =
      recording.title !== title ||
      recording?.reflection !== reflection ||
      JSON.stringify(recording?.metrics) !== JSON.stringify(metrics);

    if (!hasChanged) {
      addToast({
        title: "No changes to save",
        type: "info",
      });
      return;
    }
    setIsSaving(true);
    try {
      const success = await updateRecordingAPI(
        recording.id,
        {
          title,
          reflection,
          metrics,
        },
        user.id
      );

      if (success) {
        onRecordingUpdate({
          ...recording,
          title,
          reflection,
          metrics,
        });
        addToast({
          title: "Recording Updated",
          type: "success",
        });
      } else {
        addToast({
          title: "Your recording could not be updated.",
          description: "Check your internet connection and try again.",
          type: "error",
        });
      }
    } catch (error: any) {
      console.error("Failed to save recording:", error);
      addToast({
        title: "Error Saving Recording",
        description: error.message || "An unexpected error occurred.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMetricChange = (
    metric: "tone" | "confidence" | "fluency",
    value: number
  ) => {
    setMetrics((prev) => ({
      ...prev,
      [metric]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Self-Reflection</h3>
        <p className="text-sm text-muted-foreground mb-4">
          How did you feel about this recording? What went well? What could you
          improve?
        </p>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full rounded-md border border-input p-3 h-32 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your thoughts here..."
        />
        <h3 className="text-lg font-medium mb-2">Title</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Give it a title for better recognition of what are you talking about
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md border border-input p-3 h-10 focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Write your thoughts here..."
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Rate Your Performance</h3>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Tone</label>
              <span className="text-sm text-muted-foreground">
                {metrics.tone}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.tone}
              onChange={(e) =>
                handleMetricChange("tone", parseInt(e.target.value))
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Confidence</label>
              <span className="text-sm text-muted-foreground">
                {metrics.confidence}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.confidence}
              onChange={(e) =>
                handleMetricChange("confidence", parseInt(e.target.value))
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium">Fluency</label>
              <span className="text-sm text-muted-foreground">
                {metrics.fluency}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={metrics.fluency}
              onChange={(e) =>
                handleMetricChange("fluency", parseInt(e.target.value))
              }
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} className="btn-primary w-full">
        Save Reflection
      </Button>
    </div>
  );
};

export default PrivateNoteForm;
