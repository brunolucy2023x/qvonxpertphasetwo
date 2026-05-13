import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Hard fail early (only if Netlify forgot env vars)
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase env vars in Netlify dashboard");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);