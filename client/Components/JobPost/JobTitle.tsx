"use client";

import React, { useEffect, useState } from "react";

import { useGlobalContext } from "@/context/globalContext";

import { Separator } from "@/Components/ui/separator";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";

import { supabase } from "@/lib/supabase";

/* =========================
   TYPES
========================= */
interface EmploymentTypeProps {
  "Full Time": boolean;
  "Part Time": boolean;
  Contract: boolean;
  Internship: boolean;
  Temporary: boolean;
}

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

/* =========================
   COMPONENT
========================= */
function JobTitle() {
  const {
    handleTitleChange,
    jobTitle,
    setActiveEmploymentTypes,
    userProfile,
  } = useGlobalContext();

  const [loading, setLoading] = useState(false);

  const [employmentTypes, setEmploymentTypes] =
    useState<EmploymentTypeProps>({
      "Full Time": false,
      "Part Time": false,
      Contract: false,
      Internship: false,
      Temporary: false,
    });

  const debouncedTitle = useDebounce(jobTitle, 500);
  const debouncedTypes = useDebounce(employmentTypes, 500);

  /* =========================
     TOGGLE TYPE
  ========================= */
  const handleEmploymentTypeChange = (type: keyof EmploymentTypeProps) => {
    setEmploymentTypes((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  /* =========================
     RESTORE FROM SUPABASE
  ========================= */
  useEffect(() => {
    const fetchDraft = async () => {
      if (!userProfile?._id) return;

      setLoading(true);

      const { data, error } = await supabase
        .from("job_drafts")
        .select("*")
        .eq("user_id", userProfile._id)
        .maybeSingle();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      if (data) {
        handleTitleChange({
          target: { value: data.title || "" },
        } as React.ChangeEvent<HTMLInputElement>);

        const restored: EmploymentTypeProps = {
          "Full Time": false,
          "Part Time": false,
          Contract: false,
          Internship: false,
          Temporary: false,
        };

        (data.employment_types || []).forEach((t: string) => {
          if (t in restored) {
            restored[t as keyof EmploymentTypeProps] = true;
          }
        });

        setEmploymentTypes(restored);
      }

      setLoading(false);
    };

    fetchDraft();
  }, [userProfile?._id]);

  /* =========================
     PUSH TO CONTEXT
  ========================= */
  useEffect(() => {
    const selected = Object.keys(employmentTypes).filter(
      (type) => employmentTypes[type as keyof EmploymentTypeProps]
    );

    setActiveEmploymentTypes(selected);
  }, [employmentTypes]);

  /* =========================
     SAVE TO SUPABASE (DEBOUNCED)
  ========================= */
  useEffect(() => {
    const save = async () => {
      if (!userProfile?._id) return;

      const selectedTypes = Object.keys(employmentTypes).filter(
        (type) => employmentTypes[type as keyof EmploymentTypeProps]
      );

      const { error } = await supabase.from("job_drafts").upsert(
        [
          {
            user_id: userProfile._id,
            title: debouncedTitle || "",
            employment_types: selectedTypes,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id" }
      );

      if (error) console.error(error);
    };

    save();
  }, [debouncedTitle, debouncedTypes, userProfile?._id]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="p-6 flex flex-col gap-6 bg-background border border-border rounded-lg">
      {loading && (
        <p className="text-sm text-gray-500">
          Loading saved job data...
        </p>
      )}

      {/* TITLE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Job Title</h3>
          <Label className="text-sm text-muted-foreground mt-2 block">
            A job title is a specific designation.
          </Label>
        </div>

        <Input
          value={jobTitle || ""}
          onChange={handleTitleChange}
          placeholder="Enter Job Title"
        />
      </div>

      <Separator />

      {/* EMPLOYMENT TYPES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold">Employment Type</h3>
          <Label className="text-sm text-muted-foreground mt-2 block">
            Select job type
          </Label>
        </div>

        <div className="flex flex-col gap-2">
          {Object.entries(employmentTypes).map(([type, checked]) => (
            <div
              key={type}
              className="flex items-center gap-2 border rounded-md p-2"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() =>
                  handleEmploymentTypeChange(type as keyof EmploymentTypeProps)
                }
              />
              <Label>{type}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default JobTitle;