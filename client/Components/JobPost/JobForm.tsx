"use client";

import React, { useState } from "react";

import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";

import JobTitle from "./JobTitle";
import JobDetails from "./JobDetails";
import JobSkills from "./JobSkills ";
import JobLocation from "./JobLocation";

import { supabase } from "@/lib/supabase";

function JobForm() {
  const {
    jobTitle,
    jobDescription,
    salaryType,
    activeEmploymentTypes,
    salary,
    location,
    skills,
    negotiable,
    tags,
    resetJobForm,
    userProfile,
  } = useGlobalContext();

  const { createJob } = useJobsContext();

  const sections = ["About", "Job Details", "Skills", "Location", "Summary"];

  const [currentSection, setCurrentSection] = useState(sections[0]);
  const [loading, setLoading] = useState(false);

  const handleSectionChange = (section: string) => {
    setCurrentSection(section);
  };

  const renderStages = () => {
    switch (currentSection) {
      case "About":
        return <JobTitle />;

      case "Job Details":
        return <JobDetails />;

      case "Skills":
        return <JobSkills />;

      case "Location":
        return <JobLocation />;

      case "Summary":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Job Summary</h2>

            <div className="space-y-3 text-sm">
              <p><strong>Title:</strong> {jobTitle}</p>
              <p><strong>Salary:</strong> {salary}</p>
              <p><strong>Salary Type:</strong> {salaryType}</p>
              <p><strong>Negotiable:</strong> {negotiable ? "Yes" : "No"}</p>
              <p><strong>Employment Types:</strong> {(activeEmploymentTypes || []).join(", ")}</p>
              <p><strong>Skills:</strong> {(skills || []).join(", ")}</p>
              <p><strong>Tags:</strong> {(tags || []).join(", ")}</p>
              <p>
                <strong>Location:</strong>{" "}
                {[location?.address, location?.city, location?.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const jobData = {
        title: jobTitle,
        description: jobDescription,
        salaryType,
        jobType: activeEmploymentTypes || [],
        salary,
        location: [
          location?.address,
          location?.city,
          location?.country,
        ]
          .filter(Boolean)
          .join(", "),
        skills: skills || [],
        negotiable,
        tags: tags || [],
      };

      // MongoDB (existing system)
      await createJob(jobData);

      // Supabase (backup / analytics layer)
      const { error } = await supabase.from("jobs").insert([
        {
          title: jobTitle,
          description: jobDescription,
          salary,
          salary_type: salaryType,
          negotiable,
          job_types: activeEmploymentTypes || [],
          skills: skills || [],
          tags: tags || [],
          location: [
            location?.address,
            location?.city,
            location?.country,
          ]
            .filter(Boolean)
            .join(", "),
          created_by: userProfile?._id || null,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Supabase error:", error);
      }

      resetJobForm();
      setCurrentSection(sections[0]);
    } catch (error) {
      console.error("Job submit error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6">
      {/* SIDEBAR */}
      <div className="w-full lg:w-[12rem] flex lg:flex-col bg-white rounded-md shadow-sm">
        {sections.map((section, index) => (
          <button
            key={index}
            type="button"
            className={`pl-4 py-3 flex gap-2 font-medium ${
              currentSection === section ? "text-[#7263F3]" : "text-gray-500"
            }`}
            onClick={() => handleSectionChange(section)}
          >
            <span>{index + 1}</span>
            <span className="hidden md:block">{section}</span>
          </button>
        ))}
      </div>

      {/* FORM */}
      <form
        className="p-6 flex-1 bg-white rounded-lg shadow-sm"
        onSubmit={handleSubmit}
      >
        {renderStages()}

        <div className="flex justify-end gap-4 mt-8">
          {currentSection !== "About" && (
            <button
              type="button"
              onClick={() =>
                setCurrentSection(
                  sections[sections.indexOf(currentSection) - 1]
                )
              }
              className="px-6 py-2 border rounded-md"
            >
              Back
            </button>
          )}

          {currentSection !== "Summary" && (
            <button
              type="button"
              onClick={() =>
                setCurrentSection(
                  sections[sections.indexOf(currentSection) + 1]
                )
              }
              className="px-6 py-2 bg-[#7263F3] text-white rounded-md"
            >
              Next
            </button>
          )}

          {currentSection === "Summary" && (
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#7263F3] text-white rounded-md"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default JobForm;