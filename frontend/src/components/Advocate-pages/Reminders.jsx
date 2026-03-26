import React, { useState, useEffect } from "react";
import { 
  Bell, Check, Eye, Trash2, Plus, AlertCircle, RefreshCw, 
  Calendar, Briefcase, User 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";

const authFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      ...options.headers,
    },
  });

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [inlineError, setInlineError] = useState(null);

  const [filterType, setFilterType] = useState("All");
  const [showResolved, setShowResolved] = useState(false);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formData, setFormData] = useState({
    title: "", message: "", reminder_type: "Custom", 
    trigger_date: "", client_name: "", case_title: ""
  });

  const fetchReminders = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch("https://law-suite-wemj.onrender.com/api/reminders/");
      if (!res.ok) throw new Error("Failed to fetch reminders");
      const data = await res.json();
      setReminders(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const getDaysLeft = (triggerDate, isResolved) => {
    if (isResolved) return { text: "Resolved", color: "text-slate-500" };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tDate = new Date(triggerDate);
    tDate.setHours(0, 0, 0, 0);
    
    const diffTime = tDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", color: "text-red-500 font-bold" };
    if (diffDays === 0) return { text: "Today", color: "text-red-500 font-bold animate-pulse" };
    if (diffDays === 1) return { text: "Tomorrow", color: "text-amber-500 font-medium" };
    if (diffDays <= 3) return { text: `in ${diffDays}d`, color: "text-amber-500" };
    return { text: `in ${diffDays}d`, color: "text-slate-500" };
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Payment": return "bg-amber-100 text-amber-700 border-amber-200";
      case "Appointment": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Hearing": return "bg-red-100 text-red-700 border-red-200";
      case "Deadline": return "bg-purple-100 text-purple-700 border-purple-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      const payload = {
        title: formData.title,
        message: formData.message || null,
        reminder_type: formData.reminder_type,
        trigger_date: new Date(formData.trigger_date).toISOString(),
        client_name: formData.client_name || null,
        case_title: formData.case_title || null,
      };

      const res = await authFetch("https://law-suite-wemj.onrender.com/api/reminders/", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create reminder");
      const newReminder = await res.json();
      setReminders([newReminder, ...reminders]);
      setIsAddOpen(false);
      setFormData({ title: "", message: "", reminder_type: "Custom", trigger_date: "", client_name: "", case_title: "" });
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleOptimisticAction = async (id, actionLabel, patchData = null, isDelete = false) => {
    setInlineError(null);
    const prevReminders = [...reminders];
    
    if (isDelete) {
      setReminders(reminders.filter(r => r.id !== id));
    } else {
      setReminders(reminders.map(r => r.id === id ? { ...r, ...patchData } : r));
    }

    try {
      const url = `https://law-suite-wemj.onrender.com/api/reminders/${id}/`;
      const res = await authFetch(url, {
        method: isDelete ? "DELETE" : "PATCH",
        body: patchData ? JSON.stringify(patchData) : null,
      });
      if (!res.ok) throw new Error(`Failed to ${actionLabel}`);
    } catch (err) {
      setReminders(prevReminders);
      setInlineError(`Could not ${actionLabel}. Please try again.`);
      setTimeout(() => setInlineError(null), 3000);
    }
  };

  const totalCount = reminders.length;
  const unresolvedCount = reminders.filter(r => !r.is_resolved).length;
  const unreadCount = reminders.filter(r => !r.is_read).length;

  let filteredReminders = reminders.filter(r => filterType === "All" || r.reminder_type === filterType);
  if (!showResolved) filteredReminders = filteredReminders.filter(r => !r.is_resolved);
  
  filteredReminders.sort((a, b) => {
    if (a.is_resolved === b.is_resolved) return new Date(a.trigger_date) - new Date(b.trigger_date);
    return a.is_resolved ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans mt-19 text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reminders</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your alerts, deadlines, and automated notifications.</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white transition-colors duration-200 shadow-sm text-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Reminder
          </Button>
        </div>

        {inlineError && (
          <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-md border border-red-100 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> {inlineError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="text-sm font-medium text-slate-500">Total Reminders</div>
              <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="text-sm font-medium text-amber-600">Unresolved</div>
              <div className="text-2xl font-bold text-amber-600">{unresolvedCount}</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm border-slate-200">
            <CardContent className="p-4 flex justify-between items-center">
              <div className="text-sm font-medium text-blue-600">Unread</div>
              <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="flex flex-wrap gap-2">
            {["All", "Payment", "Appointment", "Hearing", "Deadline", "Custom"].map(type => (
              <Button
                key={type}
                variant={filterType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(type)}
                className={`text-xs h-8 ${filterType === type ? "bg-slate-900 text-white" : "text-slate-600 border-slate-200 hover:bg-slate-100"}`}
              >
                {type}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResolved(!showResolved)}
            className={`text-xs h-8 border-slate-200 transition-colors ${showResolved ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-100"}`}
          >
            {showResolved ? "Hide Resolved" : "Show Resolved"}
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mb-2" />
            <p className="text-sm">Loading reminders...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm mb-4">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={fetchReminders}>Try Again</Button>
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Bell className="h-8 w-8 mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">No reminders found.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <TooltipProvider>
              {filteredReminders.map(reminder => {
                const daysLeft = getDaysLeft(reminder.trigger_date, reminder.is_resolved);
                const dateFormatted = new Date(reminder.trigger_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <Card key={reminder.id} className={`group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-slate-200 shadow-sm ${reminder.is_resolved ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                    <CardContent className="p-4 flex items-start gap-4">
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${getTypeColor(reminder.reminder_type)}`}>
                            {reminder.reminder_type}
                          </Badge>
                          <span className={`text-xs ${daysLeft.color}`}>{daysLeft.text}</span>
                        </div>
                        
                        <h3 className={`text-sm font-semibold truncate ${reminder.is_resolved ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                          {reminder.title}
                        </h3>
                        
                        {reminder.message && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{reminder.message}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" /> {dateFormatted}
                          </div>
                          {reminder.client_name && (
                            <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <User className="h-3 w-3" /> {reminder.client_name}
                            </div>
                          )}
                          {reminder.case_title && (
                            <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <Briefcase className="h-3 w-3" /> {reminder.case_title}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between h-full min-h-[70px] ml-4">
                        {!reminder.is_read && !reminder.is_resolved ? (
                          <div className="h-2 w-2 rounded-full bg-blue-500 mb-2"></div>
                        ) : <div className="h-2 w-2 mb-2"></div>}
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {!reminder.is_read && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => handleOptimisticAction(reminder.id, 'mark read', { is_read: true })}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Mark Read</p></TooltipContent>
                            </Tooltip>
                          )}
                          
                          {!reminder.is_resolved && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" onClick={() => handleOptimisticAction(reminder.id, 'resolve', { is_resolved: true })}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Mark Resolved</p></TooltipContent>
                            </Tooltip>
                          )}

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleOptimisticAction(reminder.id, 'delete', null, true)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">Delete</p></TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                );
              })}
            </TooltipProvider>
          </div>
        )}
      </div>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">Add Reminder</DialogTitle>
            <DialogDescription className="sr-only">
              Fill out the form below to add a reminder.
            </DialogDescription>
          </DialogHeader>
          
          {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">{formError}</div>}
          
          <form onSubmit={handleAddReminder} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs text-slate-500 font-semibold uppercase">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" placeholder="E.g. Call client about documents" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="message" className="text-xs text-slate-500 font-semibold uppercase">Message (Optional)</Label>
              <Textarea id="message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="text-sm border-slate-200 shadow-sm resize-none" rows={3} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-xs text-slate-500 font-semibold uppercase">Type</Label>
                <Select value={formData.reminder_type} onValueChange={v => setFormData({...formData, reminder_type: v})}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 shadow-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Payment">Payment</SelectItem>
                    <SelectItem value="Appointment">Appointment</SelectItem>
                    <SelectItem value="Hearing">Hearing</SelectItem>
                    <SelectItem value="Deadline">Deadline</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="trigger_date" className="text-xs text-slate-500 font-semibold uppercase">Trigger Date</Label>
                <Input id="trigger_date" type="datetime-local" required value={formData.trigger_date} onChange={e => setFormData({...formData, trigger_date: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" />
              </div>
            </div>

            <Separator className="bg-slate-100 my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="client_name" className="text-xs text-slate-500 font-semibold uppercase">Client Name (Optional)</Label>
                <Input id="client_name" type="text" value={formData.client_name} onChange={e => setFormData({...formData, client_name: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="case_title" className="text-xs text-slate-500 font-semibold uppercase">Case Title (Optional)</Label>
                <Input id="case_title" type="text" value={formData.case_title} onChange={e => setFormData({...formData, case_title: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" placeholder="e.g. Property Dispute" />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button variant="outline" type="button" className="text-sm border-slate-200 hover:bg-slate-100">Cancel</Button>
              </DialogClose>
              <Button type="submit" className="text-sm bg-slate-900 hover:bg-slate-800 text-white">Save Reminder</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}