import React from "react";
import { Visibility } from "../../store/store";
import Button from "../ui/Button";
import RecordingCard from "../community/RecordingCard";

interface Recording {
  id: string;
  visibility: Visibility;
  date: string;
}

interface TabProps {
  recordings: Recording[];
  selectedRecordingId: string | null;
  setSelectedRecordingId: (id: string | null) => void;
  activeTab: Visibility;
  setActiveTab: (v: Visibility) => void;
}
const Tab: React.FC<TabProps> = ({
  recordings,
  selectedRecordingId,
  setSelectedRecordingId,
  activeTab,
  setActiveTab,
}) => {
  const renderLabel = (v: Visibility) => {
    switch (v) {
      case Visibility.PRIVATE:
        return "Private";
      case Visibility.PUBLIC:
        return "Public";
      case Visibility.ANONYMOUS:
        return "Anonymous";
    }
  };

  recordings.find((r) => String(r.id) === selectedRecordingId);

  const visibilities = [
    Visibility.PRIVATE,
    Visibility.PUBLIC,
    Visibility.ANONYMOUS,
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-4 border-b mb-6">
        {visibilities.map((v) => (
          <Button
            key={v}
            onClick={() => setActiveTab(v)}
            text={renderLabel(v)}
            className={`pb-2 text-lg ${
              activeTab === v
                ? "border-b-4 border-purple-600 text-purple-700"
                : "text-gray-500 hover:text-purple-500"
            }`}
          />
        ))}
      </div>
      {recordings.length === 0 ? (
        <p className="text-center text-gray-500">
          No recordings found for this tab.
        </p>
      ) : (
        <div className="space-y-4">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              onClick={() => setSelectedRecordingId(recording.id)}
              className={`cursor-pointer transition-all ${
                selectedRecordingId === recording.id
                  ? "ring-2 ring-primary ring-offset-2"
                  : ""
              }`}
            >
              <RecordingCard recording={recording} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tab;
