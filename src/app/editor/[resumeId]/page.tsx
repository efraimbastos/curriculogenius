// src/app/editor/[resumeId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useRouter, useParams } from "next/navigation";
import Input from "@/components/ui/Input";
import TextArea from "@/components/ui/TextArea";
import Link from "next/link";
// TODO: Import Modal component for history
// import Modal from "@/components/ui/Modal";

// Define the structure of the resume data (can be refined)
type ResumeData = {
  id: string;
  user_id: string;
  title: string;
  personal_data: { name?: string; lastName?: string; email?: string; phone?: string; address?: string; linkedin?: string; portfolio?: string } | null;
  summary: string | null;
  experience: any[] | null; // Define more specific types later
  education: any[] | null;
  skills: any[] | null;
  languages: any[] | null;
  template_id: string;
  customization_options: any | null;
  created_at: string;
  updated_at: string;
};

// Define structure for version history item
type ResumeVersion = {
    id: string;
    created_at: string;
};

type FullResumeVersion = ResumeVersion & {
    resume_data: ResumeData; // Contains the full snapshot
};

export default function EditorPage() {
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [activeSection, setActiveSection] = useState<string>("personal_data");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [versionHistory, setVersionHistory] = useState<ResumeVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const resumeId = params.resumeId as string;

  // Debounce function (same as before)
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    waitFor: number
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>): Promise<ReturnType<F>> =>
      new Promise((resolve) => {
        if (timeoutId) { clearTimeout(timeoutId); }
        timeoutId = setTimeout(() => { timeoutId = null; resolve(func(...args)); }, waitFor);
      });
  };

  // Fetch resume data on load (same as before)
  useEffect(() => {
    const fetchResume = async () => {
      if (!resumeId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase.from("resumes").select("*").eq("id", resumeId).single();
        if (fetchError) {
          if (fetchError.code === "PGRST116") { setError("Currículo não encontrado."); router.push("/dashboard"); } 
          else { throw fetchError; }
        }
        setResumeData(data as ResumeData);
      } catch (err: any) { console.error("Error fetching resume:", err); setError("Falha ao carregar o currículo.");
      } finally { setLoading(false); }
    };
    fetchResume();
  }, [resumeId, supabase, router]);

  // --- Save Version Function ---
  const saveVersion = async (currentData: ResumeData) => {
      if (!currentData || !currentData.id) return;
      console.log("Attempting to save version...");
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("User not authenticated for saving version");

          // Exclude potentially large/unnecessary fields if needed, or send the whole object
          const snapshotData = { ...currentData }; 
          // delete snapshotData.user_id; // user_id will be set by the function based on auth

          const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/resume-versions`;
          const response = await fetch(functionUrl, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ resume_id: currentData.id, resume_data: snapshotData }),
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to save version: ${response.statusText}`);
          }
          console.log("Version saved successfully");
      } catch (err: any) {
          console.error("Error saving version:", err);
          // Don't block main save operation, just log the error
          setError(prev => prev ? `${prev}\nFalha ao salvar histórico.` : "Falha ao salvar histórico.");
      }
  };

  // Debounced save function (Updated to include version saving)
  const debouncedSave = useCallback(
    debounce(async (updatedData: Partial<ResumeData>) => {
      if (!resumeId || !resumeData) return;
      
      // --- Save a version BEFORE updating the main record --- 
      // Create a snapshot of the state *before* this update is applied
      const dataToVersion = { ...resumeData, ...updatedData }; 
      await saveVersion(dataToVersion as ResumeData);
      // --- End Version Saving --- 

      setSaving(true);
      setSaveStatus("Salvando...");
      try {
        const { error: saveError } = await supabase
          .from("resumes")
          .update({ ...updatedData, updated_at: new Date().toISOString() })
          .eq("id", resumeId);

        if (saveError) throw saveError;
        setSaveStatus("Salvo ✓");
        // Update local state optimistically
        setResumeData(prev => prev ? { ...prev, ...updatedData, updated_at: new Date().toISOString() } : null);
        setTimeout(() => setSaveStatus(""), 2000);
      } catch (err: any) {
        console.error("Error saving resume:", err);
        setError("Falha ao salvar as alterações.");
        setSaveStatus("Falha ao salvar");
      } finally {
        setSaving(false);
      }
    }, 2000), // Increased debounce time slightly to accommodate version save
    [resumeId, supabase, resumeData] // resumeData is needed for snapshot
  );

  // Handle input changes and trigger debounced save (same as before)
  const handleChange = (field: keyof ResumeData | `personal_data.${string}`, value: any) => {
    setResumeData(prevData => {
      if (!prevData) return null;
      let newData: Partial<ResumeData>;
      if (typeof field === "string" && field.startsWith("personal_data.")) {
        const personalField = field.split(".")[1];
        newData = { personal_data: { ...(prevData.personal_data || {}), [personalField]: value } };
      } else {
        newData = { [field]: value };
      }
      // Update UI immediately
      const updatedState = { ...prevData, ...newData };
      // Trigger save with only the changed part
      debouncedSave(newData);
      return updatedState;
    });
  };

  // --- AI Suggestion Handling (same as before) ---
  const handleAiSuggest = async (type: "summary" | "experience_description" | "analyze_job_description") => {
    if (!resumeData) return;
    setAiLoading(true); setAiError(null);
    let context: any = {};
    switch (type) {
        case "summary": context = { skills: resumeData.skills?.map(s => s.name) || [], experiences: resumeData.experience || [] }; break;
        case "analyze_job_description":
            if (!jobDescription.trim()) { setAiError("Por favor, cole a descrição da vaga primeiro."); setAiLoading(false); return; }
            context = { jobDescription: jobDescription, currentSummary: resumeData.summary || "" }; break;
        default: setAiError("Tipo de sugestão inválido."); setAiLoading(false); return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("User not authenticated");
      const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ai-suggest`;
      const response = await fetch(functionUrl, { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session.access_token}` }, body: JSON.stringify({ type, context }) });
      if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Falha na chamada da IA: ${response.statusText}`); }
      const { suggestion } = await response.json();
      if (suggestion) {
        if (type === "summary") { handleChange("summary", suggestion); }
        else if (type === "analyze_job_description") { alert(`Sugestões de Melhoria:\n\n${suggestion}`); }
      } else { throw new Error("Nenhuma sugestão recebida da IA."); }
    } catch (err: any) { console.error("Error calling AI function:", err); setAiError(err.message || "Ocorreu um erro ao gerar a sugestão.");
    } finally { setAiLoading(false); }
  };

  // --- PDF Export Handling (same as before) ---
  const handleExportPdf = async () => {
    if (!resumeId) return;
    setExportingPdf(true); setPdfError(null);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error("User not authenticated for PDF export");
        const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/export-pdf?resumeId=${resumeId}`;
        const response = await fetch(functionUrl, { method: "GET", headers: { "Authorization": `Bearer ${session.access_token}` } });
        if (response.ok) {
            const blob = await response.blob(); const downloadUrl = window.URL.createObjectURL(blob); const link = document.createElement("a"); link.href = downloadUrl;
            const disposition = response.headers.get("content-disposition"); let filename = `${resumeData?.title || "curriculo"}.pdf`;
            if (disposition && disposition.indexOf("attachment") !== -1) { const filenameRegex = /filename[^;=\n]*=(([""]).*?\2|[^;\n]*)/; const matches = filenameRegex.exec(disposition); if (matches != null && matches[1]) { filename = matches[1].replace(/[""]/g, ""); } }
            link.setAttribute("download", filename); document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(downloadUrl);
        } else if (response.status === 403) {
            setPdfError("Você atingiu o limite de exportação gratuita. Faça upgrade para exportar ilimitadamente.");
            router.push("/payment"); // Redirect to payment page
        } else { const errorData = await response.json(); throw new Error(errorData.error || `Falha ao exportar PDF: ${response.statusText}`); }
    } catch (err: any) { console.error("Error exporting PDF:", err); setPdfError(err.message || "Ocorreu um erro ao exportar o PDF.");
    } finally { setExportingPdf(false); }
  };

  // --- Version History Handling ---
  const handleShowHistory = async () => {
      if (!resumeId) return;
      setShowHistoryModal(true);
      setLoadingHistory(true);
      setHistoryError(null);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("User not authenticated for history");

          const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/resume-versions?resumeId=${resumeId}`;
          const response = await fetch(functionUrl, {
              method: "GET",
              headers: { "Authorization": `Bearer ${session.access_token}` },
          });

          if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || `Failed to fetch history: ${response.statusText}`);
          }
          const versions = await response.json();
          setVersionHistory(versions || []);
      } catch (err: any) {
          console.error("Error fetching history:", err);
          setHistoryError(err.message || "Falha ao carregar histórico.");
      } finally {
          setLoadingHistory(false);
      }
  };

  const handleRestoreVersion = async (versionId: string) => {
      if (!window.confirm("Restaurar esta versão substituirá o conteúdo atual. Deseja continuar?")) return;
      setLoadingHistory(true); // Reuse loading state
      setHistoryError(null);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) throw new Error("User not authenticated for restore");

          // Fetch the full data of the selected version
          const functionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/resume-versions/${versionId}`;
          const response = await fetch(functionUrl, {
              method: "GET",
              headers: { "Authorization": `Bearer ${session.access_token}` },
          });
          if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.error || `Failed to fetch version data: ${response.statusText}`); }
          
          const versionData: FullResumeVersion = await response.json();
          if (!versionData || !versionData.resume_data) {
              throw new Error("Dados da versão inválidos ou não encontrados.");
          }

          // --- Save current state as a version BEFORE restoring --- 
          if(resumeData) await saveVersion(resumeData);
          // --- End Save Current Version --- 

          // Update the main resume record with the restored data
          const dataToRestore = { ...versionData.resume_data };
          // Remove fields that shouldn't be directly updated from the snapshot
          delete (dataToRestore as any).id;
          delete (dataToRestore as any).user_id;
          delete (dataToRestore as any).created_at;
          delete (dataToRestore as any).updated_at;

          setSaving(true); // Show saving indicator
          setSaveStatus("Restaurando...");
          const { error: updateError } = await supabase
              .from("resumes")
              .update({ ...dataToRestore, updated_at: new Date().toISOString() })
              .eq("id", resumeId);
          
          if (updateError) throw updateError;

          // Update local state to reflect restored data
          setResumeData(prev => prev ? { ...prev, ...dataToRestore, updated_at: new Date().toISOString() } : null);
          setSaveStatus("Versão Restaurada ✓");
          setShowHistoryModal(false); // Close modal on success
          setTimeout(() => setSaveStatus(""), 2000);

      } catch (err: any) {
          console.error("Error restoring version:", err);
          setHistoryError(err.message || "Falha ao restaurar versão.");
      } finally {
          setLoadingHistory(false);
          setSaving(false);
      }
  };

  // --- Render Logic (Loading, Error, Main Content) ---
  if (loading) { return <div className="flex justify-center items-center min-h-screen">Carregando Editor...</div>; }
  if (error) { return <div className="flex justify-center items-center min-h-screen text-red-500">Erro: {error}</div>; }
  if (!resumeData) { return <div className="flex justify-center items-center min-h-screen">Currículo não encontrado.</div>; }

  // Navigation items (same as before)
  const navItems = [
    { id: "personal_data", label: "Dados Pessoais" }, { id: "summary", label: "Resumo Profissional" },
    { id: "experience", label: "Experiência" }, { id: "education", label: "Educação" },
    { id: "skills", label: "Habilidades" }, { id: "languages", label: "Idiomas" },
    { id: "job_analysis", label: "Análise de Vaga" },
  ];

  // Render Section Form Logic (same as before)
  const renderSectionForm = () => {
    switch (activeSection) {
      case "personal_data": return (<div className="space-y-4"><Input label="Nome" id="pd-name" value={resumeData.personal_data?.name || ""} onChange={(e) => handleChange("personal_data.name", e.target.value)} /><Input label="Sobrenome" id="pd-lastName" value={resumeData.personal_data?.lastName || ""} onChange={(e) => handleChange("personal_data.lastName", e.target.value)} /><Input label="Email" id="pd-email" type="email" value={resumeData.personal_data?.email || ""} onChange={(e) => handleChange("personal_data.email", e.target.value)} /><Input label="Telefone" id="pd-phone" value={resumeData.personal_data?.phone || ""} onChange={(e) => handleChange("personal_data.phone", e.target.value)} /><Input label="Endereço (Cidade/Estado)" id="pd-address" value={resumeData.personal_data?.address || ""} onChange={(e) => handleChange("personal_data.address", e.target.value)} /><Input label="LinkedIn (URL)" id="pd-linkedin" value={resumeData.personal_data?.linkedin || ""} onChange={(e) => handleChange("personal_data.linkedin", e.target.value)} /><Input label="Portfólio (URL)" id="pd-portfolio" value={resumeData.personal_data?.portfolio || ""} onChange={(e) => handleChange("personal_data.portfolio", e.target.value)} /></div>);
      case "summary": return (<div className="space-y-4"><TextArea label="Resumo Profissional" id="summary-text" value={resumeData.summary || ""} onChange={(e) => handleChange("summary", e.target.value)} rows={8} /><button onClick={() => handleAiSuggest("summary")} disabled={aiLoading || saving} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">{aiLoading ? "Gerando..." : "Gerar com IA ✨"}</button>{aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}</div>);
      case "job_analysis": return (<div className="space-y-4"><TextArea label="Cole a Descrição da Vaga Aqui" id="job-description" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} rows={10} placeholder="Cole o texto completo da descrição da vaga..." /><button onClick={() => handleAiSuggest("analyze_job_description")} disabled={aiLoading || saving || !jobDescription.trim()} className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">{aiLoading ? "Analisando..." : "Analisar e Sugerir Melhorias"}</button>{aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}</div>);
      default: return <p>Selecione uma seção para editar.</p>; // TODO: Add other sections
    }
  };

  // --- Main Component Return (Layout) ---
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <Link href="/dashboard"><span className="text-sm font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">&larr; Voltar</span></Link>
          <input type="text" value={resumeData.title} onChange={(e) => handleChange("title", e.target.value)} className="text-lg font-semibold text-gray-700 border-b-2 border-transparent focus:border-indigo-500 focus:outline-none mx-4 flex-grow min-w-0" placeholder="Título do Currículo" />
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500 italic min-w-max">{saveStatus || (saving ? "Salvando..." : "")}</span>
            <button onClick={handleShowHistory} disabled={saving || loadingHistory} className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50">Histórico</button>
            <button onClick={handleExportPdf} disabled={exportingPdf || saving} className="px-3 py-1 text-sm border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50 disabled:opacity-50">{exportingPdf ? "Exportando..." : "Exportar PDF"}</button>
            {pdfError && <p className="text-red-500 text-xs absolute right-8 top-16 bg-white p-1 rounded shadow">{pdfError}</p>}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (<button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${activeSection === item.id ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>{item.label}</button>))}
             <button className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 mt-4`}>Escolher Modelo</button>
             <button className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900`}>Personalizar</button>
          </nav>
        </aside>

        {/* Editing Area */}
        <main className="flex-1 overflow-y-auto p-6"> <h2 className="text-xl font-semibold text-gray-800 mb-4">{navItems.find(item => item.id === activeSection)?.label || "Edição"}</h2> {renderSectionForm()} </main>

        {/* Preview Area */}
        <aside className="w-1/3 bg-gray-100 border-l border-gray-200 overflow-y-auto p-6 hidden lg:block"> <h2 className="text-xl font-semibold text-gray-800 mb-4">Preview</h2> <div className="bg-white shadow-lg p-8 aspect-[210/297]"> {/* TODO: Implement ResumePreview */} <p className="text-center text-gray-400">Preview do Currículo.</p> <pre className="text-xs overflow-auto mt-4">{JSON.stringify(resumeData, null, 2)}</pre> </div> </aside>
      </div>

      {/* History Modal (Basic Example) */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20" onClick={() => setShowHistoryModal(false)}>
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-medium mb-4">Histórico de Versões</h3>
            {loadingHistory && <p>Carregando histórico...</p>}
            {historyError && <p className="text-red-500">{historyError}</p>}
            {!loadingHistory && !historyError && (
              <ul className="space-y-2">
                {versionHistory.length > 0 ? (
                  versionHistory.map((version) => (
                    <li key={version.id} className="flex justify-between items-center p-2 border rounded hover:bg-gray-50">
                      <span>Salvo em: {new Date(version.created_at).toLocaleString("pt-BR")}</span>
                      <button 
                        onClick={() => handleRestoreVersion(version.id)}
                        disabled={saving || loadingHistory}
                        className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                      >
                        Restaurar
                      </button>
                    </li>
                  ))
                ) : (
                  <p>Nenhuma versão anterior encontrada.</p>
                )}
              </ul>
            )}
            <button onClick={() => setShowHistoryModal(false)} className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

