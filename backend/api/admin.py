from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# --- IMPORT ALL MODELS HERE ---
from .models import Client, Case, Appointment, Payment, Template, Document


class CustomUserAdmin(UserAdmin):
    # 1. Columns to display in the user list
    list_display = ('username', 'email', 'full_name', 'role', 'is_staff', 'is_active')
    
    # 2. Filters on the right side
    list_filter = ('role', 'is_staff', 'is_active')
    
    # 3. Fields to display when editing an existing user
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
    list_display = ('full_name', 'email', 'contact_number', 'is_active', 'created_by', 'created_at')
    search_fields = ('full_name', 'email', 'contact_number')
    list_filter = ('is_active', 'created_at', 'created_by')
    readonly_fields = ('created_at',)
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
    list_display = ('case_title', 'case_number', 'client', 'status', 'next_hearing', 'created_by')
    search_fields = ('case_title', 'case_number', 'court_name')
    list_filter = ('status', 'case_type', 'next_hearing', 'created_by')
    readonly_fields = ('created_at', 'updated_at')
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


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('client', 'advocate', 'appointment_date', 'appointment_time', 'duration', 'status')
    search_fields = ('client__full_name', 'advocate__full_name', 'purpose')
    list_filter = ('status', 'appointment_date', 'advocate')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Participants', {
            'fields': ('client', 'advocate')
        }),
        ('Schedule', {
            'fields': ('appointment_date', 'appointment_time', 'duration')
        }),
        ('Details', {
            'fields': ('purpose', 'status')
        }),
        ('Meta Data', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('client', 'amount', 'payment_date', 'payment_mode', 'status', 'receipt_number')
    search_fields = ('client__full_name', 'receipt_number', 'case__case_title')
    list_filter = ('status', 'payment_mode', 'payment_date')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Linkage', {
            'fields': ('client', 'case')
        }),
        ('Payment Details', {
            'fields': ('amount', 'payment_date', 'payment_mode', 'receipt_number')
        }),
        ('Status & Notes', {
            'fields': ('status', 'notes')
        }),
        ('Meta Data', {
            'fields': ('created_at',)
        }),
    )


# --- TEMPLATE ADMIN ---
@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):
    list_display = ('template_name', 'category', 'created_by', 'created_at')
    search_fields = ('template_name', 'category')
    list_filter = ('category', 'created_at', 'created_by')
    readonly_fields = ('created_at',)
    fieldsets = (
        ('Template Details', {
            'fields': ('template_name', 'category', 'file_path')
        }),
        ('Meta Data', {
            'fields': ('created_by', 'created_at')
        }),
    )


# --- DOCUMENT ADMIN ---
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('document_name', 'case', 'file_type', 'uploaded_at')
    # Search by document name or the linked case title
    search_fields = ('document_name', 'case__case_title', 'file_type')
    list_filter = ('file_type', 'uploaded_at')
    readonly_fields = ('uploaded_at',)
    fieldsets = (
        ('Document Details', {
            'fields': ('case', 'document_name', 'file_type', 'file_path')
        }),
        ('Meta Data', {
            'fields': ('uploaded_at',)
        }),
    )