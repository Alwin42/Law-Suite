import React, { useState, useEffect } from 'react';
import api from '../api';
import { 
  Search, Plus, MoreHorizontal, FileText, Edit2, FolderClosed, RefreshCcw, Loader2
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";

export default function CasePage() {
  const [cases, setCases] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [formData, setFormData] = useState({
    case_title: '',
    case_number: '',
    client: '', 
    court_name: '',
    case_type: 'Civil',
    status: 'Open',
    next_hearing: ''
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
      case_title: '', case_number: '', client: '', court_name: '',
      case_type: 'Civil', status: 'Open', next_hearing: ''
    });
    setEditingCase(null);
    setIsModalOpen(false);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setTypeFilter('All');
  };

  // Robust Client ID Extractor (from previous fix)
  const extractClientId = (caseData) => {
    if (!caseData) return '';
    if (typeof caseData.client === 'object' && caseData.client !== null) return caseData.client.id?.toString() || '';
    return caseData.client?.toString() || caseData.client_id?.toString() || '';
  };

  const handleEditClick = (caseItem) => {
    setEditingCase(caseItem);
    setFormData({
      case_title: caseItem.case_title || '',
      case_number: caseItem.case_number || '',
      client: extractClientId(caseItem),
      court_name: caseItem.court_name || '',
      case_type: caseItem.case_type || 'Civil',
      status: caseItem.status || 'Open',
      next_hearing: caseItem.next_hearing || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.client) return alert("Please select a client.");
    if (!formData.case_title || !formData.court_name) return alert("Title and Court are required.");

    const finalClientId = parseInt(formData.client, 10);
    
    const payload = {
      case_title: formData.case_title,
      case_number: formData.case_number,
      court_name: formData.court_name,
      case_type: formData.case_type,
      status: formData.status,
      next_hearing: formData.next_hearing === '' ? null : formData.next_hearing,
      client: finalClientId,    
      client_id: finalClientId   
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
      alert("Failed to save case. Please check your connection.");
    }
  };

  // Apply Search and Dropdown Filters
  const filteredCases = cases.filter(c => {
    const matchesSearch = (c.case_title && c.case_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.case_number && c.case_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (c.client_name && c.client_name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'All' ? true : c.status === statusFilter;
    const matchesType = typeFilter === 'All' ? true : c.case_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Shadcn Badge styling logic based on status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'Open': return 'default';
      case 'Pending': return 'secondary';
      case 'Closed': return 'outline';
      default: return 'default';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-8 md:p-12 font-sans text-foreground">
      <div className="max-w-7xl mx-auto">
        
        {/* =========================================
            1️⃣ PAGE HEADER SECTION
        ========================================= */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Case Files</h1>
            <p className="text-muted-foreground mt-1 text-sm">Manage active litigation, case history, and upcoming hearings.</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button onClick={() => { setEditingCase(null); setIsModalOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> New Case
            </Button>
          </div>
        </div>

        {/* =========================================
            2️⃣ FILTER ROW
        ========================================= */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search cases, clients..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Case Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Civil">Civil</SelectItem>
              <SelectItem value="Criminal">Criminal</SelectItem>
              <SelectItem value="Corporate">Corporate</SelectItem>
              <SelectItem value="Family">Family</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="ghost" onClick={resetFilters} className="text-muted-foreground">
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Filters
          </Button>
        </div>

        {/* =========================================
            3️⃣ MAIN CONTENT AREA (TABLE VIEW)
        ========================================= */}
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Case Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Case Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Hearing</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No cases found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCases.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{item.case_number}</span>
                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{item.case_title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.client_name || "Unknown Client"}</TableCell>
                    <TableCell>{item.case_type}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.next_hearing ? (
                        <span className="text-destructive font-medium">{item.next_hearing}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <FileText className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(item)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Case
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <FolderClosed className="mr-2 h-4 w-4" /> Close Case
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* =========================================
          ADD/EDIT CASE DIALOG
      ========================================= */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCase ? 'Edit Case Details' : 'Open New Case File'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Case Title</label>
              <Input required name="case_title" value={formData.case_title} onChange={handleInputChange} placeholder="e.g. State vs Doe" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Case Number</label>
                <Input required name="case_number" value={formData.case_number} onChange={handleInputChange} placeholder="CV-2026-001" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Court Name</label>
                <Input required name="court_name" value={formData.court_name} onChange={handleInputChange} placeholder="High Court" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Client</label>
              <Select value={formData.client} onValueChange={(val) => handleSelectChange('client', val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.full_name} ({c.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                <Select value={formData.case_type} onValueChange={(val) => handleSelectChange('case_type', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Case Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Civil">Civil</SelectItem>
                    <SelectItem value="Criminal">Criminal</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Family">Family</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Status</label>
                <Select value={formData.status} onValueChange={(val) => handleSelectChange('status', val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Next Hearing</label>
              <Input type="date" name="next_hearing" value={formData.next_hearing} onChange={handleInputChange} />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              <Button type="submit">{editingCase ? 'Update Case' : 'Create Case'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}