# backend/api/views/task_views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from api.models import Task, Reminder, Case, Appointment, Payment
from api.serializers import TaskSerializer, ReminderSerializer

class TaskListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user).order_by('due_date', 'due_time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UnifiedCalendarView(APIView):
    """Aggregates all dates into one unified Google Calendar style feed"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        events = []

        # 1. Add Hearings
        for case in Case.objects.filter(created_by=user, next_hearing__isnull=False):
            events.append({
                'id': f"hearing_{case.id}", 'title': f"Hearing: {case.case_title}",
                'start': case.next_hearing, 'end': case.next_hearing,
                'type': 'hearing', 'color': '#ef4444' # Red
            })

        # 2. Add Appointments
        for appt in Appointment.objects.filter(advocate=user, status='Confirmed'):
            dt = f"{appt.appointment_date}T{appt.appointment_time}"
            events.append({
                'id': f"appt_{appt.id}", 'title': f"Meeting: {appt.client.full_name}",
                'start': dt, 'end': dt, 'type': 'appointment', 'color': '#3b82f6' # Blue
            })

        # 3. Add Payments Due
        for pay in Payment.objects.filter(client__created_by=user, status='Pending', due_date__isnull=False):
            events.append({
                'id': f"pay_{pay.id}", 'title': f"Payment Due: {pay.client.full_name}",
                'start': pay.due_date, 'end': pay.due_date,
                'type': 'payment', 'color': '#f59e0b' # Amber/Orange
            })

        # 4. Add Tasks
        for task in Task.objects.filter(user=user, status__in=['Pending', 'In Progress']):
            dt = f"{task.due_date}T{task.due_time}" if task.due_time else task.due_date
            events.append({
                'id': f"task_{task.id}", 'title': task.title,
                'start': dt, 'end': dt, 'type': 'task', 'color': '#10b981' # Green
            })

        return Response(events)
    
class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    """View, Update, or Delete a specific task"""
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)

class ReminderListCreateView(generics.ListCreateAPIView):
    """List all reminders or allow the advocate to manually create a custom reminder"""
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Fetch reminders sorted by the trigger date (newest/upcoming first)
        return Reminder.objects.filter(user=self.request.user).order_by('-trigger_date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReminderDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Used to mark reminders as 'read' or 'resolved', or delete them"""
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)