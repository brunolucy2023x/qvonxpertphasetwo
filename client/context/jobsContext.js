import React, { createContext, useContext, useEffect, useState } from "react";
import { useGlobalContext } from "./globalContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const JobsContext = createContext();

// =========================
// API CONFIG (HARDENED)
// =========================
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// HARD FAIL (so you immediately see issue instead of silent bugs)
if (!API_BASE_URL) {
  throw new Error("❌ NEXT_PUBLIC_API_URL is missing in .env.local");
}

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// =========================
// CONTEXT PROVIDER
// =========================
export const JobsContextProvider = ({ children }) => {
  const { userProfile } = useGlobalContext();
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [userJobs, setUserJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const [searchQuery, setSearchQuery] = useState({
    tags: "",
    location: "",
    title: "",
  });

  const [filters, setFilters] = useState({
    fullTime: false,
    partTime: false,
    internship: false,
    contract: false,
    fullStack: false,
    backend: false,
    devOps: false,
    uiux: false,
  });

  const [minSalary, setMinSalary] = useState(30000);
  const [maxSalary, setMaxSalary] = useState(120000);

  // =========================
  // GET ALL JOBS
  // =========================
  const getJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await api.get("/api/v1/jobs");
      setJobs(res.data);
    } catch (error) {
      console.log("Error getting jobs", error);
      toast.error(error?.response?.data?.message || "Failed to fetch jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  // =========================
  // USER JOBS
  // =========================
  const getUserJobs = async (userId) => {
    if (!userId) return;
    setLoadingJobs(true);

    try {
      const res = await api.get(`/api/v1/jobs/user/${userId}`);
      setUserJobs(res.data);
    } catch (error) {
      console.log("Error getting user jobs", error);
      toast.error("Failed to fetch your jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  // =========================
  // CREATE JOB
  // =========================
  const createJob = async (jobData) => {
    try {
      const res = await api.post("/api/v1/jobs", jobData);

      toast.success("Job created successfully");

      setJobs((prev) => [res.data, ...prev]);

      if (userProfile?._id) {
        await getUserJobs(userProfile._id);
      }

      router.push(`/job/${res.data._id}`);
    } catch (error) {
      console.log("Error creating job", error);
      toast.error(error?.response?.data?.message || "Failed to create job");
    }
  };

  // =========================
  // SEARCH JOBS
  // =========================
  const searchJobs = async (tags, location, title) => {
    setLoadingJobs(true);

    try {
      const query = new URLSearchParams();

      if (tags) query.append("tags", tags);
      if (location) query.append("location", location);
      if (title) query.append("title", title);

      const res = await api.get(`/api/v1/jobs/search?${query.toString()}`);
      setJobs(res.data);
    } catch (error) {
      console.log("Error searching jobs", error);
      toast.error("Failed to search jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  // =========================
  // JOB BY ID
  // =========================
  const getJobById = async (id) => {
    if (!id) return null;

    setLoadingJobs(true);

    try {
      const res = await api.get(`/api/v1/jobs/${id}`);
      return res.data;
    } catch (error) {
      console.log("Error getting job by id", error);
      toast.error("Failed to fetch job details");
      return null;
    } finally {
      setLoadingJobs(false);
    }
  };

  // =========================
  // LIKE JOB
  // =========================
  const likeJob = async (jobId) => {
    if (!jobId) return;

    try {
      await api.put(`/api/v1/jobs/like/${jobId}`);
      toast.success("Job updated");
      await getJobs();
    } catch (error) {
      console.log("Error liking job", error);
      toast.error("Failed to update like");
    }
  };

  // =========================
  // APPLY JOB
  // =========================
  const applyToJob = async (jobId) => {
    if (!jobId || !userProfile?._id) return;

    const job = jobs.find((j) => j._id === jobId);

    if (job?.applicants?.includes(userProfile._id)) {
      toast.error("Already applied");
      return;
    }

    try {
      await api.put(`/api/v1/jobs/apply/${jobId}`);
      toast.success("Applied successfully");
      await getJobs();
    } catch (error) {
      console.log("Error applying", error);
      toast.error(error?.response?.data?.message || "Failed to apply");
    }
  };

  // =========================
  // DELETE JOB
  // =========================
  const deleteJob = async (jobId) => {
    if (!jobId) return;

    try {
      await api.delete(`/api/v1/jobs/${jobId}`);

      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      setUserJobs((prev) => prev.filter((j) => j._id !== jobId));

      toast.success("Deleted successfully");
    } catch (error) {
      console.log("Error deleting job", error);
      toast.error("Failed to delete job");
    }
  };

  // =========================
  // HELPERS
  // =========================
  const handleSearchChange = (field, value) => {
    setSearchQuery((prev) => ({ ...prev, [field]: value }));
  };

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  // =========================
  // INIT LOAD
  // =========================
  useEffect(() => {
    getJobs();

    if (userProfile?._id) {
      getUserJobs(userProfile._id);
    }
  }, [userProfile?._id]);

  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading: loadingJobs,
        createJob,
        userJobs,
        searchJobs,
        getJobById,
        likeJob,
        applyToJob,
        deleteJob,
        searchQuery,
        setSearchQuery,
        handleSearchChange,
        filters,
        handleFilterChange,
        minSalary,
        setMinSalary,
        maxSalary,
        setMaxSalary,
        setFilters,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => useContext(JobsContext);