from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User
from .models import Client , Case


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

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    # Columns to show in the list view
    list_display = ('full_name', 'email', 'contact_number', 'is_active', 'created_by', 'created_at')
    
    # Enable search by name and email
    search_fields = ('full_name', 'email', 'contact_number')
    
    # Add sidebar filters
    list_filter = ('is_active', 'created_at', 'created_by')
    
    # Make these fields read-only (optional, but good for audit trails)
    readonly_fields = ('created_at',)
    
    # Organize the "Add/Edit" form layout
    fieldsets = (
        ('Client Details', {
            'fields': ('full_name', 'email', 'contact_number', 'address')
        }),
        ('Case Info', {
            'fields': ('notes', 'is_active')
        }),
        ('Meta Data', {
            'fields': ('created_by', 'created_at')
        }),
    )

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    # Columns to show in the case list view
    list_display = ('case_title', 'case_number', 'client', 'status', 'next_hearing', 'created_by')
    
    # Enable searching by case title, number, or court name
    search_fields = ('case_title', 'case_number', 'court_name')
    
    # Sidebar filters to quickly find open cases or cases with upcoming hearings
    list_filter = ('status', 'case_type', 'next_hearing', 'created_by')
    
    # Protect timestamp fields from being manually edited
    readonly_fields = ('created_at', 'updated_at')
    
    # Clean layout for adding/editing a case in the admin panel
    fieldsets = (
        ('Basic Information', {
            'fields': ('client', 'case_title', 'case_number', 'case_type', 'status')
        }),
        ('Court & Hearing Details', {
            'fields': ('court_name', 'next_hearing')
        }),
        ('Meta Data', {
            'fields': ('created_by', 'created_at', 'updated_at')
        }),
    )