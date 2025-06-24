import React, { useState } from "react";
import { Recording } from "../../store/store";
import Button from "../ui/Button";

interface FeedbackFormProps {
  recording: Recording;
  onClose: () => void;
  onSubmitFeedback: (type: string, comment: string) => Promise<void>;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onClose,
  onSubmitFeedback,
}) => {
  const [type, setType] = useState("encouragement");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    await onSubmitFeedback(type, comment);
    setComment("");
    setLoading(false);
  };

  const onTypeChange = (e) => {
    setType(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 ">
      <p className="block">Feedback Type:</p>

      <div className="flex justify-evenly">
        {["general", "encouragement", "tips"].map((value) => (
          <label key={value}>
            <input
              type="radio"
              name="feedbackType"
              value={value}
              checked={type === value}
              onChange={onTypeChange}
              className="accent-purple-600"
            />
            <span className="px-2 capitalize">{value}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[45%]">
          <label className="block mb-1 font-medium">
            {type[0].toUpperCase() + type.slice(1)} Feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full rounded-md border border-input p-3 h-24 focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Any overall thoughts about this recording?"
          />
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          onClick={onClose}
          className="btn-outline px-4 py-2 rounded"
          disabled={loading}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          className="btn-primary px-4 py-2 rounded"
          disabled={loading || !comment.trim()}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </form>
  );
};

export default FeedbackForm;
