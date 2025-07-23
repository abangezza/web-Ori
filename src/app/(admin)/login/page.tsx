// src/app/(admin)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function LoginAdmin() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      username: form.username,
      password: form.password,
    });

    setIsLoading(false);

    if (res?.ok) {
      router.refresh(); // refresh session
      router.push("/dashboard");
    } else {
      setError("Login gagal. Username atau password salah.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-300 via-zinc-200 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-lg flex overflow-hidden">
        {/* Sidebar Logo */}
        <div className="hidden md:flex w-1/3 bg-gradient-to-b from-indigo-800 to-indigo-950 rounded-l-3xl items-center justify-center p-6">
          <Image
            src="/lambang 1.png"
            alt="Logo Radja Auto Car"
            width={128}
            height={128}
            className="rounded-2xl shadow-md"
            priority
          />
        </div>

        {/* Form Login */}
        <div className="w-full md:w-2/3 p-10 flex flex-col justify-center items-center">
          <h2 className="text-4xl font-extrabold text-gray-700 mb-8 text-center">
            Login Admin Radja
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md w-full max-w-sm mb-4">
              {error}
            </div>
          )}
          <form className="w-full max-w-sm space-y-6" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-600 mb-1"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-amber-400 hover:text-black transition-all duration-300 cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Log In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
