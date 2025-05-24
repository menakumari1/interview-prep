import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/general.action";

async function Home() {
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl text-white font-bold mb-4">
          You must be signed in to view your interviews.
        </h2>
        <Link href="/sign-in" className="text-blue-400 underline">
          Go to Sign In
        </Link>
      </div>
    );
  }

  const [userInterviews, allInterview] = await Promise.all([
    getInterviewsByUserId(user.id),
    getLatestInterviews({ userId: user.id }),
  ]);

  const hasPastInterviews = userInterviews?.length! > 0;
  const hasUpcomingInterviews = allInterview?.length! > 0;

  return (
    <>
      {/* Hero Section */}
      <section className="mt-12 card-cta flex flex-col-reverse md:flex-row items-center justify-between gap-10 bg-gradient-to-br from-gray-950 to-gray-800 rounded-2xl shadow-2xl p-12 mb-16 border border-gray-800">
        <div className="flex flex-col gap-7 max-w-lg">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight drop-shadow tracking-tight">
            Get Interview-Ready with{" "}
            <span className="text-blue-400">AI-Powered</span> Practice & Feedback
          </h2>
          <p className="text-lg text-gray-300 font-medium">
            Practice real interview questions & get instant feedback
          </p>
          <Button asChild className="w-full md:w-fit text-lg font-bold py-6 px-10 rounded-xl shadow bg-blue-600 hover:bg-blue-500 text-white transition-all duration-200">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <div className="flex justify-center items-center w-full md:w-auto">
          <Image
            src="/robot1.png"
            alt="robo-dude"
            width={340}
            height={340}
            className="max-sm:hidden rounded-2xl border-2 border-blue-900 shadow-2xl bg-gray-900 object-cover"
          />
        </div>
      </section>

      {/* Past Interviews Section */}
      <section className="flex flex-col gap-8 mt-12">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Your Interviews
        </h2>
        <div className="interviews-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-center">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedback={interview.feedback}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-10">
              <Image
                src="/ai-avatar.png"
                alt="No interviews"
                width={80}
                height={80}
                className="mb-4 grayscale opacity-60"
              />
              <p className="text-gray-500 text-lg font-medium">
                You haven&apos;t taken any interviews yet
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Interviews Section */}
      <section className="flex flex-col gap-8 mt-16 mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
          Take Interviews
        </h2>
        <div className="interviews-section grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-center">
          {hasUpcomingInterviews ? (
            allInterview?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
              />
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center py-10">
              <Image
                src="/ai-avatar.png"
                alt="No interviews"
                width={80}
                height={80}
                className="mb-4 grayscale opacity-60"
              />
              <p className="text-gray-500 text-lg font-medium">
                There are no interviews available
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default Home;
