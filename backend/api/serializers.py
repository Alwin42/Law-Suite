from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. BASE REGISTRATION SERIALIZER (Shared Logic) ---
class BaseRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create_user_instance(self, validated_data, role):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            full_name=validated_data.get('full_name', ''),
            contact_number=validated_data.get('contact_number', ''),
            # Only add these if they exist in data
            address=validated_data.get('address', ''),
            notes=validated_data.get('notes', ''),
            role=role
        )
        return user

# --- 2. ADVOCATE REGISTRATION ---
class AdvocateRegistrationSerializer(BaseRegistrationSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'full_name', 'contact_number')

    def create(self, validated_data):
        return self.create_user_instance(validated_data, 'ADVOCATE')

# --- 3. CLIENT REGISTRATION (No Password required in payload if handled by OTP, but here we keep structure) ---
class ClientRegistrationSerializer(serializers.ModelSerializer):
    address = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', 'contact_number', 'address', 'notes')

    def create(self, validated_data):
        # Generate random password for OTP-based users
        random_pass = User.objects.make_random_password()
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=random_pass,
            full_name=validated_data.get('full_name', ''),
            contact_number=validated_data.get('contact_number', ''),
            address=validated_data.get('address', ''),
            notes=validated_data.get('notes', ''),
            role='CLIENT'
        )
        return user

# --- 4. LOGIN SERIALIZER (Returns Role) ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = self.user.full_name
        return data

# --- 5. DATA SERIALIZERS ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'contact_number', 'role', 'is_active')

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)