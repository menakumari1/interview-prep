import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated, getCurrentUser } from "@/lib/actions/auth.action";
import UserProfileMenu from "@/components/UserProfileMenu";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");
  const user = await getCurrentUser();

  return (
    <div className="container mx-auto flex min-h-screen flex-col">
      <nav className="container fixed top-0 z-50 w-full border-b border-border/40 bg-background px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span className="inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 via-blue-400 to-cyan-400 p-[2px] shadow-lg">
            <Image src="/kawaai_robot.png" width={40} height={40} alt="PrepIQ Logo" className="rounded-full bg-white/90 shadow-md" />
          </span>
          <span className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-200 bg-clip-text text-transparent drop-shadow group-hover:scale-105 transition-transform">PrepIQ</span>
        </Link>
        {user && <UserProfileMenu user={user} />}
      </nav>

      <main className="mt-[60px] flex-1 px-4">{children}</main>
    </div>
  );
};

export default Layout;
