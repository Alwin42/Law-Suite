import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Cloud, 
  Plus, 
  Trash2, 
  FileText, 
  Image as ImageIcon, 
  File, 
  Loader2,
  DownloadCloud,
} from 'lucide-react';

const CloudPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // API Endpoints
  const API_URL = "http://127.0.0.1:8000/api/cloud/upload/";
  const DELETE_URL = "http://127.0.0.1:8000/api/cloud/delete/";

  // 1. Fetch Files
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload File
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post(API_URL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      fetchFiles(); 
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 3. Delete File
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${DELETE_URL}${deleteId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(files.filter(f => f.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      alert("Delete failed");
    }
  };

  // --- THE FIX: SMART PREVIEW LOGIC ---
  const renderPreview = (file) => {
    // Convert to lowercase to be safe
    const type = (file.file_type || "").toLowerCase();
    const name = (file.name || "").toLowerCase();

    // 1. CHECK PDF FIRST (Fixes the broken image bug)
    // Cloudinary sometimes says 'image/pdf', so we must catch 'pdf' before 'image'
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-red-50 group-hover:bg-red-100 transition-colors">
          <FileText className="w-12 h-12 text-red-500 mb-2" />
          <span className="text-[10px] font-bold text-red-600 bg-red-200 px-2 py-0.5 rounded tracking-wider">PDF</span>
        </div>
      );
    }

    // 2. CHECK WORD DOCUMENTS
    if (type.includes('word') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full bg-blue-50 group-hover:bg-blue-100 transition-colors">
          <FileText className="w-12 h-12 text-blue-600 mb-2" />
          <span className="text-[10px] font-bold text-blue-600 bg-blue-200 px-2 py-0.5 rounded tracking-wider">DOCX</span>
        </div>
      );
    }

    // 3. CHECK IMAGE (Only if it passed the PDF check)
    if (type.includes('image')) {
      return (
        <img 
          src={file.file_url} 
          alt={file.name} 
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
        />
      );
    }

    // 4. DEFAULT GENERIC FILE
    return (
      <div className="flex flex-col items-center justify-center h-full w-full bg-zinc-50">
        <File className="w-12 h-12 text-zinc-400 mb-2" />
        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-200 px-2 py-0.5 rounded uppercase">FILE</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-18 mt-7 font-sans text-zinc-900">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex items-center justify-between mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Cloud className="w-8 h-8" />
            Cloud Vault.
          </h1>
          <p className="text-zinc-500 mt-1 ml-11">Secure storage for your legal documents.</p>
        </div>

        <label className={`
          flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full 
          cursor-pointer transition-all duration-300 hover:bg-zinc-800 hover:shadow-lg hover:scale-105 active:scale-95
          ${uploading ? 'opacity-70 pointer-events-none' : ''}
        `}>
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-5 h-5" />}
          <span className="font-semibold text-sm">{uploading ? 'Uploading...' : 'Add File'}</span>
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
        </label>
      </div>

      {/* FILE GRID */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-300" /></div>
        ) : files.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-zinc-100 rounded-3xl">
            <p className="text-zinc-400">No files stored yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file, index) => (
              <div 
                key={file.id}
                className="group relative bg-zinc-50 rounded-2xl p-4 border border-zinc-100 transition-all duration-300 hover:shadow-xl hover:border-zinc-200 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* PREVIEW AREA */}
                <div className="h-40 w-full bg-zinc-50 rounded-xl mb-4 flex items-center justify-center border border-zinc-100 overflow-hidden relative">
                  {renderPreview(file)}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 backdrop-blur-[1px]">
                    <a 
                      href={file.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-3 bg-white rounded-full hover:bg-zinc-100 transition-colors shadow-lg"
                      title="Download"
                    >
                      <DownloadCloud className="w-5 h-5 text-black" />
                    </a>
                  </div>
                </div>

                {/* INFO AREA */}
                <div className="flex justify-between items-start px-1">
                  <div className="overflow-hidden mr-2">
                    <h3 className="font-bold text-sm text-zinc-900 truncate" title={file.name}>
                      {file.name}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 font-medium">
                      {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => setDeleteId(file.id)}
                    className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                    title="Delete File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900">Delete File?</h3>
              <p className="text-sm text-zinc-500 mt-2">
                Are you sure you want to permanently delete this file? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CloudPage;