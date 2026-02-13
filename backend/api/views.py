from rest_framework import status, views, generics, permissions ,generics, permissions
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
from .models import Client , Case , LoginOTP
from .serializers import (
    AdvocateRegistrationSerializer, 
    ClientRegistrationSerializer,
    CustomTokenObtainPairSerializer,CaseSerializer, ClientSerializer,
    UserSerializer,
    EmailSerializer,
    OTPVerifySerializer
)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from .models import Client, Case

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

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            # 1. Check if user exists
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "No account found with this email. Please register first."}, 
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
                    html_message=html_message # <--- This enables the HTML design
                )
                return Response({"message": "OTP sent successfully."})
            except Exception as e:
                print(f"Error sending email: {e}")
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            # Check OTP
            try:
                otp_record = LoginOTP.objects.filter(email=email).latest('created_at')
            except LoginOTP.DoesNotExist:
                return Response({"error": "No OTP found."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.otp != otp or not otp_record.is_valid():
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            # Login Success - Generate Token
            user = User.objects.get(email=email)
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
    # Changed to AllowAny so clients can see advocates before logging in
    permission_classes = [permissions.AllowAny] 

    def get_queryset(self):
        return User.objects.filter(role='ADVOCATE', is_active=True)
    
class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated] # Only logged-in users can see this

    def get(self, request):
        # Uses the existing UserSerializer to return name, email, role, etc.
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class ClientCaseListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # TODO: Later, fetch real cases like: cases = Case.objects.filter(client=request.user)
        # For now, return an empty list so the frontend doesn't crash
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
        # Only return clients created by the currently logged-in advocate
        return Client.objects.filter(created_by=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically set the 'created_by' field to the current user
        serializer.save(created_by=self.request.user)

class CaseListCreateView(generics.ListCreateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Filter: Show only cases created by this user
        return Case.objects.filter(created_by=self.request.user).order_by('-updated_at')

    def perform_create(self, serializer):
        # Auto-set created_by to current user
        serializer.save(created_by=self.request.user)

class CaseDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Ensure users can only edit their own cases
        return Case.objects.filter(created_by=self.request.user)
    
class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # 1. Fetch Counts
        active_cases = Case.objects.filter(created_by=user, status='Open').count()
        # Count hearings from today onwards
        pending_hearings = Case.objects.filter(created_by=user, next_hearing__gte=today).count()
        total_clients = Client.objects.filter(created_by=user).count()

        # 2. Fetch Recent Cases (Limit 3)
        recent_cases_qs = Case.objects.filter(created_by=user).order_by('-created_at')[:3]
        recent_cases = [{
            'id': c.id,
            'case_title': c.case_title,
            'case_number': c.case_number,
            'case_type': c.case_type,
            'status': c.status
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
            # Also send user details to ensure profile is accurate
            'user_profile': {
                'name': user.full_name if hasattr(user, 'full_name') else user.username,
                'role': user.role if hasattr(user, 'role') else 'Advocate'
            }
        })