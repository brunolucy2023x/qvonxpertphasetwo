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
  const { userProfile, isAuthenticated, getUserProfile } = useGlobalContext();

  const [isLiked, setIsLiked] = useState(false);
  const [loadingLike, setLoadingLike] = useState(false);

  const userId = userProfile?._id;

  // Fetch creator profile if needed
  useEffect(() => {
    if (isAuthenticated && job?.createdBy?._id) {
      getUserProfile(job.createdBy._id);
    }
  }, [isAuthenticated, job?.createdBy?._id, getUserProfile]);

  // Check if current user liked this job
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!userId || !job?._id) return;

      const { data, error } = await supabase
        .from("job_likes")
        .select("id")
        .eq("job_id", job._id)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching like status:", error.message);
        return;
      }

      setIsLiked(!!data);
    };

    fetchLikeStatus();
  }, [job?._id, userId]);

  // Handle like / unlike
  const handleLike = async () => {
    if (!userId || loadingLike) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    try {
      setLoadingLike(true);

      if (isLiked) {
        const { error } = await supabase
          .from("job_likes")
          .delete()
          .eq("job_id", job._id)
          .eq("user_id", userId);

        if (error) throw error;
        setIsLiked(false);
      } else {
        const { error } = await supabase
          .from("job_likes")
          .insert([{ job_id: job._id, user_id: userId }]);

        if (error) throw error;
        setIsLiked(true);
      }

      likeJob(job._id);
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoadingLike(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl flex flex-col gap-4 shadow-sm">
      {/* HEADER */}
      <div className="flex justify-between items-start gap-4">
        <div
          className="flex items-center space-x-4 cursor-pointer group"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
            <Image
              alt="logo"
              src={job.createdBy?.profilePicture || "/user.png"}
              width={48}
              height={48}
              className="rounded-full object-cover"
            />
          </div>

          <div>
            <CardTitle className="text-xl font-bold group-hover:underline">
              {job.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {job.createdBy?.name || "Unknown"}
            </p>
          </div>
        </div>

        {/* LIKE BUTTON */}
        <button
          disabled={loadingLike}
          onClick={handleLike}
          className={`text-2xl transition ${
            isLiked ? "text-[#7263f3]" : "text-gray-400"
          }`}
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      {/* META */}
      <p className="text-sm text-muted-foreground">{job.location}</p>
      <p className="text-sm text-muted-foreground">
        Posted {formatDates(job.createdAt)}
      </p>

      {/* SKILLS */}
      <div className="flex flex-wrap gap-2">
        {job.skills?.map((skill, i) => (
          <Badge key={i} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2">
        {job.tags?.map((tag, i) => (
          <Badge key={i} variant="outline">
            {tag}
          </Badge>
        ))}
      </div>

      {/* OWNER ACTIONS */}
      {job.createdBy?._id === userId && (
        <div className="flex gap-2 mt-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/edit-job/${job._id}`)}
          >
            <Pencil size={14} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteJob(job._id)}
          >
            <Trash size={14} />
          </Button>
        </div>
      )}
    </div>
  );
}

export default MyJob;