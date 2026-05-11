"use client";
import { supabase } from "../../lib/supabase";

export default function TestJobs() {
  const fetchJobs = async () => {
    const { data, error } = await supabase
      .from("jobs")
      .select("*");

    console.log("DATA:", data);
    console.log("ERROR:", error);
  };

  return (
    <div className="p-10">
      <button
        onClick={fetchJobs}
        className="bg-purple-600 text-white px-6 py-3 rounded-lg"
      >
        Fetch Jobs
      </button>
    </div>
  );
}