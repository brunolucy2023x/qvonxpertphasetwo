"use client";

import { useJobsContext } from "@/context/jobsContext";
import { Search } from "lucide-react";
import React from "react";

function SearchForm() {
  const { searchJobs, handleSearchChange, searchQuery } = useJobsContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    searchJobs(
      searchQuery.tags?.trim() || "",
      searchQuery.location?.trim() || "",
      searchQuery.title?.trim() || ""
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center w-full"
    >

      {/* ================= TITLE ================= */}
      <div className="flex-1 relative">
        <Search
          size={24}
          className="text-gray-400 absolute left-6 top-1/2 -translate-y-1/2"
        />

        <input
          type="text"
          name="title"
          value={searchQuery.title}
          onChange={(e) =>
            handleSearchChange("title", e.target.value)
          }
          placeholder="Job Title or Keywords"
          className="w-full py-6 text-lg md:text-xl text-black pl-14 rounded-l-full outline-none bg-white"
        />
      </div>

      {/* ================= LOCATION ================= */}
      <div className="flex-1 relative border-l border-gray-200">
        <span className="text-gray-400 text-lg absolute left-6 top-1/2 -translate-y-1/2">
          📍
        </span>

        <input
          type="text"
          name="location"
          value={searchQuery.location}
          onChange={(e) =>
            handleSearchChange("location", e.target.value)
          }
          placeholder="Enter Location"
          className="w-full py-6 text-lg md:text-xl text-black pl-14 rounded-r-full outline-none bg-white"
        />
      </div>

      {/* ================= BUTTON ================= */}
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#7263F3] hover:bg-[#5f52d9] text-white px-10 py-3 rounded-full text-lg font-medium transition"
      >
        Search
      </button>

    </form>
  );
}

export default SearchForm;