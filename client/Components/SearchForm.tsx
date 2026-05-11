"use client";

import { useJobsContext } from "@/context/jobsContext";
import { Search } from "lucide-react";
import React from "react";

function SearchForm() {
  const { searchJobs, handleSearchChange, searchQuery } = useJobsContext();

  return (
    <form
      className="relative flex items-center"
      onSubmit={(e) => {
        e.preventDefault();
        searchJobs(
          searchQuery.tags,
          searchQuery.location,
          searchQuery.title
        );
      }}
    >
      {/* TITLE INPUT */}
      <div className="flex-1 relative">
        <input
          type="text"
          id="job-title"
          name="title"
          value={searchQuery.title}
          onChange={(e) => handleSearchChange("title", e.target.value)}
          placeholder="Job Title or Keywords"
          className="w-full py-7 text-2xl text-black pl-[5rem] rounded-tl-full rounded-bl-full outline-none"
        />

        <Search
          size={30}
          className="text-gray-400 absolute left-8 top-1/2 -translate-y-1/2"
        />
      </div>

      {/* DIVIDER */}
      <div className="absolute top-1/2 left-[48%] -translate-x-1/2 -translate-y-1/2 w-[2px] h-11 bg-gray-300" />

      {/* LOCATION INPUT */}
      <div className="flex-1 relative">
        <input
          type="text"
          id="location"
          name="location"
          value={searchQuery.location}
          onChange={(e) => handleSearchChange("location", e.target.value)}
          placeholder="Enter Location"
          className="w-full py-7 text-2xl text-black pl-[4rem] rounded-tr-full rounded-br-full outline-none"
        />

        <span className="text-gray-400 text-2xl absolute left-6 top-1/2 -translate-y-1/2">
          📍
        </span>
      </div>

      {/* SUBMIT BUTTON */}
      <button
        type="submit"
        className="bg-[#7263F3] hover:bg-[#7263F3]/90 text-white text-2xl px-14 py-2 rounded-full absolute right-2 top-1/2 -translate-y-1/2 h-[calc(100%-1rem)]"
      >
        Search
      </button>
    </form>
  );
}

export default SearchForm;