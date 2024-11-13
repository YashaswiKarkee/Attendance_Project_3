from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from chat.utils.ceaser import caesar_cipher_decrypt
from accounts.models import CustomUser
from .models import Message
from .serializers import MessageSerializer
from django.contrib.auth.decorators import login_required

# chat/views.py
from django.shortcuts import render
from django.db.models import Q



# @login_required
def index(request, id):
    user_profile = CustomUser.objects.get(id=id)
    sent_messages = Message.objects.filter(sender=user_profile.id)
    received_messages = Message.objects.filter(receiver=user_profile.id)

    chatted_users = set()
    for message in sent_messages:
        chatted_users.add(message.receiver)
    for message in received_messages:
        chatted_users.add(message.sender)
    
    chatted_users = list(chatted_users)   


    return render(request, 'chat/index.html', {'chatted_users': chatted_users, 'sender_id': id})

def room(request, sender_id, receiver_id):
    # Fetch sender and receiver profiles
    sender_profile = CustomUser.objects.filter(id=sender_id).first()
    receiver_profile = CustomUser.objects.filter(id=receiver_id).first()
   
    # Fetch messages between sender and receiver
    messages = Message.objects.filter(
        Q(sender=sender_profile, receiver=receiver_profile) |
        Q(sender=receiver_profile, receiver=sender_profile)
    ).order_by('timestamp')[:50]
    
    decrypted_messages = []
    for message in messages:
        decrypted_message = caesar_cipher_decrypt(message.message, 8)
        
        # Check if sender has a profile picture, else provide a default
        if message.sender.profile_picture:
            sender_profile_picture_url = message.sender.profile_picture.url
        else:
            # Default avatar URL
            sender_profile_picture_url = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'

        decrypted_messages.append({
            'sender': message.sender,
            'message': decrypted_message,
            'sender_profile_picture': sender_profile_picture_url
        })
        print(message.message)
        
    print(decrypted_messages)

    return render(request, "chat/room.html", {
        "sender": sender_profile,
        "receiver": receiver_profile,
        "messages": decrypted_messages,
    })

class MessageListCreateAPIView(generics.ListCreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MessageRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
