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
            
        # 3. Client fallback
        return Appointment.objects.none()

class AppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Handles the PATCH requests for Rescheduling and Status Changes"""
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]
    
    # Staff can modify any appointment
    queryset = Appointment.objects.all()