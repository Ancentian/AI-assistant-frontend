"use client";

import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { toast, Toaster } from "react-hot-toast";
import SummaryApi from "../../api/index";
import { MoonIcon, SunIcon, PaperAirplaneIcon, DocumentDuplicateIcon } from "@heroicons/react/24/solid";

interface ChatHistoryItem {
  question: string;
  answer: string;
}

// Initialize marked with only valid options
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function Home() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [renderedAnswer, setRenderedAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
    }
  }, []);

  // Load chat history
  useEffect(() => {
    const stored = localStorage.getItem("chatHistory");
    if (stored) {
      try {
        const parsedHistory = JSON.parse(stored);
        setHistory(parsedHistory);
        // Render any existing answer from history
        if (parsedHistory.length > 0 && activeIndex !== null) {
          renderMarkdown(parsedHistory[activeIndex].answer).then(setRenderedAnswer);
        }
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
  }, []);

  // Save chat history
  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  // Apply theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        200
      )}px`;
    }
  }, [question]);

  // Render markdown when answer changes
  useEffect(() => {
    if (answer) {
      renderMarkdown(answer).then(setRenderedAnswer);
    } else {
      setRenderedAnswer("");
    }
  }, [answer]);

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
        const safeAnswer = DOMPurify.sanitize(data.answer);
        setAnswer(safeAnswer);
        const newHistoryItem = { question, answer: safeAnswer };
        setHistory((prev) => [...prev, newHistoryItem]);
        setQuestion("");
        setActiveIndex(history.length); // Set active index to the new item
      } else {
        throw new Error(data.detail || "Something went wrong");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Server not reachable";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem("chatHistory");
    setAnswer("");
    setRenderedAnswer("");
    setQuestion("");
    setActiveIndex(null);
    toast.success("History cleared");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`Switched to ${darkMode ? "light" : "dark"} mode`);
  };

  const copyToClipboard = () => {
    if (!answer) return;
    
    // Create a temporary element to strip HTML tags
    const temp = document.createElement("div");
    temp.innerHTML = answer;
    const plainText = temp.textContent || temp.innerText || "";
    
    navigator.clipboard.writeText(plainText)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  const renderMarkdown = async (content: string): Promise<string> => {
    try {
      const dirty = await marked(content);
      return DOMPurify.sanitize(dirty);
    } catch (e) {
      console.error("Markdown rendering error", e);
      return DOMPurify.sanitize(content);
    }
  };

  const loadHistoryItem = (index: number) => {
    const reversedIndex = history.length - 1 - index;
    const item = history[reversedIndex];
    setQuestion(item.question);
    setAnswer(item.answer);
    setActiveIndex(reversedIndex);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" toastOptions={{
        className: "dark:bg-gray-700 dark:text-white",
      }} />

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 p-4 shadow-md flex flex-col transition-colors duration-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold dark:text-white">History</h2>
          <button
            onClick={handleClearHistory}
            className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
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
                  className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                    activeIndex === history.length - 1 - index
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => loadHistoryItem(index)}
                >
                  <span className="dark:text-gray-200 line-clamp-1">
                    {item.question}
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
      <div className="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
        <div className="w-full max-w-3xl flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 md:p-6 transition-colors duration-200">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold dark:text-white">
              AI Assistant
            </h1>
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
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
                ref={textareaRef}
                className="w-full p-4 pr-12 border rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                placeholder="Ask your question..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={1}
                style={{ minHeight: "60px", maxHeight: "200px" }}
                required
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="absolute right-3 bottom-3 p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            AI may display inaccurate info, so double-check important responses.
          </p>

          {/* Loading Animation */}
          {loading && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
              <div className="flex space-x-2 justify-center">
                {[0, 150, 300].map((delay) => (
                  <div 
                    key={delay}
                    className="w-3 h-3 rounded-full bg-gray-400 dark:bg-gray-300 animate-bounce" 
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Answer Section */}
          {renderedAnswer && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600 relative">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-5 w-5 text-blue-500 dark:text-blue-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="font-bold text-gray-800 dark:text-gray-200">Answer:</h2>
                </div>
                <button
                  onClick={copyToClipboard}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  title="Copy to clipboard"
                >
                  <DocumentDuplicateIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              <div
                className="prose max-w-none dark:prose-invert dark:text-gray-300 
                  prose-p:my-3 prose-headings:my-4 prose-ul:my-3 prose-ol:my-3 
                  prose-pre:bg-gray-800 prose-pre:rounded-lg prose-pre:p-3 prose-pre:overflow-x-auto
                  prose-blockquote:border-l-4 prose-blockquote:border-gray-400 prose-blockquote:pl-4 prose-blockquote:italic
                  prose-table:border-collapse prose-table:w-full prose-table:border prose-table:border-gray-200 dark:prose-table:border-gray-600
                  prose-th:bg-gray-100 dark:prose-th:bg-gray-700 prose-th:p-2 prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-600
                  prose-td:p-2 prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-600"
                dangerouslySetInnerHTML={{ __html: renderedAnswer }}
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