"use server";

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `As an experienced interviewer, provide constructive feedback on this practice interview to help the candidate improve.

Interview Transcript:
${formattedTranscript}

Evaluation Areas:

1. Communication Skills (0-100):
   - Clarity and Articulation:
     * Clear expression of technical concepts
     * Logical flow of ideas
     * Use of relevant examples
   - Response Structure:
     * Well-organized answers
     * Appropriate level of detail
     * Concise yet comprehensive
   - Active Listening:
     * Understanding questions fully
     * Asking clarifying questions when needed
     * Addressing all parts of questions
   - Professional Communication:
     * Technical vocabulary usage
     * Confidence in delivery
     * Engagement with interviewer

2. Technical Knowledge (0-100):
   - Core Concepts:
     * Understanding of fundamental principles
     * Knowledge of best practices
     * Awareness of trade-offs
   - Practical Application:
     * Real-world problem-solving
     * Implementation considerations
     * Experience with tools and technologies
   - Technical Depth:
     * Detailed understanding
     * Knowledge of internals
     * Performance considerations
   - Industry Awareness:
     * Current trends
     * Modern practices
     * Technology ecosystem

3. Problem-Solving (0-100):
   - Analytical Approach:
     * Problem breakdown
     * Systematic thinking
     * Pattern recognition
   - Solution Design:
     * Architecture considerations
     * Scalability thinking
     * Error handling
   - Code Quality:
     * Clean code principles
     * Maintainability
     * Testing approach
   - Optimization:
     * Performance awareness
     * Resource efficiency
     * Trade-off analysis

4. Cultural Fit (0-100):
   - Collaboration:
     * Team interaction style
     * Communication with stakeholders
     * Conflict resolution
   - Work Approach:
     * Project management
     * Initiative taking
     * Responsibility handling
   - Growth Mindset:
     * Learning attitude
     * Feedback reception
     * Self-improvement focus
   - Values Alignment:
     * Professional ethics
     * Company culture fit
     * Long-term vision

5. Interview Presence (0-100):
   - Professional Demeanor:
     * Confidence level
     * Stress management
     * Adaptability
   - Engagement:
     * Active participation
     * Enthusiasm
     * Interest in role/company
   - Question Handling:
     * Understanding requirements
     * Clarification seeking
     * Complete responses
   - Overall Impact:
     * Memorable points
     * Unique perspectives
     * Areas of excellence

Feedback Structure:
1. Strengths (Be Specific):
   - Highlight 3-5 key strengths with examples
   - Connect strengths to job requirements
   - Emphasize unique positive qualities

2. Areas for Improvement:
   - Identify 3-5 specific areas
   - Provide actionable suggestions
   - Include resources or practice methods

3. Final Assessment:
   - Overall evaluation
   - Readiness for similar interviews
   - Key focus areas for preparation

Guidelines:
- Use specific examples from the interview
- Provide actionable, constructive feedback
- Balance positive and improvement areas
- Focus on growth and learning
- Keep feedback professional and encouraging

Remember: This is practice feedback to help them improve for real interviews. Be thorough but supportive in your assessment.`,
      system:
        "You are an experienced interviewer providing constructive feedback to help candidates improve their interview performance.",
    });

    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    let feedbackRef;

    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error saving feedback:", error);
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}

export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  const { interviewId, userId } = params;

  const querySnapshot = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (querySnapshot.empty) return null;

  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();

  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
}

export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const interviewsWithFeedback = await Promise.all(
      interviews.docs.map(async (doc) => {
        const interview = { id: doc.id, ...doc.data() } as Interview;
        
        // Get feedback for this interview
        const feedbackSnapshot = await db
          .collection("feedback")
          .where("interviewId", "==", doc.id)
          .where("userId", "==", userId)
          .limit(1)
          .get();

        const feedback = !feedbackSnapshot.empty
          ? feedbackSnapshot.docs[0].data()
          : null;

        return {
          ...interview,
          feedback: feedback
            ? {
                totalScore: feedback.totalScore,
                finalAssessment: feedback.finalAssessment,
                createdAt: feedback.createdAt,
              }
            : undefined,
        };
      })
    );

    return interviewsWithFeedback;
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return null;
  }
}
