import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { getCaseDocuments, uploadDocument } from '../api';
import { 
  ArrowLeft, Trash2, Calendar, Scale, User, Building2, 
  Clock, CheckCircle, FileText, Download, Plus, Loader2 
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CaseViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDetailsAndDocs = async () => {
      try {
        const [caseRes, docsRes] = await Promise.all([
          api.get(`/cases/${id}/`),
          getCaseDocuments(id)
        ]);
        setCaseData(caseRes.data);
        setDocuments(docsRes.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        alert("Case not found or permission denied.");
        navigate('/cases');
      } finally {
        setLoading(false);
      }
    };
    fetchDetailsAndDocs();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm("Permanently delete this case record? This action cannot be undone.")) {
      try {
        await api.delete(`/cases/${id}/`);
        navigate('/cases');
      } catch (error) {
        alert("Failed to delete the case.");
      }
    }
  };

  const handleCloseCase = async () => {
    try {
      const response = await api.patch(`/cases/${id}/`, { status: 'Closed' });
      setCaseData(response.data);
    } catch (error) {
      alert("Failed to update case status.");
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.target);
    formData.append('case', id); // Link to this specific case

    try {
      await uploadDocument(formData);
      const docsRes = await getCaseDocuments(id);
      setDocuments(docsRes.data);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <Scale className="h-8 w-8 text-slate-400 mb-4" />
        <p className="text-slate-500 font-medium">Loading case file...</p>
      </div>
    </div>
  );

  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-18 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <Button variant="ghost" className="mb-6 text-slate-800 hover:text-slate-900 -ml-6" onClick={() => navigate('/cases')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Case Title - {caseData.case_title}</h1>
              <p className="text-slate-500 font-mono text-sm mt-2">Case No: {caseData.case_number}</p>
            </div>
            
            <div className="flex items-center gap-3">
              {caseData.status !== "Closed" && (
                <Button variant="outline" className="border border-red-500 text-red-500 hover:bg-red-50" onClick={handleCloseCase}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Close Case
                </Button>
              )}
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-md font-medium">
            Status: 
            <Badge className={`ml-2 ${
              caseData.status === "Open" ? "bg-green-100 text-green-800" :
              caseData.status === "Pending" ? "bg-yellow-100 text-yellow-800" : 
              caseData.status === "Closed" ? "bg-red-100 text-red-800" : ""
            }`}>
              {caseData.status}
            </Badge>
        </div>
        <Separator />

        {/* CASE DETAILS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-800" /> Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="space-y-1">
                  <p className="text-md font-semibold text-slate-500 uppercase tracking-wider">Client</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <User className="h-4 w-4 text-slate-400" /> {caseData.client_name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-md font-semibold text-slate-500 uppercase tracking-wider">Case Type</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Scale className="h-4 w-4 text-slate-400" /> {caseData.case_type}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-md font-semibold text-slate-500 uppercase tracking-wider">Court Name</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Building2 className="h-4 w-4 text-slate-400" /> {caseData.court_name}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-md font-semibold text-slate-500 uppercase tracking-wider">Next Hearing</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="h-4 w-4 text-slate-400" /> {caseData.next_hearing || "Not specified"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="shadow-sm bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-md font-bold text-gray-900 uppercase tracking-wider">Database Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <p className="text-sm text-slate-700">Created At</p>
                  <p className="flex items-center gap-2 text-sm text-slate-700 font-medium"><Clock className="h-3.5 w-3.5 text-slate-400" /> {new Date(caseData.created_at).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-slate-700">Last Updated</p>
                  <p className="flex items-center gap-2 text-sm text-slate-700 font-medium"><Clock className="h-3.5 w-3.5 text-slate-400" /> {new Date(caseData.updated_at).toLocaleDateString()}</p>
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  <p className="text-sm text-slate-700">Created By</p>
                  <p className="flex items-center gap-2 text-sm text-slate-700 font-medium"><User className="h-3.5 w-3.5 text-slate-400" /> Adv. {caseData.advocate_name}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* --- NEW: CASE DOCUMENTS SECTION --- */}
        <div className="pt-6 mt-6 border-t border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="text-slate-700" size={24} /> Case Documents
            </h2>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  <Plus size={16} className="mr-2" /> Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader><DialogTitle>Upload Case Document</DialogTitle></DialogHeader>
                <form onSubmit={handleUploadDocument} className="space-y-4">
                  <div>
                    <Label>Document Name</Label>
                    <Input name="document_name" placeholder="Ex: Bail Petition" required />
                  </div>
                  <div>
                    <Label>File Type (Extension)</Label>
                    <Input name="file_type" placeholder="Ex: pdf, docx" required />
                  </div>
                  <div>
                    <Label>File</Label>
                    <Input name="file_path" type="file" required />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isUploading} className="w-full bg-slate-900 text-white">
                      {isUploading ? <Loader2 className="animate-spin" /> : "Upload"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.length > 0 ? (
              documents.map((doc) => (
                <div key={doc.id} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 truncate pr-2">{doc.document_name}</h3>
                    <Badge variant="outline" className="bg-slate-50">{doc.file_type.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                  <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="outline" className="w-full text-sm h-9">
                      <Download size={14} className="mr-2" /> Download
                    </Button>
                  </a>
                </div>
              ))
            ) : (
              <p className="col-span-full text-slate-500 text-sm py-8 text-center bg-white rounded-lg border border-dashed border-slate-300">
                No documents uploaded for this case yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}