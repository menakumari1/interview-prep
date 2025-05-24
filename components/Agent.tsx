"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn, getInitialsFromRole } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/actions/general.action";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface InterviewDetails {
  role: string;
  level: string;
  type: string;
  techstack: string[];
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [interviewDetails, setInterviewDetails] = useState<InterviewDetails>({
    role: "",
    level: "",
    type: "Technical",
    techstack: [],
  });
  const [showForm, setShowForm] = useState(type === "generate");

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript") {
        // Show text immediately for AI messages
        if (message.role === "assistant") {
          const newMessage = { role: message.role, content: message.transcript };
          setMessages((prev) => [...prev, newMessage]);
          setLastMessage(message.transcript);
        }
        // Only add user messages when they are final
        else if (message.transcriptType === "final" && message.role === "user") {
          const newMessage = { role: message.role, content: message.transcript };
          setMessages((prev) => [...prev, newMessage]);
          setLastMessage(message.transcript);
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      console.error("Error:", error);
      toast.error("An error occurred during the interview");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      setIsProcessing(true);
      try {
        if (!interviewId || !userId) {
          toast.error("Missing required interview or user information");
          router.push("/");
          return;
        }

        const { success, feedbackId: id } = await createFeedback({
          interviewId,
          userId,
          transcript: messages,
          feedbackId,
        });

        if (success && id) {
          router.push(`/interview/${interviewId}/feedback`);
        } else {
          toast.error("Failed to save feedback");
          router.push("/");
        }
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast.error("Failed to generate feedback. Please try again.");
        router.push("/");
      } finally {
        setIsProcessing(false);
      }
    };

    if (callStatus === CallStatus.FINISHED && type === "interview") {
      handleGenerateFeedback(messages);
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form fields
    if (!interviewDetails.role.trim()) {
      toast.error("Please enter a role");
      return;
    }
    if (!interviewDetails.level) {
      toast.error("Please select a level");
      return;
    }
    if (!interviewDetails.techstack.length) {
      toast.error("Please enter at least one technology");
      return;
    }

    setIsProcessing(true);
    try {
      // First generate the interview questions
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: interviewDetails.type,
          role: interviewDetails.role,
          level: interviewDetails.level,
          techstack: interviewDetails.techstack.join(","),
          amount: 5,
          userid: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(
          data.error || 
          data.details || 
          "Failed to generate interview. Please try again."
        );
      }

      if (!data.success || !data.interviewId) {
        console.error("Invalid response:", data);
        throw new Error("Failed to get interview ID");
      }

      // Redirect to the interview page with the generated questions
      router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      console.error("Error generating interview:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to generate interview. Please try again."
      );
      setIsProcessing(false);
    }
  };

  const handleCall = async () => {
    if (callStatus !== CallStatus.INACTIVE) return;
    setCallStatus(CallStatus.CONNECTING);

    let formattedQuestions = "";
    if (questions && questions.length > 0) {
      formattedQuestions = questions
        .map((question, index) => `${index + 1}. ${question}`)
        .join("\n");
    } else {
      toast.error("No questions available for the interview");
      setCallStatus(CallStatus.INACTIVE);
      return;
    }

    try {
      // Create a copy of the interviewer object to ensure it's properly structured
      const assistant = {
        ...interviewer,
        name: interviewer.name || "Interviewer",
      };

      // Add error recovery attempts
      let retryCount = 0;
      const maxRetries = 3;

      const startInterview = async () => {
        try {
          await vapi.start(assistant, {
            variableValues: {
              questions: formattedQuestions,
              username: userName || "Candidate",
              userid: userId || "",
            },
          });
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          
          if (retryCount < maxRetries) {
            retryCount++;
            toast.info(`Reconnecting... Attempt ${retryCount} of ${maxRetries}`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s between retries
            return startInterview();
          }
          throw error;
        }
      };

      await startInterview();
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start the interview. Please try again.");
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    if (callStatus !== CallStatus.ACTIVE) return;
    
    try {
      setCallStatus(CallStatus.FINISHED);
      await vapi.stop();
    } catch (error) {
      console.error("Error stopping call:", error);
      toast.error("Error ending interview. Your feedback may still be processed.");
    }
  };

  // Single line caption for current message
  const Caption = () => (
    <div className="w-full max-w-3xl mx-auto mt-4 h-[80px] flex items-center justify-center">
      {lastMessage && (
        <div className="bg-dark-300 p-4 rounded-lg text-center w-full">
          <p className="text-primary-100 text-lg line-clamp-2">{lastMessage}</p>
        </div>
      )}
    </div>
  );

  if (showForm) {
    return (
      <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-blue-300 tracking-tight drop-shadow">Interview Generator</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-md p-10 bg-gradient-to-br from-[#181C2A] to-[#232946] rounded-2xl shadow-2xl border border-blue-900">
          <div>
            <label htmlFor="role" className="block text-sm font-semibold mb-2 text-blue-200">Role</label>
            <input
              type="text"
              id="role"
              value={interviewDetails.role}
              onChange={(e) => setInterviewDetails(prev => ({ ...prev, role: e.target.value }))}
              className="w-full p-3 rounded-lg border border-blue-900 bg-[#181C2A] text-blue-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., Frontend Developer"
              required
              disabled={callStatus !== CallStatus.INACTIVE || isProcessing}
            />
          </div>

          <div>
            <label htmlFor="level" className="block text-sm font-semibold mb-2 text-blue-200">Level</label>
            <select
              id="level"
              value={interviewDetails.level}
              onChange={(e) => setInterviewDetails(prev => ({ ...prev, level: e.target.value }))}
              className="w-full p-3 rounded-lg border border-blue-900 bg-[#181C2A] text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={callStatus !== CallStatus.INACTIVE || isProcessing}
            >
              <option value="" className="text-gray-400">Select level</option>
              <option value="Junior">Junior</option>
              <option value="Mid-Level">Mid-Level</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          <div>
            <label htmlFor="techstack" className="block text-sm font-semibold mb-2 text-blue-200">Tech Stack</label>
            <input
              type="text"
              id="techstack"
              value={interviewDetails.techstack.join(", ")}
              onChange={(e) => {
                const techs = e.target.value.split(",").map(tech => tech.trim()).filter(Boolean);
                setInterviewDetails(prev => ({ ...prev, techstack: techs }));
              }}
              className="w-full p-3 rounded-lg border border-blue-900 bg-[#181C2A] text-blue-100 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="e.g., React, TypeScript, Node.js"
              required
              disabled={callStatus !== CallStatus.INACTIVE || isProcessing}
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-semibold mb-2 text-blue-200">Interview Type</label>
            <select
              id="type"
              value={interviewDetails.type}
              onChange={(e) => setInterviewDetails(prev => ({ ...prev, type: e.target.value }))}
              className="w-full p-3 rounded-lg border border-blue-900 bg-[#181C2A] text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              required
              disabled={callStatus !== CallStatus.INACTIVE || isProcessing}
            >
              <option value="Technical">Technical</option>
              <option value="Behavioral">Behavioral</option>
              <option value="Mixed">Mixed</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-blue-700 hover:bg-blue-600 text-white font-bold text-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={callStatus !== CallStatus.INACTIVE || isProcessing}
          >
            {isProcessing ? (
              <div className="flex items-center gap-2 justify-center">
                <Loader size="small" />
                <span>Generating Interview...</span>
              </div>
            ) : (
              "Start Interview"
            )}
          </button>
        </form>
      </div>
    );
  }

  const initials = interviewDetails.role ? getInitialsFromRole(interviewDetails.role) : "AI";

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-200px)] gap-4 relative p-4 bg-gradient-to-br from-[#181C2A] to-[#232946] rounded-2xl shadow-xl border border-blue-900 mt-8">
      {/* Status indicator */}
      <div className="absolute top-1 right-4 flex items-center gap-2">
        {callStatus === CallStatus.ACTIVE && (
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {isSpeaking ? "AI Speaking..." : "Listening..."}
          </span>
        )}
        {callStatus === CallStatus.CONNECTING && (
          <span className="flex items-center gap-2">
            <Loader size="small" />
            <span>Connecting to AI...</span>
          </span>
        )}
        {isProcessing && (
          <span className="flex items-center gap-2">
            <Loader size="small" />
            <span>Processing Interview...</span>
          </span>
        )}
      </div>

      {/* Main content */}
      <div className="call-view w-full grid grid-cols-1 md:grid-cols-2 gap-10 mt-12 px-10">
        {/* Interviewer */}
        <div className="h-[250px] flex flex-col items-center justify-center bg-gradient-to-br from-[#232946]/90 to-[#1e2233]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-700/50 mb-4 transition-all duration-300 hover:shadow-purple-800/40 hover:scale-[1.03]">
          <div className="avatar size-[70px] mb-2 relative">
            {isSpeaking && <div className="absolute inset-0 rounded-full border-4 border-purple-400/60 animate-pulse" />}
            <div className="flex items-center justify-center bg-[#2d325a]/80 rounded-full size-[70px] text-2xl font-extrabold text-purple-200 border-2 border-purple-400/40 shadow-inner">
              {initials}
            </div>
          </div>
          <h3 className="text-xl text-purple-100 font-extrabold drop-shadow-lg tracking-wide">AI Interviewer</h3>
          <p className="text-sm text-center text-purple-200/80 font-medium mt-1">
            {callStatus === CallStatus.INACTIVE
              ? "Ready to interview"
              : callStatus === CallStatus.CONNECTING
              ? "Preparing questions..."
              : callStatus === CallStatus.ACTIVE
              ? isSpeaking ? "Speaking..." : "Listening..."
              : "Interview completed"}
          </p>
        </div>

        {/* User */}
        <div className="h-[250px] flex flex-col items-center justify-center bg-gradient-to-br from-[#1a2a33]/90 to-[#2d325a]/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-600/50 mb-4 transition-all duration-300 hover:shadow-cyan-700/40 hover:scale-[1.03]">
          <div className="avatar size-[70px] mb-2 relative">
            <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 shadow-lg blur-[2px]" />
            <Image
              src={"/user-avatar.png"}
              alt="User Avatar"
              width={70}
              height={70}
              className="rounded-full border-2 border-cyan-300/60 shadow-xl object-cover bg-gradient-to-br from-cyan-900/60 to-cyan-400/30"
            />
          </div>
          <h3 className="text-xl text-cyan-100 font-extrabold drop-shadow-lg tracking-wide">{userName || "User"}</h3>
          <p className="text-sm text-center text-cyan-200/80 font-medium mt-1">
            {callStatus === CallStatus.ACTIVE && !isSpeaking 
              ? "Your turn to speak..."
              : "Listening to interviewer..."}
          </p>
        </div>
      </div>

      {/* Caption */}
      <Caption />

      {/* Control buttons */}
      <div className="flex gap-4 mt-2">
        {callStatus === CallStatus.INACTIVE && (
          <Button
            onClick={handleCall}
            disabled={callStatus !== CallStatus.INACTIVE}
            className="px-6"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader size="small" />
                <span>Starting Interview...</span>
              </div>
            ) : (
              "Start Interview"
            )}
          </Button>
        )}
        
        {callStatus === CallStatus.ACTIVE && (
          <Button
            onClick={handleDisconnect}
            variant="destructive"
            disabled={callStatus !== CallStatus.ACTIVE || isProcessing}
            className="px-6"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <Loader size="small" />
                <span>Ending Interview...</span>
              </div>
            ) : (
              "End Interview"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Agent;
