import cv2
import requests
import numpy as np
from deepface import DeepFace
from datetime import datetime
import os

# Load the face detection model (using OpenCV's pre-trained model)
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Path to the directory where user images are stored for recognition
USER_IMAGES_DIR = './media/'

def recognize_face(frame, frame_count, last_faces):
    # Convert the frame to grayscale (required by face detection)
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)

    recognized_faces = []

    if frame_count % 60 == 0:  # Check every 1th frame for emotion, race, and user recognition
        for (x, y, w, h) in faces:
            # Crop the detected face
            face = frame[y:y + h, x:x + w]

            # Save the face image for recognition
            face_image_path = "temp_face.jpg"
            cv2.imwrite(face_image_path, face)

            # Analyze the face to recognize the user (find the closest match)
            try:
                # Compare the detected face with known user images in the directory
                result = DeepFace.find(face_image_path, db_path=USER_IMAGES_DIR, model_name='VGG-Face')

                if result:
                    # The first match (closest match) will be at index 0
                    # Extracting username from the image filename (excluding path and extension)
                    user_name = os.path.splitext(os.path.basename(result[0]['identity'][0]))[0]
                    recognized_faces.append({
                        "user_name": user_name,
                        "face_location": (x, y, w, h),
                    })

                else:
                    print("No match found for the detected face.")
                    recognized_faces.append({
                        "user_name": "Unknown",
                        "face_location": (x, y, w, h),
                    })

            except Exception as e:
                print(f"Error during face recognition: {e}")
                # Analyze the face for emotion and race if not recognized
                try:
                    analysis = DeepFace.analyze(face_image_path, actions=['emotion', 'race'])
                    emotion = analysis['emotion']['dominant_emotion']
                    race = analysis['race']['dominant_race']
                    print(f"Emotion: {emotion}, Race: {race}")
                    recognized_faces.append({
                        "user_name": "Unknown",
                        "face_location": (x, y, w, h),
                        "emotion": emotion,
                        "race": race,
                    })
                except Exception as e:
                    print(f"Error during emotion and race analysis: {e}")
                    recognized_faces.append({
                        "user_name": "Error",
                        "face_location": (x, y, w, h),
                })

    else:
        recognized_faces = last_faces

    return recognized_faces, faces

def log_attendance(user_name, timestamp):
    """Function to send attendance data to backend"""
    try:
        # Send the attendance data to your backend
        attendance_data = {
            "user": user_name,  # The user's identifier (e.g., username)
            "time": timestamp,  # Timestamp for when the attendance was taken
        }
        print(attendance_data)
        # response = requests.post('http://your-backend-url/attendance', data=attendance_data)

        # if response.status_code == 200:
        #     print(f"Attendance logged for {user_name} at {timestamp}")
        # else:
        #     print("Failed to log attendance.")

    except Exception as e:
        print(f"Error sending attendance data: {e}")

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
        recognized_faces, faces = recognize_face(frame, frame_count, last_faces)

        # Draw rectangles around all detected faces
        for (x, y, w, h) in faces:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

        # Display the detected attributes for recognized faces
        for face in recognized_faces:
            (x, y, w, h) = face['face_location']
            print(f"User: {face['user_name']}")
            # Display user name
            cv2.putText(frame, f"User: {face['user_name']}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)

        # Display the resulting frame
        cv2.imshow('Attendance System', frame)

        # Take attendance when 'q' is pressed
        if cv2.waitKey(1) & 0xFF == ord('q'):
            # Log attendance with timestamp
            timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            for face in recognized_faces:
                print(f"User: {face['user_name']} at {timestamp}")
                # Log attendance for the recognized user
                log_attendance(face['user_name'], timestamp)

        if cv2.waitKey(1) & 0xFF == ord('x'):
            break

        # Update the last_faces for the next frame
        last_faces = recognized_faces

    # Release the capture and close windows
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
