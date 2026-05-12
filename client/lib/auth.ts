import { supabase } from "./supabaseClient";
import bcrypt from "bcryptjs";

// ================== SIGNUP ==================
export async function signupUser(full_name: string, email: string, password: string) {
  // Hash the password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  const { data, error } = await supabase
    .from("users")
    .insert({ full_name, email, password_hash })
    .select()
    .single();

  if (error) throw error;

  return data;
}

// ================== LOGIN ==================
export async function loginUser(email: string, password: string) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error) throw new Error("Invalid email or password");

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error("Invalid email or password");

  return user;
}

// ================== FORGOT PASSWORD ==================
export async function createPasswordReset(email: string) {
  // Get user
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (!user) throw new Error("Email not found");

  // Create a token
  const token = crypto.randomUUID();
  const expires_at = new Date(Date.now() + 3600 * 1000); // 1 hour

  await supabase
    .from("password_reset_tokens")
    .insert({ user_id: user.id, token, expires_at });

  // Here you would send the token via email
  // e.g., using SendGrid, Nodemailer, or Supabase Functions
  console.log("Password reset link: ", `https://yourdomain.com/reset-password?token=${token}`);
  return token;
}

// ================== RESET PASSWORD ==================
export async function resetPassword(token: string, newPassword: string) {
  // Check token
  const { data: resetRecord, error } = await supabase
    .from("password_reset_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !resetRecord) throw new Error("Invalid or expired token");
  if (new Date(resetRecord.expires_at) < new Date()) throw new Error("Token expired");

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 10);

  // Update user
  await supabase
    .from("users")
    .update({ password_hash })
    .eq("id", resetRecord.user_id);

  // Delete token after use
  await supabase
    .from("password_reset_tokens")
    .delete()
    .eq("id", resetRecord.id);

  return true;
}