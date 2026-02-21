from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from api.models import Client, Appointment, Case, Payment 
from api.serializers import UserSerializer
from api.models import Client, Appointment
from api.serializers import UserSerializer
from django.utils import timezone
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
    
class ClientCaseListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Find all cases where the linked client matches the logged-in user's email
        cases = Case.objects.filter(client__email=request.user.email).select_related('created_by')
        
        # Format the data exactly how ClientDashboard.jsx expects it
        data = [{
            "id": c.id,
            "title": c.case_title,
            "lawyer_name": f"Adv. {c.created_by.full_name}" if c.created_by else "Unassigned",
            "status": c.status
        } for c in cases]
        
        return Response(data) 


class ClientHearingListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        
        # Find all future hearings for this client, ordered by closest date
        hearings = Case.objects.filter(
            client__email=request.user.email, 
            next_hearing__gte=today
        ).order_by('next_hearing')
        
        # Format the data exactly how ClientDashboard.jsx expects it
        data = [{
            "id": h.id,
            "date": str(h.next_hearing), 
            "court_name": h.court_name,
            # Since you don't have a specific 'hearing time' in your Case model yet,
            # we will pass a placeholder, or you can leave it blank.
            "time": "Time TBD by Court" 
        } for h in hearings]
        
        return Response(data)


class ClientPaymentListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch all payments linked to this client
        payments = Payment.objects.filter(client__email=request.user.email).order_by('-payment_date')
        
        # Format the data exactly how ClientDashboard.jsx expects it
        data = [{
            "id": p.id,
            "description": f"Payment for {p.case.case_title}" if p.case else p.notes or f"Retainer ({p.payment_mode})",
            "date": str(p.payment_date),
            "amount": str(p.amount)
        } for p in payments]
        
        return Response(data)