import json
import os
from channels.generic.websocket import AsyncWebsocketConsumer
from dotenv import load_dotenv
from together import Together
from .models import Message
from channels.db import database_sync_to_async

load_dotenv()

# Initialize the Together client
client = Together(api_key=os.environ.get("TOGETHER_API_KEY"))

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'chat_{self.room_name}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message_content = text_data_json['message']
        sender = text_data_json['sender']

        await self.save_message(sender, self.room_name, message_content)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message_content,
                'sender': sender
            }
        )

        try:
            response = client.chat.completions.create(
                model="meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
                max_tokens=100,
                messages=[{"role": "user", "content": message_content}]
            )
            ai_message = response.choices[0].message.content
        except Exception as e:
            ai_message = f"Error getting AI response: {e}"

        await self.save_message('AI', self.room_name, ai_message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': ai_message,
                'sender': 'AI'
            }
        )

    async def chat_message(self, event):
        message = event['message']
        sender = event['sender']

        await self.send(text_data=json.dumps({
            'message': message,
            'sender': sender
        }))

    @database_sync_to_async
    def save_message(self, sender, room, content):
        Message.objects.create(sender=sender, room=room, content=content)
