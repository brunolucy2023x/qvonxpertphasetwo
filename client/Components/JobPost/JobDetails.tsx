"use client";

import React from "react";
import dynamic from "next/dynamic";

import { useGlobalContext } from "@/context/globalContext";

import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(
  () => import("react-quill-new"),
  { ssr: false }
);

/* =======================
   JOB DESCRIPTION EDITOR
======================= */
function MyEditor() {
  const { jobDescription, setJobDescription } = useGlobalContext();

  return (
    <div className="min-h-[400px]">
      <ReactQuill
        theme="snow"
        value={jobDescription || ""}
        onChange={(value) => setJobDescription(value)}
        modules={{
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link"],
            ["clean"],
          ],
        }}
        className="bg-white"
      />
    </div>
  );
}

/* =======================
   MAIN COMPONENT
======================= */
function JobDetails() {
  const {
    salary,
    setSalary,
    salaryType,
    setSalaryType,
    negotiable,
    setNegotiable,
  } = useGlobalContext();

  return (
    <div className="p-6 flex flex-col gap-6 bg-background border border-border rounded-lg">

      {/* ================= DESCRIPTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-bold">Job Description</h3>
          <Label className="text-gray-500 mt-2 block">
            Provide a detailed description of the job.
          </Label>
        </div>

        <div>
          <MyEditor />
        </div>
      </div>

      <Separator />

      {/* ================= SALARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <h3 className="text-lg font-bold">Salary</h3>
          <Label className="text-gray-500 mt-2 block">
            Enter salary range for the job.
          </Label>
        </div>

        <div className="space-y-4">

          {/* SALARY INPUT */}
          <Input
            type="number"
            placeholder="Enter Salary"
            value={salary ?? ""}
            onChange={(e) => setSalary(Number(e.target.value))}
          />

          {/* OPTIONS */}
          <div className="flex flex-col md:flex-row gap-4 justify-between">

            {/* NEGOTIABLE */}
            <div className="flex items-center space-x-2 border p-3 rounded-md">
              <Checkbox
                checked={negotiable}
                onCheckedChange={(checked) =>
                  setNegotiable(checked === true)
                }
              />

              <Label className="text-gray-500">
                Negotiable / Hide Salary
              </Label>
            </div>

            {/* SALARY TYPE */}
            <div className="min-w-[180px]">
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Yearly">Yearly</SelectItem>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="Weekly">Weekly</SelectItem>
                  <SelectItem value="Hourly">Hourly</SelectItem>
                  <SelectItem value="Fixed">Fixed</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;