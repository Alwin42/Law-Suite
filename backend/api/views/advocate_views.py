from rest_framework import views, generics, permissions
from rest_framework.response import Response
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser

from api.models import Client, Case, Appointment, Payment, Template, Document
from api.serializers import (
    CaseSerializer, ClientSerializer, PaymentSerializer, 
    DocumentSerializer, AppointmentSerializer, TemplateSerializer
)

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        active_cases = Case.objects.filter(created_by=user, status='Open').count()
        pending_hearings = Case.objects.filter(created_by=user, next_hearing__gte=today).count()
        total_clients = Client.objects.filter(created_by=user).count()
        appointments_count = Appointment.objects.filter(
            advocate=user, status__in=['Pending', 'Confirmed']
        ).count()

        recent_cases_qs = Case.objects.filter(created_by=user).order_by('-created_at')[:3]
        recent_cases = [{
            'id': c.id, 'case_title': c.case_title, 'case_number': c.case_number,
            'case_type': c.case_type, 'status': c.status, 'next_hearing': c.next_hearing, 
        } for c in recent_cases_qs]

        upcoming_hearings_qs = Case.objects.filter(created_by=user, next_hearing__gte=today).order_by('next_hearing')[:3]
        upcoming_hearings = [{
            'id': c.id, 'case_title': c.case_title, 
            'next_hearing': c.next_hearing, 'court_name': c.court_name
        } for c in upcoming_hearings_qs]

        recent_appointments_qs = Appointment.objects.filter(advocate=user).order_by('-created_at')[:3]
        recent_appointments = [{
            'id': a.id, 'client_name': a.client.full_name if a.client else "Unknown",
            'appointment_date': str(a.appointment_date), 'appointment_time': str(a.appointment_time), 
            'status': a.status
        } for a in recent_appointments_qs]

        calendar_hearings = Case.objects.filter(created_by=user, next_hearing__isnull=False).values_list('next_hearing', flat=True)
        calendar_appointments = Appointment.objects.filter(advocate=user, status__in=['Pending', 'Confirmed']).values_list('appointment_date', flat=True)

        return Response({
            'stats': {
                'active_cases': active_cases, 'pending_hearings': pending_hearings,
                'total_clients': total_clients, 'appointments_count': appointments_count,
            },
            'recent_cases': recent_cases,
            'upcoming_hearings': upcoming_hearings,
            'recent_appointments': recent_appointments, 
            'calendar_data': {
                'hearings': [str(date) for date in calendar_hearings],
                'appointments': [str(date) for date in calendar_appointments]
            },
            'user_profile': {
                'name': user.full_name if hasattr(user, 'full_name') else user.username,
                'role': user.role if hasattr(user, 'role') else 'Advocate'
            }
        })

class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(created_by=self.request.user)

class AdvocateClientCasesView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Case.objects.filter(client_id=client_id, created_by=self.request.user).order_by('-updated_at')

class ClientPaymentListCreateView(generics.ListCreateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        client_id = self.kwargs['client_id']
        return Payment.objects.filter(client_id=client_id, client__created_by=self.request.user).order_by('-payment_date')

    def perform_create(self, serializer):
        client_id = self.kwargs['client_id']
        client = Client.objects.get(id=client_id, created_by=self.request.user)
        serializer.save(client=client)

class CaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(created_by=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(created_by=self.request.user)

class AdvocateAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(advocate=self.request.user).order_by('appointment_date', 'appointment_time')

class UpdateAppointmentStatusView(generics.UpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Appointment.objects.filter(advocate=self.request.user)

class AdvocateHearingListView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Case.objects.filter(created_by=self.request.user, next_hearing__isnull=False).order_by('next_hearing')

class TemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Template.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TemplateDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Template.objects.filter(created_by=self.request.user)

class DocumentListCreateView(generics.ListCreateAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def get_queryset(self):
        return Document.objects.filter(case__created_by=self.request.user).order_by('-uploaded_at')

    def perform_create(self, serializer):
        serializer.save()

class CaseDocumentListView(generics.ListAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        case_id = self.kwargs['case_id']
        return Document.objects.filter(case_id=case_id, case__created_by=self.request.user).order_by('-uploaded_at')