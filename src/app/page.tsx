"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner";
import { marked } from "marked";
import { toast, Toaster } from "react-hot-toast";
import SummaryApi from "../../api/index";
import { MoonIcon, SunIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface ChatHistoryItem {
  question: string;
  answer: any;
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      setHistory(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(SummaryApi.Ask.url, {
        method: SummaryApi.Ask.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();

      if (res.ok) {
        setAnswer(data.answer);
        setHistory((prev) => [...prev, { question, answer: data.answer }]);
        setQuestion("");
      } else {
        setError(data.detail || "Something went wrong.");
        toast.error(data.detail || "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      setError("Server not reachable.");
      toast.error("Server not reachable.");
    }
    setLoading(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("chatHistory");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 p-4 shadow-md flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold dark:text-white">History</h2>
          <button
            onClick={handleClearHistory}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
          >
            Clear
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {history.length > 0 ? (
            <ul className="space-y-2">
              {[...history].reverse().map((item, index) => (
                <li
                  key={index}
                  className={`p-2 rounded cursor-pointer text-sm ${
                    activeIndex === index
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => {
                    setAnswer(item.answer);
                    setQuestion(item.question);
                    setActiveIndex(index);
                  }}
                >
                  <span className="dark:text-gray-200">
                    {item.question.slice(0, 30)}...
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              No conversations yet.
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-8 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">
              Ancent Mbithi AI Assistant
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <SunIcon className="h-5 w-5 text-yellow-400" />
              ) : (
                <MoonIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative">
            <div className="relative">
              <textarea
                className="w-full p-4 pr-12 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                placeholder="Ask your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                required
              ></textarea>
              {question && (
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {loading ? (
                    <LoadingSpinner size="small" />
                  ) : (
                    <PaperAirplaneIcon className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
          </form>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Gemini may display inaccurate info, including about people, so double-check its responses.
          </p>

          {/* Loading Animation */}
          {loading && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
          {/* Answer Section */}
          {answer && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                </svg>
                <h2 className="font-bold text-gray-800 dark:text-gray-200">Answer:</h2>
              </div>
              <div
                className="prose max-w-none dark:prose-invert dark:text-gray-300"
                dangerouslySetInnerHTML={{ __html: marked(answer) }}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}