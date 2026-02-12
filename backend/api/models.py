from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import datetime

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('ADVOCATE', 'Advocate'),
        ('STAFF', 'Staff'),
        ('CLIENT', 'Client'), 
    )
    
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STAFF')
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)

    # --- NEW FIELDS NEEDED FOR CLIENTS ---
    address = models.TextField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True) # For case notes
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
class LoginOTP(models.Model):
    email = models.EmailField()
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        # OTP valid for 5 minutes
        return self.created_at >= timezone.now() - datetime.timedelta(minutes=5)
    
class Client(models.Model):
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    contact_number = models.CharField(max_length=20)
    address = models.TextField()
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Link client to the specific Advocate (User) who created them
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')

    def __str__(self):
        return f"{self.full_name} ({self.email})"