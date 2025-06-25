import React, { useEffect, useState } from "react";
import { useStore } from "../../../store/store";
import supabase from "../../../utils/supabaseClient";
import Button from "../Button";
import { Mail } from "lucide-react";

const ChangeEmail: React.FC = () => {
  const [newEmail, setNewEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const addToast = useStore((state) => state.addToast);

  useEffect(() => {
    const fetchCurrentEmail = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!data.user || error) {
        console.log("Failed to get current user", error?.message);
        return;
      }

      setCurrentEmail(data.user?.email ?? null);
    };
    fetchCurrentEmail();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setCurrentEmail(user?.email ?? null);
      }
    });
    return () => {
      data?.subscription.unsubscribe();
    };
  }, []);

  const handleSaveEmail = async () => {
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail);
    if (!isValidEmail) {
      addToast({ title: "Invalid email format", type: "error" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    });

    if (error) {
      setLoading(false);
      addToast({
        title: "Failed to update email",
        description: error.message,
        type: "error",
      });
      return;
    }
    addToast({
      title: "Confirmation email sent",
      description:
        "Please check your inbox and confirm the new email. After confirmation, log in again to see the changes.",
      type: "success",
    });
    setNewEmail("");
    setIsEditingEmail(false);
  };

  const handleCancel = () => {
    setNewEmail("");
    setIsEditingEmail(false);
  };

  return (
    <div className="w-full space-y-3 mb-3">
      {!isEditingEmail ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-violet-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">
                Change Email
              </div>
              <div className="text-xs text-gray-500 italic">
                {newEmail || currentEmail}
              </div>
            </div>
          </div>
          <Button
            className="text-sm text-violet-700 hover:text-violet-500 font-medium"
            onClick={() => setIsEditingEmail(true)}
          >
            Edit
          </Button>
        </div>
      ) : (
        <>
          <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 flex items-center space-x-2"
            >
              <span>Update Email</span>
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <input
                id="email"
                type="text"
                className="border px-3 py-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-violet-300"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={loading}
                placeholder="name@gmail.com"
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
                  onClick={handleSaveEmail}
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

export default ChangeEmail;
