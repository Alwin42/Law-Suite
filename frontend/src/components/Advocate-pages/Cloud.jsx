import React, { useState, useEffect } from 'react';
import api from '../../api'; 
import { 
  Cloud, Plus, Trash2, FileText, 
  Image as ImageIcon, File, Loader2, DownloadCloud,
  AlertCircle, CheckCircle, ArrowLeft
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const CloudPage = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // <-- Alert State
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  // <-- Helper function to trigger alerts and auto-hide them
  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const res = await api.get('cloud/upload/'); 
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
      showAlert("destructive", "Failed to load files from the cloud.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post('cloud/upload/', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchFiles(); 
      showAlert("default", "File uploaded successfully!");
    } catch (error) {
      showAlert("destructive", "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.delete(`cloud/delete/${deleteId}/`); 
      setFiles(files.filter(f => f.id !== deleteId));
      setDeleteId(null);
      showAlert("default", "File permanently deleted.");
    } catch (error) {
      showAlert("destructive", "Delete failed. You may not have permission.");
      setDeleteId(null);
    }
  };

  // --- FORCE DOWNLOAD ---
  const getDownloadUrl = (url) => {
    if (!url) return "#";
    if (url.includes('/image/upload/')) {
      return url.replace('/image/upload/', '/image/upload/fl_attachment/');
    }
    return url;
  };

  const renderPreview = (file) => {
    const type = (file.file_type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-red-50 group-hover:bg-red-100 transition-colors">
          <FileText className="w-12 h-12 text-red-500 mb-2" />
          <span className="text-[10px] font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded tracking-wider">PDF</span>
        </div>
      );
    }

    if (type.includes('word') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
          <FileText className="w-12 h-12 text-blue-600 mb-2" />
          <span className="text-[10px] font-bold text-blue-600 bg-blue-200 px-2 py-0.5 rounded tracking-wider">DOCX</span>
        </div>
      );
    }

    if (type.includes('image')) {
      return (
        <img 
          src={file.file_url} 
          alt={file.name} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        />
      );
    }

    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-50">
        <File className="w-12 h-12 text-zinc-400 mb-2" />
        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded uppercase">FILE</span>
      </div>
    );
  };

  return (
    /* FIXED: Adjusted outer padding to scale from mobile (p-4) to desktop (md:p-12) */
    <div className="min-h-screen bg-white p-4 sm:p-8 md:p-12 pt-20 font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto">
        
        {/* FIXED: Responsive Back Button */}
        <Button 
          variant="ghost" 
          className="mb-4 sm:mb-6 text-slate-600 hover:text-slate-900 hover:bg-slate-100 -ml-2 sm:-ml-4 w-fit transition-colors" 
          onClick={() => navigate('/dashboard')}
        >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

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

        {/* FIXED: Header flexbox scales to a column on mobile so the button doesn't get squished */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
              <Cloud className="w-8 h-8" />
              Cloud Vault.
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base mt-1 sm:ml-11">Secure storage for your legal documents.</p>
          </div>

          {/* FIXED: Upload button expands to full width on mobile for easier tapping */}
          <label className={`w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 sm:py-3 bg-black text-white rounded-xl sm:rounded-full cursor-pointer transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:scale-105 active:scale-95 ${uploading ? 'opacity-70 pointer-events-none' : ''}`}>
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
            <span className="font-semibold text-sm">{uploading ? 'Uploading...' : 'Add File'}</span>
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        <div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-300" /></div>
          ) : files.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50">
              <p className="text-zinc-500 font-medium">No files stored yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {files.map((file, index) => (
                <div key={file.id} className="group relative bg-zinc-50 rounded-2xl p-4 border border-zinc-100 transition-all duration-300 hover:shadow-xl hover:border-zinc-200 hover:-translate-y-1" style={{ animationDelay: `${index * 50}ms` }}>
                  
                  <div className="h-40 w-full bg-zinc-50 rounded-xl mb-4 flex items-center justify-center border border-zinc-100 overflow-hidden relative">
                    {renderPreview(file)}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                      {/* APPLY getDownloadUrl HERE */}
                      <a 
                        href={getDownloadUrl(file.file_url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-white rounded-full hover:bg-zinc-100 transition-colors shadow-lg"
                        title="Download File"
                      >
                        <DownloadCloud className="w-5 h-5 text-black" />
                      </a>
                    </div>
                  </div>

                  <div className="flex justify-between items-start px-1">
                    <div className="overflow-hidden mr-2">
                      <h3 className="font-bold text-sm text-zinc-900 truncate" title={file.name}>{file.name}</h3>
                      <p className="text-xs text-zinc-400 mt-1 font-medium">{new Date(file.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => setDeleteId(file.id)} className="text-zinc-300 hover:text-red-500 transition-colors p-1" title="Delete File">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
              <h3 className="text-lg font-bold text-zinc-900">Delete File?</h3>
              <p className="text-sm text-zinc-500 mt-2">Are you sure you want to permanently delete this file? This action cannot be undone.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloudPage;