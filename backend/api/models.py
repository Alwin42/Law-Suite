from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    # Roles as defined in your requirement analysis
    ROLE_CHOICES = (
        ('ADMIN', 'Admin'),
        ('ADVOCATE', 'Advocate'),
        ('STAFF', 'Staff'),
    )
    
    # Extending default fields
    full_name = models.CharField(max_length=255)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='STAFF')
    contact_number = models.CharField(max_length=15, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    # Start/End date are handled by AbstractUser's date_joined and last_login
    
    def __str__(self):
        return f"{self.username} ({self.role})"