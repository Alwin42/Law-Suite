from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import random
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail  

from .models import LoginOTP
from .serializers import (
    AdvocateRegistrationSerializer, 
    ClientRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    EmailSerializer,
    OTPVerifySerializer
)

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
            
            # CHECK: Only existing users can request OTP for login
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return Response(
                    {"error": "No account found with this email. Please register first."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            # Generate OTP
            otp_code = str(random.randint(100000, 999999))
            LoginOTP.objects.create(email=email, otp=otp_code)

            # --- SEND EMAIL (With Error Handling) ---
            subject = 'Your Login OTP - Law Suite'
            message = f'Your One-Time Password (OTP) is: {otp_code}'
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            try:
                send_mail(subject, message, email_from, recipient_list, fail_silently=False)
                return Response({"message": "OTP sent successfully."})
            except Exception as e:
                # If email fails, print error to console but don't crash app
                print(f"Error sending email: {e}")
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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