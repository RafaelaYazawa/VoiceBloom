import supabase from "./supabaseClient";
import { Visibility, Recording, RecordingsUpdateData } from "../store/store";
import { User } from "@supabase/supabase-js";

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  return data;
};

export const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.log("error", error);
    throw error;
  }

  return data;
};

export const uploadAndSaveRecording = async (
  user: User,
  blob: Blob,
  visibility: "private" | "public" | "anonymous",
  prompt: string
) => {
  const fileExt = ".webm";
  const safeUserId = user.id;
  const fileName = `${safeUserId}/${Date.now()}${fileExt}`;

  // console.log("Uploading recording for user:", user);
  // console.log("user.id:", user?.id);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(fileName, blob, {
      cacheControl: "3600",
      upsert: false,
      contentType: "audio/webm",
    });

  if (uploadError) {
    console.error("Upload error:", uploadError);
    throw uploadError;
  }

  const filePathFromUpload = uploadData?.path;
  if (!filePathFromUpload) {
    throw new Error("No path returned from upload");
  }

  const { data: signedUrlData, error: signedUrlError } = await supabase.storage
    .from("recordings")
    .createSignedUrl(filePathFromUpload, 3600);

  if (signedUrlError) {
    console.error("Signed URL error:", signedUrlError);
    throw signedUrlError;
  }

  const { data: metadata, error: saveError } = await supabase
    .from("recordings")
    .insert([
      {
        user_id: user.id,
        audio_url: filePathFromUpload,
        visibility,
        prompt,
      },
    ])
    .select();

  if (saveError) {
    console.error("Failed to save metadata:", saveError);
    console.log("Tried to insert:", {
      audio_url: filePathFromUpload,
      visibility,
      prompt,
    });
    throw saveError;
  }

  return {
    metadata,
    signedUrl: signedUrlData.signedUrl,
    filePath: filePathFromUpload,
  };
};

export const getRecordings = async (
  user: User | null,
  filterVisibility?: Visibility
): Promise<Recording[]> => {
  if (!user || user.id === null) {
    console.warn(
      "getRecordings: No valid user provided. Cannot fetch user-owned recordings."
    );
    return [];
  }

  let query = supabase.from("recordings").select("*").eq("user_id", user.id);

  if (filterVisibility) {
    query = query.eq("visibility", filterVisibility);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching recordings:", error);
    return [];
  }
  if (!data) {
    return [];
  }

  const recordingsWithUrl = await Promise.all(
    data.map(async (rec) => {
      if (!rec.audio_url) {
        console.log("Skipping recording with missing audio_url:", rec);
        return { ...rec, audioUrl: null };
      }

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("recordings")
          .createSignedUrl(rec.audio_url, 60);

      if (signedUrlError || !signedUrlData) {
        console.error(
          "Failed to get signed URL for",
          rec.audio_url,
          signedUrlError?.message || "Unknown error"
        );
        return { ...rec, audioUrl: null };
      }
      return {
        ...rec,
        audioUrl: signedUrlData.signedUrl,
        date: rec.created_at,
      };
    })
  );
  return recordingsWithUrl;
};

export const updateRecording = async (
  id: string,
  updates: Partial<RecordingsUpdateData>,
  userId: string
): Promise<boolean> => {
  if (!userId) {
    console.log(
      "updateRecording: No valid user ID provided. Cannot update recording."
    );
    return false;
  }

  const { error: updateError } = await supabase
    .from("recordings")
    .update(updates)
    .eq("id", id)
    .eq("user_id", userId);

  if (updateError) {
    console.error("Failed to update recording:", updateError.message);
    return false;
  }

  console.log(
    "Successfully updated recording with ID:",
    id,
    "updates:",
    updates
  );

  return true;
};

export const getCommunityRecordings = async (): Promise<Recording[]> => {
  const { data, error } = await supabase
    .from("recordings")
    .select("*, user_id:profiles(username, email), feedbacks(*)")
    .in("visibility", ["public", "anonymous"])
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.log("data =", data);
    console.log("Failed to fetch recordings:", error);
    return [];
  }
  const recordingsWithUrl = await Promise.all(
    data.map(async (rec) => {
      if (!rec.audio_url) {
        console.warn(
          "Skipping community recording with missing audio_url:",
          rec
        );
        return {
          ...rec,
          feedback: rec.feedbacks || [],
          username: rec.user_id?.username || "Anonymous",
          email: rec.user_id?.email || "",
          date: rec.created_at || "",
          audioUrl: null,
        };
      }
      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("recordings")
          .createSignedUrl(rec.audio_url, 60);

      if (signedUrlError || !signedUrlData) {
        console.error(
          "Failed to get signed URL for community recording",
          rec.audio_url,
          signedUrlError?.message || "Unknown error"
        );
        return {
          ...rec,
          feedback: rec.feedbacks || [],
          username: rec.user_id?.username || "Anonymous",
          email: rec.user_id?.email || "",
          date: rec.created_at || "",
          audioUrl: null,
        };
      }
      return {
        ...rec,
        feedback: rec.feedbacks || [],
        username: rec.user_id?.username || "Anonymous",
        email: rec.user_id?.email || "",
        date: rec.created_at || "",
        audioUrl: signedUrlData.signedUrl,
      };
    })
  );
  return recordingsWithUrl;
};

export const uploadAndSaveFeedbacks = async (feedback: {
  user_id: string | null;
  recording_id: string;
  comment_type?: "general" | "tips" | "encouragement";
  comment: string;
  flagged?: boolean;
}): Promise<boolean> => {
  const { error } = await supabase.from("feedbacks").insert([
    {
      ...feedback,
      comment_type: feedback.comment_type || "general",
      flagged: feedback.flagged ?? false,
    },
  ]);
  if (error) {
    console.error("Failed to insert feedback:", error);
    return false;
  }

  return true;
};

export const deletingOwnComments = async (feedbackId: string) => {
  const { error } = await supabase
    .from("feedbacks")
    .delete()
    .eq("id", feedbackId);

  if (error) {
    console.error("Failed to delete feedback:", error.message);
  } else {
    console.log("Feedback deleted!");
  }

  return true;
};

export const fetchingProfile = async (
  user: User | null
): Promise<any | null> => {
  if (!user || !user.id) {
    console.error(
      "fetchingProfile: No authenticated user or user ID provided."
    );
    return null;
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !data) {
    console.error("Profile fetch error:", profileError?.message);
    return null;
  }

  const profileData = {
    ...data,
    joinedDate: data.created_at,
  };

  return profileData;
};
