import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { 
  ArrowLeft, Edit2, Trash2, Calendar, 
  Scale, User, Building2, Clock, CheckCircle, FileText 
} from 'lucide-react';

// Shadcn Components
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CaseViewPage() {
  const { id } = useParams(); // Gets the Case ID from the URL
  const navigate = useNavigate();
  
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH CASE DETAILS ---
  useEffect(() => {
    const fetchCaseDetails = async () => {
      try {
        const response = await api.get(`/cases/${id}/`);
        setCaseData(response.data);
      } catch (error) {
        console.error("Failed to fetch case details:", error);
        alert("Case not found or you don't have permission to view it.");
        navigate('/cases');
      } finally {
        setLoading(false);
      }
    };
    fetchCaseDetails();
  }, [id, navigate]);

  // --- DELETE CASE ---
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to permanently delete this case record? This action cannot be undone.")) {
      try {
        await api.delete(`/cases/${id}/`);
        navigate('/cases');
      } catch (error) {
        console.error("Failed to delete case:", error);
        alert("Failed to delete the case.");
      }
    }
  };

  // --- QUICK CLOSE CASE (PATCH) ---
  const handleCloseCase = async () => {
    try {
      const response = await api.patch(`/cases/${id}/`, { status: 'Closed' });
      setCaseData(response.data);
    } catch (error) {
      console.error("Failed to close case:", error);
      alert("Failed to update case status.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-pulse flex flex-col items-center">
        <Scale className="h-8 w-8 text-slate-400 mb-4" />
        <p className="text-slate-500 font-medium">Loading case file...</p>
      </div>
    </div>
  );

  if (!caseData) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* =========================================
            HEADER (Title + Actions)
        ========================================= */}
        <div>
          <Button 
            variant="ghost" 
            className="mb-4 text-slate-500 hover:text-slate-900 -ml-4"
            onClick={() => navigate('/cases')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cases
          </Button>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold tracking-tight">{caseData.case_title}</h1>
                <Badge variant={
                  caseData.status === "Open" ? "default" : 
                  caseData.status === "Closed" ? "secondary" : "outline"
                }>
                  {caseData.status}
                </Badge>
              </div>
              <p className="text-slate-500 font-mono text-sm">Case No: {caseData.case_number}</p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              {caseData.status !== "Closed" && (
                <Button variant="outline" onClick={handleCloseCase}>
                  <CheckCircle className="mr-2 h-4 w-4" /> Close Case
                </Button>
              )}
              {/* Note: In a real app, this would open your edit modal/page */}
              <Button variant="outline" onClick={() => alert("Open Edit Modal")}>
                <Edit2 className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* =========================================
            BASIC INFORMATION & META INFO (Grid)
        ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Details (Takes up 2/3 of the space) */}
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-slate-500" />
                  Case Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <User className="h-4 w-4 text-slate-400" />
                    {caseData.client_name || `Client ID: ${caseData.client}`}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Case Type</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Scale className="h-4 w-4 text-slate-400" />
                    {caseData.case_type}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Court Name</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Building2 className="h-4 w-4 text-slate-400" />
                    {caseData.court_name}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filing / Hearing Date</p>
                  <div className="flex items-center gap-2 text-slate-900 font-medium">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    {/* Maps to filing_date or next_hearing depending on your model setup */}
                    {caseData.filing_date || caseData.next_hearing || "Not specified"}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

          {/* Meta Information Sidebar (Takes up 1/3 of the space) */}
          <div className="space-y-6">
            <Card className="shadow-sm bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">
                  System Metadata
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Created At</p>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(caseData.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {new Date(caseData.updated_at).toLocaleDateString()}
                  </div>
                </div>

                <Separator className="my-2" />

                <div className="space-y-1">
                  <p className="text-xs text-slate-500">Created By</p>
                  <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {/* Assuming the backend sends created_by as an ID or nested object */}
                    Advocate ID: {typeof caseData.created_by === 'object' ? caseData.created_by.id : caseData.created_by}
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}