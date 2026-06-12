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

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const file = formData.get("resume") as File;
    const jobDescription = (formData.get("jobDescription") as string) || "";

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

    const jobMatchScore = calculateMatchScore(resumeSkills, jdSkills);

    const resumeScore = Math.min(
      95,
      Math.max(45, 40 + resumeSkills.length * 3)
    );

    const mockResult = {
      score: resumeScore,

      summary:
        "The resume shows relevant technical experience based on the extracted skills, projects, and professional background.",

      strengths: [
        resumeSkills.length > 0
          ? `Strong technical coverage with skills like ${resumeSkills
              .slice(0, 5)
              .join(", ")}`
          : "Resume has some relevant experience but skills are not clearly detected",
        "Resume includes project and professional experience sections",
        "Candidate profile appears suitable for data, AI, or software-related roles",
      ],

      weaknesses: [
        "Achievements can be improved with stronger measurable impact",
        "Project descriptions should include clearer business outcomes",
        "Resume can be optimized further for ATS keyword matching",
      ],

      missingSkills:
        missingJobSkills.length > 0
          ? missingJobSkills
          : ["No major missing skills detected from the provided JD"],

      atsTips: [
        "Add exact keywords from the job description naturally into skills and projects",
        "Use measurable impact such as accuracy improvement, latency reduction, or cost savings",
        "Keep bullet points action-oriented and aligned with the target role",
      ],

      interviewQuestions: [
        "Explain your most important project end to end.",
        "How did you measure the success of your ML or AI solution?",
        "How would you deploy and monitor this system in production?",
      ],

      jobMatchScore,

      matchedSkills:
        matchedSkills.length > 0
          ? matchedSkills
          : ["No strong JD skill matches detected"],

      missingJobSkills:
        missingJobSkills.length > 0
          ? missingJobSkills
          : ["No major JD skill gaps detected"],

      jdSuggestions: [
        jobMatchScore < 60
          ? "Resume needs more JD-specific keywords to improve match score"
          : "Resume has decent alignment with the job description",
        "Add missing JD skills in projects or skills section if you genuinely have experience",
        "Rewrite project bullets to reflect the responsibilities mentioned in the JD",
      ],

      mockInterview: {
        technicalQuestions: [
          "Explain the difference between supervised and unsupervised learning.",
          "How would you handle imbalanced data in a fraud detection system?",
          "Explain how XGBoost works internally.",
          "What is feature engineering and why is it important?",
          "How do you evaluate a machine learning model?",
        ],

        projectQuestions: [
          "Explain your most important project end to end.",
          "What problem were you solving in your fraud detection project?",
          "What challenges did you face and how did you solve them?",
          "How did you measure business impact?",
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
          "Design a real-time fraud detection system.",
          "Design an AI resume analyzer system.",
          "How would you scale an ML inference API?",
          "How would you design a RAG-based chatbot?",
          "How would you monitor model performance in production?",
        ],

        codingQuestions: [
          "Find the second highest number in an array.",
          "Write a function to count word frequency in a string.",
          "Implement an LRU cache.",
          "Find duplicate elements in a list.",
          "Write SQL to find the second highest salary.",
        ],
      },
    };

    return NextResponse.json({
      result: JSON.stringify(mockResult),
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