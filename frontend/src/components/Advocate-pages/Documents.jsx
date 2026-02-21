import React, { useState, useEffect } from 'react';
import { getDocuments } from '../../api';
import { FileText, Download, Loader2, FolderOpen } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Documents() {
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
    <div className="min-h-screen bg-slate-50 p-8 md:p-18 font-sans text-slate-900 mt-5">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FolderOpen className="text-slate-700" size={32} /> 
            All Client Documents
          </h1>
        </div>

        <div className="rounded-xl  border border-slate-600 bg-white shadow-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 text-lg">
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
                  <TableCell colSpan={5} className="h-32 text-center text-md text-slate-500">No documents found.</TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <FileText size={16} className="text-slate-400" /> {doc.document_name}
                    </TableCell>
                    <TableCell className="text-slate-600">{doc.case_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-slate-100">{doc.file_type.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell className="text-slate-500">{new Date(doc.uploaded_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 text-sm font-medium">
                        <Download size={14} /> Download
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