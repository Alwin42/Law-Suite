from rest_framework import generics, permissions
from .serializers import UserRegistrationSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

# Registration View
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Allow non-logged in users to register
    serializer_class = UserRegistrationSerializer