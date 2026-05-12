"use client";

import React, { useEffect, useState } from "react";

import { useGlobalContext } from "@/context/globalContext";

import { Label } from "../ui/label";
import { Input } from "../ui/input";

import { supabase } from "@/lib/supabase";

/* =========================
   SIMPLE DEBOUNCE HOOK
========================= */
function useDebounce(value: any, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/* =========================
   COMPONENT
========================= */
function JobLocation() {
  const { setLocation, location, userProfile } = useGlobalContext();

  const [loadingLocation, setLoadingLocation] = useState(false);

  /**
   * LOCAL INPUT CHANGE
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setLocation((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * DEBOUNCED LOCATION (PREVENT SPAM SAVE)
   */
  const debouncedLocation = useDebounce(location, 500);

  /**
   * LOAD SAVED LOCATION
   */
  useEffect(() => {
    const fetchLocation = async () => {
      if (!userProfile?._id) return;

      try {
        setLoadingLocation(true);

        const { data, error } = await supabase
          .from("user_locations")
          .select("*")
          .eq("user_id", userProfile._id)
          .maybeSingle();

        if (error) {
          console.error("Fetch error:", error);
          return;
        }

        if (data) {
          setLocation({
            country: data.country || "",
            city: data.city || "",
            address: data.address || "",
          });
        }
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchLocation();
  }, [userProfile?._id]);

  /**
   * SAVE TO SUPABASE (DEBOUNCED)
   */
  useEffect(() => {
    const save = async () => {
      if (!userProfile?._id) return;

      if (!debouncedLocation) return;

      try {
        const { error } = await supabase.from("user_locations").upsert(
          [
            {
              user_id: userProfile._id,
              country: debouncedLocation?.country || "",
              city: debouncedLocation?.city || "",
              address: debouncedLocation?.address || "",
              updated_at: new Date().toISOString(),
            },
          ],
          {
            onConflict: "user_id",
          }
        );

        if (error) {
          console.error("Save error:", error);
        }
      } catch (err) {
        console.error("Unexpected save error:", err);
      }
    };

    save();
  }, [debouncedLocation, userProfile?._id]);

  return (
    <div className="p-6 flex flex-col gap-6 bg-background border border-border rounded-lg">
      {/* HEADER */}
      <div>
        <h3 className="text-lg font-semibold">Job Location</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add the location where the job will be performed.
        </p>
      </div>

      {loadingLocation && (
        <div className="text-sm text-gray-500">
          Loading saved location...
        </div>
      )}

      {/* COUNTRY + CITY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Country</Label>
          <Input
            name="country"
            value={location?.country || ""}
            onChange={handleChange}
            placeholder="Enter Country"
          />
        </div>

        <div>
          <Label>City</Label>
          <Input
            name="city"
            value={location?.city || ""}
            onChange={handleChange}
            placeholder="Enter City"
          />
        </div>
      </div>

      {/* ADDRESS */}
      <div>
        <Label>Address</Label>
        <Input
          name="address"
          value={location?.address || ""}
          onChange={handleChange}
          placeholder="Enter Address"
        />
      </div>
    </div>
  );
}

export default JobLocation;