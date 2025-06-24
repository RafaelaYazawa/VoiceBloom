import React, { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import { motion } from "framer-motion";
import { Visibility, Profile, useStore } from "../store/store";
import ActivityCalendar from "../components/progress/ActivityCalendar";
import ProgressChart from "../components/progress/ProgressChart";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { fetchingProfile, getRecordings } from "../utils/api";
import { ScaleLoader } from "react-spinners";
import { Headphones, Flame } from "lucide-react";
import UsernameSettings from "../components/ui/ProfileSettings/UsernameSettings";
import LocationSettings from "../components/ui/ProfileSettings/LocationSettings";
import ChangePassword from "../components/ui/ProfileSettings/ChangePassword";
import ChangeEmail from "../components/ui/ProfileSettings/ChangeEmail";

const ProfilePage: React.FC = () => {
  const { recordings, setRecordings } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_IN" && session) {
          const updatedProfile = await fetchingProfile();
          setProfile(updatedProfile);
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
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
    totalRecordings: recordings.length,
    sharedRecordings: recordings.filter(
      (r) =>
        r.visibility === Visibility.PUBLIC ||
        r.visibility === Visibility.ANONYMOUS
    ).length,
    privateRecordings: recordings.filter(
      (r) => r.visibility === Visibility.PRIVATE
    ).length,
    currentStreak: calculatingCurrentStreak(recordings),
  };

  console.log("profil ", profile);

  return (
    <div className="max-w-4xl mx-auto py-6">
      {loading ? (
        <>
          <div className="flex items-center justify-center">
            <ScaleLoader color="#9333ea" height={23} />
          </div>
          <div className="text-center">
            <p>Loading your profile</p>
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-semibold mb-2">My Profile</h1>
            <p className="text-muted-foreground">
              Track your progress and see how far you've come.
            </p>
          </div>

          <div className="flex gap-6 mb-8 items-start gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border h-full  md:w-2/3">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-medium">
                    {profile?.username
                      ? profile.username.charAt(0).toUpperCase()
                      : profile?.email
                      ? profile.email.charAt(0).toUpperCase()
                      : "?"}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium">
                      {profile?.username || profile?.email || "Unkown User"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {profile?.joinedDate
                        ? `Joined ${format(
                            parseISO(profile.joinedDate),
                            "MMMM yyyy"
                          )}`
                        : `Join date unavailable`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between gap-x-20">
                <div className="w-full">
                  <h2 className="text-lg font-semibold mb-4">
                    Profile Settings
                  </h2>
                  <UsernameSettings
                    initialUsername={profile?.username ?? null}
                    onUpdate={(newUsername) =>
                      setProfile((prev) =>
                        prev ? { ...prev, username: newUsername } : null
                      )
                    }
                  />

                  <LocationSettings
                    initialLocation={profile?.location}
                    onUpdate={(newLocation) =>
                      setProfile((prev) =>
                        prev ? { ...prev, location: newLocation } : null
                      )
                    }
                  />
                  <h2 className="text-lg font-semibold mb-4">Security</h2>
                  <ChangeEmail />
                  <ChangePassword />
                </div>
              </div>
            </div>

            <div className="w-full md:col-span-2 w-96">
              <div className="p-6 bg-white rounded-lg shadow-sm border">
                <div className="md:col-span-2 w-full">
                  <div className="flex gap-3">
                    <h2 className="text-lg font-semibold mb-4">Progress</h2>
                    <Headphones className="text-violet-500" />
                  </div>

                  <div className="flex justify-between items-center py-3 border-b">
                    <span className="text-muted-foreground">
                      Total Recordings
                    </span>
                    <span className="font-medium">{stats.totalRecordings}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">
                      Shared Recordings
                    </span>
                    <span className="font-medium">
                      {stats.sharedRecordings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">
                      Private Recordings
                    </span>
                    <span className="font-medium">
                      {stats.privateRecordings}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div className="flex gap-1">
                      <span className="text-muted-foreground">
                        Current Streak
                      </span>
                      <Flame className="text-violet-500" />
                    </div>
                    <span className="font-medium">
                      {stats.currentStreak > 0
                        ? `${stats.currentStreak} days`
                        : "No active streak"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <ActivityCalendar recordings={recordings} />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <ProgressChart recordings={recordings} />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-medium mb-4">Recent Achievements</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/30 p-4 rounded-md border border-muted">
                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3">
                  🎯
                </div>
                <h3 className="font-medium mb-1">First Recording</h3>
                <p className="text-sm text-muted-foreground">
                  Made your first voice recording
                </p>
              </div>

              {stats.sharedRecordings > 0 && (
                <div className="bg-muted/30 p-4 rounded-md border border-muted">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mb-3">
                    🌟
                  </div>
                  <h3 className="font-medium mb-1">Community Contributor</h3>
                  <p className="text-sm text-muted-foreground">
                    Shared a recording with the community
                  </p>
                </div>
              )}

              {stats.totalRecordings >= 5 && (
                <div className="bg-muted/30 p-4 rounded-md border border-muted">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                    🔥
                  </div>
                  <h3 className="font-medium mb-1">Practice Makes Perfect</h3>
                  <p className="text-sm text-muted-foreground">
                    Completed 5+ recordings
                  </p>
                </div>
              )}
            </div>

            {stats.totalRecordings === 0 && (
              <div className="mt-4 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't earned any achievements yet. Start recording to
                  unlock them!
                </p>
                <a href="/record" className="btn-primary inline-flex">
                  Start Recording
                </a>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;
