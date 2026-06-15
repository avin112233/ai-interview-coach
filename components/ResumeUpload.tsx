"use client";

import { useState } from "react";
import jsPDF from "jspdf";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type MockInterview = {
  technicalQuestions: string[];
  projectQuestions: string[];
  hrQuestions: string[];
  systemDesignQuestions: string[];
  codingQuestions: string[];
};

type Analysis = {
  score: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  atsTips: string[];
  interviewQuestions: string[];
  jobMatchScore: number;
  matchedSkills: string[];
  missingJobSkills: string[];
  jdSuggestions: string[];
};

export default function ResumeUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [mockInterview, setMockInterview] = useState<MockInterview | null>(null);
  const [showMockInterview, setShowMockInterview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      setFile(selectedFile);
      setAnalysis(null);
      setMockInterview(null);
      setShowMockInterview(false);
      setError("");
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a PDF resume first.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);
      setMockInterview(null);
      setShowMockInterview(false);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.result || "Failed to analyze resume.");
      }

      const parsed = JSON.parse(data.result);
      setAnalysis(parsed);
    } catch (error: any) {
      setError(error?.message || "Something went wrong while analyzing resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMockInterview = async () => {
    if (!analysis) {
      setError("Please analyze the resume first.");
      return;
    }

    try {
      setInterviewLoading(true);
      setError("");
      setMockInterview(null);
      setShowMockInterview(false);

      const response = await fetch("/api/mock-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: analysis.summary,
          matchedSkills: analysis.matchedSkills,
          missingSkills: analysis.missingSkills,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.result || "Failed to generate mock interview.");
      }

      setMockInterview(data.mockInterview);
      setShowMockInterview(true);
    } catch (error: any) {
      setError(error?.message || "Failed to generate mock interview.");
    } finally {
      setInterviewLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setJobDescription("");
    setAnalysis(null);
    setMockInterview(null);
    setShowMockInterview(false);
    setError("");
  };

  const downloadReport = () => {
    if (!analysis) return;

    const doc = new jsPDF();
    let y = 20;

    const addSection = (title: string, items: string[]) => {
      doc.setFontSize(16);
      doc.text(title, 15, y);
      y += 8;
      doc.setFontSize(11);

      items.forEach((item) => {
        const lines = doc.splitTextToSize(`- ${item}`, 180);
        doc.text(lines, 15, y);
        y += lines.length * 7;

        if (y > 280) {
          doc.addPage();
          y = 20;
        }
      });

      y += 6;
    };

    doc.setFontSize(22);
    doc.text("AI Resume Analysis Report", 15, y);
    y += 15;

    doc.setFontSize(14);
    doc.text(`Resume Score: ${analysis.score}/100`, 15, y);
    y += 8;
    doc.text(`JD Match Score: ${analysis.jobMatchScore}/100`, 15, y);
    y += 12;

    addSection("Summary", [analysis.summary]);
    addSection("Strengths", analysis.strengths);
    addSection("Weaknesses", analysis.weaknesses);
    addSection("Missing Skills", analysis.missingSkills);
    addSection("ATS Tips", analysis.atsTips);
    addSection("Matched JD Skills", analysis.matchedSkills);
    addSection("Missing JD Skills", analysis.missingJobSkills);
    addSection("JD Suggestions", analysis.jdSuggestions);
    addSection("Interview Questions", analysis.interviewQuestions);

    if (mockInterview) {
      addSection("Technical Questions", mockInterview.technicalQuestions);
      addSection("Project Questions", mockInterview.projectQuestions);
      addSection("HR Questions", mockInterview.hrQuestions);
      addSection("System Design Questions", mockInterview.systemDesignQuestions);
      addSection("Coding Questions", mockInterview.codingQuestions);
    }

    doc.save("resume-analysis-report.pdf");
  };

  const scoreChartData = analysis
    ? [
        { name: "Resume Score", value: analysis.score },
        { name: "JD Match", value: analysis.jobMatchScore },
      ]
    : [];

  const skillChartData = analysis
    ? [
        { name: "Matched Skills", value: analysis.matchedSkills.length },
        { name: "Missing Skills", value: analysis.missingJobSkills.length },
      ]
    : [];

  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow p-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3">AI Resume Analyzer</h1>
            <p className="text-gray-600 mb-8">
              Upload your resume, paste a job description, and get ATS score,
              skill gap analysis, and dynamic interview questions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed rounded-xl p-6 text-center">
              <h2 className="text-xl font-semibold mb-3">Upload Resume</h2>

              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="border p-2 rounded w-full"
              />

              {file ? (
                <p className="mt-4 text-green-700">
                  Selected: <strong>{file.name}</strong>
                </p>
              ) : (
                <p className="mt-4 text-gray-500">
                  Only PDF resumes are supported.
                </p>
              )}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">Job Description</h2>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full min-h-44 border rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAnalyze}
              disabled={!file || loading}
              className="px-8 py-3 rounded-lg bg-black text-white disabled:bg-gray-400 flex items-center justify-center gap-2"
            >
              {loading && <Spinner />}
              {loading ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            <button
              onClick={handleReset}
              className="px-8 py-3 rounded-lg border border-gray-300 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
        </div>

        {analysis && (
          <div className="mt-8 grid gap-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleGenerateMockInterview}
                disabled={interviewLoading}
                className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center gap-2"
              >
                {interviewLoading && <Spinner />}
                {interviewLoading ? "Generating..." : "Generate Mock Interview"}
              </button>

              {mockInterview && (
                <button
                  onClick={() => setShowMockInterview(!showMockInterview)}
                  className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  {showMockInterview ? "Hide Questions" : "Show Questions"}
                </button>
              )}

              <button
                onClick={downloadReport}
                className="px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                Download Report
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <CircularScoreCard title="Resume Score" score={analysis.score} />
              <CircularScoreCard title="JD Match Score" score={analysis.jobMatchScore} />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <ChartCard title="Score Comparison" data={scoreChartData} />
              <ChartCard title="Skill Gap Analysis" data={skillChartData} />
            </div>

            <Card title="Summary" items={[analysis.summary]} />
            <Card title="Strengths" items={analysis.strengths} />
            <Card title="Weaknesses" items={analysis.weaknesses} />
            <Card title="Missing Skills" items={analysis.missingSkills} />
            <Card title="ATS Tips" items={analysis.atsTips} />
            <Card title="Matched JD Skills" items={analysis.matchedSkills} />
            <Card title="Missing JD Skills" items={analysis.missingJobSkills} />
            <Card title="JD Improvement Suggestions" items={analysis.jdSuggestions} />

            {mockInterview && showMockInterview && (
              <>
                <Card title="Technical Questions" items={mockInterview.technicalQuestions} />
                <Card title="Project Questions" items={mockInterview.projectQuestions} />
                <Card title="HR Questions" items={mockInterview.hrQuestions} />
                <Card title="System Design Questions" items={mockInterview.systemDesignQuestions} />
                <Card title="Coding Questions" items={mockInterview.codingQuestions} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Spinner({ large = false }: { large?: boolean }) {
  return (
    <div
      className={`animate-spin rounded-full border-4 border-gray-300 border-t-black ${
        large ? "h-12 w-12" : "h-5 w-5"
      }`}
    />
  );
}

function CircularScoreCard({ title, score }: { title: string; score: number }) {
  const radius = 60;
  const stroke = 12;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      <div className="relative">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e5e7eb"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />

          <circle
            stroke="#111827"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            transform={`rotate(-90 ${radius} ${radius})`}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold">{score}%</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  data,
}: {
  title: string;
  data: { name: string; value: number }[];
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>

      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#111827" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>

      <ul className="list-disc pl-6 space-y-2">
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}