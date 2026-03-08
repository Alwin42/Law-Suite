from django.contrib.auth import get_user_model
from django.utils.crypto import get_random_string
from rest_framework import generics, permissions
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from ..models import Appointment, Case, Payment, LoginOTP
from api.serializers import AppointmentSerializer, CaseSerializer , PaymentSerializer
from rest_framework import serializers 
from api.models import Client
# Import our Brevo utility function 
from api.utils import send_brevo_otp_email

User = get_user_model()

# ==========================================
# 1. CUSTOM PERMISSIONS
# ==========================================
class IsStaffPermission(permissions.BasePermission):
    """
    Allows access only to authenticated staff users.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.role == 'STAFF')
        )

# ==========================================
# 2. STAFF AUTHENTICATION VIEWS
# ==========================================
class StaffRequestOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')

        if not email:
            return Response({"error": "Email is required."}, status=400)

        try:
            user = User.objects.get(email=email)
            
            if not user.is_staff and user.role != 'STAFF':
                return Response({"error": "Access Denied: Not a staff member."}, status=403)
            
            if not user.is_active:
                return Response({"error": "This staff account has been deactivated."}, status=403)

            otp_code = get_random_string(length=6, allowed_chars='0123456789')
            LoginOTP.objects.create(email=email, otp=otp_code)

            html_message = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; padding: 40px 20px; color: #18181b;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); border: 1px solid #e4e4e7;">
                    <div style="background-color: #000000; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Law Suite</h1>
                        <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 12px; font-weight: 500;">SECURE STAFF PORTAL</p>
                    </div>
                    <div style="padding: 32px;">
                        <p style="font-size: 16px; margin-top: 0;">Hello <strong>{user.full_name or "Staff"}</strong>,</p>
                        <p style="font-size: 15px; color: #52525b; line-height: 1.6;">You recently requested to sign in to your staff account. Use the verification code below to securely complete your login:</p>
                        
                        <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 24px; text-align: center; margin: 30px 0;">
                            <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #000000;">{otp_code}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #ef4444; font-weight: 600; text-align: center; margin-bottom: 0;">
                            ⏳ This code will expire in 5 minutes.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e4e4e7; margin: 32px 0;" />
                        
                        <p style="font-size: 12px; color: #71717a; line-height: 1.5; margin-bottom: 0; text-align: center;">
                            If you did not request this login code, please ignore this email or contact your system administrator immediately.<br><br>
                            <strong>Do not share this code with anyone.</strong>
                        </p>
                    </div>
                </div>
            </div>
            """

            plain_message = f"""
            Hello {user.full_name or "Staff"},

            Your secure Law Suite login OTP is: {otp_code}

            This code will expire in 5 minutes. 

            If you did not request this code, please ignore this email.
            """

            # Use Brevo to send the email
            success = send_brevo_otp_email(
                subject='Law Suite - Secure Login Code',
                plain_message=plain_message,
                html_message=html_message,
                recipient_email=email
            )

            if success:
                return Response({"message": "OTP sent successfully. Please check your email."}, status=200)
            else:
                return Response({"error": "Failed to send email via Brevo. Please try again later."}, status=500)

        except User.DoesNotExist:
            return Response({"error": "No staff account found with this email."}, status=404)


class StaffVerifyOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')

        if not email or not otp:
            return Response({"error": "Email and OTP are required."}, status=400)

        otp_record = LoginOTP.objects.filter(email=email).order_by('-created_at').first()

        if not otp_record:
            return Response({"error": "No OTP requested for this email."}, status=400)

        if otp_record.otp != otp:
            return Response({"error": "Invalid OTP. Please try again."}, status=400)
            
        if not otp_record.is_valid():
            return Response({"error": "OTP has expired. Please request a new one."}, status=400)

        try:
            user = User.objects.get(email=email)
            refresh = RefreshToken.for_user(user)

            otp_record.delete()

            return Response({
                "message": "Login successful",
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                "user": {
                    "name": user.full_name or user.username,
                    "email": user.email,
                    "role": user.role
                }
            }, status=200)

        except User.DoesNotExist:
            return Response({"error": "User no longer exists."}, status=404)

# ==========================================
# 3. STAFF DASHBOARD & MANAGEMENT VIEWS
# ==========================================
class StaffDashboardStatsView(APIView):
    # This endpoint is now protected by our custom IsStaffPermission
    permission_classes = [IsStaffPermission]

    def get(self, request):
        # 1. Calculate Top-Level Stats
        stats = {
            "pending_appointments": Appointment.objects.filter(status='Pending').count(),
            "active_cases": Case.objects.filter(status__in=['Open', 'Pending']).count(),
            "unpaid_invoices": Payment.objects.filter(status='Pending').count(),
        }

        # 2. Build the "Action Required" Task List
        tasks = []
        
        # Grab up to 3 pending appointments
        pending_appts = Appointment.objects.filter(status='Pending').order_by('appointment_date')[:3]
        for appt in pending_appts:
            tasks.append({
                "id": f"appt_{appt.id}", # Unique key for React
                "real_id": appt.id,
                "type": "appointment",
                "title": f"Approve consultation for {appt.client.full_name}",
                "time": f"{appt.appointment_date} at {appt.appointment_time}"
            })

        # Grab up to 3 pending payments
        pending_payments = Payment.objects.filter(status='Pending').order_by('-created_at')[:3]
        for pay in pending_payments:
            tasks.append({
                "id": f"pay_{pay.id}",
                "real_id": pay.id,
                "type": "payment",
                "title": f"Send payment reminder to {pay.client.full_name}",
                "time": f"Amount: ₹{pay.amount}"
            })

        # Return it all to React
        return Response({
            "stats": stats,
            "pendingTasks": tasks
        }, status=200)


class StaffCaseListView(generics.ListAPIView):
    serializer_class = CaseSerializer
    permission_classes = [IsStaffPermission]

    def get_queryset(self):
        # select_related makes the database fetch client and advocate info in a single query 
        # instead of hundreds of separate queries, making the page load lightning fast.
        return Case.objects.all().select_related('client', 'created_by').order_by('-updated_at')


class StaffCaseDetailView(generics.UpdateAPIView):
    serializer_class = CaseSerializer
    permission_classes = [IsStaffPermission]
    queryset = Case.objects.all()

class StaffPaymentListView(generics.ListAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsStaffPermission]

    def get_queryset(self):
        # Fetch all payments, optimize by joining client and case tables
        return Payment.objects.all().select_related('client', 'case').order_by('-created_at')

class StaffPaymentDetailView(generics.UpdateAPIView):
    serializer_class = PaymentSerializer
    permission_classes = [IsStaffPermission]
    queryset = Payment.objects.all()

class StaffClientSerializer(serializers.ModelSerializer):
    advocate_name = serializers.CharField(source='created_by.full_name', read_only=True, default="System")
    payment_status = serializers.SerializerMethodField()
    hearings = serializers.SerializerMethodField()
    case_status = serializers.SerializerMethodField()

    class Meta:
        model = Client
        fields = [
            'id', 'full_name', 'email', 'contact_number', 'address', 
            'is_active', 'advocate_name', 'payment_status', 'hearings', 'case_status'
        ]

    def get_payment_status(self, obj):
        # Checks if this client has any pending invoices
        if obj.payment_set.filter(status='Pending').exists():
            return "Pending Dues"
        return "Clear"

    def get_hearings(self, obj):
        # Extracts all upcoming hearing dates from all their cases
        dates = obj.case_set.filter(next_hearing__isnull=False).values_list('next_hearing', flat=True)
        return [d.strftime('%b %d, %Y') for d in dates if d]

    def get_case_status(self, obj):
        # Determines overall case status
        cases = obj.case_set.all()
        if not cases: return "No Cases"
        if cases.filter(status__in=['Open', 'Pending']).exists(): return "Active Cases"
        return "Closed"


# 2. View to List and Create Clients
class StaffClientListView(generics.ListCreateAPIView):
    serializer_class = StaffClientSerializer
    permission_classes = [IsStaffPermission]

    def get_queryset(self):
        # prefetch_related prevents database lag by loading cases and payments in a single batch
        return Client.objects.prefetch_related('case_set', 'payment_set').select_related('created_by').order_by('-created_at')

    def perform_create(self, serializer):
        # Automatically assign the staff member as the creator when adding a new client
        serializer.save(created_by=self.request.user)

# 3. View to Update and Delete Clients
class StaffClientDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StaffClientSerializer
    permission_classes = [IsStaffPermission]
    queryset = Client.objects.all()

class StaffAppointmentListView(generics.ListCreateAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffPermission]

    def get_queryset(self):
        # Staff gets to see ALL appointments across all advocates
        return Appointment.objects.all().select_related('client', 'advocate').order_by('-appointment_date')

class StaffAppointmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = AppointmentSerializer
    permission_classes = [IsStaffPermission]
    queryset = Appointment.objects.all()