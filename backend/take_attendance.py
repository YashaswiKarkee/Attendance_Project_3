import cv2
import requests
import numpy as np
from deepface import DeepFace
from datetime import datetime

# Load the face detection model (using OpenCV's pre-trained model)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

def recognize_face(frame, frame_count, last_faces):
    # Convert the frame to grayscale (required by face detection)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    recognized_faces = []

    if frame_count % 60 == 0:  # Check every 60th frame for emotion, race, age, and gender analysis
        for (x, y, w, h) in faces:
            # Crop the detected face
            face = frame[y:y + h, x:x + w]

            # Analyze the face using DeepFace
            try:
                result = DeepFace.analyze(face, actions=['emotion', 'race'])  # Only emotion and race are active for now

                # Extract emotion and race
                emotion = result[0]['dominant_emotion']
                race = result[0]['dominant_race']
                
                # Uncomment the lines below to include gender and age
                # age = result[0]['age']
                # gender = result[0]['gender']

                # Store the emotion, race, and face location
                recognized_faces.append({
                    "emotion": emotion,
                    "race": race,
                    # Uncomment the lines below if you want to store age and gender
                    # "age": age,
                    # "gender": gender,
                    "face_location": (x, y, w, h)
                })

            except Exception as e:
                print(f"Error analyzing face: {e}")
    else:
        # If it's not the 60th frame, keep the previous emotion and race information
        recognized_faces = last_faces

    return recognized_faces

def main():
    # Open a connection to the webcam (camera index 0 is the default camera)
    cap = cv2.VideoCapture(0)
    frame_count = 0  # Counter to track the number of frames processed
    last_faces = []  # Store the previous frame's detected faces and attributes

    while True:
        ret, frame = cap.read()

        if not ret:
            print("Failed to grab frame")
            break

        frame_count += 1  # Increment the frame count

        # Recognize faces in the frame, but only analyze every 60th frame
        recognized_faces = recognize_face(frame, frame_count, last_faces)

        # Draw rectangles around the faces and display the detected attributes
        for face in recognized_faces:
            (x, y, w, h) = face['face_location']
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

            # Display emotion and race
            cv2.putText(frame, f"Emotion: {face['emotion']}", (x, y - 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            cv2.putText(frame, f"Race: {face['race']}", (x, y - 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            
            # Uncomment the lines below to display age and gender when they are included
            # cv2.putText(frame, f"Age: {face['age']}", (x, y - 70), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)
            # cv2.putText(frame, f"Gender: {face['gender']}", (x, y - 90), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 0), 2)

        # Display the resulting frame
        cv2.imshow('Attendance System', frame)

        # Take attendance when 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            # Log attendance with timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            for face in recognized_faces:
                print(f"User: Detected Emotion: {face['emotion']}, Race: {face['race']} at {timestamp}")

                # Here you could call your backend to log the attendance
                # Example: requests.post('http://your-backend-url/attendance', data={"user": user_id, "time": timestamp})

        if cv2.waitKey(1) & 0xFF == ord('x'):
            break

        # Update the last_faces for the next frame
        last_faces = recognized_faces

    # Release the capture and close windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
