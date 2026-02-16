from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdvocateRegisterView,
    CaseListCreateView, 
    ClientRegisterView,
    DashboardStatsView, 
    RequestOTPView, 
    VerifyOTPView,
    CustomTokenObtainPairView,
    ActiveAdvocateListView,
    UserProfileView,
    ClientCaseListView,
    ClientHearingListView,
    ClientPaymentListView,
    CaseDetailView,
    ClientListCreateView 
)

urlpatterns = [
    # Auth
    path('register/advocate/', AdvocateRegisterView.as_view(), name='register_advocate'),
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # OTP - These are perfectly mapped now!
    path('auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),

    # Tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Data - Public
    path('advocates/active/', ActiveAdvocateListView.as_view(), name='active_advocates'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    
    # Client Dashboard Endpoints
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),    
    path('client/cases/', ClientCaseListView.as_view(), name='client-cases'),
    path('client/hearings/', ClientHearingListView.as_view(), name='client-hearings'),
    path('client/payments/', ClientPaymentListView.as_view(), name='client-payments'),
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'),
]