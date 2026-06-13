import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

function cleanJson(text: string) {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const summary = body.summary || "";
    const matchedSkills = body.matchedSkills || [];
    const missingSkills = body.missingSkills || [];
    const strengths = body.strengths || [];
    const weaknesses = body.weaknesses || [];
    const jobDescription = body.jobDescription || "";

    const prompt = `
You are a senior technical interviewer.

Generate fresh interview questions every time.

Candidate Summary:
${summary}

Matched Skills:
${matchedSkills.join(", ")}

Missing Skills:
${missingSkills.join(", ")}

Strengths:
${strengths.join(", ")}

Weaknesses:
${weaknesses.join(", ")}

Job Description:
${jobDescription}

Return ONLY valid JSON.

{
  "technicalQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "projectQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "hrQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "systemDesignQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ],
  "codingQuestions": [
    "question 1",
    "question 2",
    "question 3",
    "question 4",
    "question 5"
  ]
}
`;

    const completion =
      await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],

        temperature: 0.9,
      });

    const text =
      completion.choices[0]?.message?.content || "{}";

    const cleaned = cleanJson(text);

    const parsed = JSON.parse(cleaned);

    return NextResponse.json({
      mockInterview: parsed,
    });
  } catch (error: any) {
    console.error("Groq Error:", error);

    return NextResponse.json(
      {
        result: `Failed to generate mock interview: ${
          error?.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}