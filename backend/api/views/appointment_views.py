from rest_framework import generics
from ..models import Appointment
from ..serializers import AppointmentSerializer
from rest_framework.permissions import IsAuthenticated

class AppointmentListCreateView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        # 1. If Staff, return ALL appointments
        if user.is_staff or user.role == 'STAFF':
            return Appointment.objects.all().order_by('-appointment_date')
            
        # 2. If Advocate, return their appointments
        elif user.role == 'ADVOCATE':
            return Appointment.objects.filter(advocate=user).order_by('-appointment_date')
            
        # 3. Otherwise (Client), return nothing or client specific logic
        return Appointment.objects.none()