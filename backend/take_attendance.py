from helper_apis import *
import cv2
import numpy as np
from deepface import DeepFace
from datetime import datetime, time
import os

#check for what happens if the model server is closed and again turned on as recognized users set will be discarded.
#check for what happens if the model server is closed before attendance is logged in second time.

# Directory containing embeddings for known faces
database_path = "./media/"

recognized_users = set()  # Track users who have been checked in
last_check_out_time = {}  # Track the last check-out time for each user
out_of_sight_duration = {}  # Track the duration a user is out of sight 

def main():
    cap = cv2.VideoCapture(0)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
    
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))
        for (x, y, w, h) in faces:
            # Draw rectangle around detected face
            cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)

            # Extract and resize the face region for recognition
            face_img = frame[y:y+h, x:x+w]
            
            # Save the face image for recognition
            face_image_path = "temp_face.jpg"
            cv2.imwrite(face_image_path, face_img)
            
            try:
                # Use DeepFace.find to match detected face with known faces in the database
                results = DeepFace.find(face_image_path, db_path=database_path, enforce_detection=False, model_name="Facenet")
                print(results)

                if len(results) > 0:
                    user_name = os.path.basename(results[0]["identity"].values[0]).split(".")[0]  # Assuming filename is the username

                    if user_name not in recognized_users:
                        # First time seeing this user, mark check-in
                        timestamp = datetime.strptime(datetime.now().time(), '%H:%M:%S').time()
                        log_attendance(user_name, timestamp)
                        recognized_users.add(user_name)  # Avoid multiple check-ins for the same user
                        last_check_out_time[user_name] = datetime.strptime(datetime.now().time(), '%H:%M:%S').time()
                        cv2.putText(frame, f"Attendance marked for {user_name}", (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

                    last_check_out_time[user_name] = datetime.strptime(datetime.now().time(), '%H:%M:%S').time()
                else:
                    out_of_sight_duration[user_name] = out_of_sight_duration[user_name] if user_name in out_of_sight_duration else 0 + (datetime.strptime(datetime.now().time(), '%H:%M:%S').time() - last_check_out_time[user_name])
                    last_check_out_time[user_name] = datetime.now().time()
                    # if out_of_sight_duration[user_name] > 7200 or datetime.strptime(datetime.now().time(), '%H:%M:%S').time() >= datetime.strptime('18:00:00', '%H:%M:%S').time():  # 2 hours or 6 pm
                    if out_of_sight_duration[user_name] > 10 or datetime.strptime(datetime.now().time(), '%H:%M:%S').time() >= datetime.strptime('18:00:00', '%H:%M:%S').time():  # 2 hours or 6 pm
                        log_attendance(user_name, check_out_time=last_check_out_time[user_name], out_of_sight_duration=out_of_sight_duration[user_name])

                cv2.putText(frame, "Face not recognized", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            except Exception as e:
                print(f"Error in face recognition: {e}")

        cv2.imshow("Attendance System", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()

    # initialize_daily_attendance()
    # log_attendance("test", datetime.now().time())
    

if __name__ == "__main__":
    main()
