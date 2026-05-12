"use client";

import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Briefcase, FileText, Bookmark, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useGlobalContext } from "@/context/globalContext";

// =========================
// TYPES
// =========================
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: string;
}

interface ActionButtonProps {
  label: string;
}

interface Activity {
  description: string;
  created_at?: string;
}

// =========================
// PAGE
// =========================
export default function DashboardPage() {
  const { userProfile } = useGlobalContext();

  const [jobsPosted, setJobsPosted] = useState(0);
  const [applications, setApplications] = useState(0);
  const [savedJobs, setSavedJobs] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // FETCH SUPABASE DATA
  // =========================
  useEffect(() => {
    const fetchDashboard = async () => {
      if (!userProfile?._id) return;

      setLoading(true);

      try {
        // =========================
        // JOBS POSTED
        // =========================
        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("*")
          .eq("user_id", userProfile._id);

        if (jobsError) throw jobsError;

        setJobsPosted(jobsData?.length || 0);

        // =========================
        // APPLICATIONS (from jobs table)
        // =========================
        const allApplications =
          jobsData?.reduce((acc, job) => {
            return acc + (job.applicants?.length || 0);
          }, 0) || 0;

        setApplications(allApplications);

        // =========================
        // SAVED JOBS (placeholder table)
        // =========================
        const { data: saved } = await supabase
          .from("saved_jobs")
          .select("*")
          .eq("user_id", userProfile._id);

        setSavedJobs(saved?.length || 0);

        // =========================
        // PROFILE VIEWS (placeholder fallback)
        // =========================
        setProfileViews(12);

        // =========================
        // RECENT ACTIVITY (optional table)
        // =========================
        const { data: activity } = await supabase
          .from("activity")
          .select("*")
          .eq("user_id", userProfile._id)
          .order("created_at", { ascending: false })
          .limit(10);

        setRecentActivity(activity || []);
      } catch (error) {
        console.log("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [userProfile?._id]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Header />

      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* TITLE */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">
                Welcome back 👋 — here’s your Supabase data
              </p>
            </div>

            <button className="mt-4 md:mt-0 bg-[#7263F3] text-white px-5 py-2.5 rounded-lg">
              + Post a Job
            </button>
          </div>

          {/* LOADING */}
          {loading && (
            <p className="text-sm text-gray-500">Loading dashboard...</p>
          )}

          {/* STATS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard title="Jobs Posted" value={String(jobsPosted)} icon={<Briefcase size={20} />} trend="+0%" />
            <StatCard title="Applications" value={String(applications)} icon={<FileText size={20} />} trend="+0%" />
            <StatCard title="Saved Jobs" value={String(savedJobs)} icon={<Bookmark size={20} />} trend="+0%" />
            <StatCard title="Profile Views" value={String(profileViews)} icon={<TrendingUp size={20} />} trend="+0%" />
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ACTIVITY */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border">
              <h2 className="font-semibold mb-4">Recent Activity</h2>

              {recentActivity.length > 0 ? (
                recentActivity.map((a, i) => (
                  <div key={i} className="mb-3">
                    <p className="text-sm text-gray-600">{a.description}</p>
                    <span className="text-xs text-gray-400">
                      {a.created_at}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No activity yet</p>
              )}
            </div>

            {/* ACTIONS */}
            <div className="bg-white p-6 rounded-xl border">
              <h2 className="font-semibold mb-4">Quick Actions</h2>
              <ActionButton label="Post a Job" />
              <ActionButton label="Browse Candidates" />
              <ActionButton label="View Applications" />
              <ActionButton label="Edit Profile" />
            </div>

          </div>

          {/* JOBS */}
          <div className="bg-white p-6 rounded-xl border">
            <h2 className="font-semibold mb-4">Your Jobs</h2>

            {jobsPosted > 0 ? (
              <p>Your jobs are now loaded from Supabase</p>
            ) : (
              <p className="text-gray-500">No jobs posted yet</p>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

// =========================
// COMPONENTS
// =========================
const StatCard = ({ title, value, icon, trend }: StatCardProps) => (
  <div className="bg-white p-5 rounded-xl border">
    <div className="flex justify-between">
      <span className="text-sm text-gray-500">{title}</span>
      <span className="text-[#7263F3]">{icon}</span>
    </div>
    <div className="mt-3 flex justify-between">
      <h3 className="text-2xl font-bold">{value}</h3>
      <span className="text-green-500 text-xs">{trend}</span>
    </div>
  </div>
);

const ActionButton = ({ label }: ActionButtonProps) => (
  <button className="w-full text-left px-4 py-3 border rounded-lg mb-2 hover:bg-gray-50">
    {label}
  </button>
);