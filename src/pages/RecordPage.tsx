import React, { useState } from "react";
import { motion } from "framer-motion";
import VoiceRecorder from "../components/recording/VoiceRecorder";
import { useStore, Visibility } from "../store/store";
import { uploadAndSaveRecording } from "../utils/api";
import supabase from "../utils/supabaseClient";

const RecordPage: React.FC = () => {
  const { dailyPrompt, addToast } = useStore();
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<
    "private" | "public" | "anonymous"
  >("private");
  const [customPrompt, setCustomPrompt] = useState("");

  const handleSaveRecording = async (blob: Blob, promptUsed: string) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!session || !user) {
      console.error("User is not logged in");
      return;
    }

    if (!recordingBlob) {
      alert("No recording found. Please record something first.");
      return;
    }

    const promptToSave = promptUsed;
    try {
      const { filePath, signedUrl, metadata } = await uploadAndSaveRecording(
        recordingBlob,
        visibility,
        promptToSave
      );

      addToast({
        title: "Recording saved",
        description: "You can hear it in the Private Journal.",
        type: "success",
      });
      setRecordingBlob(null);
      setAudioUrl(null);
    } catch (err) {
      console.error("Failed to save recording:", err);
      if (err instanceof Error) {
        addToast({
          title: `Failed to save`,
          description: err.message.slice(0, 100),
          type: "error",
        });
      } else {
        addToast({
          title: "Failed to save. Please try again.",
          type: "error",
        });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-semibold mb-2">Daily Practice</h1>
          <p className="text-muted-foreground">
            Record yourself speaking to the prompt below. Take your time and
            speak naturally.
          </p>
        </div>

        <VoiceRecorder
          onSave={handleSaveRecording}
          audioUrl={audioUrl}
          onRecordingComplete={(blob) => {
            setRecordingBlob(blob);
          }}
          prompt={customPrompt || dailyPrompt}
        />

        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">Sharing Options</h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Share with Community</p>
              <p className="text-sm text-muted-foreground">
                Make your recording available for others to hear and provide
                feedback.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <select
                title="Sharing Options"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as Visibility)}
                className="p-2"
              >
                <option value={Visibility.PRIVATE}>Private</option>
                <option value={Visibility.PUBLIC}>Public</option>
                <option value={Visibility.ANONYMOUS}>Anonymous</option>
              </select>
            </label>
          </div>

          {visibility === "public" && (
            <div className="mt-4 p-3 bg-accent/10 rounded-md text-sm">
              <p className="text-accent">
                Your recording will be <strong>publicly visible</strong> to
                anyone accessing the Community. Only choose this option if
                you’re comfortable sharing your identity.
              </p>
            </div>
          )}

          {visibility === "anonymous" && (
            <div className="mt-4 p-3 bg-accent/10 rounded-md text-sm">
              <p className="text-accent">
                Your recording will be shared anonymously. No personal
                information will be visible to others.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium mb-4">
            Tips for Better Recordings
          </h3>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Find a quiet space with minimal background noise.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Speak at a comfortable pace - there's no rush.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              It's okay to make mistakes! This is a practice space.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Try to express emotions through your voice.
            </li>
            <li className="flex items-start">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary mt-1.5 mr-2"></span>
              Record multiple times if needed until you're satisfied.
            </li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default RecordPage;
