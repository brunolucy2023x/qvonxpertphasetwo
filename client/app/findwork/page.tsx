"use client";

import Filters from "@/Components/Filters";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import React from "react";
import Image from "next/image";

function Page() {
  const { jobs, filters } = useJobsContext();

  const [columns, setColumns] = React.useState<number>(3);

  // SEARCH STATE
  const [search, setSearch] = React.useState<string>("");
  const [location, setLocation] = React.useState<string>("");
  const [type, setType] = React.useState<string>("");

  // SORT STATE
  const [sort, setSort] = React.useState<string>("relevant");

  // SAVED + APPLIED
  const [savedJobs, setSavedJobs] = React.useState<string[]>([]);
  const [appliedJobs, setAppliedJobs] = React.useState<string[]>([]);

  // debounce
  const [debouncedSearch, setDebouncedSearch] =
    React.useState<string>(search);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);

    return () => clearTimeout(t);
  }, [search]);

  const toggleSave = (id: string) => {
    setSavedJobs((prev) =>
      prev.includes(id)
        ? prev.filter((j) => j !== id)
        : [...prev, id]
    );
  };

  const applyJob = (id: string) => {
    if (!appliedJobs.includes(id)) {
      setAppliedJobs((prev) => [...prev, id]);
    }
  };

  // FILTERING
  const filteredJobs = jobs.filter((job: Job) => {
    const keyword = debouncedSearch.toLowerCase();

    const matchesKeyword =
      job.title?.toLowerCase().includes(keyword) ||
      (job as any).company?.toLowerCase().includes(keyword) ||
      job.tags?.some((t: string) =>
        t.toLowerCase().includes(keyword)
      );

    const matchesLocation =
      !location ||
      job.location?.toLowerCase().includes(location.toLowerCase());

    const matchesType =
      !type ||
      type === "All" ||
      job.jobType?.includes(type);

    const matchesSidebarFilters =
      (!filters.fullTime ||
        job.jobType?.includes("Full Time")) &&
      (!filters.partTime ||
        job.jobType?.includes("Part Time")) &&
      (!filters.contract ||
        job.jobType?.includes("Contract")) &&
      (!filters.internship ||
        job.jobType?.includes("Internship")) &&
      (!filters.fullStack ||
        job.tags?.includes("Full Stack")) &&
      (!filters.backend ||
        job.tags?.includes("Backend")) &&
      (!filters.devOps ||
        job.tags?.includes("DevOps")) &&
      (!filters.uiUx ||
        job.tags?.includes("UI/UX"));

    return (
      matchesKeyword &&
      matchesLocation &&
      matchesType &&
      matchesSidebarFilters
    );
  });

  // SORTING
  const sortedJobs = [...filteredJobs].sort(
    (a: any, b: any) => {
      if (sort === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }

      return 0;
    }
  );

  return (
    <main className="bg-gradient-to-b from-gray-50 to-white min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
        <div className="absolute top-[-120px] left-[-120px] w-[300px] h-[300px] bg-purple-300 opacity-30 blur-3xl rounded-full" />

        <div className="absolute bottom-[-120px] right-[-120px] w-[300px] h-[300px] bg-green-300 opacity-30 blur-3xl rounded-full" />

        <div className="relative max-w-7xl mx-auto px-6 py-14 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Find Your Next{" "}
              <span className="text-indigo-600">
                Opportunity
              </span>
            </h1>

            <p className="text-gray-600 mt-4 text-lg max-w-lg">
              Search, filter and apply to jobs instantly.
            </p>
          </div>

          <div className="hidden lg:block flex-1 relative h-[300px]">
            <Image
              src="/woman-on-phone.jpg"
              alt="hero"
              fill
              className="object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* SEARCH */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
        <div className="sticky top-4 bg-white/80 backdrop-blur-xl border shadow-xl rounded-2xl p-4 flex flex-col lg:flex-row gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Job title, company..."
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50"
          />

          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-50"
          >
            <option value="">All Types</option>
            <option value="Full Time">
              Full Time
            </option>
            <option value="Part Time">
              Part Time
            </option>
            <option value="Contract">
              Contract
            </option>
            <option value="Internship">
              Internship
            </option>
          </select>
        </div>
      </section>

      {/* JOB LIST */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        {/* TOP BAR */}
        <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-semibold text-gray-900">
            Job Opportunities
          </h2>

          <div className="flex items-center gap-3">
            {/* SORT */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-lg bg-gray-100 text-sm"
            >
              <option value="relevant">
                Most Relevant
              </option>

              <option value="newest">
                Newest
              </option>
            </select>

            {/* COLUMN TOGGLE */}
            <div className="flex gap-2">
              {[1, 2, 3].map((col) => (
                <button
                  key={col}
                  onClick={() => setColumns(col)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    columns === col
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500">
              {sortedJobs.length} results
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* FILTERS */}
          <aside className="lg:w-[280px] w-full">
            <div className="lg:sticky lg:top-24 bg-white/70 border p-5 rounded-2xl shadow-lg">
              <Filters />
            </div>
          </aside>

          {/* GRID */}
          <div
            className={`flex-1 grid gap-6 ${
              columns === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : columns === 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {sortedJobs.length > 0 ? (
              sortedJobs.map((job: Job) => (
                <div
                  key={job._id}
                  className="transition hover:scale-[1.02] hover:shadow-xl relative"
                >
                  {/* SAVE BUTTON */}
                  <button
                    onClick={() =>
                      toggleSave(job._id as string)
                    }
                    className="absolute top-3 right-3 z-10 text-xl"
                  >
                    {savedJobs.includes(
                      job._id as string
                    )
                      ? "⭐"
                      : "☆"}
                  </button>

                  <JobCard job={job} />

                  {/* APPLY BUTTON */}
                  <button
                    onClick={() =>
                      applyJob(job._id as string)
                    }
                    className={`mt-2 w-full py-2 rounded-lg text-sm ${
                      appliedJobs.includes(
                        job._id as string
                      )
                        ? "bg-green-500 text-white"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {appliedJobs.includes(
                      job._id as string
                    )
                      ? "Applied ✅"
                      : "Apply Now"}
                  </button>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No jobs found
              </p>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default Page;