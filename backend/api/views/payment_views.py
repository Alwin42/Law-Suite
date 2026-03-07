import urllib.parse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics

# Import our new Brevo utility function 
from api.utils import send_brevo_otp_email 

from ..models import Client, Payment
from api.serializers import PaymentSerializer

class SendUPIPaymentRequestView(APIView):
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
            
            # 1. Save the pending payment to your database
            payment = Payment.objects.create(
                client=client,
                amount=amount,
                payment_date=due_date, # Reusing payment_date as the due date for now
                payment_mode='UPI',
                status='Pending',
            )

            # 2. Construct the exact UPI URI scheme
            # We must URL-encode the name and title to handle spaces securely
            advocate_name = urllib.parse.quote(request.user.full_name or request.user.username)
            encoded_title = urllib.parse.quote(f"{title} - Invoice #{payment.id}")
            
            upi_string = f"upi://pay?pa={upi_id}&pn={advocate_name}&am={amount}&cu=INR&tn={encoded_title}"
            
            # 3. Double encode the entire string to pass it to the Google QR generator
            final_qr_payload = urllib.parse.quote(upi_string)

            # Using QuickChart (Highly reliable and works perfectly with Gmail)
            qr_image_url = f"https://quickchart.io/qr?size=250&text={final_qr_payload}"

            # 4. Build the HTML Email
            html_message = f"""
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; padding: 40px 20px; color: #18181b;">
                <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e4e4e7;">
                    
                    <div style="background-color: #000000; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">Payment Request</h1>
                        <p style="color: #a1a1aa; margin: 5px 0 0 0; font-size: 12px;">FROM: {request.user.full_name.upper()}</p>
                    </div>
                    
                    <div style="padding: 32px; text-align: center;">
                        <p style="font-size: 16px; margin-top: 0; text-align: left;">Hello <strong>{client.full_name}</strong>,</p>
                        <p style="font-size: 14px; color: #52525b; text-align: left; line-height: 1.6;">A new payment request has been issued for your case. Scan the QR code below using GPay, PhonePe, or Paytm to pay instantly.</p>
                        
                        <div style="background-color: #fafafa; border: 1px solid #e4e4e7; border-radius: 8px; padding: 20px; margin: 30px 0;">
                            <p style="font-size: 12px; font-weight: bold; color: #71717a; text-transform: uppercase; margin: 0 0 10px 0;">{title}</p>
                            <h2 style="font-size: 36px; font-weight: 900; margin: 0; color: #000000;">₹{amount}</h2>
                            <p style="font-size: 12px; color: #ef4444; font-weight: bold; margin: 5px 0 20px 0;">Due by: {due_date}</p>
                            
                            <img src="{qr_image_url}" alt="UPI QR Code" style="border: 2px solid #e4e4e7; border-radius: 8px; padding: 5px; background: white;" />
                        </div>
                        
                        <p style="font-size: 12px; color: #71717a;">
                            Or pay manually to UPI ID:<br>
                            <strong>{upi_id}</strong>
                        </p>
                    </div>
                </div>
            </div>
            """

            # 5. Send the email using Brevo
            subject = f'Payment Request: {title}'
            plain_message = f'Please pay Rs. {amount} by {due_date}. UPI ID: {upi_id}'
            
            success = send_brevo_otp_email(
                subject=subject,
                plain_message=plain_message,
                html_message=html_message,
                recipient_email=client.email
            )

            if success:
                return Response({"message": "Payment request sent successfully!"}, status=200)
            else:
                return Response({"error": "Failed to send payment request email."}, status=500)

        except Client.DoesNotExist:
            return Response({"error": "Client not found."}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        
class PaymentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """ Allows updating the status or deleting an existing payment """
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Advocates can only modify payments attached to their own clients
        return Payment.objects.filter(client__created_by=self.request.user)