import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

const Feedback = async ({ params }: RouteParams) => {
  const { id } = await params;
  const user = await getCurrentUser();
  
  if (!user || !user.id) {
    redirect("/sign-in");
  }

  const interview = await getInterviewById(id);
  if (!interview) {
    redirect("/");
  }

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user.id,
  });

  if (!feedback) {
    redirect(`/interview/${id}`);
  }

  return (
    <section className="section-feedback max-w-3xl mx-auto bg-gradient-to-br from-[#151826] to-[#1a1d2b] rounded-3xl shadow-2xl p-0 md:p-0 border border-blue-950 mt-16 mb-16 animate-fade-in overflow-hidden">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-blue-950/90 to-blue-800/80 px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-blue-900">
        <div className="flex flex-col gap-2 md:gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-100 tracking-tight drop-shadow">
            <span className="text-blue-300 capitalize">{interview.role}</span> Interview Feedback
          </h1>
          <p className="text-base text-gray-400">{dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")}</p>
        </div>
        <div className="flex flex-col items-center bg-gradient-to-br from-blue-800/80 to-blue-600/80 rounded-full p-3 shadow-lg">
          <Image src="/star.svg" width={48} height={48} alt="star" />
          <span className="text-2xl font-bold text-blue-200 mt-1">{feedback.totalScore}/100</span>
          <span className="text-xs text-gray-300">Overall</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-8 px-8 py-10">
        {/* Final Assessment */}
        <div className="bg-[#181b28]/90 rounded-2xl p-6 shadow border border-blue-950 flex flex-col md:flex-row gap-6 items-start">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-blue-200 mb-2 flex items-center gap-2">
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#60a5fa" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Final Assessment
            </h2>
            <p className="text-gray-200 text-base leading-relaxed">{feedback.finalAssessment}</p>
          </div>
        </div>

        {/* Interview Breakdown */}
        <div className="bg-[#181b28]/90 rounded-2xl p-6 shadow border border-blue-950">
          <h2 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path stroke="#60a5fa" strokeWidth="2" d="M4 12h16"/></svg>
            Interview Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feedback.categoryScores.map((category, index) => (
              <div key={index} className="flex flex-col gap-1 bg-gray-900/70 rounded-xl p-4 border border-blue-900">
                <span className="font-semibold text-gray-100">
                  {index + 1}. {category.name}
                </span>
                <span className="text-blue-200 font-bold">{category.score}/100</span>
                <span className="text-gray-400 text-sm">{category.comment}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Areas for Improvement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-green-950/80 to-green-800/80 rounded-2xl p-6 shadow border border-green-950 flex flex-col">
            <h3 className="text-lg font-bold text-green-200 mb-2 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#22c55e" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              Strengths
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="ml-2">{strength}</li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-red-950/80 to-red-800/80 rounded-2xl p-6 shadow border border-red-950 flex flex-col">
            <h3 className="text-lg font-bold text-red-200 mb-2 flex items-center gap-2">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="#ef4444" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              Areas for Improvement
            </h3>
            <ul className="list-disc list-inside text-gray-200">
              {feedback.areasForImprovement.map((area, index) => (
                <li key={index} className="ml-2">{area}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 mt-8 bg-gray-900/70 p-6 rounded-xl shadow-lg border border-blue-900">
          <Button className="btn-secondary flex-1">
            <Link href="/" className="flex w-full justify-center">
              <p className="text-sm font-semibold text-blue-200 text-center">
                Back to dashboard
              </p>
            </Link>
          </Button>

          <Button className="btn-primary flex-1">
            <Link
              href={`/interview/${id}`}
              className="flex w-full justify-center"
            >
              <p className="text-sm font-semibold text-black text-center">
                Retake Interview
              </p>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Feedback;
