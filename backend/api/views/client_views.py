from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.shortcuts import get_object_or_404

# Cleaned up and consolidated imports
from api.models import Client, Appointment, Document, Case, Payment 
from api.serializers import UserSerializer, CaseSerializer, DocumentSerializer

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

class ClientFullCaseListView(generics.ListAPIView):
    """Returns the full list of cases for the client page"""
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only return cases matching the logged-in client's email
        return Case.objects.filter(client__email=self.request.user.email).order_by('-updated_at')

class ClientCaseDetailView(generics.RetrieveAPIView):
    """Returns the specific details of a single case for the client"""
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Ensure they can only retrieve IDs that belong to their email
        return Case.objects.filter(client__email=self.request.user.email)

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
            "case_title": h.case_title,
            "date": str(h.next_hearing), 
            "court_name": h.court_name,
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
            "description": p.title,
            "title": p.title,  
            "due_date": p.due_date,
            "date": str(p.payment_date),
            "amount": str(p.amount)
        } for p in payments]
        
        return Response(data)

class ClientDocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) 

    def get_queryset(self):
        # Fetch all documents linked to cases that belong to this client
        return Document.objects.filter(case__client__email=self.request.user.email).order_by('-uploaded_at')

    def perform_create(self, serializer):
        case_id = self.request.data.get('case')
        
        # FIXED: Prevents a 500 server crash if case_id is invalid
        case = get_object_or_404(Case, id=case_id)
        
        # Security Check: Ensure client owns the case they are uploading to
        if case.client.email != self.request.user.email:
            raise permissions.PermissionDenied("You cannot upload to this case.")
            
        serializer.save()