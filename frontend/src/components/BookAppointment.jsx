import * as React from "react";
import { format } from "date-fns";
import { 
    Calendar as CalendarIcon, 
    User, Phone, Mail, MapPin, CheckCircle2 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- API & HOOKS ---
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getActiveAdvocates } from "../api"; 

// --- UI COMPONENTS ---
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "./ui/ card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select"; 

export default function BookAppointment() {
  const [date, setDate] = useState();
  const [advocates, setAdvocates] = useState([]);
  const [selectedAdvocate, setSelectedAdvocate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await getActiveAdvocates();
            const activeOnly = response.data.filter(adv => adv.is_active);
            setAdvocates(activeOnly);
        } catch (error) {
            console.error("Error fetching advocates:", error);
        }
    };
    fetchData();
  }, []);

  // --- 2. HANDLE SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !selectedAdvocate) {
        alert("Please select an advocate and a date.");
        return;
    }

    setIsLoading(true);
    const formData = new FormData(e.target);
    
    const bookingData = {
        client_name: formData.get("full_name"),
        client_email: formData.get("email"),
        client_contact: formData.get("contact"),
        client_address: formData.get("address"),
        advocate_id: selectedAdvocate,
        appointment_date: format(date, "yyyy-MM-dd"),
    };

    try {
        // Simulate API
        await new Promise(resolve => setTimeout(resolve, 1000));
        alert("Appointment Request Sent Successfully!");
        navigate("/client-dashboard");
    } catch (error) {
        alert("Failed to book appointment.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl shadow-xl border-slate-200 bg-white">
        
        {/* HEADER */}
        <CardHeader className="text-center border-b border-slate-100 pb-8">
          <div className="mx-auto w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-white shadow-lg">
            <CheckCircle2 size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Book an Appointment</CardTitle>
          <CardDescription className="text-slate-500">
            Fill in the details below to schedule your consultation.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 1: APPOINTMENT DETAILS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Select Advocate */}
                <div className="space-y-2">
                    <Label className="text-slate-700 font-semibold">Select Advocate</Label>
                    <Select onValueChange={setSelectedAdvocate} required>
                        <SelectTrigger className="bg-slate-50 border-slate-200 h-11">
                            <SelectValue placeholder="Choose Expert..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white z-50">
                            {advocates.length > 0 ? (
                                advocates.map((adv) => (
                                    <SelectItem key={adv.id} value={String(adv.id)} className="cursor-pointer">
                                        {adv.full_name}
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-3 text-sm text-slate-500 text-center">No advocates available</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Picker (FIXED: Added bg-white and z-index) */}
                <div className="space-y-2 flex flex-col">
                    <Label className="text-slate-700 font-semibold">Preferred Date</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full pl-3 text-left font-normal h-11 bg-slate-50 border-slate-200 hover:bg-slate-100",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                {date ? format(date, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        {/* THE FIX: Added 'bg-white' explicitly to force background color */}
                        <PopoverContent className="w-auto p-0 bg-white border border-slate-200 shadow-xl z-50" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                disabled={(date) =>
                                    date < new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className="bg-white rounded-md"
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="border-t border-slate-100 my-4"></div>

            {/* SECTION 2: CLIENT DETAILS */}
            <div className="space-y-6">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Client Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup icon={User} label="Full Name" name="full_name" placeholder="Ex: John Doe" required />
                    <InputGroup icon={Phone} label="Contact Number" name="contact" type="tel" placeholder="+91 98765 43210" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputGroup icon={Mail} label="Email Address" name="email" type="email" placeholder="john@example.com" required />
                    <InputGroup icon={MapPin} label="Address" name="address" placeholder="House No, Street, City" required />
                </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base bg-slate-900 text-white hover:bg-slate-800 shadow-lg mt-4" disabled={isLoading}>
                {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Component for Inputs with Icons
const InputGroup = ({ icon: Icon, label, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={props.name} className="text-slate-700 font-semibold">{label}</Label>
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Icon size={18} />
      </div>
      <Input 
        id={props.name} 
        className="pl-10 h-11 bg-slate-50 border-slate-200 focus:ring-slate-900 focus:border-slate-900" 
        {...props} 
      />
    </div>
  </div>
);