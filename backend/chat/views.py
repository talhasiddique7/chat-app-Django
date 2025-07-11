from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer

class MessageList(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        room_name = self.kwargs['room_name']
        return Message.objects.filter(room=room_name)

