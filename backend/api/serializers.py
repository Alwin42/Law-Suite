from rest_framework import serializers
from django.contrib.auth import get_user_model

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'full_name', 'contact_number', 'role')

    def create(self, validated_data):
        # This securely hashes the password before saving
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            contact_number=validated_data.get('contact_number', ''),
            role=validated_data.get('role', 'STAFF')
        )
        return user