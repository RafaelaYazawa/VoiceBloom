import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Mic, Users, BookOpen, BarChart3, User } from "lucide-react";
import { Profile } from "../../store/store";
import { useAuth } from "../../store/AuthContext";
import { getRecordings, fetchingProfile } from "../../utils/api";

import { differenceInCalendarDays, format, parseISO } from "date-fns";

const Sidebar: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [userRecordings, setUserRecordings] = useState<Recording[]>([]);

  if (!user && !authLoading) return null;

  useEffect(() => {
    const fetchUserData = async () => {
      setDataLoading(true);
      if (authLoading) {
        return;
      }

      try {
        if (user && user.id) {
          const fetchedProfile = await fetchingProfile(user);
          setProfile(fetchedProfile);

          const allOwnedRecs = await getRecordings(user);
          setUserRecordings(allOwnedRecs);
        } else {
          console.log(
            "No authenticated user. Sidebar will show default content."
          );
          setProfile(null);
          setUserRecordings([]);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
        setProfile(null);
        setUserRecordings([]);
      } finally {
        setDataLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  const calculatingCurrentStreak = (recordings: Recording[]) => {
    if (recordings.length === 0) return 0;

    const sortedDates = Array.from(
      new Set(
        recordings
          .map((r) => format(parseISO(r.created_at), "yyyy-MM-dd"))
          .sort((a, b) => (a < b ? 1 : -1))
      )
    );
    let streak = 0;
    const today = format(new Date(), "yyyy-MM-dd");
    const lastRecordingDate = sortedDates[0];

    const daysSinceLast = differenceInCalendarDays(
      parseISO(today),
      parseISO(lastRecordingDate)
    );

    if (daysSinceLast === 0) {
      streak = 1;
    } else if (daysSinceLast === 1) {
      streak = 1;
    } else {
      return 0;
    }
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
    return streak;
  };

  const stats = {
    currentStreak: calculatingCurrentStreak(userRecordings),
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
            <p className="font-medium truncate">
              {dataLoading
                ? "Loading..."
                : profile?.username || profile?.email || "User"}
            </p>
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
