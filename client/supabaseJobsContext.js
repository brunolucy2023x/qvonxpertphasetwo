"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "./lib/supabase";

const SupabaseJobsContext = createContext();

export const SupabaseJobsProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  // FETCH JOBS
  const getJobs = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("SUPABASE ERROR:", error);
    } else {
      setJobs(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <SupabaseJobsContext.Provider
      value={{
        jobs,
        loading,
        getJobs,
      }}
    >
      {children}
    </SupabaseJobsContext.Provider>
  );
};

export const useSupabaseJobs = () =>
  useContext(SupabaseJobsContext);