import React, { useState, useEffect } from "react";
import { 
  Check, Trash2, Edit2, Plus, Clock, Briefcase, User, 
  Calendar as CalendarIcon, AlertCircle, RefreshCw 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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

const getLocalDateString = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [inlineError, setInlineError] = useState(null);

  const [selectedDate, setSelectedDate] = useState(getLocalDateString(new Date()));
  const [statusFilter, setStatusFilter] = useState("All");

  const defaultForm = {
    title: "", description: "", due_date: selectedDate, due_time: "", 
    priority: "Medium", category: "Court Work", status: "Pending", client_name: "", case_title: ""
  };
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [formError, setFormError] = useState(null);

  const fetchTasks = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await authFetch("https://law-suite-wemj.onrender.com/api/tasks/");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const todayDateStr = getLocalDateString(new Date());
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return {
      dateObj: d,
      dateStr: getLocalDateString(d),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      hasTasks: tasks.some(t => t.due_date === getLocalDateString(d))
    };
  });

  const getPriorityColor = (priority) => {
    if (priority === "High") return "bg-red-400";
    if (priority === "Medium") return "bg-amber-400";
    if (priority === "Low") return "bg-green-400";
    return "bg-slate-300";
  };

  const handleSaveTask = async (e, isEdit = false) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date) {
      setFormError("Title and Due Date are required.");
      return;
    }
    setFormError(null);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        due_date: formData.due_date,
        due_time: formData.due_time || null,
        priority: formData.priority,
        category: formData.category,
        status: formData.status,
        client_name: formData.client_name || null,
        case_title: formData.case_title || null,
      };

      const url = isEdit ? `https://law-suite-wemj.onrender.com/api/tasks/${editingTask.id}/` : "https://law-suite-wemj.onrender.com/api/tasks/";
      const method = isEdit ? "PATCH" : "POST";

      const res = await authFetch(url, { method, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Failed to ${isEdit ? 'update' : 'create'} task`);
      
      const savedTask = await res.json();
      
      if (isEdit) {
        setTasks(tasks.map(t => t.id === savedTask.id ? savedTask : t));
        setIsEditOpen(false);
        setEditingTask(null);
      } else {
        setTasks([...tasks, savedTask]);
        setIsAddOpen(false);
      }
      setFormData(defaultForm);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    setInlineError(null);
    const prevTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));

    try {
      const res = await authFetch(`https://law-suite-wemj.onrender.com/api/tasks/${id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch (err) {
      setTasks(prevTasks);
      setInlineError("Could not delete task. Please try again.");
      setTimeout(() => setInlineError(null), 3000);
    }
  };

  const handleToggleStatus = async (task) => {
    setInlineError(null);
    const newStatus = task.status === "Completed" ? "Pending" : "Completed";
    const prevTasks = [...tasks];
    setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));

    try {
      const res = await authFetch(`https://law-suite-wemj.onrender.com/api/tasks/${task.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
    } catch (err) {
      setTasks(prevTasks);
      setInlineError("Could not update task status.");
      setTimeout(() => setInlineError(null), 3000);
    }
  };

  const openEditDialog = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || "",
      due_date: task.due_date,
      due_time: task.due_time ? task.due_time.slice(0, 5) : "",
      priority: task.priority,
      category: task.category,
      status: task.status,
      client_name: task.client_name || "",
      case_title: task.case_title || ""
    });
    setFormError(null);
    setIsEditOpen(true);
  };

  const dayTasks = tasks.filter(t => t.due_date === selectedDate);
  const totalCount = dayTasks.length;
  const pendingCount = dayTasks.filter(t => t.status === "Pending").length;
  const inProgressCount = dayTasks.filter(t => t.status === "In Progress").length;
  const completedCount = dayTasks.filter(t => t.status === "Completed").length;

  let displayTasks = dayTasks;
  if (statusFilter !== "All") {
    displayTasks = displayTasks.filter(t => t.status === statusFilter);
  }
  
  displayTasks.sort((a, b) => {
    const aDone = a.status === "Completed" || a.status === "Cancelled";
    const bDone = b.status === "Completed" || b.status === "Cancelled";
    if (aDone === bDone) {
      return (a.due_time || "24:00").localeCompare(b.due_time || "24:00");
    }
    return aDone ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans mt-19 text-slate-900">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tasks</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your daily court work and personal docket.</p>
          </div>
          <Button onClick={() => { setFormData({ ...defaultForm, due_date: selectedDate }); setIsAddOpen(true); }} className="bg-slate-900 hover:bg-slate-800 text-white transition-colors duration-200 shadow-sm text-sm">
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>

        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardContent className="p-2 sm:p-4 flex items-center justify-between">
            {calendarDays.map((day) => (
              <div 
                key={day.dateStr}
                onClick={() => setSelectedDate(day.dateStr)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl cursor-pointer transition-colors duration-200 min-w-[40px] sm:min-w-[60px]
                  ${selectedDate === day.dateStr ? "bg-slate-900 text-white shadow-md" : "hover:bg-slate-100 text-slate-600"}
                `}
              >
                <span className="text-[10px] font-semibold uppercase">{day.dayName}</span>
                <span className="text-lg sm:text-xl font-bold mt-0.5">{day.dayNum}</span>
                <div className="mt-1 h-1 w-1 rounded-full">
                  {day.hasTasks && <div className={`h-1 w-1 rounded-full ${selectedDate === day.dateStr ? 'bg-white' : 'bg-slate-400'}`}></div>}
                </div>
                {day.dateStr === todayDateStr && selectedDate !== day.dateStr && (
                  <span className="text-[8px] font-bold text-amber-500 absolute -bottom-1">TODAY</span>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setStatusFilter("All")} className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold flex justify-between items-center transition-colors ${statusFilter === "All" ? "bg-slate-200 border-slate-300 text-slate-900 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <span>Total Tasks</span><span>{totalCount}</span>
          </button>
          <button onClick={() => setStatusFilter("Pending")} className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold flex justify-between items-center transition-colors ${statusFilter === "Pending" ? "bg-amber-100 border-amber-200 text-amber-900 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <span>Pending</span><span>{pendingCount}</span>
          </button>
          <button onClick={() => setStatusFilter("In Progress")} className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold flex justify-between items-center transition-colors ${statusFilter === "In Progress" ? "bg-blue-100 border-blue-200 text-blue-900 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <span>In Progress</span><span>{inProgressCount}</span>
          </button>
          <button onClick={() => setStatusFilter("Completed")} className={`flex-1 px-4 py-2.5 rounded-lg border text-xs font-semibold flex justify-between items-center transition-colors ${statusFilter === "Completed" ? "bg-emerald-100 border-emerald-200 text-emerald-900 shadow-sm" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"}`}>
            <span>Completed</span><span>{completedCount}</span>
          </button>
        </div>

        {inlineError && (
          <div className="bg-red-50 text-red-600 text-xs px-4 py-2 rounded-md border border-red-100 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> {inlineError}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin mb-2" />
            <p className="text-sm">Loading tasks...</p>
          </div>
        ) : errorMsg ? (
          <div className="flex flex-col items-center justify-center py-20 text-red-500">
            <AlertCircle className="h-8 w-8 mb-3 opacity-50" />
            <p className="text-sm mb-4">{errorMsg}</p>
            <Button variant="outline" size="sm" onClick={fetchTasks}>Try Again</Button>
          </div>
        ) : displayTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-lg shadow-sm">
            <CalendarIcon className="h-8 w-8 mb-3 text-slate-300" />
            <p className="text-sm text-slate-500">No tasks for this day.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <TooltipProvider>
              {displayTasks.map(task => {
                const isDone = task.status === "Completed" || task.status === "Cancelled";
                return (
                  <Card key={task.id} className={`group hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 border-slate-200 shadow-sm overflow-hidden flex ${isDone ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
                    <div className={`w-1 shrink-0 ${getPriorityColor(task.priority)}`}></div>
                    <CardContent className="p-4 flex-1 flex items-start gap-4">
                      
                      <div className="mt-0.5 shrink-0">
                        <Checkbox 
                          checked={task.status === "Completed"} 
                          onCheckedChange={() => handleToggleStatus(task)}
                          className="border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-sm font-semibold truncate ${isDone ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                            {task.title}
                          </h3>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-slate-100 text-slate-600 border-slate-200 font-medium">
                            {task.category}
                          </Badge>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">{task.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                          {task.due_time && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {task.due_time.slice(0, 5)}
                            </div>
                          )}
                          {task.client_name && (
                            <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <User className="h-3 w-3" /> {task.client_name}
                            </div>
                          )}
                          {task.case_title && (
                            <div className="flex items-center gap-1 bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              <Briefcase className="h-3 w-3" /> {task.case_title}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0 ml-4 h-full min-h-[50px]">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-slate-400' : 'text-slate-500'}`}>
                          {task.status}
                        </span>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(task)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent><p className="text-xs">Edit</p></TooltipContent>
                          </Tooltip>

                          <AlertDialog>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-xs">Delete</p></TooltipContent>
                            </Tooltip>
                            <AlertDialogContent className="sm:max-w-[400px] bg-white border-slate-200">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-slate-900">Delete Task</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-500 text-sm">
                                  This action cannot be undone. This will permanently delete the task "{task.title}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="text-sm border-slate-200">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteTask(task.id)} className="text-sm bg-red-600 hover:bg-red-700 text-white">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
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

      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setEditingTask(null);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] bg-white border-slate-200 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-slate-900">
              {isEditOpen ? "Edit Task" : "Add Task"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Fill out the form below to add or edit your task details.
            </DialogDescription>
          </DialogHeader>
          
          {formError && <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">{formError}</div>}
          
          <form onSubmit={(e) => handleSaveTask(e, isEditOpen)} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs text-slate-500 font-semibold uppercase">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" placeholder="E.g. File motion to dismiss" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs text-slate-500 font-semibold uppercase">Description (Optional)</Label>
              <Textarea id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="text-sm border-slate-200 shadow-sm resize-none" rows={2} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="due_date" className="text-xs text-slate-500 font-semibold uppercase">Due Date</Label>
                <Input id="due_date" type="date" required value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="due_time" className="text-xs text-slate-500 font-semibold uppercase">Time (Optional)</Label>
                <Input id="due_time" type="time" value={formData.due_time} onChange={e => setFormData({...formData, due_time: e.target.value})} className="text-sm border-slate-200 shadow-sm h-9" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-semibold uppercase">Priority</Label>
                <Select value={formData.priority} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-semibold uppercase">Category</Label>
                <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Court Work">Court Work</SelectItem>
                    <SelectItem value="Documentation">Documentation</SelectItem>
                    <SelectItem value="Client Call">Client Call</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-500 font-semibold uppercase">Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="h-9 text-sm border-slate-200 shadow-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
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
              <Button type="submit" className="text-sm bg-slate-900 hover:bg-slate-800 text-white">
                {isEditOpen ? "Update Task" : "Save Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}