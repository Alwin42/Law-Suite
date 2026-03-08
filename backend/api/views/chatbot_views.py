import os
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Case, Clients  # Importing both models

class GroqRAGChatbotView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # 1. RETRIEVAL: Fetch Context for both Cases and Clients
        advocate_cases = Case.objects.filter(created_by=request.user) 
        advocate_clients = Clients.objects.filter(created_by=request.user)

        # Build Context for Cases
        context_text = "### ADVOCATE'S CASE RECORDS:\n"
        if advocate_cases.exists():
            for c in advocate_cases:
                context_text += f"- Case: {c.case_title} (No. {c.case_number}), Type: {c.case_type}, Status: {c.status}, Next Hearing: {c.next_hearing}\n"
        else:
            context_text += "No active cases found.\n"

        # Build Context for Clients
        context_text += "\n### ADVOCATE'S CLIENT RECORDS:\n"
        if advocate_clients.exists():
            for cl in advocate_clients:
                # Adjust these fields (name, email, phone) to match your Clients model fields
                context_text += f"- Client: {cl.full_name}, Contact: {cl.email} | {cl.phone_number}, Total Cases: {cl.case_count if hasattr(cl, 'case_count') else 'N/A'}\n"
        else:
            context_text += "No client records found.\n"

        # 2. AUGMENTATION: Instruction manual for both data types
        system_prompt = f"""
        You are a highly intelligent legal assistant in the 'Law Suite' platform. 
        Your job is to answer the advocate's questions regarding their cases AND clients.
        
        CRITICAL RULE: Always base your answers strictly on the 'DATABASE CONTEXT' provided below. 
        If a question is about a person or case not listed, politely say you don't have that record.
        
        DATABASE CONTEXT:
        {context_text}
        """

        # 3. GENERATION
        try:
            api_key = os.environ.get("GROQ_API_KEY")
            client = Groq(api_key=api_key)
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.3-70b-versatile", # Updated to the latest stable model
                max_tokens=1000,
            )

            bot_reply = chat_completion.choices[0].message.content
            return Response({"reply": bot_reply}, status=200)

        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            return Response({"error": "AI service unavailable."}, status=500)