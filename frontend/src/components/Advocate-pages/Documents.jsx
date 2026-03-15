import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- NEW: Added useNavigate
import { getDocuments } from '../../api';
import { FileText, Download, Loader2, FolderOpen, ArrowLeft } from 'lucide-react'; // <-- NEW: Added ArrowLeft

import { Button } from "@/components/ui/button"; // <-- NEW: Added Button Import
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Documents() {
  const navigate = useNavigate(); // <-- NEW: Initialized navigate
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await getDocuments();
        setDocuments(response.data);
      } catch (error) {
        console.error("Failed to fetch documents", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    // FIXED: Adjusted padding to scale correctly from mobile to desktop
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 md:p-12 mt-19 font-sans text-slate-900 pt-20">
      <div className="max-w-7xl mx-auto">
        
        {/* --- RESPONSIVE BACK BUTTON --- */}
        <Button 
          variant="ghost" 
          className="mb-4 sm:mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 w-fit transition-colors -ml-2 sm:-ml-4" 
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderOpen className="text-slate-700" size={28} /> 
            All Client Documents
          </h1>
        </div>

        {/* FIXED: Added overflow-x-auto so the table can be swiped on small phones */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-x-auto">
          {/* FIXED: Added min-w to prevent table columns from squishing together */}
          <Table className="min-w-[600px] sm:min-w-full">
            <TableHeader className="bg-slate-50 text-sm sm:text-base">
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Case Title</TableHead>
                <TableHead>File Type</TableHead>
                <TableHead>Date Uploaded</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-sm sm:text-md text-slate-500">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <FileText size={16} className="text-slate-400 shrink-0" /> 
                        <span className="truncate max-w-[150px] sm:max-w-[250px]" title={doc.document_name}>
                          {doc.document_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 whitespace-nowrap">{doc.case_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100">{doc.file_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 text-sm font-medium">
                        <Download size={14} /> 
                        {/* Hides the word 'Download' on very small screens, keeping just the icon */}
                        <span className="hidden sm:inline">Download</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>
    </div>
  );
}