// src/app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Resume {
  id: string;
  title: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndResumes = async () => {
      setLoading(true);
      setError(null);

      // Check auth state
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("No active session or error fetching session:", sessionError);
        router.push("/auth/login"); // Redirect to login if not authenticated
        return;
      }

      setUserEmail(session.user.email || null);

      // Fetch resumes
      try {
        const { data, error: fetchError } = await supabase
          .from("resumes")
          .select("id, title, updated_at")
          .order("updated_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }
        setResumes(data || []);
      } catch (err: any) {
        console.error("Error fetching resumes:", err);
        setError("Falha ao carregar seus currículos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndResumes();
  }, [supabase, router]);

  const handleCreateNew = async () => {
    setLoading(true);
    setError(null);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data: newResume, error: createError } = await supabase
            .from("resumes")
            .insert({ user_id: user.id, title: "Novo Currículo" }) // Default title
            .select("id")
            .single();

        if (createError) throw createError;
        if (!newResume) throw new Error("Failed to create resume record.");

        router.push(`/editor/${newResume.id}`);
    } catch (err: any) {
        console.error("Error creating new resume:", err);
        setError("Falha ao criar novo currículo. Tente novamente.");
        setLoading(false);
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!window.confirm("Tem certeza que deseja excluir este currículo?")) {
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const { error: deleteError } = await supabase
            .from("resumes")
            .delete()
            .eq("id", resumeId);

        if (deleteError) throw deleteError;

        // Refresh the list
        setResumes(resumes.filter(r => r.id !== resumeId));

    } catch (err: any) {
        console.error("Error deleting resume:", err);
        setError("Falha ao excluir o currículo. Tente novamente.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh(); // Ensure server components update
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="text-xl font-bold text-indigo-600">Meu Dashboard</div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{userEmail}</span>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              Sair
            </button>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Seus Currículos</h1>

          {loading && <p className="text-center text-gray-500">Carregando...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {/* Create New Resume Card */}
              <button
                onClick={handleCreateNew}
                disabled={loading}
                className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-12 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 bg-white"
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  Criar Novo Currículo
                </span>
              </button>

              {/* Existing Resume Cards */}
              {resumes.map((resume) => (
                <div key={resume.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col justify-between">
                  <div className="p-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">{resume.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Atualizado em: {new Date(resume.updated_at).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-5 py-3 flex justify-end space-x-3">
                    <Link href={`/editor/${resume.id}`}>
                      <span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">Editar</span>
                    </Link>
                    {/* Add other actions like Preview, PDF, History later */}
                    <button
                      onClick={() => handleDelete(resume.id)}
                      disabled={loading}
                      className="text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

