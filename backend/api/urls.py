from django.urls import path
from .views import (
    AdvocateRegisterView, 
    ClientRegisterView, 
    RequestOTPView, 
    VerifyOTPView,
    CustomTokenObtainPairView,
    ActiveAdvocateListView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Auth - Advocate
    path('register/advocate/', AdvocateRegisterView.as_view(), name='register_advocate'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # Auth - Client
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    
    # OTP - THESE MUST MATCH your frontend API calls
    path('auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),

    # Tokens & Data
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('advocates/active/', ActiveAdvocateListView.as_view(), name='active_advocates'),
]