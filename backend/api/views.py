from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import random
from django.utils import timezone
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail  
from django.utils.html import strip_tags
from .models import Client, Case, LoginOTP , Appointment, Template
from .serializers import (
    AdvocateRegistrationSerializer, 
    ClientRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    CaseSerializer, 
    ClientSerializer,
    UserSerializer,
    EmailSerializer, 
    OTPVerifySerializer, AppointmentSerializer, TemplateSerializer
)
from rest_framework.parsers import MultiPartParser, FormParser
User = get_user_model()

# --- 1. ADVOCATE REGISTRATION ---
class AdvocateRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = AdvocateRegistrationSerializer

# --- 2. CLIENT REGISTRATION ---
class ClientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = ClientRegistrationSerializer

# --- 3. PASSWORD LOGIN ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- 4. OTP VIEWS (For Client Login) ---
class RequestOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] # Bypasses stale tokens
    
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # 1. Check if the email exists in the CLIENT table
            client_exists = Client.objects.filter(email=email).exists()
            if not client_exists:
                return Response(
                    {"error": "No client record found with this email. Please contact your advocate."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # 2. Generate OTP
            otp_code = str(random.randint(100000, 999999))
            LoginOTP.objects.create(email=email, otp=otp_code)

            # 3. Create Professional HTML Email
            subject = 'Login Verification - Legal Suite'
            
            # Minimalist HTML Template
            html_message = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }}
                    .container {{ max-width: 480px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); overflow: hidden; border: 1px solid #e2e8f0; }}
                    .header {{ background-color: #0f172a; padding: 24px; text-align: center; }}
                    .header h1 {{ color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 2px; font-weight: 600; }}
                    .content {{ padding: 40px 32px; text-align: center; }}
                    .otp-box {{ background-color: #f1f5f9; padding: 24px; border-radius: 8px; margin: 24px 0; border: 1px dashed #cbd5e1; }}
                    .otp-code {{ font-size: 36px; font-weight: 700; color: #0f172a; letter-spacing: 6px; font-family: 'Courier New', monospace; display: block; }}
                    .footer {{ padding: 24px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>LEGAL SUITE</h1>
                    </div>
                    <div class="content">
                        <p style="color: #475569; font-size: 16px; margin-bottom: 24px;">Secure Login Verification</p>
                        <p style="color: #64748b; font-size: 14px; margin: 0;">Use the code below to access your client portal.</p>
                        
                        <div class="otp-box">
                            <span class="otp-code">{otp_code}</span>
                        </div>

                        <p style="color: #94a3b8; font-size: 13px;">This code is valid for <strong>10 minutes</strong>.<br>Do not share this code with anyone.</p>
                    </div>
                    <div class="footer">
                        &copy; 2026 Legal Suite. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text fallback for old email clients
            plain_message = strip_tags(html_message)
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            try:
                # Send HTML Email
                send_mail(
                    subject, 
                    plain_message, 
                    email_from, 
                    recipient_list, 
                    fail_silently=False, 
                    html_message=html_message 
                )
                return Response({"message": "OTP sent successfully."})
            except Exception as e:
                print(f"Error sending email: {e}")
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] # Bypasses stale tokens

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            # 1. Check OTP validity
            try:
                otp_record = LoginOTP.objects.filter(email=email).latest('created_at')
            except LoginOTP.DoesNotExist:
                return Response({"error": "No OTP found."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.otp != otp or not otp_record.is_valid():
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            # 2. Fetch Client Data
            client = Client.objects.filter(email=email).first()

            # 3. Auto-provision the official User token account
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'full_name': client.full_name if client else 'Client',
                    'role': 'CLIENT',
                }
            )
            
            # If newly created, secure it by making password unusable (OTP only)
            if created:
                user.set_unusable_password() 
                user.save()

            # 4. Login Success - Generate JWT Tokens
            refresh = RefreshToken.for_user(user)
            
            # Clean up used OTPs
            LoginOTP.objects.filter(email=email).delete()

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': user.role,
                'full_name': user.full_name
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# --- 5. DATA VIEWS ---
class ActiveAdvocateListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        return User.objects.filter(role='ADVOCATE', is_active=True)
    

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class ClientCaseListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Later, fetch real cases
        return Response([]) 


class ClientHearingListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Add Hearing model logic here later
        return Response([])


class ClientPaymentListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Add Payment model logic here later
        return Response([])
    

class ClientListCreateView(generics.ListCreateAPIView):
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Client.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


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
    

class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # 1. Fetch Counts
        active_cases = Case.objects.filter(created_by=user, status='Open').count()
        pending_hearings = Case.objects.filter(created_by=user, next_hearing__gte=today).count()
        total_clients = Client.objects.filter(created_by=user).count()

        # 2. Fetch Recent Cases (Limit 3)
        recent_cases_qs = Case.objects.filter(created_by=user).order_by('-created_at')[:3]
        recent_cases = [{
            'id': c.id,
            'case_title': c.case_title,
            'case_number': c.case_number,
            'case_type': c.case_type,
            'status': c.status,
            'next_hearing': c.next_hearing, 
        } for c in recent_cases_qs]

        # 3. Fetch Upcoming Hearings (Limit 3)
        upcoming_hearings_qs = Case.objects.filter(created_by=user, next_hearing__gte=today).order_by('next_hearing')[:3]
        upcoming_hearings = [{
            'id': c.id,
            'case_title': c.case_title,
            'next_hearing': c.next_hearing,
            'court_name': c.court_name
        } for c in upcoming_hearings_qs]

        return Response({
            'stats': {
                'active_cases': active_cases,
                'pending_hearings': pending_hearings,
                'total_clients': total_clients,
            },
            'recent_cases': recent_cases,
            'upcoming_hearings': upcoming_hearings,
            'user_profile': {
                'name': user.full_name if hasattr(user, 'full_name') else user.username,
                'role': user.role if hasattr(user, 'role') else 'Advocate'
            }
        })
    
# Appointment Booking 
class BookAppointmentView(views.APIView):
    # Allow any authenticated client to book
    permission_classes = [permissions.IsAuthenticated] 

    def post(self, request):
        data = request.data
        
        # 1. Fetch the selected Advocate (user_id FK)
        advocate_id = data.get('advocate_id')
        advocate = User.objects.filter(id=advocate_id, role='ADVOCATE').first()
        if not advocate:
            return Response({"error": "Invalid Advocate selected."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Find or Auto-Create the Client record (client_id FK)
        # We use the logged-in user's email or the form email to link the records safely
        email = data.get('client_email', request.user.email)
        
        client, _ = Client.objects.get_or_create(
            email=email,
            defaults={
                'full_name': data.get('client_name', request.user.full_name),
                'contact_number': data.get('client_contact', request.user.contact_number),
                'address': data.get('client_address', ''),
                'created_by': advocate # Link this client to the advocate
            }
        )

        # 3. Create the Appointment record
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
    
class AdvocateAppointmentListView(generics.ListAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Only return appointments booked for THIS specific advocate
        # Ordered by the soonest appointment first
        return Appointment.objects.filter(advocate=self.request.user).order_by('appointment_date', 'appointment_time')

class UpdateAppointmentStatusView(generics.UpdateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Ensure advocates can only update their own appointments
        return Appointment.objects.filter(advocate=self.request.user)
    
class DashboardStatsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # 1. Fetch Counts
        active_cases = Case.objects.filter(created_by=user, status='Open').count()
        pending_hearings = Case.objects.filter(created_by=user, next_hearing__gte=today).count()
        total_clients = Client.objects.filter(created_by=user).count()
        appointments_count = Appointment.objects.filter(
            advocate=user, 
            status__in=['Pending', 'Confirmed']
        ).count()

        # 2. Fetch Recent Cases (Limit 3)
        recent_cases_qs = Case.objects.filter(created_by=user).order_by('-created_at')[:3]
        recent_cases = [{
            'id': c.id,
            'case_title': c.case_title,
            'case_number': c.case_number,
            'case_type': c.case_type,
            'status': c.status,
            'next_hearing': c.next_hearing, 
        } for c in recent_cases_qs]

        # 3. Fetch Upcoming Hearings (Limit 3)
        upcoming_hearings_qs = Case.objects.filter(created_by=user, next_hearing__gte=today).order_by('next_hearing')[:3]
        upcoming_hearings = [{
            'id': c.id,
            'case_title': c.case_title,
            'next_hearing': c.next_hearing,
            'court_name': c.court_name
        } for c in upcoming_hearings_qs]

        # --- THE MISSING PART: Fetch Recent Appointments (Limit 3) ---
        recent_appointments_qs = Appointment.objects.filter(advocate=user).order_by('-created_at')[:3]
        recent_appointments = [{
            'id': a.id,
            'client_name': a.client.full_name if a.client else "Unknown",
            'appointment_date': str(a.appointment_date), 
            'appointment_time': str(a.appointment_time), 
            'status': a.status
        } for a in recent_appointments_qs]

        # 4. Return everything to React
        return Response({
            'stats': {
                'active_cases': active_cases,
                'pending_hearings': pending_hearings,
                'total_clients': total_clients,
                'appointments_count': appointments_count,
            },
            'recent_cases': recent_cases,
            'upcoming_hearings': upcoming_hearings,
            'recent_appointments': recent_appointments, 
            'user_profile': {
                'name': user.full_name if hasattr(user, 'full_name') else user.username,
                'role': user.role if hasattr(user, 'role') else 'Advocate'
            }
        })

class AdvocateHearingListView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Only return cases for this advocate that actually have a hearing date
        # order_by('next_hearing') puts the soonest dates at the top!
        return Case.objects.filter(
            created_by=self.request.user,
            next_hearing__isnull=False
        ).order_by('next_hearing')
    
class TemplateListCreateView(generics.ListCreateAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) # Allows handling file uploads

    def get_queryset(self):
        # Only show templates created by the logged-in advocate
        return Template.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TemplateDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = TemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # SECURITY: Ensure advocates can only delete their own templates
        return Template.objects.filter(created_by=self.request.user)