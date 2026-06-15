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
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is missing");
    }

    const body = await req.json();

    const summary = body.summary || "";
    const matchedSkills = body.matchedSkills || [];
    const missingSkills = body.missingSkills || [];
    const strengths = body.strengths || [];
    const weaknesses = body.weaknesses || [];
    const jobDescription = body.jobDescription || "";

    const randomSeed = `${Date.now()}-${Math.random()}`;

    const prompt = `
You are a senior technical interviewer.

Generate fresh, unique interview questions.
Do not repeat generic questions.
Use this random seed to vary questions: ${randomSeed}

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
No markdown.
No explanation.

Format:
{
  "technicalQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "projectQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "hrQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "systemDesignQuestions": ["q1", "q2", "q3", "q4", "q5"],
  "codingQuestions": ["q1", "q2", "q3", "q4", "q5"]
}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 1,
    });

    const text = completion.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(cleanJson(text));

    return NextResponse.json({
      mockInterview: parsed,
    });
  } catch (error: any) {
    console.error("Groq Mock Interview Error:", error);

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