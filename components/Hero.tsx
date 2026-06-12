import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-5xl font-bold">
        AI Interview Coach
      </h1>

      <p className="mt-4 text-xl text-gray-600">
        Crack Your Dream Job with AI
      </p>

      <Link
        href="/analyze-resume"
        className="mt-8 px-6 py-3 rounded-lg bg-black text-white"
      >
        Analyze Resume
      </Link>
    </section>
  );
}