export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-8 py-4">
      <h1 className="text-2xl font-bold">AI Interview Coach</h1>

      <div className="flex gap-6">
        <a href="/">Home</a>
        <a href="/analyze-resume">Analyze Resume</a>
        <a href="/mock-interview">Mock Interview</a>
      </div>
    </nav>
  );
}