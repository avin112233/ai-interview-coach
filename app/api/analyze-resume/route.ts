import { NextRequest, NextResponse } from "next/server";

// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse";

const importantSkills = [
  "python",
  "sql",
  "machine learning",
  "deep learning",
  "nlp",
  "llm",
  "genai",
  "rag",
  "langchain",
  "langgraph",
  "fastapi",
  "kafka",
  "spark",
  "pyspark",
  "mlflow",
  "docker",
  "kubernetes",
  "aws",
  "azure",
  "gcp",
  "airflow",
  "databricks",
  "tensorflow",
  "pytorch",
  "xgboost",
  "model monitoring",
  "ci/cd",
  "react",
  "next.js",
  "typescript",
  "javascript",
  "node.js",
  "postgresql",
  "mongodb",
  "redis",
  "elasticsearch",
  "snowflake",
  "power bi",
  "tableau",
  "statistics",
  "a/b testing",
  "feature engineering",
  "classification",
  "regression",
  "clustering",
  "recommendation system",
  "computer vision",
  "transformers",
  "bert",
  "prompt engineering",
  "vector database",
  "chromadb",
  "pinecone",
];

function findSkills(text: string) {
  const lowerText = text.toLowerCase();

  return importantSkills.filter((skill) =>
    lowerText.includes(skill.toLowerCase())
  );
}

function calculateMatchScore(resumeSkills: string[], jdSkills: string[]) {
  if (jdSkills.length === 0) return 0;

  const matchedSkills = jdSkills.filter((skill) =>
    resumeSkills.includes(skill)
  );

  return Math.round((matchedSkills.length / jdSkills.length) * 100);
}

function calculateResumeScore(resumeText: string, resumeSkills: string[]) {
  let score = 40;

  score += Math.min(resumeSkills.length * 3, 30);

  if (resumeText.length > 2000) score += 8;
  if (resumeText.length > 4000) score += 7;

  if (resumeText.toLowerCase().includes("project")) score += 5;
  if (resumeText.toLowerCase().includes("experience")) score += 5;
  if (resumeText.toLowerCase().includes("certification")) score += 3;
  if (/\d+%|\d+\s?x|\d+\+/.test(resumeText)) score += 7;

  return Math.min(score, 95);
}

function generateStrengths(resumeSkills: string[]) {
  const strengths = [];

  if (resumeSkills.length > 0) {
    strengths.push(
      `Strong technical skill coverage including ${resumeSkills
        .slice(0, 6)
        .join(", ")}.`
    );
  }

  if (
    resumeSkills.includes("python") ||
    resumeSkills.includes("sql")
  ) {
    strengths.push(
      "Good foundation in core data and programming skills."
    );
  }

  if (
    resumeSkills.includes("machine learning") ||
    resumeSkills.includes("xgboost") ||
    resumeSkills.includes("deep learning")
  ) {
    strengths.push(
      "Relevant machine learning exposure for data science roles."
    );
  }

  if (
    resumeSkills.includes("fastapi") ||
    resumeSkills.includes("docker") ||
    resumeSkills.includes("kubernetes")
  ) {
    strengths.push(
      "Shows production-oriented engineering and deployment knowledge."
    );
  }

  return strengths.length > 0
    ? strengths
    : ["Resume contains experience, but technical strengths are not clearly highlighted."];
}

function generateWeaknesses(resumeText: string, missingJobSkills: string[]) {
  const weaknesses = [];

  if (!/\d+%|\d+\s?x|\d+\+/.test(resumeText)) {
    weaknesses.push(
      "Resume should include more quantified achievements and measurable impact."
    );
  }

  if (missingJobSkills.length > 0) {
    weaknesses.push(
      `Missing important JD skills such as ${missingJobSkills
        .slice(0, 4)
        .join(", ")}.`
    );
  }

  weaknesses.push(
    "Project bullets can be improved by clearly explaining problem, approach, tools, and outcome."
  );

  return weaknesses;
}

function generateInterviewQuestions(resumeSkills: string[]) {
  const questions = [
    "Explain your most important project end to end.",
    "How did you measure the success of your solution?",
    "What challenges did you face and how did you solve them?",
  ];

  resumeSkills.slice(0, 5).forEach((skill) => {
    questions.push(`How have you used ${skill} in your project?`);
  });

  return questions;
}

function generateMockInterview(resumeSkills: string[]) {
  return {
    technicalQuestions: [
      ...resumeSkills.slice(0, 5).map(
        (skill) => `Explain ${skill} and how you used it in your work.`
      ),
      "How do you evaluate model performance?",
      "How do you handle overfitting?",
    ],

    projectQuestions: [
      "Explain your main project architecture end to end.",
      "What was your exact contribution in the project?",
      "What business problem did your project solve?",
      "What metrics did you use to measure success?",
      "How would you improve this project further?",
    ],

    hrQuestions: [
      "Tell me about yourself.",
      "Why are you looking for a job change?",
      "What are your strengths and weaknesses?",
      "Describe a time you handled pressure.",
      "Where do you see yourself in the next 3 years?",
    ],

    systemDesignQuestions: [
      "Design a resume analyzer system.",
      "Design a real-time ML inference system.",
      "How would you scale an API for thousands of users?",
      "How would you monitor a production ML model?",
      "How would you design a RAG-based chatbot?",
    ],

    codingQuestions: [
      "Find the second highest number in an array.",
      "Count word frequency in a string.",
      "Find duplicate elements in a list.",
      "Implement an LRU cache.",
      "Write SQL to find the second highest salary.",
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("resume") as File;
    const jobDescription =
      (formData.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json(
        { result: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);

    const resumeText = pdfData.text.slice(0, 12000);

    const resumeSkills = findSkills(resumeText);
    const jdSkills = findSkills(jobDescription);

    const matchedSkills = jdSkills.filter((skill) =>
      resumeSkills.includes(skill)
    );

    const missingJobSkills = jdSkills.filter(
      (skill) => !resumeSkills.includes(skill)
    );

    const jobMatchScore = calculateMatchScore(
      resumeSkills,
      jdSkills
    );

    const resumeScore = calculateResumeScore(
      resumeText,
      resumeSkills
    );

    const analysisResult = {
      score: resumeScore,

      summary:
        resumeSkills.length > 0
          ? `This resume shows experience in ${resumeSkills
              .slice(0, 6)
              .join(", ")}. The candidate appears suitable for roles involving data, AI, analytics, or software engineering depending on the job description.`
          : "The resume was parsed successfully, but clear technical keywords were limited.",

      strengths: generateStrengths(resumeSkills),

      weaknesses: generateWeaknesses(
        resumeText,
        missingJobSkills
      ),

      missingSkills:
        missingJobSkills.length > 0
          ? missingJobSkills
          : ["No major missing JD skills detected."],

      atsTips: [
        "Add exact keywords from the target job description naturally in the resume.",
        "Add measurable impact such as accuracy improvement, cost saving, latency reduction, or revenue impact.",
        "Use strong action verbs and keep project bullets result-oriented.",
      ],

      interviewQuestions:
        generateInterviewQuestions(resumeSkills),

      jobMatchScore,

      matchedSkills:
        matchedSkills.length > 0
          ? matchedSkills
          : ["No strong JD skill matches detected."],

      missingJobSkills:
        missingJobSkills.length > 0
          ? missingJobSkills
          : ["No major JD skill gaps detected."],

      jdSuggestions: [
        jobMatchScore >= 75
          ? "Resume has strong alignment with the job description."
          : jobMatchScore >= 50
          ? "Resume has moderate alignment. Add missing JD keywords where relevant."
          : "Resume needs stronger alignment with the job description.",
        "Update project descriptions to reflect responsibilities mentioned in the JD.",
        "Add missing skills only if you genuinely have experience with them.",
      ],

      mockInterview: generateMockInterview(resumeSkills),
    };

    return NextResponse.json({
      result: JSON.stringify(analysisResult),
    });
  } catch (error: any) {
    console.error("Resume Analysis Error:", error);

    return NextResponse.json(
      {
        result: `Failed to analyze resume: ${
          error?.message || "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}