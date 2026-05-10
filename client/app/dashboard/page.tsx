"use client";

import Header from "@/Components/Header";
import Footer from "@/Components/Footer";
import { Briefcase, FileText, Bookmark, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";

// Define the types for props in the components
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
  timestamp: string;
}

export default function DashboardPage() {
  // Define states for various dashboard data
  const [jobsPosted, setJobsPosted] = useState(0);
  const [applications, setApplications] = useState(0);
  const [savedJobs, setSavedJobs] = useState(0);
  const [profileViews, setProfileViews] = useState(0);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState<string | null>(null); // For handling errors

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data (profile)
        const userResponse = await axios.get("/api/v1/check-auth");

        if (userResponse.data.isAuthenticated) {
          setUserProfile(userResponse.data.user);

          // Fetch job stats for the user (using auth0Id instead of ObjectId)
          const jobStatsResponse = await axios.get(`/api/v1/jobs/user/${userResponse.data.user.auth0Id}`);
          setJobsPosted(jobStatsResponse.data.length);

          // For demo purposes, we're just assuming number of applications and saved jobs
          setApplications(3); // This should come from actual data (e.g., saved applications)
          setSavedJobs(5); // Likewise, this should be dynamic
        }

        // Fetch recent activity (dummy example)
        // You would replace this with actual activity fetching API
        const recentActivityResponse = await axios.get("/api/v1/recent-activity");
        setRecentActivity(recentActivityResponse.data);

        // Set profile views (example)
        setProfileViews(12); // Ideally, this would come from user data too
      } catch (err) {
        // Commented out the error handling for now
        // console.error("Error fetching dashboard data", err);

        // Check if it's an Axios error
        // if (axios.isAxiosError(err)) {
        //   // Handle Axios error response
        //   if (err.response) {
        //     setError(`Error: ${err.response.status} - ${err.response.data.message}`);
        //   } else if (err.request) {
        //     // No response was received from the server
        //     setError("Error: No response from server.");
        //   } else {
        //     // General Axios error (e.g., request setup issues)
        //     setError(`Error: ${err.message}`);
        //   }
        // } else {
        //   // Handle non-Axios errors (e.g., JavaScript errors)
        //   setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        // }
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      {/* ================= HEADER ================= */}
      <Header />

      {/* ================= PAGE CONTENT ================= */}
      <main className="flex-1 px-6 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* ================= TITLE ================= */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back 👋 — here’s what’s happening today</p>
            </div>

            {/* Quick Action Button */}
            <button className="mt-4 md:mt-0 bg-[#7263F3] text-white px-5 py-2.5 rounded-lg shadow hover:bg-[#5d4fe0] transition">
              + Post a Job
            </button>
          </div>

          {/* ================= STATS ================= */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            <StatCard
              title="Jobs Posted"
              value={jobsPosted.toString()}
              icon={<Briefcase size={20} />}
              trend="+0%"
            />
            <StatCard
              title="Applications"
              value={applications.toString()}
              icon={<FileText size={20} />}
              trend="+0%"
            />
            <StatCard
              title="Saved Jobs"
              value={savedJobs.toString()}
              icon={<Bookmark size={20} />}
              trend="+0%"
            />
            <StatCard
              title="Profile Views"
              value={profileViews.toString()}
              icon={<TrendingUp size={20} />}
              trend="+0%"
            />
          </div>

          {/* ================= MAIN GRID ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Activity */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Recent Activity</h2>
                <button className="text-sm text-[#7263F3] hover:underline">View all</button>
              </div>

              {/* Render activity items dynamically */}
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="mb-4">
                    <p className="text-sm text-gray-600">
                      {activity.description || "No description available"}
                    </p>
                    <span className="text-xs text-gray-400">
                      {activity.timestamp || "No timestamp available"}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    📭
                  </div>
                  <p className="text-gray-600 font-medium">No activity yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    When you post jobs or receive applications, they’ll show up here.
                  </p>
                </div>
              )}

              {/* Error Handling */}
              {error && (
                <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
                  <p>{error}</p>
                </div>
              )}
            </div>

            {/* RIGHT: Quick Actions */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
              <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <ActionButton label="Post a Job" />
                <ActionButton label="Browse Candidates" />
                <ActionButton label="View Applications" />
                <ActionButton label="Edit Profile" />
              </div>
            </div>
          </div>

          {/* ================= RECENT JOBS ================= */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">Your Job Listings</h2>
              <button className="text-sm text-[#7263F3] hover:underline">Manage jobs</button>
            </div>

            {/* Render jobs dynamically or show empty state */}
            {jobsPosted > 0 ? (
              <div>Your jobs will be listed here...</div> // Render job items
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-4xl mb-3">💼</div>
                <p className="text-gray-600 font-medium">No jobs posted yet</p>
                <p className="text-sm text-gray-400 mt-1 mb-4">
                  Start by posting your first job to attract talent.
                </p>
                <button className="bg-[#7263F3] text-white px-5 py-2 rounded-lg hover:bg-[#5d4fe0] transition">
                  Post Job
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}

// ================= COMPONENTS =================

const StatCard = ({ title, value, icon, trend }: StatCardProps) => {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div className="text-gray-500 text-sm">{title}</div>
        <div className="text-[#7263F3]">{icon}</div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <span className="text-xs text-green-500">{trend}</span>
      </div>
    </div>
  );
};

const ActionButton = ({ label }: ActionButtonProps) => {
  return (
    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
      {label}
    </button>
  );
};