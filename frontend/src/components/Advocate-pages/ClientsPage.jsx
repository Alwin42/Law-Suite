import React, { useState, useEffect } from 'react';
import api from '../../api'; 
import { Link } from 'react-router-dom'; // <-- NEW: Import Link
import { 
  Search, Plus, MoreVertical, Phone, Mail, MapPin, 
  Calendar, User, Loader 
} from 'lucide-react';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', contact_number: '', address: '', notes: ''
  });

  // Fetch Clients on Load
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' 
                          ? true 
                          : filterStatus === 'active' ? client.is_active : !client.is_active;
    return matchesSearch && matchesFilter;
  });

  // Handle Input Change
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Add Client
  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/clients/', formData);
      setClients([response.data, ...clients]); 
      setIsModalOpen(false);
      setFormData({ full_name: '', email: '', contact_number: '', address: '', notes: '' }); 
    } catch (error) {
      console.error("Failed to create client:", error);
      alert("Failed to add client. Please check the details.");
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 mt-1">Manage your case contacts and details.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          <Plus size={20} />
          <span>Add New Client</span>
        </button>
      </div>

      {/* TOOLBAR */}
      {(clients.length > 0 || searchTerm) && (
        <div className="max-w-7xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize ${
                  filterStatus === status ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CLIENT GRID */}
      {clients.length === 0 ? (
        <div className="max-w-2xl mx-auto text-center py-20">
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <User size={40} className="text-slate-300" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Clients Yet</h3>
            <p className="text-slate-500 mb-3 max-w-md mx-auto">
              Your client list is empty. Add your first client to start managing cases and generating automated briefs.
            </p>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">OR <br></br>Please log in again to access your client data.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
            >
              <Plus size={20} />
              Add First Client
            </button>
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-20">
           <p className="text-slate-500 text-lg">No clients match your search.</p>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            
            // --- NEW: Wrapped entire card in a Link ---
            <Link 
                to={`/clients/${client.id}`} 
                key={client.id} 
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 relative overflow-hidden block"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                    {client.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{client.full_name}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      client.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {client.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                {/* Prevent the Link from triggering when clicking the options button */}
                <button 
                    className="text-slate-400 hover:text-slate-600"
                    onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{client.contact_number}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{client.address}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{new Date(client.created_at).toLocaleDateString()}</span>
                </div>
                <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View Details &rarr;</span>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              <input required name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-3 py-2 border rounded-lg" />
                <input required name="contact_number" value={formData.contact_number} onChange={handleInputChange} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full px-3 py-2 border rounded-lg" />
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" className="w-full px-3 py-2 border rounded-lg" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-slate-900 text-white rounded-lg">Create Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}