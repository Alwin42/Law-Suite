from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from api.models import Appointment
from api.serializers import AppointmentSerializer

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. Staff sees ALL appointments
        if user.is_staff or user.role == 'STAFF':
            return Appointment.objects.all().order_by('-appointment_date', '-appointment_time')
            
        # 2. Advocate sees only their own appointments
        elif user.role == 'ADVOCATE':
            return Appointment.objects.filter(advocate=user).order_by('-appointment_date', '-appointment_time')
            
        # 3. Client sees only their own appointments 
        return Appointment.objects.filter(client__email=user.email).order_by('-appointment_date')

    # --- Auto-Inject Logged-in User Data ---
    def perform_create(self, serializer):
        user = self.request.user
        
        # pass the logged-in user's data directly to the serializer behind the scenes.
        # This securely links the appointment without trusting frontend text inputs!
        serializer.save(
            client_name=getattr(user, 'full_name', user.username),
            client_email=user.email,
            client_contact=getattr(user, 'contact_number', getattr(user, 'phone', 'No Phone'))
        )

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Handles the PATCH requests for Rescheduling and Status Changes"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    # Staff can modify any appointment
    queryset = Appointment.objects.all()