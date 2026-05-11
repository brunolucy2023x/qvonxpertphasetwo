"use client";

import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

import { Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { Badge } from "@/Components/ui/badge";

function Profile() {
  const { userProfile } = useGlobalContext();
  const router = useRouter();

  // ✅ SAFE DESTRUCTURING (prevents crashes when Supabase loads async user)
  const {
    profilePicture,
    name = "User",
    profession = "Member",
    email = "",
  } = userProfile || {};

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL || "https://qvonxpert.com";

  return (
    <DropdownMenu>
      {/* TRIGGER */}
      <div className="flex items-center gap-4">
        <Badge>{profession}</Badge>

        <DropdownMenuTrigger asChild className="cursor-pointer">
          <Image
            src={profilePicture || "/user.png"}
            alt="avatar"
            width={36}
            height={36}
            className="rounded-lg object-cover"
          />
        </DropdownMenuTrigger>
      </div>

      {/* MENU */}
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email || "No email"}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* SETTINGS */}
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>

        {/* LOGOUT (SUPABASE READY HOOK POINT) */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            // 👉 SUPABASE FUTURE INTEGRATION POINT
            // supabase.auth.signOut()

            window.location.href = `${baseUrl}/logout`;
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;