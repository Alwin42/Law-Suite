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
    
class Client(models.Model):
    # DFD: client_id is handled automatically by Django as 'id'
    full_name = models.CharField(max_length=255)
    contact_number = models.CharField(max_length=20)
    email = models.EmailField()
    address = models.TextField()
    notes = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # DFD: created_by (FK)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')

    def __str__(self):
        return f"{self.full_name} ({self.email})"

class Case(models.Model):
    # DFD Choices for specific fields
    CASE_TYPES = [
        ('Civil', 'Civil'),
        ('Criminal', 'Criminal'),
        ('Corporate', 'Corporate'),
        ('Family', 'Family'),
        ('Property', 'Property'),
    ]
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('Pending', 'Pending'),
        ('Closed', 'Closed'),
        ('Decree', 'Decree'),
    ]

    # DFD Attributes
    case_number = models.CharField(max_length=50, unique=True)
    case_title = models.CharField(max_length=255) 
    case_type = models.CharField(max_length=50, choices=CASE_TYPES, default='Civil')
    court_name = models.CharField(max_length=255) 
    filing_date = models.DateField(null=True, blank=True) 
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Open')
    next_hearing = models.DateField(null=True, blank=True)
    # DFD Foreign Keys
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='cases') 
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='cases') 
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True) # New field from DFD

    def __str__(self):
        return f"{self.case_number} - {self.case_title}"
    
class Appointment(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Confirmed', 'Confirmed'),
        ('Cancelled', 'Cancelled'),
        ('Completed', 'Completed')
    ]
    # Foreign Keys
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='appointments')
    advocate = models.ForeignKey(User, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateField()
    appointment_time = models.TimeField()
    duration = models.CharField(max_length=50, default="30 Mins")
    purpose = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Appointment: {self.client.full_name} with {self.advocate.full_name} on {self.appointment_date}"

class Template(models.Model):
    
    # template_id is handled automatically as 'id'
    template_name = models.CharField(max_length=255)
    category = models.CharField(max_length=100) 
    file_path = models.FileField(upload_to='case_templates/') # Stores the file path
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Foreign Key
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='templates')

    def __str__(self):
        return self.template_name