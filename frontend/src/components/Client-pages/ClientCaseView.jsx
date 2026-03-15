import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getClientCaseDetail } from "../../api"; 
import { ArrowLeft, Briefcase, Gavel, CalendarDays, Scale, MapPin, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge"; 
import { Card, CardContent } from "@/components/ui/card";

export default function ClientCaseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const response = await getClientCaseDetail(id);
        setCaseData(response.data);
      } catch (error) {
        console.error("Failed to load case detail", error);
        navigate("/client-dashboard/cases"); 
      } finally {
        setIsLoading(false);
      }
    };
    fetchCase();
  }, [id, navigate]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto mt-9">
        
        {/* Navigation Back */}
        <button 
          onClick={() => navigate("/client-dashboard/cases")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors mb-6 md:mb-8"
        >
          <ArrowLeft size={16} /> Back to Cases
        </button>

        {/* Header Section */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden mb-6 md:mb-8">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-60 translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none px-3 py-1 text-xs md:text-sm">
                  {caseData.status}
                </Badge>
                <span className="text-xs md:text-sm font-semibold text-slate-400 tracking-widest uppercase">{caseData.case_type} LAW</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{caseData.case_title}</h1>
              <p className="text-slate-500 mt-2 text-sm md:text-lg flex items-center gap-2">
                <Briefcase size={18} className="shrink-0"/> <span className="truncate">Case No: {caseData.case_number}</span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Details Grid */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          {/* Court Details */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <div className="h-2 bg-slate-800 w-full"></div>
            <CardContent className="p-5 md:p-6">
              <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
                <Gavel size={16}/> Court Information
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Filing Court</p>
                  <p className="font-semibold text-slate-900 flex items-start gap-2 mt-1 text-sm md:text-base">
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0"/> <span>{caseData.court_name}</span>
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Filing Date</p>
                  <p className="font-semibold text-slate-900 flex items-center gap-2 mt-1 text-sm md:text-base">
                    <CalendarDays size={16} className="text-slate-400 shrink-0"/> {caseData.filing_date || "Not Filed Yet"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hearing & Advocate Details */}
          <Card className="border-none shadow-sm rounded-2xl overflow-hidden">
            <div className="h-2 bg-emerald-500 w-full"></div>
            <CardContent className="p-5 md:p-6">
              <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 md:mb-6 flex items-center gap-2">
                <Scale size={16}/> Status Updates
              </h3>
              <div className="space-y-4 md:space-y-5">
                <div className="bg-emerald-50 p-3 md:p-4 rounded-xl border border-emerald-100/50">
                  <p className="text-[10px] md:text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Next Scheduled Hearing</p>
                  <p className="text-lg md:text-xl font-black text-emerald-900 leading-tight">
                    {caseData.next_hearing ? new Date(caseData.next_hearing).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }) : "To Be Determined"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Assigned Advocate</p>
                  <p className="font-semibold text-slate-900 mt-1 text-sm md:text-base">{caseData.advocate_name || "Pending Assignment"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </div>
    </div>
  );
}