"use client";

import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

import { Button } from "./ui/button";
import Loader from "./ui/loader";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getInitialsFromRole } from "@/lib/utils";

interface InterviewCardProps {
  interviewId: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string | number;
  feedback?: {
    totalScore?: number;
    finalAssessment?: string;
    createdAt?: string | number;
  };
}

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  feedback,
}: InterviewCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  const handleClick = () => {
    setIsLoading(true);
  };

  // Reset loading state when component unmounts
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, []);

  // Reset loading state when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  const initials = getInitialsFromRole(role);

  return (
    <div className="w-[360px] max-sm:w-full min-h-96 bg-gradient-to-br from-[#181c24] to-[#232a36] border border-[#232a36] shadow-2xl hover:shadow-blue-900/40 transition-transform duration-200 hover:scale-[1.025] rounded-2xl mt-6">
      <div className="p-0 flex flex-col h-full overflow-hidden rounded-2xl">
        {/* Top section with badge */}
        <div className="relative flex flex-col items-center bg-[#232a36] pb-4 pt-6 px-6 rounded-t-2xl">
          <div
            className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-blue-700 to-blue-500 text-white text-xs font-bold tracking-widest shadow z-20 border-b border-l border-blue-800 rounded-bl-lg rounded-tr-2xl"
          >
            <span>{normalizedType}</span>
          </div>
          <div className="flex items-center justify-center bg-gradient-to-br from-[#232a36] to-[#181c24] border-4 border-blue-700 size-[90px] text-3xl font-extrabold text-blue-300 shadow-lg mt-2 rounded-full">
            {initials}
          </div>
          <h3 className="mt-4 text-xl font-bold text-white text-center capitalize tracking-tight">{role} Interview</h3>
        </div>

        {/* Details section */}
        <div className="flex flex-col flex-1 justify-between px-6 pt-4 pb-6 bg-[#181c24] rounded-b-2xl">
          <div className="flex flex-row gap-6 justify-center mb-2">
            <div className="flex flex-row gap-2 items-center text-gray-400">
              <Image src="/calendar.svg" width={20} height={20} alt="calendar" />
              <span className="text-sm">{formattedDate}</span>
            </div>
            <div className="flex flex-row gap-2 items-center text-yellow-400">
              <Image src="/star.svg" width={20} height={20} alt="star" />
              <span className="text-sm font-semibold">{feedback?.totalScore || "---"}/100</span>
            </div>
          </div>
          <p className="line-clamp-2 mt-2 text-gray-300 text-center text-base min-h-[48px]">
            {feedback?.finalAssessment || "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
          <div className="flex flex-row justify-between items-end mt-8">
            <DisplayTechIcons techStack={techstack} />
            <Link
              href={feedback ? `/interview/${interviewId}/feedback` : `/interview/${interviewId}`}
              onClick={handleClick}
              className="no-underline"
            >
              <Button
                className="bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white font-semibold px-5 py-2 shadow-lg transition-all duration-200 min-w-[120px] border-none rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader size="small" />
                    <span>{feedback ? "Loading Feedback..." : "Loading Interview..."}</span>
                  </div>
                ) : (
                  <span>{feedback ? "Check Feedback" : "View Interview"}</span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
