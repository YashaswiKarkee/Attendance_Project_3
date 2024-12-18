import cv2
import os
from deepface import DeepFace
from datetime import datetime, timedelta
from helper_apis import log_attendance_on_quit, initialize_daily_attendance, ATTENDANCE_DATA

# Constants
DATABASE_PATH = "./media/profile_pics/"
FRAME_SKIP = 2  # Process every nth frame to improve performance

def process_face(face_img, face_location, frame):
    """
    Recognize a face and handle attendance.
    """
    x, y, w, h = face_location

    try:
        # Perform face recognition with DeepFace
        results = DeepFace.find(
            img_path=face_img,
            db_path=DATABASE_PATH,
            model_name="Facenet",
            enforce_detection=False
        )

        # Check if results are found and correctly formatted
        if isinstance(results, list) and len(results) > 0:
            # Extract the DataFrame (first element)
            df = results[0]

            if not df.empty:
                # Sort results by the distance column to select the most similar match
                df_sorted = df.sort_values(by="distance", ascending=True)
                print("sorted", df_sorted)

                # Access the identity of the closest match (lowest distance)
                user_name = df_sorted["identity"].iloc[0]
                user_name = os.path.basename(user_name).split(".")[0]
                print("user_name", user_name)
                now = datetime.now()

                # Handle Check-in (only once per user)
                if ATTENDANCE_DATA[user_name]["check_in_time"] is None:
                    # Check if employee is late (after 9:30 AM)
                    threshold_time = now.replace(hour=9, minute=30, second=0, microsecond=0)
                    if now > threshold_time:
                        ATTENDANCE_DATA[user_name]["status"] = "L"  # Mark as Late
                    ATTENDANCE_DATA[user_name]["check_in_time"] = now
                    ATTENDANCE_DATA[user_name]["status"] = "P"

                # Update last seen time and calculate out-of-sight duration
                last_seen = ATTENDANCE_DATA[user_name].get("last_seen", now)
                out_of_sight_duration = now - last_seen
                ATTENDANCE_DATA[user_name]["out_of_sight_time"] += out_of_sight_duration
                ATTENDANCE_DATA[user_name]["last_seen"] = now

                # Annotate frame: Rectangle and text with username
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
                cv2.putText(
                    frame,
                    f"Check-in: {user_name}",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 255, 0),
                    2,
                )
            else:
                # No match found, skip processing
                cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
                cv2.putText(
                    frame,
                    "Unknown",
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (0, 0, 255),
                    2,
                )

        else:
            # No results found, skip processing
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)
            cv2.putText(
                frame,
                "Unknown",
                (x, y - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2,
            )

    except Exception as e:
        print(f"Error processing face: {e}")

def main():
    """
    Main function to capture frames, detect faces, and mark attendance.
    """
    cap = cv2.VideoCapture(2)  # Use correct index for DroidCam or other cameras
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    frame_count = 0
    initialize_daily_attendance()

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % FRAME_SKIP != 0:
            continue  # Skip processing some frames to improve efficiency

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))

        # Process each face sequentially
        for (x, y, w, h) in faces:
            face_img = frame[y:y+h, x:x+w]
            process_face(face_img, (x, y, w, h), frame)

        # Show the frame with the annotations
        cv2.imshow("Attendance System", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            # Log attendance for all recognized users
            for user_name, details in ATTENDANCE_DATA.items():
                if details["check_in_time"]:
                    details["check_out_time"] = datetime.now()
                    details["working_hours"] = details["check_out_time"] - details["check_in_time"] - details["out_of_sight_time"]
            print(ATTENDANCE_DATA)
            log_attendance_on_quit()
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
