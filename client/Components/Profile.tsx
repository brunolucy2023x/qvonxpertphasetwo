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
import { supabase } from "@/lib/supabase";

function Profile() {
  const { userProfile, setUserProfile } = useGlobalContext();
  const router = useRouter();

  const {
    profilePicture,
    name = "User",
    profession = "Member",
    email = "",
  } = userProfile || {};

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_BASE_URL || "http://localhost:3000";

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Logout error:", error);

      // Clear global context
      setUserProfile(null);

      // Redirect to home
      router.push("/");
    } catch (err) {
      console.error("Unexpected logout error:", err);
    }
  };

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

        {/* LOGOUT */}
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;