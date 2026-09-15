export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-900 border-b border-gray-800 text-white shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide">LATHALA STUDIO</h1>
          <p className="text-xs text-gray-400">
            NEWSLETTER DESIGNER & AUDIENCE CRM
          </p>
        </div>
      </div>
    </header>
  );
}
