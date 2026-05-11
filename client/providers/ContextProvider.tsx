"use client";

import React from "react";
import { GlobalContextProvider } from "@/context/globalContext";
import { JobsContextProvider } from "@/context/jobsContext";

import { SupabaseJobsProvider } from "../supabaseJobsContext";






interface Props {
  children: React.ReactNode;
}

function ContextProvider({ children }: Props) {
  return (
    <GlobalContextProvider>
      <JobsContextProvider>
        <SupabaseJobsProvider>
          {children}
        </SupabaseJobsProvider>
      </JobsContextProvider>
    </GlobalContextProvider>
  );
}

export default ContextProvider;