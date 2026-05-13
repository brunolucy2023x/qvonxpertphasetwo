import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate only in runtime-safe way (NO build crash)
if (!supabaseUrl || !supabaseUrl.startsWith("http")) {
  console.warn("Missing or invalid NEXT_PUBLIC_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  console.warn("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Create client ONLY if values exist
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;