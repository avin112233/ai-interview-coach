import { NextRequest, NextResponse } from "next/server";

// @ts-ignore
import pdfParse from "pdf-parse/lib/pdf-parse";

const importantSkills = [
  "python", "sql", "machine learning", "deep learning", "nlp", "llm",
  "genai", "rag", "langchain", "langgraph", "fastapi", "kafka",
  "spark", "pyspark", "mlflow", "docker", "kubernetes", "aws",
  "azure", "gcp", "airflow", "databricks", "tensorflow", "pytorch",
  "xgboost", "model monitoring", "ci/cd", "react", "next.js",
  "typescript", "javascript", "node.js", "postgresql", "mongodb",
  "redis", "elasticsearch", "snowflake", "power bi", "tableau",
  "statistics", "a/b testing", "feature engineering", "classification",
  "regression", "clustering", "recommendation system", "computer vision",
  "transformers", "bert", "prompt engineering", "vector database",
  "chromadb", "pinecone",
];

function findSkills(text: string) {
  const lowerText = text.toLowerCase();
  return importantSkills.filter((skill) => lowerText.includes(skill));
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
  const lowerText = resumeText.toLowerCase();

  score += Math.min(resumeSkills.length * 3, 30);

  if (resumeText.length > 2000) score += 8;
  if (resumeText.length > 4000) score += 7;
  if (lowerText.includes("project")) score += 5;
  if (lowerText.includes("experience")) score += 5;
  if (lowerText.includes("certification")) score += 3;
  if (/\d+%|\d+\s?x|\d+\+/.test(resumeText)) score += 7;

  return Math.min(score, 95);
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
    const resumeScore = calculateResumeScore(resumeText, resumeSkills);

    const result = {
      score: resumeScore,

      summary:
        resumeSkills.length > 0
          ? `This resume shows experience in ${resumeSkills
              .slice(0, 7)
              .join(", ")}. The candidate has a JD match score of ${jobMatchScore}/100 based on detected skills.`
          : "The resume was parsed successfully, but limited technical keywords were detected.",

      strengths: [
        resumeSkills.length > 0
          ? `Strong technical coverage with skills like ${resumeSkills
              .slice(0, 6)
              .join(", ")}.`
          : "Resume contains experience, but technical strengths are not clearly highlighted.",
        resumeSkills.includes("python") || resumeSkills.includes("sql")
          ? "Good foundation in programming and data handling."
          : "Core technical skills can be highlighted more clearly.",
        resumeSkills.includes("machine learning") || resumeSkills.includes("xgboost")
          ? "Relevant machine learning exposure for data science roles."
          : "Machine learning impact can be described more strongly.",
      ],

      weaknesses: [
        !/\d+%|\d+\s?x|\d+\+/.test(resumeText)
          ? "Resume should include more quantified achievements and measurable impact."
          : "Some project bullets can still be made more result-oriented.",
        missingJobSkills.length > 0
          ? `Missing JD skills: ${missingJobSkills.slice(0, 5).join(", ")}.`
          : "No major JD skill gaps detected.",
        "Project descriptions can better explain problem, approach, tools, and outcome.",
      ],

      missingSkills:
        missingJobSkills.length > 0
          ? missingJobSkills
          : ["No major missing JD skills detected."],

      atsTips: [
        "Add exact keywords from the job description naturally in the resume.",
        "Use measurable impact such as accuracy improvement, cost saving, or latency reduction.",
        "Use action verbs and align project bullets with the target role.",
      ],

      interviewQuestions: [
        "Explain your most important project end to end.",
        "What was your exact contribution in your strongest project?",
        "How did you measure the success of your solution?",
        ...resumeSkills
          .slice(0, 5)
          .map((skill) => `How have you used ${skill} in a real project?`),
      ],

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
        "Rewrite project bullets to reflect responsibilities mentioned in the JD.",
        "Add missing skills only if you genuinely have experience with them.",
      ],
    };

    return NextResponse.json({
      result: JSON.stringify(result),
    });
  } catch (error: any) {
    console.error("Resume Analysis Error:", error);

    return NextResponse.json(
      {
        result: `Failed to analyze resume: ${error?.message || "Unknown error"}`,
      },
      { status: 500 }
    );
  }
}