import React, { useState } from "react";
import Button from "../Button";
import { useStore } from "../../../store/store";
import supabase from "../../../utils/supabaseClient";
import { MapPin } from "lucide-react";
import { useAuth } from "../../../store/AuthContext";

interface LocationSettings {
  initialLocation?: string;
  onUpdate: (newLocation: string) => void;
}

const LocationSettings: React.FC<LocationSettings> = ({
  initialLocation,
  onUpdate,
}) => {
  const [editingLocation, setEditingLocation] = useState(false);
  const [location, setLocation] = useState(initialLocation || "");
  const [loading, setLoading] = useState(false);
  const addToast = useStore((state) => state.addToast);
  const { user } = useAuth();

  const handleSaveLocation = async () => {
    setLoading(true);
    const userId = user?.id;
    if (!userId) {
      addToast({
        title: "Authentication Error",
        description: "User not logged in. Please log in again.",
        type: "error",
      });
      setLoading(false);
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ location })
      .eq("id", userId);

    setLoading(false);

    if (error) {
      addToast({
        title: "Failed to update location",
        description: error.message,
        type: "error",
      });
    } else {
      addToast({ title: "Location updated", type: "success" });
      onUpdate(location);
      setEditingLocation(false);
    }
  };
  return (
    <div className="w-full space-y-3 mb-3">
      {!editingLocation ? (
        <div className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition">
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-violet-500" />
            <div>
              <div className="text-sm font-medium text-gray-700">Location</div>
              <div className="text-xs text-gray-500 italic">
                {location || "Not specified"}
              </div>
            </div>
          </div>
          <Button
            className="text-sm text-violet-600 hover:text-violet-700 font-medium"
            onClick={() => setEditingLocation(true)}
          >
            {location ? "Edit" : "Set location"}
          </Button>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-white shadow-sm space-y-3">
          <label
            htmlFor="location"
            className="text-sm font-medium text-gray-700 flex items-center space-x-2"
          >
            <MapPin className="w-4 h-4 text-violet-500" />
            <span>Update Location</span>
          </label>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
            <input
              id="location"
              type="text"
              className="border px-3 py-2 rounded-md text-sm flex-grow focus:outline-none focus:ring-2 focus:ring-violet-300"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              placeholder="e.g. Brazil"
            />
            <div className="flex space-x-2">
              <Button
                className="px-3 py-2 text-sm text-gray-500 border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => {
                  setLocation(initialLocation || "");
                  setEditingLocation(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                className="px-3 py-2 text-sm text-white bg-violet-600 rounded-md hover:bg-violet-700"
                onClick={handleSaveLocation}
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

export default LocationSettings;
