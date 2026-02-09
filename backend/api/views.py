from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
import random

# Import models
from .models import LoginOTP

# Import ALL serializers
from .serializers import (
    AdvocateRegistrationSerializer, 
    ClientRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserSerializer,
    EmailSerializer,
    OTPVerifySerializer
)

User = get_user_model()

# --- 1. ADVOCATE REGISTRATION VIEW ---
class AdvocateRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = AdvocateRegistrationSerializer

# --- 2. CLIENT REGISTRATION VIEW ---
class ClientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = ClientRegistrationSerializer

# --- 3. CUSTOM LOGIN VIEW (Password) ---
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# --- 4. OTP VIEWS (For Client Login) ---
class RequestOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email, role='CLIENT')
            except User.DoesNotExist:
                return Response({"error": "Client with this email not found."}, status=404)

            otp_code = str(random.randint(100000, 999999))
            LoginOTP.objects.create(email=email, otp=otp_code)

            print(f"\n [OTP SERVICE] Code for {email}: {otp_code} \n")
            return Response({"message": "OTP sent."})
        return Response(serializer.errors, status=400)

class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            try:
                otp_record = LoginOTP.objects.filter(email=email).latest('created_at')
            except LoginOTP.DoesNotExist:
                return Response({"error": "Invalid OTP."}, status=400)

            if otp_record.otp != otp or not otp_record.is_valid():
                return Response({"error": "Invalid/Expired OTP."}, status=400)

            user = User.objects.get(email=email)
            refresh = RefreshToken.for_user(user)
            LoginOTP.objects.filter(email=email).delete()

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': user.role,
                'full_name': user.full_name
            })
        return Response(serializer.errors, status=400)

# --- 5. DATA VIEWS ---
class ActiveAdvocateListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return User.objects.filter(role='ADVOCATE', is_active=True)