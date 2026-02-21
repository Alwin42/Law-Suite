import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClientDetails, getAdvocateClientCases, getClientPayments, addClientPayment } from '../../api';
import { 
  ArrowLeft, Phone, Mail, MapPin, 
  FileText, CreditCard, Plus, Loader2, Calendar, IndianRupee
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [cases, setCases] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Payment Form States
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [clientRes, casesRes, paymentsRes] = await Promise.all([
          getClientDetails(id),
          getAdvocateClientCases(id),
          getClientPayments(id)
        ]);
        
        setClient(clientRes.data);
        setCases(casesRes.data);
        setPayments(paymentsRes.data);
      } catch (error) {
        console.error("Failed to fetch client data", error);
        alert("Client not found.");
        navigate('/clients');
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id, navigate]);

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setIsAddingPayment(true);
    const formData = new FormData(e.target);
    
    // Matched exact payload to the Backend View requirements based on DFD
    const paymentData = {
      amount: formData.get('amount'),
      payment_date: formData.get('payment_date'),
      payment_mode: formData.get('payment_mode'),
      receipt_number: formData.get('receipt_number'),
      status: formData.get('status'),
      case: formData.get('case_id') || null,
      notes: formData.get('notes'),
    };

    try {
      await addClientPayment(id, paymentData);
      const newPaymentsRes = await getClientPayments(id);
      setPayments(newPaymentsRes.data);
      setIsModalOpen(false);
    } catch (error) {
      alert("Failed to record payment.");
    } finally {
      setIsAddingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'Refunded': return 'bg-slate-200 text-slate-800 border-slate-300';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-slate-900" size={32} />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-900 pt-20">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP HEADER: CLIENT PROFILE */}
        <div>
          <Button variant="ghost" className="mb-4 text-slate-800 hover:text-slate-900 -ml-4" onClick={() => navigate('/clients')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
          </Button>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                {client.full_name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{client.full_name}</h1>
                <Badge className={`mt-1 ${client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {client.is_active ? 'Active Client' : 'Inactive'}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1 gap-x-2 gap-y-2 text-md text-slate-600">
              <span className="flex items-center gap-2"><Phone size={16} className="text-slate-400"/> {client.contact_number}</span>
              <span className="flex items-center gap-2"><Mail size={16} className="text-slate-400"/> {client.email}</span>
              <span className="flex items-center gap-2 md:col-span-2"><MapPin size={16} className="text-slate-400"/> {client.address}</span>
            </div>
          </div>
        </div>

        {/* BOTTOM GRID: CASES & PAYMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: CASES LIST */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <FileText className="text-slate-700" size={20} /> Associated Cases
              </h2>
            </div>
            
            <div className="space-y-4">
              {cases.length > 0 ? (
                cases.map((c) => (
                  <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-slate-300 transition-colors cursor-pointer" onClick={() => navigate(`/cases/${c.id}`)}>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{c.case_title}</h3>
                      <p className="text-sm text-slate-500 mt-1">{c.case_number} • {c.case_type}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Next Hearing</p>
                        <p className="text-sm font-medium text-slate-900 flex items-center justify-end gap-1"><Calendar size={14}/> {c.next_hearing || 'Not Set'}</p>
                      </div>
                      <Badge variant="outline" className="bg-slate-50">{c.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 bg-white rounded-xl border border-dashed border-slate-300 text-slate-500">
                  No cases found for this client.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: PAYMENT HISTORY CARD */}
          <div className="space-y-6">
            <Card className="shadow-sm bg-white border-slate-200 flex flex-col h-full max-h-[600px]">
              <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gray-800" />
                  Payment History
                </CardTitle>
                
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 h-8">
                      <Plus size={14} className="mr-1" /> Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-white sm:max-w-[425px]">
                    <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
                    <form onSubmit={handleRecordPayment} className="space-y-4 py-2">
                      
                      <div className="space-y-2">
                        <Label>Amount Received</Label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <Input name="amount" type="number" step="0.01" required className="pl-9" placeholder="0.00" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date</Label>
                          <Input name="payment_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="space-y-2">
                          <Label>Mode</Label>
                          <select name="payment_mode" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                            <option value="UPI">UPI</option>
                            <option value="Cash">Cash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Cheque">Cheque</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Receipt No.</Label>
                          <Input name="receipt_number" placeholder="Optional" />
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <select name="status" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" required>
                            <option value="Completed">Completed</option>
                            <option value="Pending">Pending</option>
                            <option value="Failed">Failed</option>
                            <option value="Refunded">Refunded</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Link to Case (Optional)</Label>
                        <select name="case_id" className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                          <option value="">-- General Retainer --</option>
                          {cases.map(c => <option key={c.id} value={c.id}>{c.case_title}</option>)}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Input name="notes" placeholder="Ex: Advance payment for drafting..." />
                      </div>
                      
                      <DialogFooter className="mt-4">
                        <Button type="submit" disabled={isAddingPayment} className="w-full bg-slate-900 text-white">
                          {isAddingPayment ? <Loader2 className="animate-spin" /> : "Save Payment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              
              <CardContent className="pt-4 overflow-y-auto flex-1">
                {payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex flex-col p-3 rounded-lg border border-slate-100 bg-slate-50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-slate-900 flex items-center"><IndianRupee size={14}/>{payment.amount}</span>
                          <span className="text-xs font-medium text-slate-500">{payment.payment_date}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                           <div className="flex gap-2">
                              <Badge variant="outline" className="text-[10px] bg-white text-slate-600">{payment.payment_mode}</Badge>
                              <Badge variant="outline" className={`text-[10px] ${getStatusColor(payment.status)}`}>{payment.status}</Badge>
                           </div>
                           {payment.case_title && (
                             <span className="text-xs text-slate-400 truncate max-w-[120px]" title={payment.case_title}>
                               {payment.case_title}
                             </span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No payment records yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}