"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5050/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();

      if (json.success) {
        const { accessToken } = json.data;
        
        // Save to localStorage for API calls
        localStorage.setItem("admin_token", accessToken);
        
        // Save to cookie for Next.js Middleware protection
        // This ensures the middleware knows the user is logged in
        document.cookie = `admin_token=${accessToken}; path=/; max-age=86400; SameSite=Lax`;
        
        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(json.message || "Invalid credentials.");
      }
    } catch (err) {
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f0d0c] flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#E36727] to-amber-600 text-white flex items-center justify-center shadow-xl">
            <i className="fa-solid fa-utensils text-xl sm:text-2xl"></i>
          </div>
        </div>
        <h2 className="mt-5 text-center font-serif text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Admin Portal
        </h2>
        <p className="mt-1.5 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Sign in to manage catering and orders.
        </p>
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        <div className="bg-white dark:bg-slate-900 py-6 px-4.5 sm:py-8 sm:px-10 shadow-2xl rounded-2xl sm:rounded-3xl border border-slate-100 dark:border-slate-800">
          <form className="space-y-5 sm:space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation mt-0.5 shrink-0"></i>
                <p>{error}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Email address
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-slate-400 text-xs sm:text-sm"></i>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-3 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-[#E36727] focus:border-[#E36727] text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                  placeholder="admin@cateringlk.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>
              <div className="mt-1.5 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-slate-400 text-xs sm:text-sm"></i>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-9 pr-3 py-2.5 sm:py-3 border border-slate-300 dark:border-slate-700 rounded-xl shadow-xs placeholder-slate-400 focus:outline-none focus:ring-[#E36727] focus:border-[#E36727] text-xs sm:text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-xs sm:text-sm font-extrabold text-white bg-[#E36727] hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E36727] transition-all transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Authenticating...
                  </div>
                ) : (
                  "Sign in to Dashboard"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
