import React, { useState } from "react";
import { Recording } from "../../store/store";

interface FeedbackFormProps {
  recording: Recording;
  onClose: () => void;
  onSubmitFeedback: (
    recording: Recording,
    type: string,
    comment: string
  ) => Promise<void>;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  recording,
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
    await onSubmitFeedback(recording, type, comment);
    setComment("");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        Feedback Type:
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full rounded border border-gray-300 p-2"
        >
          <option value="general">General</option>
          <option value="encouragement">Encouragement</option>
          <option value="tips">Tips</option>
        </select>
      </label>

      <label className="block">
        Your Comment:
        <textarea
          required
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback here..."
          className="mt-1 block w-full rounded border border-gray-300 p-2 resize-y"
        />
      </label>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onClose}
          className="btn-outline px-4 py-2 rounded"
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn-primary px-4 py-2 rounded"
          disabled={loading || !comment.trim()}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default FeedbackForm;
