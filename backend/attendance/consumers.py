import json
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from deepface import DeepFace
from channels.generic.websocket import AsyncWebsocketConsumer

class AttendanceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = "attendance"
        self.room_group_name = f"attendance_{self.room_name}"

        # Join the WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave the WebSocket group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        # Parse the incoming message
        data = json.loads(text_data)
        frame_data = data.get('frame', '')

        if frame_data:
            # Decode Base64 frame data
            image_data = base64.b64decode(frame_data.split(',')[1])  # Remove metadata part
            image = Image.open(BytesIO(image_data))

            # Convert image to numpy array
            frame = np.array(image)

            # Detect faces and recognize emotions
            try:
                results = DeepFace.analyze(frame, actions=['emotion', 'age', 'gender', 'race'], enforce_detection=False)
                response_data = []

                for result in results:
                    # Process each face detected
                    response_data.append({
                        'name': result.get('dominant_emotion', 'Unknown'),
                        'role': 'User',  # Placeholder for role, you can modify as needed
                        'emotion': result.get('dominant_emotion', 'Neutral'),
                    })

                # Send recognized information back to the frontend
                await self.send(text_data=json.dumps(response_data))

            except Exception as e:
                await self.send(text_data=json.dumps({
                    'error': str(e),
                    'message': 'Error processing face recognition or emotion analysis.'
                }))
