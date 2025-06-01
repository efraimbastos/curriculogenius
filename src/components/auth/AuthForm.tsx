// src/components/auth/AuthForm.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (mode === "signup") {
        response = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Optional: Redirect URL after email confirmation
            // emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        response = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      const { error: authError } = response;

      if (authError) {
        throw authError;
      }

      // On successful login/signup, redirect to dashboard
      // Note: Supabase client handles session persistence
      router.push("/dashboard"); // Adjust route as needed
      router.refresh(); // Refresh server components

    } catch (err: any) {
      console.error(`Error during ${mode}:`, err);
      setError(err.message || `Failed to ${mode}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="seu@email.com"
          disabled={loading}
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6} // Supabase default minimum password length
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="********"
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {loading ? "Processando..." : mode === "login" ? "Entrar" : "Cadastrar"}
      </button>
    </form>
  );
}

