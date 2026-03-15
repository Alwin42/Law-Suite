import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { getClientFullCases } from "../../api"; 
import { Badge } from "@/components/ui/badge"; 

export default function ClientCasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await getClientFullCases();
        setCases(response.data);
      } catch (error) {
        console.error("Failed to load cases:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCases();
  }, []);

  if (isLoading) return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-16 overflow-hidden">

      {/* MAIN CONTENT (Sidebar logic completely removed) */}
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="max-w-5xl mx-auto">
            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10 flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">My Legal Cases</h1>
                <p className="text-sm md:text-base text-slate-500 mt-1 md:mt-2">View and track the progress of all your active and closed matters.</p>
              </div>
            </motion.header>

            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6"
            >
              {cases.length > 0 ? cases.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => navigate(`/client-dashboard/cases/${c.id}`)}
                  className="group bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom" />
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 shrink-0">
                      <Briefcase size={20} />
                    </div>
                    <Badge variant="secondary" className="bg-slate-50 text-slate-700 border-slate-200 text-xs md:text-sm">{c.status}</Badge>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">{c.case_title}</h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">{c.case_number} • {c.case_type}</p>
                  
                  <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="text-xs text-slate-400 font-medium truncate pr-4">
                      Advocate: <span className="text-slate-700">{c.advocate_name || "Unassigned"}</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>
              )) : (
                <p className="text-slate-500 text-sm md:text-base">No cases found in your record.</p>
              )}
            </motion.div>
        </div>
      </main>
    </div>
  );
}