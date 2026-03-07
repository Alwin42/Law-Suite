import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
from django.conf import settings

def send_brevo_otp_email(subject, plain_message, html_message, recipient_email):
    """
    Sends a transactional email using the Brevo V3 API.
    """
    # 1. Configure the API client
    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key['api-key'] = settings.BREVO_API_KEY
    
    api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(configuration))

    # 2. Define the sender and recipient
    sender = {"name": "Law Suite", "email": settings.DEFAULT_FROM_EMAIL}
    to = [{"email": recipient_email}]

    # 3. Construct the email payload
    send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
        to=to,
        sender=sender,
        subject=subject,
        text_content=plain_message,
        html_content=html_message
    )

    # 4. Fire the API call
    try:
        api_response = api_instance.send_transac_email(send_smtp_email)
        return True
    except ApiException as e:
        print(f"Brevo API Exception: {e}")
        return False