// src/app/(admin)/login/page.tsx - Responsive Version
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
      router.refresh();
      router.push("/dashboard");
    } else {
      setError("Login gagal. Username atau password salah.");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-300 via-zinc-200 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl lg:max-w-5xl bg-white rounded-2xl lg:rounded-3xl shadow-lg flex flex-col lg:flex-row overflow-hidden">
        {/* Sidebar Logo */}
        <div className="lg:w-1/3 bg-gradient-to-b from-indigo-800 to-indigo-950 flex items-center justify-center p-6 lg:p-8 order-2 lg:order-1">
          <div className="text-center">
            <Image
              src="/lambang 1.png"
              alt="Logo Radja Auto Car"
              width={96}
              height={96}
              className="lg:w-32 lg:h-32 rounded-2xl shadow-md mx-auto mb-4"
              priority
            />
            <h3 className="text-white text-lg lg:text-xl font-semibold hidden lg:block">
              Radja Auto Car
            </h3>
            <p className="text-indigo-200 text-sm hidden lg:block mt-2">
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Form Login */}
        <div className="w-full lg:w-2/3 p-6 sm:p-8 lg:p-10 flex flex-col justify-center order-1 lg:order-2">
          <div className="max-w-sm mx-auto w-full">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-700 mb-2 text-center">
              Login Admin
            </h2>
            <p className="text-gray-600 text-center mb-6 lg:mb-8 text-sm lg:text-base">
              Masuk ke dashboard admin Radja Auto Car
            </p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md w-full mb-4">
                <p className="text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-4 lg:space-y-6" onSubmit={handleLogin}>
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-slate-600 mb-2"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  className="w-full px-3 py-2 lg:py-3 border border-slate-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-600 mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  className="w-full px-3 py-2 lg:py-3 border border-slate-300 rounded-md shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm lg:text-base"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                  disabled={isLoading}
                  placeholder="Masukkan password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-2 lg:py-3 rounded-md font-medium hover:bg-amber-400 hover:text-black transition-all duration-300 cursor-pointer disabled:bg-slate-400 disabled:cursor-not-allowed text-sm lg:text-base"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </div>
                ) : (
                  "Log In"
                )}
              </button>
            </form>

            {/* Mobile Logo - Show only on small screens */}
            <div className="lg:hidden mt-8 text-center">
              <div className="text-xs text-gray-500">
                © 2024 Radja Auto Car. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
