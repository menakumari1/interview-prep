import { generateText } from "ai";
import { google } from "@ai-sdk/google";

import { db } from "@/firebase/admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, role, level, techstack, amount, userid } = body;

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      return Response.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate interview type
    const validTypes = ["Technical", "Behavioral", "Mixed"];
    if (!validTypes.includes(type)) {
      return Response.json(
        { success: false, error: "Invalid interview type" },
        { status: 400 }
      );
    }

    // Validate level
    const validLevels = ["Junior", "Mid-Level", "Senior"];
    if (!validLevels.includes(level)) {
      return Response.json(
        { success: false, error: "Invalid experience level" },
        { status: 400 }
      );
    }

    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate realistic interview questions that will help candidates practice and prepare effectively.

Interview Parameters:
- Role: ${role}
- Level: ${level}
- Tech Stack: ${techstack}
- Interview Type: ${type}
- Number of Questions: ${amount}

Question Guidelines:
1. Level-Specific Focus:
   - Junior: Core concepts and basic implementations
   - Mid-Level: Architecture and optimization
   - Senior: System design and leadership

2. Question Types:
   - Technical: Real coding scenarios and practical problems
   - Behavioral: Real workplace situations
   - Mixed: Combined technical and soft skills

3. Tech Stack Coverage:
   - Include questions about ${techstack}
   - Focus on practical usage
   - Cover common challenges

Format Requirements:
- Return as JSON array: ["Question 1", "Question 2", "Question 3"]
- Keep questions clear and concise
- Avoid special characters that affect voice synthesis

Note: These questions will be used in a practice interview to help candidates prepare.`,
    });

    console.log("Raw response from model:", questions);

    // Clean and parse questions
    let parsedQuestions;
    try {
      // Remove any markdown formatting and clean whitespace
      let cleanedQuestions = questions.trim();
      if (cleanedQuestions.startsWith('```') && cleanedQuestions.endsWith('```')) {
        cleanedQuestions = cleanedQuestions
          .split('\n')
          .slice(1, -1)
          .join('\n');
      }
      
      console.log("Cleaned questions:", cleanedQuestions);

      try {
        parsedQuestions = JSON.parse(cleanedQuestions);
      } catch (parseError) {
        // If direct parsing fails, try to extract array from response
        const startIndex = cleanedQuestions.indexOf('[');
        const endIndex = cleanedQuestions.lastIndexOf(']');
        if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
          const arrayContent = cleanedQuestions.substring(startIndex, endIndex + 1);
          console.log("Attempting to parse extracted array:", arrayContent);
          parsedQuestions = JSON.parse(arrayContent);
        } else {
          throw parseError;
        }
      }

      // Validate parsed questions
      if (!Array.isArray(parsedQuestions)) {
        console.error("Parsed result is not an array:", parsedQuestions);
        throw new Error("Generated questions must be an array");
      }

      // Clean and validate each question
      parsedQuestions = parsedQuestions
        .map(q => typeof q === 'string' ? q.trim() : String(q))
        .filter(q => {
          // Validate minimum question length and quality
          const minLength = 10;
          const hasQuestionMark = q.includes('?');
          const isValidLength = q.length >= minLength;
          return isValidLength && hasQuestionMark;
        });

      if (parsedQuestions.length === 0) {
        throw new Error("No valid questions generated");
      }

      if (parsedQuestions.length < amount) {
        console.warn(`Only ${parsedQuestions.length} valid questions generated out of ${amount} requested`);
      }

      // Ensure we don't exceed the requested amount
      parsedQuestions = parsedQuestions.slice(0, amount);

      console.log("Successfully parsed questions:", parsedQuestions);

    } catch (error) {
      console.error("Failed to parse questions:", error);
      console.error("Raw questions:", questions);
      return Response.json(
        { 
          success: false, 
          error: "Failed to generate valid questions. Please try again.",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }

    // Create interview document
    try {
      const interview = {
        role,
        type,
        level,
        techstack: techstack.split(",").map((tech: string) => tech.trim()).filter(Boolean),
        questions: parsedQuestions,
        userId: userid,
        finalized: true,
        createdAt: new Date().toISOString(),
      };

      console.log("Creating interview with:", interview);

      const docRef = await db.collection("interviews").add(interview);
      console.log("Interview created with ID:", docRef.id);

      return Response.json({ 
        success: true, 
        interviewId: docRef.id 
      }, { status: 200 });

    } catch (error) {
      console.error("Failed to save interview:", error);
      return Response.json(
        { 
          success: false, 
          error: "Failed to save interview",
          details: error instanceof Error ? error.message : String(error)
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return Response.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json(
    { success: true, message: "Interview generation API is running" },
    { status: 200 }
  );
}
