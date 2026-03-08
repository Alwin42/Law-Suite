import os
from groq import Groq
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from api.models import Case 

class GroqRAGChatbotView(APIView):
    # Security: Only logged-in advocates can talk to the bot
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # 1. RETRIEVAL: Fetch Context from Django DB
        # We STRICTLY filter cases so the AI only sees cases created by the logged-in user
        advocate_cases = Case.objects.filter(created_by=request.user) 
        
        # Build a text summary of the advocate's cases
        context_text = "Here is the advocate's current database of cases:\n"
        if advocate_cases.exists():
            for c in advocate_cases:
                # Formatting the case data based on your models.py
                context_text += f"- Case Title: {c.case_title} (No. {c.case_number}), Type: {c.case_type}, Court: {c.court_name}, Status: {c.status}, Next Hearing: {c.next_hearing}\n"
        else:
            context_text += "The advocate currently has no active cases in the database.\n"

        # 2. AUGMENTATION: Combine the DB data with the user's prompt
        system_prompt = f"""
        You are a highly intelligent legal assistant embedded in the 'Law Suite' platform. 
        Your job is to answer the advocate's questions accurately.
        
        CRITICAL RULE: Always base your answers about cases strictly on the 'DATABASE CONTEXT' below. 
        If the advocate asks about a case that is NOT in the context, politely say "I cannot find that case in your current records."
        Be concise, professional, and directly answer the question.
        
        DATABASE CONTEXT:
        {context_text}
        """

        # 3. GENERATION: Send to Groq API
        try:
            api_key = os.environ.get("GROQ_API_KEY")
            if not api_key:
                return Response({"error": "Chatbot API Key is missing. Check environment variables."}, status=500)

            client = Groq(api_key=api_key)
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                model="llama-3.3-70b-versatile",
                max_tokens=1000,
            )

            bot_reply = chat_completion.choices[0].message.content

            return Response({"reply": bot_reply}, status=200)

        except Exception as e:
            print(f"Groq API Error: {str(e)}")
            return Response({"error": "Failed to connect to AI server. Please try again later."}, status=500)