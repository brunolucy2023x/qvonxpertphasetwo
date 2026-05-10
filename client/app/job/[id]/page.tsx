"use client";

import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

function Page() {
  const { jobs, likeJob, applyToJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();

  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  const [isLiked, setIsLiked] = React.useState(false);
  const [isApplied, setIsApplied] = React.useState(false);

  const job = jobs.find((job: Job) => job._id === id);
  const otherJobs = jobs.filter((job: Job) => job._id !== id);

  // SAFE USER ID
  const userId = userProfile?._id;

  useEffect(() => {
    if (job && userId) {
      setIsApplied(job.applicants?.includes(userId));
    }
  }, [job, userId]);

  useEffect(() => {
    if (job && userId) {
      setIsLiked(job.likes?.includes(userId));
    }
  }, [job, userId]);

  if (!job) return null;

  const {
    title,
    location,
    description,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
    salaryType,
  } = job;

  const { name, profilePicture } = createdBy || {};

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  return (
    <main>
      <Header />

      <div className="p-8 mb-8 mx-auto w-[90%] rounded-md flex gap-8">
        {/* LEFT SIDEBAR */}
        <div className="w-[26%] flex flex-col gap-8">
          <JobCard activeJob job={job} />

          {otherJobs.map((job: Job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 bg-white p-6 rounded-md">
          <div className="flex flex-col gap-2">
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 relative overflow-hidden rounded-md bg-gray-200">
                  <Image
                    src={profilePicture || "/user.png"}
                    alt={name || "User"}
                    width={45}
                    height={45}
                    className="rounded-md"
                  />
                </div>

                <div>
                  <p className="font-bold">{name || "Recruiter"}</p>
                  <p className="text-sm">Recruiter</p>
                </div>
              </div>

              <button
                className={`text-2xl ${
                  isLiked ? "text-[#7263f3]" : "text-gray-400"
                }`}
                onClick={() => {
                  if (!isAuthenticated) {
                    router.push(`${baseUrl}/login`);
                    return;
                  }
                  handleLike(job._id);
                }}
              >
                {isLiked ? bookmark : bookmarkEmpty}
              </button>
            </div>

            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-gray-500">{location}</p>

            {/* INFO GRID */}
            <div className="mt-2 flex gap-4 justify-between items-center">
              <p className="flex-1 py-2 px-4 flex flex-col items-center bg-green-500/20 rounded-xl">
                <span className="text-sm">Salary</span>
                <span className="font-bold">
                  {formatMoney(salary, "GBP")}
                </span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center bg-purple-500/20 rounded-xl">
                <span className="text-sm">Posted</span>
                <span className="font-bold">
                  {formatDates(createdAt)}
                </span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center bg-blue-500/20 rounded-xl">
                <span className="text-sm">Applicants</span>
                <span className="font-bold">
                  {applicants?.length || 0}
                </span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center bg-yellow-500/20 rounded-xl">
                <span className="text-sm">Job Type</span>
                <span className="font-bold">
                  {jobType?.[0] || "N/A"}
                </span>
              </p>
            </div>

            <h2 className="font-bold text-2xl mt-2">
              Job Description
            </h2>
          </div>

          <div
            className="wysiwyg mt-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="w-[26%] flex flex-col gap-8">
          <button
            className={`text-white py-4 rounded-full ${
              isApplied
                ? "bg-green-500"
                : "bg-[#7263f3] hover:bg-[#7263f3]/90"
            }`}
            onClick={() => {
              if (!isAuthenticated) {
                router.push(`${baseUrl}/login`);
                return;
              }

              if (!isApplied) {
                applyToJob(job._id);
                setIsApplied(true);
              } else {
                toast.error("You have already applied to this job");
              }
            }}
          >
            {isApplied ? "Applied" : "Apply Now"}
          </button>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Page;