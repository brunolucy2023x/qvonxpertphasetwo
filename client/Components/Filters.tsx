"use client";

import React from "react";
import { Button } from "./ui/button";
import { useJobsContext } from "@/context/jobsContext";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import formatMoney from "@/utils/formatMoney";

const defaultFilters = {
  fullTime: false,
  partTime: false,
  contract: false,
  internship: false,
  fullStack: false,
  backend: false,
  devOps: false,
  uiUx: false,
};

function Filters() {
  const jobsContext = useJobsContext();

  // SAFETY CHECK
  if (!jobsContext) {
    return null;
  }

  const {
    handleFilterChange,
    filters = defaultFilters,
    setFilters,
    minSalary,
    maxSalary,
    setMinSalary,
    setMaxSalary,
    searchJobs,
    setSearchQuery,
  } = jobsContext;

  /* =========================================
      CLEAR FILTERS
  ========================================= */

  const clearAllFilters = () => {
    setFilters(defaultFilters);

    setSearchQuery({
      tags: "",
      location: "",
      title: "",
    });

    setMinSalary(0);
    setMaxSalary(200000);
  };

  /* =========================================
      SALARY HANDLERS
  ========================================= */

  const handleMinSalaryChange = (value: number[]) => {
    const min = value[0];

    setMinSalary(min);

    if (min > maxSalary) {
      setMaxSalary(min);
    }
  };

  const handleMaxSalaryChange = (value: number[]) => {
    const max = value[0];

    setMaxSalary(max);

    if (max < minSalary) {
      setMinSalary(max);
    }
  };

  /* =========================================
      FILTER ITEM
  ========================================= */

  const FilterItem = ({
    id,
    label,
  }: {
    id: keyof typeof defaultFilters;
    label: string;
  }) => (
    <label
      htmlFor={id}
      className="group flex items-center justify-between border border-black px-4 py-4 cursor-pointer hover:bg-black hover:text-white transition-all duration-200"
    >
      <div className="flex items-center gap-3">
        <Checkbox
          id={id}
          checked={filters?.[id] ?? false}
          onCheckedChange={() => handleFilterChange(id)}
          className="border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
        />

        <span className="text-sm uppercase tracking-[0.15em] font-bold">
          {label}
        </span>
      </div>
    </label>
  );

  return (
    <div className="w-full space-y-10 overflow-hidden">
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="border border-black bg-[#d9ff65]">
        <div className="p-5 border-b border-black">
          <p className="text-xs uppercase tracking-[0.3em] font-black">
            Qvonxpert Filters
          </p>

          <h2 className="mt-3 text-3xl font-black uppercase leading-none">
            Refine
            <br />
            Results
          </h2>
        </div>

        <div className="p-5">
          <Button
            variant="ghost"
            onClick={() => {
              clearAllFilters();
              searchJobs();
            }}
            className="w-full h-[56px] border border-black bg-black text-white rounded-none uppercase tracking-[0.2em] text-xs font-black hover:bg-white hover:text-black transition-all"
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* =========================================
          JOB TYPE
      ========================================= */}

      <div className="border border-black bg-white">
        <div className="border-b border-black px-5 py-4">
          <h3 className="text-lg font-black uppercase tracking-[0.15em]">
            Job Type
          </h3>
        </div>

        <div className="p-5 space-y-3">
          <FilterItem id="fullTime" label="Full Time" />
          <FilterItem id="partTime" label="Part Time" />
          <FilterItem id="contract" label="Contract" />
          <FilterItem id="internship" label="Internship" />
        </div>
      </div>

      {/* =========================================
          SKILLS
      ========================================= */}

      <div className="border border-black bg-[#efe7da]">
        <div className="border-b border-black px-5 py-4">
          <h3 className="text-lg font-black uppercase tracking-[0.15em]">
            Categories
          </h3>
        </div>

        <div className="p-5 space-y-3">
          <FilterItem id="fullStack" label="Full Stack" />
          <FilterItem id="backend" label="Backend" />
          <FilterItem id="devOps" label="DevOps" />
          <FilterItem id="uiUx" label="UI / UX" />
        </div>
      </div>

      {/* =========================================
          SALARY
      ========================================= */}

      <div className="border border-black bg-white overflow-hidden">
        <div className="border-b border-black px-5 py-4">
          <h3 className="text-lg font-black uppercase tracking-[0.15em]">
            Salary Range
          </h3>
        </div>

        <div className="p-5 space-y-8">
          {/* MIN */}

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="uppercase tracking-[0.15em] text-xs font-black">
                Minimum Salary
              </Label>

              <span className="text-sm font-bold border border-black px-3 py-1">
                {formatMoney(minSalary ?? 0, "GBP")}
              </span>
            </div>

            <div className="border border-black px-4 py-6">
              <Slider
                min={0}
                max={200000}
                step={100}
                value={[minSalary ?? 0]}
                onValueChange={handleMinSalaryChange}
              />
            </div>
          </div>

          {/* MAX */}

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="uppercase tracking-[0.15em] text-xs font-black">
                Maximum Salary
              </Label>

              <span className="text-sm font-bold border border-black px-3 py-1">
                {formatMoney(maxSalary ?? 200000, "GBP")}
              </span>
            </div>

            <div className="border border-black px-4 py-6">
              <Slider
                min={0}
                max={200000}
                step={100}
                value={[maxSalary ?? 200000]}
                onValueChange={handleMaxSalaryChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================
          FOOTER NOTE
      ========================================= */}

      <div className="border border-black bg-black text-white p-5">
        <p className="text-xs uppercase tracking-[0.2em] leading-7">
          Qvonxpert helps professionals discover modern opportunities across
          technology, design, marketing, engineering, and innovation-driven
          industries.
        </p>
      </div>
    </div>
  );
}

export default Filters;
