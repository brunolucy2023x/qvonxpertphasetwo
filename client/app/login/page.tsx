'use client';

import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
      <div className="shadow-xl rounded-2xl bg-white p-6">
        <SignIn path="/login" routing="path" />
      </div>
    </div>
  );
}