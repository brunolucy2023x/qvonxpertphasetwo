"use client";

import dynamic from "next/dynamic";

// Dynamically import the client-side login component (no SSR)
const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function Page() {
  return <LoginClient />;
}