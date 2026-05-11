"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import { Pencil, Trash } from "lucide-react";

import { Job } from "@/types/types";

import { useJobsContext } from "@/context/jobsContext";
import { useGlobalContext } from "@/context/globalContext";

import { CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

import { formatDates } from "@/utils/fotmatDates";

import { bookmark, bookmarkEmpty } from "@/utils/Icons";

import { supabase } from "@/lib/supabase";

interface JobProps {
  job: Job;
}

function MyJob({ job }: JobProps) {
  const router = useRouter();

  const { deleteJob, likeJob } = useJobsContext();

  const {
    userProfile,
    isAuthenticated,
    getUserProfile,
  } = useGlobalContext();

  const [isLiked, setIsLiked] = useState(false);

  const [loadingLike, setLoadingLike] =
    useState(false);

  const userId = userProfile?._id;

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL ||
    "https://qvonxpert.com";

  /**
   * SAFE FETCH PROFILE
   * DOES NOT INTERFERE WITH CURRENT DATABASE
   */
  useEffect(() => {
    if (
      isAuthenticated &&
      job?.createdBy?._id
    ) {
      getUserProfile(job.createdBy._id);
    }
  }, [
    isAuthenticated,
    job?.createdBy?._id,
    getUserProfile,
  ]);

  /**
   * CHECK LIKE STATUS FROM SUPABASE
   * DOES NOT TOUCH MONGODB
   */
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userId || !job?._id) return;

      try {
        const { data, error } = await supabase
          .from("job_likes")
          .select("id")
          .eq("job_id", job._id)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error(
            "Supabase fetch like error:",
            error
          );

          return;
        }

        setIsLiked(!!data);
      } catch (error) {
        console.error(
          "Like status error:",
          error
        );
      }
    };

    fetchLikeStatus();
  }, [job?._id, userId]);

  /**
   * HANDLE LIKE / UNLIKE
   * SUPABASE + EXISTING DATABASE
   */
  const handleLike = async (jobId: string) => {
    if (!userId || loadingLike) return;

    try {
      setLoadingLike(true);

      if (isLiked) {
        /**
         * REMOVE LIKE FROM SUPABASE
         */
        const { error } = await supabase
          .from("job_likes")
          .delete()
          .eq("job_id", jobId)
          .eq("user_id", userId);

        if (error) {
          console.error(
            "Supabase unlike error:",
            error
          );

          return;
        }

        setIsLiked(false);
      } else {
        /**
         * ADD LIKE TO SUPABASE
         */
        const { error } = await supabase
          .from("job_likes")
          .insert([
            {
              job_id: jobId,
              user_id: userId,
            },
          ]);

        if (error) {
          console.error(
            "Supabase like error:",
            error
          );

          return;
        }

        setIsLiked(true);
      }

      /**
       * KEEP EXISTING MONGODB FUNCTIONALITY
       */
      likeJob(jobId);
    } catch (error) {
      console.error(
        "Handle like error:",
        error
      );
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl flex flex-col gap-5 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div
          className="flex items-center space-x-4 mb-2 cursor-pointer group"
          onClick={() =>
            router.push(`/job/${job._id}`)
          }
        >
          {/* PROFILE IMAGE */}
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            <Image
              alt="logo"
              src={
                job.createdBy?.profilePicture ||
                "/user.png"
              }
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>

          {/* TITLE + COMPANY */}
          <div>
            <CardTitle className="text-xl font-bold truncate group-hover:underline">
              {job.title}
            </CardTitle>

            <p className="text-sm text-muted-foreground">
              {job.createdBy?.name ||
                "Unknown"}
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <button
          type="button"
          disabled={loadingLike}
          className={`text-2xl transition-all duration-200 ${
            isLiked
              ? "text-[#7263f3]"
              : "text-gray-400 hover:text-[#7263f3]"
          } ${
            loadingLike
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={() => {
            if (!isAuthenticated) {
              router.push(
                `${baseUrl}/login`
              );

              return;
            }

            handleLike(job._id);
          }}
        >
          {isLiked
            ? bookmark
            : bookmarkEmpty}
        </button>
      </div>

      {/* META */}
      <div>
        {/* LOCATION */}
        <p className="text-sm text-muted-foreground mb-2">
          {job.location}
        </p>

        {/* DATE */}
        <p className="text-sm text-muted-foreground mb-4">
          Posted{" "}
          {formatDates(job.createdAt)}
        </p>

        <div className="flex justify-between gap-6 flex-wrap">
          {/* SKILLS + TAGS */}
          <div className="flex-1">
            {/* SKILLS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills?.map(
                (skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                  >
                    {skill}
                  </Badge>
                )
              )}
            </div>

            {/* TAGS */}
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags?.map(
                (tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                  >
                    {tag}
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* EDIT / DELETE */}
          {job.createdBy?._id ===
            userId && (
            <div className="self-end flex items-center gap-2">
              {/* EDIT */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(
                    `/edit-job/${job._id}`
                  )
                }
              >
                <Pencil size={14} />

                <span className="sr-only">
                  Edit job
                </span>
              </Button>

              {/* DELETE */}
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500 hover:text-red-500"
                onClick={() =>
                  deleteJob(job._id)
                }
              >
                <Trash size={14} />

                <span className="sr-only">
                  Delete job
                </span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJob;