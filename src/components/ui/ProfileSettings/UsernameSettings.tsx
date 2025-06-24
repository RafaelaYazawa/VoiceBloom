import React, { useEffect, useState } from "react";
import { useStore } from "../../../store/store";
import supabase from "../../../utils/supabaseClient";
import Button from "../Button";
import { User } from "lucide-react";

interface UsernameSettingProps {
  initialUsername: string | null;
  onUpdate: (newUsername: string) => void;
}

const ProfileSettings: React.FC<UsernameSettingProps> = ({
  initialUsername,
  onUpdate,
}) => {
  const [username, setUsername] = useState(initialUsername || "");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const addToast = useStore((state) => state.addToast);

  useEffect(() => {
    setUsername(initialUsername ?? "");
  }, [initialUsername]);

  const handleCancel = () => {
    setUsername(initialUsername ?? "");
    setIsEditing(false);
  };

  const handleSaveUsername = async () => {
    if (!username.trim()) {
      addToast({ title: "Username cannot be empyt", type: "error" });
      return;
    }
    setLoading(true);
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      addToast({
        title: "Failed to update username",
        description: error.message,
        type: "error",
      });
    } else {
      addToast({ title: "Username updated", type: "success" });
      onUpdate(username);
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full space-y-3 mb-3">
      {!isEditing ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-violet-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Username</div>
              <div className="text-xs text-gray-500 italic">
                {username || "Not specified"}
              </div>
            </div>
          </div>
          <Button
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            onClick={() => setIsEditing(true)}
          >
            {username ? "Edit" : "Add Username"}
          </Button>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
          <label
            htmlFor="username"
            className="text-sm font-medium text-gray-700 flex items-center space-x-2"
          >
            <User className="w-4 h-4 text-violet-500" />
            <span>Username</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <input
              id="username"
              type="text"
              className="border px-3 py-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              placeholder="Username"
            />
            <div className="flex space-x-2">
              <Button
                className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="px-3 py-2 text-sm text-white bg-violet-600 rounded-md hover:bg-violet-700"
                onClick={handleSaveUsername}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;
