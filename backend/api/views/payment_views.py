import os
import urllib.parse
import razorpay
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import generics

# Import your models and serializers
from api.models import Client, Payment
from api.serializers import PaymentSerializer

# Initialize Razorpay Client using environment variables
razorpay_client = razorpay.Client(
    auth=(os.environ.get('RAZORPAY_KEY_ID'), os.environ.get('RAZORPAY_KEY_SECRET'))
)

class RequestPaymentView(APIView):
    """
    Called by the Advocate Dashboard. Creates the invoice in the DB and emails the client 
    with BOTH a UPI QR Code and a secure Razorpay checkout link.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        client_id = request.data.get('client_id')
        amount = request.data.get('amount')
        title = request.data.get('title')
        due_date = request.data.get('due_date')
        upi_id = request.data.get('upi_id') # The Advocate's UPI ID

        if not all([client_id, amount, title, due_date, upi_id]):
            return Response({"error": "All fields are required."}, status=400)

        try:
            client = Client.objects.get(id=client_id, created_by=request.user)
            
            # 1. Create the database record
            payment = Payment.objects.create(
                advocate=request.user,
                client=client,
                title=title,
                amount=amount,
                due_date=due_date, 
                upi_id=upi_id,
                payment_mode='UPI', # Default, updates if paid via Razorpay
                status='Pending',
            )

            # 2. Generate the UPI QR Code
            advocate_name = urllib.parse.quote(request.user.full_name or request.user.username)
            encoded_title = urllib.parse.quote(f"{title} - Invoice #{payment.id}")
            upi_string = f"upi://pay?pa={upi_id}&pn={advocate_name}&am={amount}&cu=INR&tn={encoded_title}"
            final_qr_payload = urllib.parse.quote(upi_string)
            qr_image_url = f"https://quickchart.io/qr?size=250&text={final_qr_payload}"

            # 3. Generate the Razorpay Web Portal Link
            payment_link = f"https://law-suite-niov.onrender.com/pay/{payment.id}"

            # 4. Build the HTML Email
            html_message = f"""
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
                <div style="max-width: 600px; margin: auto; background-color: white; padding: 30px; border-radius: 8px; border: 1px solid #eee;">
                    <h2 style="color: #333; text-align: center;">Payment Request from {request.user.full_name.upper()}</h2>
                    <p>Hello <strong>{client.full_name}</strong>,</p>
                    <p>A new payment request has been issued for your case.</p>
                    
                    <div style="background-color: #f0f4f8; padding: 20px; border-radius: 6px; text-align: center; margin: 20px 0;">
                        <h3 style="margin: 0; color: #1a202c;">{title}</h3>
                        <h1 style="margin: 10px 0; color: #1a202c;">₹{amount}</h1>
                        <p style="color: #e53e3e; margin: 0; font-weight: bold;">Due by: {due_date}</p>
                    </div>

                    <h3 style="text-align: center;">Option 1: Pay Securely via Card/NetBanking</h3>
                    <div style="text-align: center; margin: 20px 0;">
                        <a href="{payment_link}" style="background-color: #1a202c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
                            Go to Payment Portal
                        </a>
                    </div>

                    <h3 style="text-align: center; margin-top: 30px;">Option 2: Scan & Pay via UPI</h3>
                    <div style="text-align: center;">
                        <img src="{qr_image_url}" alt="UPI QR Code" style="border: 1px solid #ddd; border-radius: 4px; padding: 5px; width: 200px; height: 200px;" />
                        <p style="font-size: 12px; color: #666; margin-top: 10px;">Or pay manually to UPI ID: <strong>{upi_id}</strong></p>
                    </div>
                </div>
            </div>
            """

            # 5. Send Email via Django's SMTP (Gmail)
            send_mail(
                subject=f"Payment Request: {title}",
                message=f"Please pay Rs. {amount} by {due_date}. Pay via portal: {payment_link} or use UPI ID: {upi_id}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[client.email],
                html_message=html_message,
                fail_silently=False,
            )

            return Response({"message": "Payment requested and email sent successfully!"}, status=201)

        except Client.DoesNotExist:
            return Response({"error": "Client not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ Allows an advocate to update the status or delete an existing payment """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Advocates can only modify payments attached to their own clients
        return Payment.objects.filter(client__created_by=self.request.user)


class PublicPaymentDetailView(APIView):
    """
    Called by the Client Payment Portal to fetch invoice details. 
    Requires AllowAny because the client is not a logged-in advocate.
    """
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            payment = Payment.objects.get(pk=pk)
            return Response({
                "id": payment.id,
                "title": payment.title,
                "amount": payment.amount,
                "due_date": payment.due_date,
                "status": payment.status,
                "upi_id": payment.upi_id
            }, status=200)
        except Payment.DoesNotExist:
            return Response({"error": "Invoice not found"}, status=404)


class CreateRazorpayOrderView(APIView):
    """
    Called by the Client Payment Portal right before opening the checkout modal.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        amount = request.data.get('amount')
        payment_record_id = request.data.get('payment_record_id')

        if not amount or not payment_record_id:
            return Response({"error": "Amount and payment record ID are required"}, status=400)

        # Razorpay expects the amount in paise (multiply by 100)
        razorpay_amount = int(float(amount)) * 100 
        
        data = {
            "amount": razorpay_amount, 
            "currency": "INR",
            "receipt": f"receipt_{payment_record_id}",
            "payment_capture": 1 # Auto-capture
        }

        try:
            # Generate the order on Razorpay's servers
            razorpay_order = razorpay_client.order.create(data=data)
            
            # Save the generated order ID to your database
            payment = Payment.objects.get(id=payment_record_id)
            payment.razorpay_order_id = razorpay_order['id']
            payment.save()

            return Response(razorpay_order, status=200)
        except Payment.DoesNotExist:
            return Response({"error": "Payment record not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class VerifyRazorpayPaymentView(APIView):
    """
    Called by the Client Payment Portal after a successful transaction.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        razorpay_payment_id = request.data.get('razorpay_payment_id')
        razorpay_order_id = request.data.get('razorpay_order_id')
        razorpay_signature = request.data.get('razorpay_signature')
        payment_record_id = request.data.get('payment_record_id')

        params_dict = {
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        }

        try:
            # Cryptographically verify the signature
            razorpay_client.utility.verify_payment_signature(params_dict)
            
            # If verification passes, update the database
            payment = Payment.objects.get(id=payment_record_id)
            payment.razorpay_payment_id = razorpay_payment_id
            payment.razorpay_signature = razorpay_signature
            payment.status = 'Completed'
            payment.payment_mode = 'Razorpay' # Update mode since they didn't use the UPI QR
            payment.save()
            
            return Response({"message": "Payment verified securely"}, status=200)
        
        except razorpay.errors.SignatureVerificationError:
            return Response({"error": "Payment signature verification failed. Potential tampering."}, status=400)
        except Payment.DoesNotExist:
             return Response({"error": "Payment record not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)