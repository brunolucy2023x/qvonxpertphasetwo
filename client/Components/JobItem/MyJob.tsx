"use client";

import React, { useEffect } from "react";
import { Job } from "@/types/types";
import { useJobsContext } from "@/context/jobsContext";
import Image from "next/image";
import { CardTitle } from "../ui/card";
import { formatDates } from "@/utils/fotmatDates";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
}

function MyJob({ job }: JobProps) {
  const { deleteJob, likeJob } = useJobsContext();
  const { userProfile, isAuthenticated, getUserProfile } =
    useGlobalContext();

  const router = useRouter();

  const [isLiked, setIsLiked] = React.useState(false);

  const userId = userProfile?._id;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  // SAFE FETCH PROFILE
  useEffect(() => {
    if (isAuthenticated && job?.createdBy?._id) {
      getUserProfile(job.createdBy._id);
    }
  }, [isAuthenticated, job?.createdBy?._id]);

  // SAFE LIKE STATE
  useEffect(() => {
    if (userId && job?.likes) {
      setIsLiked(job.likes.includes(userId));
    }
  }, [job?.likes, userId]);

  return (
    <div className="p-8 bg-white rounded-xl flex flex-col gap-5">
      {/* HEADER */}
      <div className="flex justify-between">
        <div
          className="flex items-center space-x-4 mb-2 cursor-pointer"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <Image
            alt="logo"
            src={job.createdBy?.profilePicture || "/user.png"}
            width={48}
            height={48}
            className="rounded-full shadow-sm"
          />

          <div>
            <CardTitle className="text-xl font-bold truncate">
              {job.title}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              {job.createdBy?.name || "Unknown"}
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
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

      {/* META */}
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {job.location}
        </p>

        <p className="text-sm text-muted-foreground mb-4">
          Posted {formatDates(job.createdAt)}
        </p>

        <div className="flex justify-between">
          <div>
            {/* SKILLS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills?.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags?.map((tag, index) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* EDIT / DELETE */}
          {job.createdBy?._id === userId && (
            <div className="self-end">
              <Button variant="ghost" size="icon">
                <Pencil size={14} />
                <span className="sr-only">Edit job</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() => deleteJob(job._id)}
              >
                <Trash size={14} />
                <span className="sr-only">Delete job</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJob;