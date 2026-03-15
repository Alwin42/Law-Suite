import React, { useState, useEffect } from 'react';
import { getTemplates, uploadTemplate, deleteTemplate } from '../../api'; 
import { 
  FileText, Download, Plus, Search, Loader2, FolderOpen, Trash2,
  AlertCircle, CheckCircle2 ,ArrowLeft
} from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

// --- NEW: Alert Components ---
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function CaseTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- NEW: Alert State ---
  const [alertInfo, setAlertInfo] = useState(null);

  // Auto-hide alerts after 5 seconds
  useEffect(() => {
    if (alertInfo) {
      const timer = setTimeout(() => setAlertInfo(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alertInfo]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await getTemplates();
      setTemplates(response.data);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setAlertInfo(null);
    
    const formData = new FormData(e.target);
    
    try {
      await uploadTemplate(formData);
      await fetchTemplates(); 
      setIsModalOpen(false); 
      e.target.reset();
      // --- NEW: Success Alert ---
      setAlertInfo({ variant: "default", title: "Success", desc: "Template uploaded successfully." });
    } catch (error) {
      console.error("Upload failed", error);
      // --- NEW: Error Alert ---
      setAlertInfo({ variant: "destructive", title: "Upload Failed", desc: "Failed to upload template." });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    // Keep standard confirm for destructive actions, or use a custom Dialog later
    if (!window.confirm("Are you sure you want to delete this template? This cannot be undone.")) {
      return;
    }

    try {
      await deleteTemplate(id);
      setTemplates(templates.filter(template => template.id !== id));
      // --- NEW: Delete Success Alert ---
      setAlertInfo({ variant: "default", title: "Deleted", desc: "Template removed successfully." });
    } catch (error) {
      console.error("Delete failed", error);
      setAlertInfo({ variant: "destructive", title: "Delete Failed", desc: "Failed to delete the template. Please try again." });
    }
  };

  const filteredTemplates = templates.filter(t => 
    t.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-9 md:p-23 mt-7 font-sans text-slate-900 pt-20 ">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
             <Button variant="ghost" className="mb-2 mt-3 text-slate-800 hover:text-slate-900 -ml-4" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FolderOpen className="text-slate-700" size={32} /> 
              Case Templates
            </h1>
            <p className="text-slate-500 mt-1">Manage and access your legal document drafts.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search templates..." 
                className="pl-9 w-64 bg-white"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 text-white hover:bg-slate-800 gap-2">
                  <Plus size={18} /> Upload New
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Upload Template</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name</Label>
                    <Input id="name" name="template_name" placeholder="Ex: Bail Application Draft" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" placeholder="Ex: Criminal / Civil" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="file">Document File</Label>
                    <Input id="file" name="file_path" type="file" required className="cursor-pointer" />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUploading} className="bg-slate-900 text-white w-full">
                      {isUploading ? <Loader2 className="animate-spin mr-2" /> : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* --- NEW: ALERT RENDERER --- */}
        {alertInfo && (
          <Alert 
            variant={alertInfo.variant} 
            className={`mb-6 transition-all duration-300 ${alertInfo.variant === 'default' ? 'border-green-200 bg-green-50 text-green-800' : ''}`}
          >
            {alertInfo.variant === "destructive" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            <AlertTitle>{alertInfo.title}</AlertTitle>
            <AlertDescription>{alertInfo.desc}</AlertDescription>
          </Alert>
        )}

        {/* MINIMALIST CARD TILES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <div 
                key={template.id} 
                className="group bg-white rounded-xl border border-slate-300 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                    <FileText size={24} />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                      {template.category}
                    </Badge>
                    <button 
                      onClick={() => handleDelete(template.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-1 line-clamp-1">
                    {template.template_name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Uploaded on {new Date(template.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50">
                  <a 
                    href={template.file_path} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors gap-2"
                  >
                    <Download size={16} /> Download File
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>No templates found. Upload your first one!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}