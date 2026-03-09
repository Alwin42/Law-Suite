import React, { useState, useEffect } from 'react';
import api from '../../api'; 
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { 
  Search, Plus, MoreVertical, Phone, Mail, MapPin, 
  Calendar, User, Loader, AlertCircle, CheckCircle, ArrowLeft, Edit2, Trash2
} from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', contact_number: '', address: '', notes: ''
  });
  
  // --- NEW: States for Edit/Delete Dropdowns ---
  const [openDropdownId, setOpenDropdownId] = useState(null); // Tracks which client's menu is open
  const [editingClientId, setEditingClientId] = useState(null); // Tracks if we are editing vs creating

  const navigate = useNavigate();
  const [alertInfo, setAlertInfo] = useState({ show: false, type: 'default', message: '' });

  const showAlert = (type, message) => {
    setAlertInfo({ show: true, type, message });
    setTimeout(() => {
      setAlertInfo({ show: false, type: 'default', message: '' });
    }, 5000);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients/');
      setClients(response.data);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      showAlert("destructive", "Failed to fetch clients. Please try refreshing the page.");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' 
                          ? true 
                          : filterStatus === 'active' ? client.is_active : !client.is_active;
    return matchesSearch && matchesFilter;
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- NEW: Unified Save Handler (Handles both Create and Edit) ---
  const handleSaveClient = async (e) => {
    e.preventDefault();
    try {
      if (editingClientId) {
        // Edit Existing Client
        const response = await api.put(`/clients/${editingClientId}/`, formData);
        setClients(clients.map(c => c.id === editingClientId ? response.data : c));
        showAlert("default", "Client updated successfully!");
      } else {
        // Create New Client
        const response = await api.post('/clients/', formData);
        setClients([response.data, ...clients]); 
        showAlert("default", "Client added successfully!");
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save client:", error);
      showAlert("destructive", "Failed to save client. Please check the details.");
    }
  };

  // --- NEW: Helper to safely close and reset the modal ---
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClientId(null);
    setFormData({ full_name: '', email: '', contact_number: '', address: '', notes: '' });
  };

  // --- NEW: Dropdown Toggle Logic ---
  const toggleDropdown = (e, id) => {
    e.preventDefault(); // Prevents the <Link> from triggering
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  // --- NEW: Open Edit Modal with Pre-filled Data ---
  const handleEditClick = (e, client) => {
    e.preventDefault(); // Prevents <Link> navigation
    setOpenDropdownId(null); // Close dropdown
    setEditingClientId(client.id);
    setFormData({
      full_name: client.full_name,
      email: client.email,
      contact_number: client.contact_number,
      address: client.address,
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  // --- NEW: Delete Logic ---
  const handleDeleteClick = async (e, id) => {
    e.preventDefault(); // Prevents <Link> navigation
    setOpenDropdownId(null); // Close dropdown
    
    if (window.confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      try {
        await api.delete(`/clients/${id}/`);
        setClients(clients.filter(c => c.id !== id));
        showAlert("default", "Client deleted successfully.");
      } catch (error) {
        console.error("Delete error:", error);
        showAlert("destructive", "Failed to delete client.");
      }
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
      
      {alertInfo.show && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert variant={alertInfo.type} className="animate-in fade-in slide-in-from-top-4 bg-white shadow-sm">
            {alertInfo.type === 'destructive' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertTitle>{alertInfo.type === 'destructive' ? 'Error' : 'Success'}</AlertTitle>
            <AlertDescription>{alertInfo.message}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8 mt-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Button variant="ghost" className="mb-4 text-slate-800 hover:text-slate-900 -ml-4" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Client Directory</h1>
          <p className="text-slate-500 mt-1">Manage your case contacts and details.</p>
        </div>
        <button 
          onClick={() => { closeModal(); setIsModalOpen(true); }}
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
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Your client list is empty. Add your first client to start managing cases.</p>
            <button 
              onClick={() => { closeModal(); setIsModalOpen(true); }}
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
            
            <Link 
                to={`/clients/${client.id}`} 
                key={client.id} 
                className="group bg-white rounded-xl p-6 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 relative overflow-visible block"
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

                {/* --- NEW: Dropdown Menu Trigger & Content --- */}
                <div className="relative z-10">
                  <button 
                      className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition-colors"
                      onClick={(e) => toggleDropdown(e, client.id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  {openDropdownId === client.id && (
                    <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                      <button 
                        onClick={(e) => handleEditClick(e, client)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={14} /> Edit Client
                      </button>
                      <button 
                        onClick={(e) => handleDeleteClick(e, client.id)}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-100"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
                {/* --- END NEW --- */}
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

      {/* --- NEW: Dynamic Edit/Create Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h2 className="text-xl font-bold text-slate-900">
                {editingClientId ? "Edit Client" : "Add New Client"}
              </h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 p-1">✕</button>
            </div>
            <form onSubmit={handleSaveClient} className="space-y-4">
              <input required name="full_name" value={formData.full_name} onChange={handleInputChange} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/20 outline-none" />
              <div className="grid grid-cols-2 gap-4">
                <input required name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/20 outline-none" />
                <input required name="contact_number" value={formData.contact_number} onChange={handleInputChange} placeholder="Phone" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/20 outline-none" />
              </div>
              <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Address" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/20 outline-none" />
              <textarea name="notes" value={formData.notes} onChange={handleInputChange} placeholder="Notes" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-slate-900/20 outline-none" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800">
                  {editingClientId ? "Update Client" : "Create Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}