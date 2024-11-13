import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from accounts.models import CustomUser
from .models import Message
from chat.utils.ceaser import caesar_cipher_encrypt

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.roomName = self.scope["url_route"]["kwargs"]["roomName"]

        self.room_group_name = f"chat_{self.roomName}"

        # Join room group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)

        await self.accept()
        

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        print(text_data)
        text_data_json = json.loads(text_data)
        message = text_data_json["message"]
        sender_id = text_data_json["sender_id"]
        receiver_id = text_data_json["receiver_id"]

        # Get sender and receiver profiles
        sender = await self.get_user_profile_by_id(sender_id)
        receiver = await self.get_user_profile_by_id(receiver_id)

        # Save message to the database
        if sender and receiver:
            await self.save_message(sender, receiver, message)

        # Send message to room group
        await self.channel_layer.group_send(
            self.room_group_name, {"type": "chat.message", "message": message, "sender_id": sender_id, "receiver_id": receiver_id}
        )

    # Receive message from room group
    async def chat_message(self, event):
        print(event)
        message = event["message"]
        sender_id = event["sender_id"]
        receiver_id = event["receiver_id"]
        sender = await self.get_user_profile_by_id(sender_id)

        # Check if sender has a profile picture, otherwise use a default one
        sender_pic = sender.profile_picture.url if sender.profile_picture else 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'
        sender_name = sender.username
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            "message": message,
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "sender_pic": sender_pic,
            "sender_name": sender_name  # Add the sender's name here

        }))


    @database_sync_to_async
    def get_user_profile_by_id(self, id):
        try:
            return CustomUser.objects.get(id=id)
        except CustomUser.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        cipherText = caesar_cipher_encrypt(message, 8)
        return Message.objects.create(sender=sender, receiver=receiver, message=cipherText)
        
    # @database_sync_to_async
    # def get_old_messages(self, sender, receiver):
    #     # Get the last 50 messages between the sender and receiver
    #     return list(Message.objects.filter(
    #         sender=sender, receiver=receiver
    #     ).order_by('-timestamp')[:50])

    # async def send_old_messages(self):
    #     sender = await self.get_user_profile_by_id(self.sender_id)
    #     receiver = await self.get_user_profile_by_id(self.receiver_id)

    #     if sender and receiver:
    #         old_messages = await self.get_old_messages(sender, receiver)
    #         for message in reversed(old_messages):
    #             print(message.sender)
    #             sender_pic = message.sender.profile_picture
    #             await self.send(text_data=json.dumps({
    #                 "message": message.message,
    #                 "sender_pic": sender_pic
    #             }))
