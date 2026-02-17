import React, { useState, useEffect } from 'react';
import { getAdvocateHearings, updateCaseDetails } from '../api'; 
import { 
  Gavel, Calendar, MapPin, FileText, 
  Loader2, Edit, AlertCircle 
} from 'lucide-react';

// Shadcn UI Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";

export default function Hearings() {
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State for the Update Modal
  const [editDate, setEditDate] = useState("");
  const [editCourt, setEditCourt] = useState("");
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => {
    fetchHearings();
  }, []);

  const fetchHearings = async () => {
    try {
      const response = await getAdvocateHearings();
      setHearings(response.data);
    } catch (error) {
      console.error("Failed to fetch hearings:", error);
    } finally {
      setLoading(false);
    }
  };

  const openManageModal = (hearing) => {
    setSelectedHearing(hearing);
    setEditDate(hearing.next_hearing || "");
    setEditCourt(hearing.court_name || "");
    setEditStatus(hearing.status || "Open");
  };

  const handleUpdateHearing = async () => {
    setIsUpdating(true);
    try {
      const updatedData = {
        next_hearing: editDate,
        court_name: editCourt,
        status: editStatus,
      };

      await updateCaseDetails(selectedHearing.id, updatedData);
      
      // Instantly update the UI table
      setHearings(prev => prev.map(h => 
        h.id === selectedHearing.id ? { ...h, ...updatedData } : h
      ));
      
      setSelectedHearing(null); // Close modal
    } catch (error) {
      console.error("Failed to update hearing:", error);
      alert("Failed to update hearing details.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper function for Status Colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Decree': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Closed': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 md:p-12 font-sans text-slate-900 pt-20 md:ml-64">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Gavel className="text-slate-700" size={32} /> 
            Upcoming Hearings
          </h1>
          <p className="text-slate-500 mt-1">Track and manage your scheduled court appearances.</p>
        </div>

        {/* HEARINGS TABLE */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Case Details</TableHead>
                <TableHead>Court</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hearings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                    No upcoming hearings scheduled.
                  </TableCell>
                </TableRow>
              ) : (
                hearings.map((h) => (
                  <TableRow key={h.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-medium whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-900">
                        <Calendar size={16} className="text-slate-400" />
                        {new Date(h.next_hearing).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{h.case_title}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <FileText size={12} /> {h.case_number} • {h.case_type}
                        </span>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded-md w-fit">
                        <MapPin size={14} className="text-slate-400" /> {h.court_name}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(h.status)}>
                        {h.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => openManageModal(h)}>
                        <Edit className="mr-2 h-4 w-4" /> Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* MANAGE HEARING MODAL */}
      <Dialog open={!!selectedHearing} onOpenChange={() => setSelectedHearing(null)}>
        {selectedHearing && (
          <DialogContent className="sm:max-w-[450px] bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Update Hearing</DialogTitle>
            </DialogHeader>
            
            <div className="bg-slate-50 p-3 rounded-md border border-slate-100 mb-2">
              <p className="text-sm font-semibold text-slate-900">{selectedHearing.case_title}</p>
              <p className="text-xs text-slate-500">Case No: {selectedHearing.case_number}</p>
            </div>

            <div className="space-y-4 py-4">
              
              {/* Date Input */}
              <div className="space-y-2">
                <Label htmlFor="date">Next Hearing Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Court Input */}
              <div className="space-y-2">
                <Label htmlFor="court">Court Name</Label>
                <Input 
                  id="court" 
                  type="text" 
                  value={editCourt}
                  onChange={(e) => setEditCourt(e.target.value)}
                  className="bg-white"
                />
              </div>

              {/* Status Select (Using native select for simplicity, or swap with Shadcn Select) */}
              <div className="space-y-2">
                <Label htmlFor="status">Case Status</Label>
                <select 
                  id="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                >
                  <option value="Open">Open</option>
                  <option value="Pending">Pending</option>
                  <option value="Decree">Decree</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

            </div>

            <DialogFooter className="border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => setSelectedHearing(null)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button onClick={handleUpdateHearing} disabled={isUpdating} className="bg-slate-900 text-white hover:bg-slate-800">
                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}