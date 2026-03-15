from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AdvocateHearingListView, TemplateDetailView, DocumentListCreateView, 
    CaseDocumentListView, AdvocateRegisterView, CaseListCreateView, ClientRegisterView,
    DashboardStatsView, RequestOTPView, UpdateAppointmentStatusView, VerifyOTPView, 
    CustomTokenObtainPairView, ActiveAdvocateListView, UserProfileView, AdvocatePaymentListView,
    ClientCaseListView, ClientHearingListView, ClientPaymentListView, TemplateListCreateView,
    CaseDetailView, AdvocateAppointmentListView, ClientListCreateView, BookAppointmentView, ClientDocumentListCreateView,
    ClientDetailView, AdvocateClientCasesView, ClientPaymentListCreateView, ClientFullCaseListView, ClientCaseDetailView
)
from .views.file_views import FileUploadView, FileDeleteView 
from .views.staff_views import StaffRequestOTPView, StaffVerifyOTPView, StaffDashboardStatsView
from .views.appointment_views import AppointmentListCreateView, AppointmentDetailView
from .views.chatbot_views import GroqRAGChatbotView
from .views import staff_views

# CLEANED: Consolidated all payment imports into one block
from .views.payment_views import (
    RequestPaymentView, 
    PaymentDetailView,
    PublicPaymentDetailView, 
    CreateRazorpayOrderView, 
    VerifyRazorpayPaymentView
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

    # Appointments (General)
    path('advocate/appointments/', AdvocateAppointmentListView.as_view(), name='advocate-appointments'),
    path('appointments/<int:pk>/status/', UpdateAppointmentStatusView.as_view(), name='update-appointment-status'),
    path('appointments/book/', BookAppointmentView.as_view(), name='book-appointment'),
    path('appointments/', AppointmentListCreateView.as_view(), name='appointment-list-create'),
    path('appointments/<int:pk>/', AppointmentDetailView.as_view(), name='appointment-detail'),

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

    # Client Portal Endpoints
    path('client/cases/', ClientCaseListView.as_view(), name='client-portal-cases'),
    path('client/hearings/', ClientHearingListView.as_view(), name='client-portal-hearings'),
    path('client/payments/', ClientPaymentListView.as_view(), name='client-portal-payments'),
    path('client/my-cases/', ClientFullCaseListView.as_view(), name='client-full-cases'),
    path('client/my-cases/<int:pk>/', ClientCaseDetailView.as_view(), name='client-case-detail'),
    path('client/documents/', ClientDocumentListCreateView.as_view(), name='client-documents'),
    
    # Cloud 
    path('cloud/upload/', FileUploadView.as_view(), name='cloud-upload'), # GET and POST
    path('cloud/delete/<int:pk>/', FileDeleteView.as_view(), name='cloud-delete'), # DELETE
    
    # Staff Portal
    path('staff/request-otp/', StaffRequestOTPView.as_view(), name='staff-request-otp'),
    path('staff/verify-otp/', StaffVerifyOTPView.as_view(), name='staff-verify-otp'),
    path('staff/dashboard-stats/', StaffDashboardStatsView.as_view(), name='staff-dashboard-stats'),
    
    path('staff/cases/', staff_views.StaffCaseListView.as_view(), name='staff-case-list'),
    path('staff/cases/<int:pk>/', staff_views.StaffCaseDetailView.as_view(), name='staff-case-detail'),
    
    path('staff/payments/', staff_views.StaffPaymentListView.as_view(), name='staff-payment-list'),
    path('staff/payments/<int:pk>/', staff_views.StaffPaymentDetailView.as_view(), name='staff-payment-detail'),
    
    path('staff/clients/', staff_views.StaffClientListView.as_view(), name='staff-client-list'),
    path('staff/clients/<int:pk>/', staff_views.StaffClientDetailView.as_view(), name='staff-client-detail'),
    path('staff/appointments/', staff_views.StaffAppointmentListView.as_view(), name='staff-appt-list'),
    path('staff/appointments/<int:pk>/', staff_views.StaffAppointmentDetailView.as_view(), name='staff-appt-detail'),

    # AI Chatbot Endpoint
    path('chatbot/ask/', GroqRAGChatbotView.as_view(), name='chatbot-ask'),
    
    #  Payments
    path('payments/', AdvocatePaymentListView.as_view(), name='advocate-all-payments'),
    path('payments/request-upi/', RequestPaymentView.as_view(), name='request-payment'),
    path('payments/<int:pk>/', PaymentDetailView.as_view(), name='payment-detail'), # For advocates
    path('payments/public/<int:pk>/', PublicPaymentDetailView.as_view(), name='public-payment-detail'), # For clients (Notice the /public/ path)
    path('payments/create-order/', CreateRazorpayOrderView.as_view(), name='create-razorpay-order'),
    path('payments/verify/', VerifyRazorpayPaymentView.as_view(), name='verify-razorpay-payment'),
]