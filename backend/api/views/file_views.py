from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.shortcuts import get_object_or_404
from ..models import AdvocateFile
from ..serializers import AdvocateFileSerializer
import cloudinary.uploader

class FileUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        files = AdvocateFile.objects.filter(user=request.user).order_by('-uploaded_at')
        serializer = AdvocateFileSerializer(files, many=True)
        return Response(serializer.data)

    def post(self, request):
        if 'file' not in request.data:
            return Response({"error": "No file provided"}, status=400)

        file_obj = request.data['file']

        try:
            # FIX: Just use 'auto'. Cloudinary handles PDFs best when allowed to auto-detect.
            upload_result = cloudinary.uploader.upload(
                file_obj, 
                resource_type="auto"
            )
            
            advocate_file = AdvocateFile.objects.create(
                user=request.user,
                name=file_obj.name,
                file_url=upload_result.get('secure_url'),
                file_type=f"{upload_result.get('resource_type')}/{upload_result.get('format', 'file')}"
            )
            
            serializer = AdvocateFileSerializer(advocate_file)
            return Response(serializer.data, status=201)

        except Exception as e:
            print(f"Upload Error: {e}")
            return Response({"error": f"Upload failed: {str(e)}"}, status=500)

class FileDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        file_obj = get_object_or_404(AdvocateFile, pk=pk, user=request.user)
        try:
            file_obj.delete()
            return Response({"message": "File deleted"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)