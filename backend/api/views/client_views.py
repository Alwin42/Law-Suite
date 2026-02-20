from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from api.models import Client, Appointment
from api.serializers import UserSerializer

User = get_user_model()

class ActiveAdvocateListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        return User.objects.filter(role='ADVOCATE', is_active=True)

class BookAppointmentView(views.APIView):
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request):
        data = request.data
        
        advocate_id = data.get('advocate_id')
        advocate = User.objects.filter(id=advocate_id, role='ADVOCATE').first()
        if not advocate:
            return Response({"error": "Invalid Advocate selected."}, status=status.HTTP_400_BAD_REQUEST)

        email = data.get('client_email', request.user.email)
        
        client, _ = Client.objects.get_or_create(
            email=email,
            defaults={
                'full_name': data.get('client_name', request.user.full_name),
                'contact_number': data.get('client_contact', request.user.contact_number),
                'address': data.get('client_address', ''),
                'created_by': advocate 
            }
        )

        appointment = Appointment.objects.create(
            client=client,
            advocate=advocate,
            appointment_date=data.get('appointment_date'),
            appointment_time=data.get('appointment_time'),
            duration=data.get('duration'),
            purpose=data.get('purpose'),
            status='Pending'
        )

        return Response({
            "message": "Appointment booked successfully!", 
            "appointment_id": appointment.id
        }, status=status.HTTP_201_CREATED)

class ClientCaseListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Implement Client-specific Case fetching logic
        return Response([]) 

class ClientHearingListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Implement Client-specific Hearing fetching logic
        return Response([])

class ClientPaymentListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Implement Client-specific Payment fetching logic
        return Response([])