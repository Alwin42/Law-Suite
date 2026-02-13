import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Search, Plus, Calendar, User, FileText, Gavel, Loader, X, Edit2, Clock 
} from 'lucide-react';

export default function CasePage() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);

  // FIXED: Reverted back to client_id to match your specific Django Serializer
  const [formData, setFormData] = useState({
    case_title: '',
    case_number: '',
    client_id: '', 
    court_name: '',
    case_type: 'Civil',
    status: 'Open',
    next_hearing: '',
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [casesRes, clientsRes] = await Promise.all([
        api.get('/cases/'),
        api.get('/clients/')
      ]);
      setCases(casesRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      case_title: '', case_number: '', client_id: '', court_name: '',
      case_type: 'Civil', status: 'Open', next_hearing: '', description: ''
    });
    setEditingCase(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      case_title: caseItem.case_title || '',
      case_number: caseItem.case_number || '',
      // Safely grab the ID whether the backend sent it as client_id or client
      client_id: caseItem.client_id || caseItem.client || '', 
      court_name: caseItem.court_name || '',
      case_type: caseItem.case_type || 'Civil',
      status: caseItem.status || 'Open',
      next_hearing: caseItem.next_hearing || '',
      description: caseItem.description || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client_id) return alert("Please select a client.");
    if (!formData.case_title || !formData.court_name) return alert("Title and Court are required.");

    // FIXED: Ensure we send exactly what Django is asking for: 'client_id' as an Integer
    const payload = {
      case_title: formData.case_title,
      case_number: formData.case_number,
      court_name: formData.court_name,
      case_type: formData.case_type,
      status: formData.status,
      next_hearing: formData.next_hearing === '' ? null : formData.next_hearing,
      description: formData.description,
      client_id: parseInt(formData.client_id, 10) // Forces the ID to be a number
    };

    try {
      let response;
      if (editingCase) {
        response = await api.put(`/cases/${editingCase.id}/`, payload);
        setCases(cases.map(c => c.id === editingCase.id ? response.data : c));
      } else {
        response = await api.post('/cases/', payload);
        setCases([response.data, ...cases]);
      }
      resetForm();
    } catch (error) {
      console.error("Operation failed:", error);
      const msg = error.response?.data ? JSON.stringify(error.response.data, null, 2) : "Check connection.";
      alert(`Failed to save case:\n${msg}`);
    }
  };

  const filteredCases = cases.filter(c => 
    (c.case_title && c.case_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.case_number && c.case_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.client_name && c.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-16 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Case Files</h1>
          <p className="text-slate-500 mt-1">Track legal proceedings and hearings.</p>
        </div>
        <button 
          onClick={() => { setEditingCase(null); setIsModalOpen(true); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus size={20} />
          <span>New Case</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by title, number, or client..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCases.map((item) => (
          <div key={item.id} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            
            <div className="flex justify-between items-start mb-4">
               <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                 <Gavel size={24} className="text-slate-700" />
               </div>
               <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                 item.status === 'Open' ? 'bg-blue-50 text-blue-700' : 
                 item.status === 'Closed' ? 'bg-gray-100 text-gray-500' : 'bg-amber-50 text-amber-700'
               }`}>
                 {item.status}
               </span>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{item.case_title}</h3>
              <p className="text-sm text-slate-500 font-mono mb-4">Case No: {item.case_number}</p>
              
              <div className="space-y-3">
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-slate-400 shrink-0"/> 
                    <span className="truncate font-medium">{item.client_name || "Unknown"}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400 shrink-0"/> 
                    {item.next_hearing ? (
                      <span>Next Hearing: <span className="text-red-600 font-medium">{item.next_hearing}</span></span>
                    ) : (
                      <span>No hearing scheduled</span>
                    )}
                 </div>
                 <div className="flex items-start gap-2 text-sm text-slate-600">
                    <FileText size={16} className="text-slate-400 mt-0.5 shrink-0"/> 
                    <span className="line-clamp-2 text-xs">{item.description || "No description."}</span>
                 </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end items-center gap-2">
               <button 
                 onClick={() => handleEditClick(item)}
                 className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
               >
                 <Clock size={14} /> Update
               </button>
               <button 
                 onClick={() => handleEditClick(item)}
                 className="text-xs font-semibold text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded transition-colors flex items-center gap-1"
               >
                 <Edit2 size={14} /> Edit
               </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingCase ? 'Edit Case Details' : 'Open New Case File'}
              </h2>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Case Title</label>
                <input required name="case_title" value={formData.case_title} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" placeholder="e.g. State vs Doe"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Case Number</label>
                  <input required name="case_number" value={formData.case_number} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" placeholder="CV-2026-001"/>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Court Name</label>
                  <input required name="court_name" value={formData.court_name} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" placeholder="High Court"/>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Client</label>
                {/* FIXED: Form input name set to client_id */}
                <select required name="client_id" value={formData.client_id} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-slate-900/10 outline-none appearance-none">
                  <option value="">Select Client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                  <select name="case_type" value={formData.case_type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                    {['Civil', 'Criminal', 'Corporate', 'Family'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                    {['Open', 'Pending', 'Closed'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Next Hearing</label>
                <input type="date" name="next_hearing" value={formData.next_hearing} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                 <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" placeholder="Details..." />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={resetForm} className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 shadow-lg transition-transform active:scale-95">
                  {editingCase ? 'Update Case' : 'Create Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}