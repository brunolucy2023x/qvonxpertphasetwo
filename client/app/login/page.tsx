// Server Component
import dynamic from "next/dynamic";

// Dynamically import client-only component (no SSR)
const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function Page() {
  return <LoginClient />;
}