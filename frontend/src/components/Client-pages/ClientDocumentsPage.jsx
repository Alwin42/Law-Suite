import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Briefcase, Gavel, CreditCard, FileText, 
  UploadCloud, Download, File, X, Loader2, CheckCircle2,
  AlertCircle, CheckCircle // <-- Added alert icons
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api, { getClientFullCases } from "../../api"; 
import { cn } from "@/lib/utils";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// <-- Import Alert Components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function ClientDocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [myCases, setMyCases] = useState([]); // For the upload dropdown
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // <-- NEW: Alert State
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  // <-- NEW: Helper function to trigger alerts and auto-hide them
  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const [docsRes, casesRes] = await Promise.all([
        api.get('client/documents/'),
        getClientFullCases()
      ]);
      setDocuments(docsRes.data);
      setMyCases(casesRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      showAlert("destructive", "Failed to load documents.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLE UPLOAD ---
  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    
    const formData = new FormData(e.target);
    // 'file', 'title', and 'case' are automatically in formData if inputs have name="" attributes

    try {
      await api.post('client/documents/', formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showAlert("default", "Document Uploaded Successfully!"); // <-- Replaced native alert
      setIsDialogOpen(false);
      fetchData(); // Refresh the list
    } catch (error) {
      console.error("Upload failed:", error);
      showAlert("destructive", "Failed to upload document."); // <-- Replaced native alert
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#FAFAFA]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 pt-16">
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-100 flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] z-10">
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto mt-6">
          <SidebarItem icon={LayoutDashboard} label="Overview" onClick={() => navigate("/client-dashboard")} />
          <SidebarItem icon={Briefcase} label="My Cases" onClick={() => navigate("/client-dashboard/cases")} />
          <SidebarItem icon={Gavel} label="Hearings" onClick={() => navigate("/client-dashboard/hearings")} />
          <SidebarItem icon={CreditCard} label="Billing & Payments" onClick={() => navigate("/client-dashboard/payments")} />
          <SidebarItem icon={FileText} label="Documents" active={true} onClick={() => {}} />
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-72 p-8 lg:p-12 overflow-y-auto h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto">
            
            {/* --- ALERT NOTIFICATION BAR --- */}
            {alertInfo.show && (
              <div className="mb-6">
                <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm border-slate-200">
                  {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
                  <AlertDescription>
                    {alertInfo.message}
                  </AlertDescription>
                </Alert>
              </div>
            )}

            <motion.header initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end mb-10">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Case Documents</h1>
                <p className="text-slate-500 mt-2">Securely view and upload files related to your legal matters.</p>
              </div>

              {/* UPLOAD DIALOG */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                    <UploadCloud className="mr-2 h-4 w-4" /> Upload Document
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4 mt-4">
                    
                    <div className="space-y-2">
                      <Label>Select Case</Label>
                      <Select name="case" required>
                        <SelectTrigger className="bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Which case is this for?" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {myCases.map(c => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.case_title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Document Title</Label>
                      <Input name="title" placeholder="Ex: ID Proof, Evidence Photo..." required className="bg-slate-50 border-slate-200"/>
                    </div>

                    <div className="space-y-2">
                      <Label>File Attachment</Label>
                      <Input name="document" type="file" required className="bg-slate-50 border-slate-200 cursor-pointer"/>
                    </div>

                    <Button type="submit" disabled={isUploading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                      {isUploading ? "Uploading..." : "Submit Document"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </motion.header>

            {/* DOCUMENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.length > 0 ? documents.map((doc) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={doc.id} 
                  className="group bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-200 hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-emerald-50 transition-colors">
                      <FileText size={24} className="text-slate-400 group-hover:text-emerald-600"/>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 line-clamp-1" title={doc.title}>{doc.title}</h3>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        CASE #{doc.case}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                    <p className="text-xs font-medium text-slate-400">
                        Ready to view
                    </p>
                    <a 
                      href={doc.document} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                      title="Download / View"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <UploadCloud size={48} className="text-slate-300 mb-4" />
                  <p className="text-slate-500 font-medium">No documents uploaded yet.</p>
                </div>
              )}
            </div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Helper
function SidebarItem({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={cn("group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 relative overflow-hidden", active ? "text-emerald-700 bg-emerald-50/50" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900")}>
            {active && <motion.div layoutId="activeTab" className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />}
            <div className="flex items-center gap-3 relative z-10">
                <Icon size={18} className={cn("transition-colors duration-300", active ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-700")} />
                {label}
            </div>
        </button>
    )
}