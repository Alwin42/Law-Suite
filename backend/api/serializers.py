from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()

# --- 1. BASE REGISTRATION SERIALIZER ---
class BaseRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create_user_instance(self, validated_data, role):
        # Separate standard fields
        username = validated_data['username']
        email = validated_data['email']
        password = validated_data['password']
        
        # Create user instance
        user = User.objects.create_user(username=username, email=email, password=password)
        
        # Assign extra fields explicitly
        user.full_name = validated_data.get('full_name', '')
        user.contact_number = validated_data.get('contact_number', '')
        user.address = validated_data.get('address', '')
        user.notes = validated_data.get('notes', '')
        user.role = role
        user.save()
        
        return user

# --- 2. ADVOCATE REGISTRATION ---
class AdvocateRegistrationSerializer(BaseRegistrationSerializer):
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'full_name', 'contact_number')

    def create(self, validated_data):
        return self.create_user_instance(validated_data, 'ADVOCATE')

# --- 3. CLIENT REGISTRATION ---
class ClientRegistrationSerializer(serializers.ModelSerializer):
    # Password is NOT required in request (we generate it)
    address = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'full_name', 'contact_number', 'address', 'notes')

    def create(self, validated_data):
        # Generate a random 16-char password for clients (since they use OTP)
        random_password = User.objects.make_random_password()
        validated_data['password'] = random_password
        
        # Use a simplified creation logic for clients
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=random_password
        )
        user.full_name = validated_data.get('full_name', '')
        user.contact_number = validated_data.get('contact_number', '')
        user.address = validated_data.get('address', '')
        user.notes = validated_data.get('notes', '')
        user.role = 'CLIENT'
        user.save()
        return user

# --- 4. LOGIN SERIALIZER ---
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['full_name'] = user.full_name
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role'] = self.user.role
        data['full_name'] = self.user.full_name
        return data

# --- 5. DATA SERIALIZERS ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'contact_number', 'role', 'is_active', 'address')

class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)