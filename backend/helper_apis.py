import requests
from datetime import date, timedelta

BASE_URL = "http://localhost:8000/api/attendance/"

# Data structure to store attendance details
ATTENDANCE_DATA = {}

def initialize_daily_attendance():
    """
    Initialize daily attendance by marking all employees absent.
    """
    global ATTENDANCE_DATA
    ATTENDANCE_DATA = {}

    try:
        response = requests.get(BASE_URL + "list-users/")
        if response.status_code == 200:
            users = response.json()
            

            for user in users:
                username = user["username"]
                user_id = user["id"]
                
                response = requests.get(BASE_URL + "check-attendance/", params={"user_id": user_id, "date": date.today().strftime("%Y-%m-%d")})
                data = response.json()
                if response.status_code == 200 and data["error"] == False:
                    ATTENDANCE_DATA[username] = {
                        "check_in_time": None,
                        "check_out_time": None,
                        "out_of_sight_time": timedelta(),
                        "working_hours": timedelta(),
                        "status": "A",
                        "username": username,
                    }

            print("Daily attendance initialized.")
        else:
            print("Failed to fetch users for daily attendance initialization.")
    except Exception as e:
        print(f"Error initializing daily attendance: {e}")


def log_attendance_on_quit():
    """
    Log attendance for all employees based on ATTENDANCE_DATA.
    """
    try:
        for username, details in ATTENDANCE_DATA.items():
            if details["attendance_id"]:
                payload = {
                    "check_in_time": details["check_in_time"],
                    "check_out_time": details["check_out_time"],
                    "out_of_sight_time": details["out_of_sight_time"].total_seconds(),
                    "working_hours": details["working_hours"].total_seconds(),
                    "status": details["status"],
                }
                requests.post(BASE_URL + "get-attendance/", json=payload)
        print("Attendance logged successfully.")
    except Exception as e:
        print(f"Error logging attendance: {e}")
