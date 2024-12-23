import requests
from datetime import date, timedelta

BASE_URL = "http://localhost:8000/api/attendance/"

ATTENDANCE_DATA_SET = {}

def initialize_daily_attendance():
    """
    Initialize daily attendance by marking all employees absent.
    """
    global ATTENDANCE_DATA_SET
    ATTENDANCE_DATA_SET = {}

    try:
        response = requests.get(BASE_URL + "list-users/")

        if response.status_code == 200:
            try:
                users = response.json()
            except ValueError as e:
                print("Error parsing JSON:", e)
                return

            for user in users:
                username = user["username"]
                user_id = user["id"]

                response = requests.get(BASE_URL + "get-attendance/check-attendance/", params={"user_id": user_id, "date": date.today().strftime("%Y-%m-%d")})
                data = response.json()
                if response.status_code == 200 and data["error"] == False:
                    ATTENDANCE_DATA_SET[username] = {
                        "check_in_time": None,
                        "check_out_time": None,
                        "out_of_sight_time": timedelta(),
                        "working_hours": timedelta(),
                        "status": "A",
                        "username": username,
                        "user_id": user_id,
                    }
                if response.status_code == 200 and data["error"] == True:
                    ATTENDANCE_DATA_SET[username] = {
                        "check_in_time": None,
                        "check_out_time": None,
                        "out_of_sight_time": timedelta(),
                        "working_hours": timedelta(),
                        "username": username,
                        "user_id": user_id,
                    }
            print(ATTENDANCE_DATA_SET)
            print("Daily attendance initialized.")
            return ATTENDANCE_DATA_SET
        else:
            print("Failed to fetch users for daily attendance initialization. Status code:", response.status_code)
    except Exception as e:
        print(f"Error initializing daily attendance: {e}")


def log_attendance_on_quit(ATTENDANCE_DATA):
    """
    Log attendance for all employees based on ATTENDANCE_DATA.
    """
    try:
        for username, details in ATTENDANCE_DATA.items():
            try:
                print("username in log attendance", username)
                response = requests.get(BASE_URL + "get-attendance/get-attendance-id", params={"username": details["username"], "date": date.today().strftime("%Y-%m-%d")})
                data = response.json()
                print("data in log attendance", data)
                if response.status_code == 200:
                    if data["is_first"]:
                        payload = {
                        "check_in_time": details["check_in_time"].strftime("%H:%M:%S") if details["check_in_time"] else None,
                        "check_out_time": details["check_out_time"].strftime("%H:%M:%S") if details["check_out_time"] else None,
                        "out_of_sight_time": details["out_of_sight_time"].total_seconds(),
                        "working_hours": details["working_hours"].total_seconds(),
                        "status": details["status"],
                    }
                    else:
                        payload = {
                            "check_in_time": details["check_in_time"].strftime("%H:%M:%S") if details["check_in_time"] else None,
                            "check_out_time": details["check_out_time"].strftime("%H:%M:%S") if details["check_out_time"] else None,
                            "out_of_sight_time": details["out_of_sight_time"].total_seconds(),
                            "working_hours": details["working_hours"].total_seconds(),
                        }
                    requests.patch(BASE_URL + "get-attendance/" + str(data["id"]) + "/", json=payload)
                
                if response.status_code == 400 or response.status_code == 404:
                    payload = {
                        "check_in_time": details["check_in_time"].strftime("%H:%M:%S") if details["check_in_time"] else None,
                        "check_out_time": details["check_out_time"].strftime("%H:%M:%S") if details["check_out_time"] else None,
                        "out_of_sight_time": details["out_of_sight_time"].total_seconds(),
                        "working_hours": details["working_hours"].total_seconds(),
                        "status": details["status"],
                        "employee": details["user_id"],
                        "date": date.today().strftime("%Y-%m-%d"),
                    }
                    requests.post(BASE_URL + "get-attendance/", json=payload)
    
            except Exception as e:
                print(f"Error getting attendance id: {e}")
                continue
        print("Attendance logged successfully.")
    except Exception as e:
        print(f"Error logging attendance: {e}")