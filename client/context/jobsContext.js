"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useGlobalContext } from "./globalContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const JobsContext = createContext();

// =========================
// CONTEXT PROVIDER
// =========================
export const JobsContextProvider = ({ children }) => {
  const { userProfile } = useGlobalContext();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [supabaseJobs, setSupabaseJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // GET ALL JOBS (SUPABASE)
  // =========================
  const getJobs = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setJobs(data || []);
    } catch (error) {
      console.log("Get jobs error:", error.message);
      toast.error("Failed to fetch jobs");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // GET SUPABASE JOBS (OPTIONAL DUPLICATE VIEW)
  // =========================
  const getSupabaseJobs = async () => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSupabaseJobs(data || []);
    } catch (err) {
      console.log("Supabase error:", err.message);
    }
  };

  // =========================
  // GET USER JOBS
  // =========================
  const getUserJobs = async (userId) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setUserJobs(data || []);
    } catch (error) {
      console.log("User jobs error:", error.message);
      setUserJobs([]);
    }
  };

  // =========================
  // CREATE JOB
  // =========================
  const createJob = async (jobData) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert([
          {
            ...jobData,
            user_id: userProfile?._id,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setJobs((prev) => [data, ...prev]);

      toast.success("Job created");

      router.push(`/job/${data.id || data._id}`);
    } catch (error) {
      console.log("Create job error:", error.message);
      toast.error("Failed to create job");
    }
  };

  // =========================
  // LIKE JOB (SIMPLE ARRAY UPDATE)
  // =========================
  const likeJob = async (jobId) => {
    try {
      const job = jobs.find((j) => j.id === jobId || j._id === jobId);

      const { error } = await supabase
        .from("jobs")
        .update({ likes: (job?.likes || 0) + 1 })
        .eq("id", jobId);

      if (error) throw error;

      await getJobs();
    } catch (error) {
      console.log("Like error:", error.message);
      toast.error("Failed to like job");
    }
  };

  // =========================
  // APPLY JOB
  // =========================
  const applyToJob = async (jobId) => {
    try {
      const job = jobs.find((j) => j.id === jobId || j._id === jobId);

      const { error } = await supabase
        .from("jobs")
        .update({
          applicants: [
            ...(job?.applicants || []),
            userProfile?._id,
          ],
        })
        .eq("id", jobId);

      if (error) throw error;

      toast.success("Applied successfully");
      await getJobs();
    } catch (error) {
      console.log("Apply error:", error.message);
      toast.error("Failed to apply");
    }
  };

  // =========================
  // DELETE JOB
  // =========================
  const deleteJob = async (jobId) => {
    try {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", jobId);

      if (error) throw error;

      setJobs((prev) =>
        prev.filter((j) => j.id !== jobId && j._id !== jobId)
      );

      toast.success("Deleted");
    } catch (error) {
      console.log("Delete error:", error.message);
      toast.error("Failed to delete job");
    }
  };

  // =========================
  // INIT LOAD
  // =========================
  useEffect(() => {
    getJobs();
    getSupabaseJobs();

    if (userProfile?._id) {
      getUserJobs(userProfile._id);
    }
  }, [userProfile?._id]);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        userJobs,
        supabaseJobs,
        loading,

        createJob,
        getJobs,
        likeJob,
        applyToJob,
        deleteJob,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => useContext(JobsContext);