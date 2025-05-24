"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/actions/auth.action";

export default function UserProfileMenu({ user }: { user: { name: string; email: string } }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
    router.push("/sign-in");
  };

  return (
    <div className="relative group">
      <button className="cursor-pointer flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800 hover:bg-gray-700 border border-gray-700 focus:outline-none">
        <Image src="/user-avatar.png" alt="profile" width={32} height={32} className="rounded-full" />
        <span className="text-white font-medium">{user.name}</span>
      </button>
      <div className="absolute right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 min-w-max max-w-xs overflow-hidden">
        <button
          className="cursor-pointer w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-800 rounded-lg"
          onClick={handleLogout}
          disabled={loading}
        >
          {loading ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
