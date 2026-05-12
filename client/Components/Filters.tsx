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

  /* =========================
     CLEAR FILTERS
  ========================= */
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

  /* =========================
     SALARY HANDLERS
  ========================= */
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

  /* =========================
     FILTER ITEM COMPONENT
  ========================= */
  const FilterItem = ({
    id,
    label,
  }: {
    id: keyof typeof defaultFilters;
    label: string;
  }) => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={filters?.[id] ?? false}
        onCheckedChange={() => handleFilterChange(id)}
      />

      <Label htmlFor={id}>{label}</Label>
    </div>
  );

  return (
    <div className="w-[22rem] pr-4 space-y-6">

      {/* ================= JOB TYPE ================= */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Job Type</h2>

          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              clearAllFilters();
              searchJobs();
            }}
          >
            Clear All
          </Button>
        </div>

        <div className="space-y-3 mt-4">
          <FilterItem id="fullTime" label="Full Time" />
          <FilterItem id="partTime" label="Part Time" />
          <FilterItem id="contract" label="Contract" />
          <FilterItem id="internship" label="Internship" />
        </div>
      </div>

      {/* ================= TAGS ================= */}
      <div>
        <h2 className="text-lg font-semibold">Tags</h2>

        <div className="space-y-3 mt-4">
          <FilterItem id="fullStack" label="Full Stack" />
          <FilterItem id="backend" label="Backend" />
          <FilterItem id="devOps" label="DevOps" />
          <FilterItem id="uiUx" label="UI/UX" />
        </div>
      </div>

      {/* ================= SALARY ================= */}
      <div>
        <h2 className="text-lg font-semibold">Salary Range</h2>

        <div className="flex flex-col gap-4 mt-4">

          <div>
            <Label>Minimum Salary</Label>

            <Slider
              min={0}
              max={200000}
              step={100}
              value={[minSalary ?? 0]}
              onValueChange={handleMinSalaryChange}
            />

            <span className="text-sm text-gray-500">
              {formatMoney(minSalary ?? 0, "GBP")}
            </span>
          </div>

          <div>
            <Label>Maximum Salary</Label>

            <Slider
              min={0}
              max={200000}
              step={100}
              value={[maxSalary ?? 200000]}
              onValueChange={handleMaxSalaryChange}
            />

            <span className="text-sm text-gray-500">
              {formatMoney(maxSalary ?? 200000, "GBP")}
            </span>
          </div>

        </div>
      </div>

    </div>
  );
}

export default Filters;