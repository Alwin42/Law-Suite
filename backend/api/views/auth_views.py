from rest_framework import status, views, generics, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail  
from django.utils.html import strip_tags
import random

# Notice the "api." prefix to correctly import from the parent directory
from api.models import Client, LoginOTP
from api.serializers import (
    AdvocateRegistrationSerializer, ClientRegistrationSerializer,
    CustomTokenObtainPairSerializer, UserSerializer,
    EmailSerializer, OTPVerifySerializer
)

User = get_user_model()

class AdvocateRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = AdvocateRegistrationSerializer

class ClientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = ClientRegistrationSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class RequestOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] 
    
    def post(self, request):
        serializer = EmailSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            client_exists = Client.objects.filter(email=email).exists()
            if not client_exists:
                return Response(
                    {"error": "No client record found with this email. Please contact your advocate."}, 
                    status=status.HTTP_404_NOT_FOUND
                )

            otp_code = str(random.randint(100000, 999999))
            LoginOTP.objects.create(email=email, otp=otp_code)

            subject = 'Login Verification - Legal Suite'
            
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
            
            plain_message = strip_tags(html_message)
            email_from = settings.EMAIL_HOST_USER
            recipient_list = [email]
            
            try:
                send_mail(subject, plain_message, email_from, recipient_list, fail_silently=False, html_message=html_message)
                return Response({"message": "OTP sent successfully."})
            except Exception as e:
                print(f"Error sending email: {e}")
                return Response({"error": "Failed to send email. Please try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyOTPView(views.APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = [] 

    def post(self, request):
        serializer = OTPVerifySerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            otp = serializer.validated_data['otp']

            try:
                otp_record = LoginOTP.objects.filter(email=email).latest('created_at')
            except LoginOTP.DoesNotExist:
                return Response({"error": "No OTP found."}, status=status.HTTP_400_BAD_REQUEST)

            if otp_record.otp != otp or not otp_record.is_valid():
                return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

            client = Client.objects.filter(email=email).first()

            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'full_name': client.full_name if client else 'Client',
                    'role': 'CLIENT',
                }
            )
            
            if created:
                user.set_unusable_password() 
                user.save()

            refresh = RefreshToken.for_user(user)
            LoginOTP.objects.filter(email=email).delete()

            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'role': user.role,
                'full_name': user.full_name
            })
            
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)