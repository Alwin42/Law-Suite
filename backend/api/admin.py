from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

class CustomUserAdmin(UserAdmin):
    # 1. Columns to display in the user list
    list_display = ('username', 'email', 'full_name', 'role', 'is_staff', 'is_active')
    
    # 2. Filters on the right side
    list_filter = ('role', 'is_staff', 'is_active')
    
    # 3. Fields to display when editing an existing user
    # We append your custom fields to the default 'Personal info' section
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'full_name', 'contact_number')}),
    )
    
    # 4. Fields to display when creating a NEW user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('role', 'full_name', 'contact_number')}),
    )
    
    # 5. Search capability
    search_fields = ('username', 'email', 'full_name', 'contact_number')

# Register the model
admin.site.register(User, CustomUserAdmin)