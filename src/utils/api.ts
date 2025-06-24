import supabase from "./supabaseClient";
import { Visibility, Recording, RecordingsUpdateData } from "../store/store";

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
  blob: Blob,
  visibility: "private" | "public" | "anonymous",
  prompt: string
) => {
  const fileExt = ".webm";
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User is not authenticated");
  }

  const safeUserId = user.id;
  const fileName = `${safeUserId}/${Date.now()}${fileExt}`;

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
  visibility: Visibility
): Promise<Recording[]> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error("Could not get user", userError);
    return [];
  }

  let query = supabase
    .from("recordings")
    .select("*")
    .eq("visibility", visibility);

  if (visibility === "private") {
    query = query.eq("user_id", user.id);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.log("Error fetching recordings:", error);
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
          signedUrlError
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
  updates: Partial<RecordingsUpdateData>
): Promise<boolean> => {
  const { data, error: userError } = await supabase.auth.getUser();

  if (userError || !data) {
    console.log("Could not find user", userError);
    return false;
  }

  const user = data.user;

  const { error: updateError } = await supabase
    .from("recordings")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("failed to update recording", updateError);
    return false;
  }

  console.log("Updating recording with:", updates);

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
  return data.map((r) => ({
    ...r,
    feedback: r.feedbacks || [],
    username: r.user_id?.username || "Anonymous",
    email: r.user_id?.email || "",
    date: r.created_at || "",
  }));
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

export const fetchingProfile = async () => {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user || authError) {
    console.error("Auth error:", authError?.message);
    return;
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
