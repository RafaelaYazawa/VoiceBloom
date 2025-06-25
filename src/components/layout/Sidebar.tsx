import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Visibility } from "../../store/store";
import { Mic, Users, BookOpen, BarChart3, User } from "lucide-react";
import { Profile } from "../../store/store";
import { getRecordings, fetchingProfile } from "../../utils/api";

import { differenceInCalendarDays, format, parseISO } from "date-fns";

const Sidebar: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    const fetchProfileAndRecordings = async () => {
      const data = await fetchingProfile();

      const privateRecs = await getRecordings(Visibility.PRIVATE);
      const publicRecs = await getRecordings(Visibility.PUBLIC);
      const anonymousRecs = await getRecordings(Visibility.ANONYMOUS);

      const allRecs = [...privateRecs, ...publicRecs, ...anonymousRecs];

      setProfile(data);
      setRecordings(allRecs);

      setLoading(false);
    };
    fetchProfileAndRecordings();
  }, []);
  const calculatingCurrentStreak = (recordings: Recording[]) => {
    if (recordings.length === 0) return 0;

    const sortedDates = Array.from(
      new Set(
        recordings
          .map((r) => format(parseISO(r.created_at), "yyyy-MM-dd"))
          .sort((a, b) => (a < b ? 1 : -1))
      )
    );
    let streak = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = parseISO(sortedDates[i]);
      const prevDate = parseISO(sortedDates[i - 1]);

      const diff = differenceInCalendarDays(prevDate, currentDate);

      if (diff === 1) {
        streak++;
      } else if (diff > 1) {
        break;
      }
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const lastRecordingDate = sortedDates[0];
    const daysSinceLast = differenceInCalendarDays(
      new Date(today),
      new Date(lastRecordingDate)
    );
    if (daysSinceLast > 1) {
      return 0;
    }

    return streak;
  };

  const stats = {
    currentStreak: calculatingCurrentStreak(recordings),
  };

  const links = [
    { to: "/record", label: "Practice", icon: <Mic className="h-5 w-5" /> },
    {
      to: "/community",
      label: "Community",
      icon: <Users className="h-5 w-5" />,
    },
    {
      to: "/journal",
      label: "Journal",
      icon: <BookOpen className="h-5 w-5" />,
    },
    { to: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
  ];

  return (
    <div className="h-full py-8 flex flex-col">
      <div className="px-6 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {profile?.username
              ? profile.username.charAt(0).toUpperCase()
              : profile?.email
              ? profile.email.charAt(0).toUpperCase()
              : "?"}
          </div>
          <div>
            <p className="font-medium">{profile?.username}</p>
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3 text-secondary" />
              <span className="text-xs text-muted-foreground">
                {typeof stats.currentStreak === "number" &&
                stats.currentStreak > 0
                  ? `${stats.currentStreak} days streak`
                  : "No active streak"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-2">
        <ul className="space-y-1">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`
                }
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="px-6 pt-6 mt-auto">
        <div className="rounded-md bg-accent/10 p-4">
          <h4 className="font-medium text-accent mb-1">Daily Tip</h4>
          <p className="text-sm text-foreground">
            Try recording in a quiet space to focus on your pronunciation and
            reduce distractions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
