"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

import { useGlobalContext } from "@/context/globalContext";

import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

import { supabase } from "@/lib/supabase";

/* =========================
   DEBOUNCE HOOK
========================= */
function useDebounce(value: any, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

function JobSkills() {
  const { skills, setSkills, tags, setTags, userProfile } =
    useGlobalContext();

  const [newSkill, setNewSkill] = useState("");
  const [newTag, setNewTag] = useState("");
  const [loading, setLoading] = useState(false);

  const debouncedSkills = useDebounce(skills, 500);
  const debouncedTags = useDebounce(tags, 500);

  /* =========================
     LOAD FROM SUPABASE
  ========================= */
  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile?._id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("user_job_preferences")
        .select("*")
        .eq("user_id", userProfile._id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        setSkills(data.skills || []);
        setTags(data.tags || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [userProfile?._id]);

  /* =========================
     SAVE (DEBOUNCED)
  ========================= */
  useEffect(() => {
    const save = async () => {
      if (!userProfile?._id) return;

      const { error } = await supabase
        .from("user_job_preferences")
        .upsert(
          [
            {
              user_id: userProfile._id,
              skills: debouncedSkills || [],
              tags: debouncedTags || [],
              updated_at: new Date().toISOString(),
            },
          ],
          { onConflict: "user_id" }
        );

      if (error) console.error(error);
    };

    save();
  }, [debouncedSkills, debouncedTags, userProfile?._id]);

  /* =========================
     SKILL HANDLERS
  ========================= */
  const addSkill = () => {
    const value = newSkill.trim();
    if (!value || skills.includes(value)) return;

    setSkills([...skills, value]);
    setNewSkill("");
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s: string) => s !== skill));
  };

  /* =========================
     TAG HANDLERS
  ========================= */
  const addTag = () => {
    const value = newTag.trim();
    if (!value || tags.includes(value)) return;

    setTags([...tags, value]);
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t: string) => t !== tag));
  };

  return (
    <div className="p-6 flex flex-col gap-6 bg-background border border-border rounded-lg">
      {loading && (
        <div className="text-sm text-gray-500">
          Loading skills and tags...
        </div>
      )}

      {/* ================= SKILLS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Skills</h3>
          <Label className="text-sm text-muted-foreground mt-2 block">
            Add relevant skills
          </Label>
        </div>

        <div>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Enter skill"
            />
            <Button onClick={addSkill}>Add</Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {skills.map((skill: string, i: number) => (
              <div
                key={i}
                className="px-3 py-1 rounded-full bg-primary text-white flex items-center gap-2"
              >
                {skill}
                <X size={14} onClick={() => removeSkill(skill)} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      {/* ================= TAGS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Tags</h3>
          <Label className="text-sm text-muted-foreground mt-2 block">
            Add relevant tags
          </Label>
        </div>

        <div>
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag"
            />
            <Button onClick={addTag}>Add</Button>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map((tag: string, i: number) => (
              <div
                key={i}
                className="px-3 py-1 rounded-full bg-secondary flex items-center gap-2"
              >
                {tag}
                <X size={14} onClick={() => removeTag(tag)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobSkills;