import React, { useState } from "react";
import { useStore } from "../../../store/store";
import supabase from "../../../utils/supabaseClient";
import Button from "../Button";
import { Lock } from "lucide-react";

const PasswordSettings: React.FC = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const addToast = useStore((state) => state.addToast);
  const handleSavePassword = async () => {
    if (!newPassword.trim()) {
      addToast({ title: "password cannot be empyt", type: "error" });
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast({ title: "Passwords do not match", type: "error" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);

    if (error) {
      addToast({
        title: "Failed to update password",
        description: error.message,
        type: "error",
      });
    } else {
      addToast({ title: "Password updated", type: "success" });
      setNewPassword("");
      setConfirmPassword("");
      setIsEditingPassword(false);
    }
  };

  const handleCancel = () => {
    setNewPassword("");
    setConfirmPassword("");
    setIsEditingPassword(false);
  };

  return (
    <div className="w-2xs space-y-3 mb-3">
      {!isEditingPassword ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition">
          <div className="flex items-center space-x-3">
            <Lock className="w-5 h-5 text-violet-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                Change Password
              </div>
              <div className="text-xs text-gray-500 italic">
                {newPassword ? "Password updated" : "Password active"}
              </div>
            </div>
          </div>
          <Button
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            onClick={() => setIsEditingPassword(true)}
          >
            Edit
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <Lock className="w-4 h-4 text-violet-500" />
              <span>Update Password</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div>
                <input
                  type="text"
                  className="border px-3 py-2 mb-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-violet-300"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                  placeholder="******"
                />

                <input
                  type="text"
                  className="border px-3 py-2 mb-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-violet-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  placeholder="******"
                />
              </div>
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
                  onClick={handleSavePassword}
                  disabled={loading}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PasswordSettings;
