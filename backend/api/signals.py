from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from datetime import timedelta
from .models import Case, Payment, Reminder

@receiver(post_save, sender=Case)
def create_hearing_reminder(sender, instance, created, **kwargs):
    """Automatically create a reminder when a next_hearing date is set"""
    if instance.next_hearing:
        # Create a reminder triggered 1 day before the hearing at 9:00 AM
        trigger_dt = timezone.datetime.combine(instance.next_hearing, timezone.datetime.min.time())
        trigger_dt = timezone.make_aware(trigger_dt) - timedelta(days=1) + timedelta(hours=9)

        # Avoid creating duplicate reminders for the same hearing date
        Reminder.objects.get_or_create(
            user=instance.created_by,
            case_title=instance.case_title,
            reminder_type='Hearing',
            trigger_date=trigger_dt,
            defaults={
                'title': f"Hearing Tomorrow: {instance.case_title}",
                'message': f"You have a hearing scheduled tomorrow at {instance.court_name} for case {instance.case_number}.",
                'client_name': instance.client.full_name if instance.client else None,
            }
        )

@receiver(post_save, sender=Payment)
def create_payment_reminder(sender, instance, created, **kwargs):
    """Automatically create a reminder when a payment is created with a due date"""
    if instance.status == 'Pending' and instance.due_date and instance.advocate:
        trigger_dt = timezone.datetime.combine(instance.due_date, timezone.datetime.min.time())
        trigger_dt = timezone.make_aware(trigger_dt) + timedelta(hours=10) # 10 AM on Due Date

        Reminder.objects.get_or_create(
            user=instance.advocate,
            client_name=instance.client.full_name,
            reminder_type='Payment',
            trigger_date=trigger_dt,
            defaults={
                'title': f"Payment Due: ₹{instance.amount}",
                'message': f"Payment of ₹{instance.amount} is due today from {instance.client.full_name}.",
                'case_title': instance.case.case_title if instance.case else None,
            }
        )