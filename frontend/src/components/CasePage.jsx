import React, { useState, useEffect } from 'react';
import api from '../api'; 
import { 
  Search, Plus, Briefcase, Calendar, 
  User, FileText, Gavel, Loader, X, Landmark 
} from 'lucide-react';

export default function CasePage() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  
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

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCase = async (e) => {
    e.preventDefault();

    // VALIDATION: Ensure Client, Title, and Court are present
    if (!formData.client_id) {
      alert("Please select a client.");
      return;
    }
    if (!formData.case_title || !formData.court_name) {
      alert("Case Title and Court Name are required.");
      return;
    }

    // CLEAN PAYLOAD: Convert empty date strings to NULL
    const payload = {
      ...formData,
      next_hearing: formData.next_hearing === '' ? null : formData.next_hearing
    };

    try {
      const response = await api.post('/cases/', payload);
      setCases([response.data, ...cases]);
      setIsModalOpen(false);
      
     
      setFormData({
        case_title: '', 
        case_number: '', 
        client_id: '', 
        court_name: '',
        case_type: 'Civil', 
        status: 'Open', 
        next_hearing: '', 
        description: ''
      });
    } catch (error) {
      console.error("Failed to create case:", error);
      if (error.response && error.response.data) {
        // This will now show specifics like "case_title: This field is required"
        const errorMsg = JSON.stringify(error.response.data, null, 2);
        alert(`Failed to create case:\n${errorMsg}`);
      } else {
        alert("Network error. Please check your connection.");
      }
    }
  };

  // Filter Logic (Updated to check case_title)
  const filteredCases = cases.filter(c => 
    (c.case_title && c.case_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.case_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.client_name && c.client_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader className="animate-spin text-slate-900" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-16 font-sans text-slate-800">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Case Files</h1>
          <p className="text-slate-500 mt-1">Track legal proceedings and hearings.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} />
          <span>New Case</span>
        </button>
      </div>

      {/* TOOLBAR */}
      <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by case title, number, or client..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* CASES GRID */}
      {filteredCases.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
          <Briefcase size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">No active cases</h3>
          <p className="text-slate-500">Create a new case file to get started.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((item) => (
            <div key={item.id} className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden flex flex-col h-full">
              
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
                {/* Fixed: using item.case_title instead of item.title */}
                <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-1">{item.case_title}</h3>
                <p className="text-sm text-slate-500 font-mono mb-4">#{item.case_number}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <User size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{item.client_name || "Unknown Client"}</span>
                  </div>
                  
                  {/* Added Court Name Display */}
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Landmark size={16} className="text-slate-400 shrink-0" />
                    <span className="truncate">{item.court_name || "Court not specified"}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} className="text-slate-400 shrink-0" />
                    <span>Next Hearing: <span className="text-slate-900">{item.next_hearing || "Not Scheduled"}</span></span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                 <span className="text-xs text-slate-400 font-medium">{item.case_type}</span>
                 <button className="text-sm font-semibold text-slate-900 hover:underline">View Details →</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD CASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Open New Case File</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddCase} className="space-y-4">
              
              {/* ROW 1: Case Title (Renamed from Title) */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Case Title</label>
                <input required name="case_title" value={formData.case_title} onChange={handleInputChange} placeholder="e.g. State vs. Doe" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
              </div>

              {/* ROW 2: Case Number & Court Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Case Number</label>
                  <input required name="case_number" value={formData.case_number} onChange={handleInputChange} placeholder="e.g. CV-2026-001" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Court Name</label>
                  <input required name="court_name" value={formData.court_name} onChange={handleInputChange} placeholder="e.g. High Court" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
                </div>
              </div>

              {/* ROW 3: Client Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Select Client</label>
                <select 
                  required 
                  name="client_id" 
                  value={formData.client_id} 
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-slate-900/10 outline-none appearance-none"
                >
                  <option value="">-- Choose a Client --</option>
                  {clients.length > 0 ? (
                    clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.full_name} ({client.email})
                      </option>
                    ))
                  ) : (
                    <option disabled>No clients found. Add a client first.</option>
                  )}
                </select>
              </div>

              {/* ROW 4: Type & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Case Type</label>
                  <select name="case_type" value={formData.case_type} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="Civil">Civil</option>
                    <option value="Criminal">Criminal</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Family">Family</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg bg-white">
                    <option value="Open">Open</option>
                    <option value="Pending">Pending</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              {/* ROW 5: Hearing Date */}
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-500 uppercase">Next Hearing Date</label>
                <input type="date" name="next_hearing" value={formData.next_hearing} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
              </div>

              {/* ROW 6: Description (Renamed to match Backend if needed, typically 'description' is fine) */}
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Description</label>
                 <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Case description / specifics..." className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/10 outline-none" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 shadow-lg">Create Case</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}