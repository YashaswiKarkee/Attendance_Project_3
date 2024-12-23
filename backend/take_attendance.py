import cv2
import os
from deepface import DeepFace
from datetime import datetime, timedelta
from helper_apis import log_attendance_on_quit, initialize_daily_attendance

# Constants
DATABASE_PATH = "./media/profile_pics/"
FRAME_SKIP = 2  
OUT_OF_SIGHT_THRESHOLD = timedelta(seconds=60)

ATTENDANCE_DATA = {}

def process_face(face_img, face_location, frame):
    """
    Recognize a face and handle attendance.
    """
    x, y, w, h = face_location

    try:
        results = DeepFace.find(
            img_path=face_img,
            db_path=DATABASE_PATH,
            model_name="Facenet",
            enforce_detection=False
        )

        if isinstance(results, list) and len(results) > 0:
            df = results[0]

            if not df.empty:
                # Sort results by the distance column to select the most similar match
                df_sorted = df.sort_values(by="distance", ascending=True)
                print("sorted", df_sorted)

                # Access the identity of the closest match (lowest distance)
                user_name = df_sorted["identity"].iloc[0]
                normalized_path = os.path.normpath(user_name)
                print("user_name_old", user_name)
                user_name = normalized_path.split(os.sep + "profile_pics" + os.sep)[1].split(os.sep)[0]
                print("user_name", user_name)
                now = datetime.now()
                print("attendance data", ATTENDANCE_DATA)

                if ATTENDANCE_DATA[user_name]["check_in_time"] is None:
                    threshold_time = now.replace(hour=9, minute=30, second=0, microsecond=0)
                    print("threshold_time", threshold_time)
                    print("now", now)
                    if now > threshold_time:
                        print("now is greater than threshold_time")
                        ATTENDANCE_DATA[user_name]["status"] = "L"  # Late
                    else:
                        ATTENDANCE_DATA[user_name]["status"] = "P"  # Present on time
                    
                    ATTENDANCE_DATA[user_name]["check_in_time"] = now

                last_seen = ATTENDANCE_DATA[user_name].get("last_seen")
                if not last_seen:
                    ATTENDANCE_DATA[user_name]["last_seen"] = now
                    ATTENDANCE_DATA[user_name]["out_of_sight_time"] = timedelta(0)
                else:
                    out_of_sight_duration = now - last_seen

                    if out_of_sight_duration > OUT_OF_SIGHT_THRESHOLD:
                        ATTENDANCE_DATA[user_name]["out_of_sight_time"] += out_of_sight_duration

                    ATTENDANCE_DATA[user_name]["last_seen"] = now

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

    except Exception as e:
        print(f"Error processing face: {e}")

def main():
    """
    Main function to capture frames, detect faces, and mark attendance.
    """
    
    global ATTENDANCE_DATA
    # Camera Index: 1 for webcam and 2 for droidcam
    cap = cv2.VideoCapture(1)
    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")

    frame_count = 0
    ATTENDANCE_DATA = initialize_daily_attendance()
    print("ATTENDANCE_DATA_initialized", ATTENDANCE_DATA)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        frame_count += 1
        if frame_count % FRAME_SKIP != 0:
            continue

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(50, 50))

        for (x, y, w, h) in faces:
            face_img = frame[y:y+h, x:x+w]
            process_face(face_img, (x, y, w, h), frame)

        cv2.imshow("Attendance System", frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            for user_name, details in ATTENDANCE_DATA.items():
                if details["check_in_time"]:
                    details["check_out_time"] = datetime.now()
                    details["working_hours"] = details["check_out_time"] - details["check_in_time"] - details["out_of_sight_time"]
            print(ATTENDANCE_DATA)
            log_attendance_on_quit(ATTENDANCE_DATA=ATTENDANCE_DATA)
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
