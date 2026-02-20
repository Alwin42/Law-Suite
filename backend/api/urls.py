from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdvocateHearingListView, TemplateDetailView, DocumentListCreateView, 
    CaseDocumentListView, AdvocateRegisterView, CaseListCreateView, ClientRegisterView,
    DashboardStatsView, RequestOTPView, UpdateAppointmentStatusView, VerifyOTPView, 
    CustomTokenObtainPairView, ActiveAdvocateListView, UserProfileView, 
    ClientCaseListView, ClientHearingListView, ClientPaymentListView, TemplateListCreateView,
    CaseDetailView, AdvocateAppointmentListView, ClientListCreateView, BookAppointmentView,
    ClientDetailView, AdvocateClientCasesView, ClientPaymentListCreateView
)

urlpatterns = [
    # Auth
    path('register/advocate/', AdvocateRegisterView.as_view(), name='register_advocate'),
    path('register/client/', ClientRegisterView.as_view(), name='register_client'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # OTP 
    path('auth/otp/request/', RequestOTPView.as_view(), name='otp_request'),
    path('auth/otp/verify/', VerifyOTPView.as_view(), name='otp_verify'),

    # Tokens
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Data - Public & Dashboards
    path('advocates/active/', ActiveAdvocateListView.as_view(), name='active_advocates'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),    

    # Appointments
    path('advocate/appointments/', AdvocateAppointmentListView.as_view(), name='advocate-appointments'),
    path('appointments/<int:pk>/status/', UpdateAppointmentStatusView.as_view(), name='update-appointment-status'),
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),

    # Hearings 
    path('advocate/hearings/', AdvocateHearingListView.as_view(), name='advocate-hearings'),
    
    # Client List
    path('clients/', ClientListCreateView.as_view(), name='client-list-create'),
    path('clients/<int:pk>/', ClientDetailView.as_view(), name='client-detail'),
    path('clients/<int:client_id>/cases/', AdvocateClientCasesView.as_view(), name='client-cases-list'),
    path('clients/<int:client_id>/payments/', ClientPaymentListCreateView.as_view(), name='client-payments'),

    # Cases
    path('cases/', CaseListCreateView.as_view(), name='case-list-create'),
    path('cases/<int:pk>/', CaseDetailView.as_view(), name='case-detail'),

    # Templates
    path('templates/', TemplateListCreateView.as_view(), name='templates-list-create'),
    path('templates/<int:pk>/', TemplateDetailView.as_view(), name='template-detail'),

    # Documents
    path('documents/', DocumentListCreateView.as_view(), name='document-list-create'),
    path('cases/<int:case_id>/documents/', CaseDocumentListView.as_view(), name='case-document-list'),

    # Client Portal Endpoints (For Later)
    path('client/cases/', ClientCaseListView.as_view(), name='client-portal-cases'),
    path('client/hearings/', ClientHearingListView.as_view(), name='client-portal-hearings'),
    path('client/payments/', ClientPaymentListView.as_view(), name='client-portal-payments'),
]