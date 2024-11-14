
import requests
from datetime import datetime, date

base_url = "http://localhost:8000/api/attendance/"

def initialize_daily_attendance():
    """Function to initialize the daily attendance data"""
    try:
        response = requests.get(base_url + 'list-users/')
        if response.status_code == 200:
            data = response.json()
            
            for user in data:
                user_id = user['id']
                try:
                    response = requests.get(base_url + 'get-attendance/check-attendance?user_id=' + str(user_id) + '&date=' + str(date.today()))
                    if response.status_code == 200:
                        try:
                            response = requests.post(base_url + 'get-attendance/', data={"employee": user_id, "status": "A"})
                            print(f"Daily attendance initialized for {user['username']}.")
                        except Exception as e:
                            print(f"Error initializing daily attendance: {e}")  
                    else:
                        continue
                except Exception as e:
                    print(f"Error initializing daily attendance: {e}") 
        else:
            print("Failed to initialize daily attendance.")
    except Exception as e:
        print(f"Error initializing daily attendance: {e}")
        
def log_attendance(user_name, timestamp, **kwargs):
    """Function to send attendance data to backend"""
    timestamp_time = datetime.strptime(timestamp, '%H:%M:%S').time()
    if timestamp_time > datetime.strptime('09:30:00', '%H:%M:%S').time():
        is_late = True
    else:
        is_late = False
    try:
        response = requests.get(base_url + 'get-attendance/get-attendance-id?username=' + user_name + '&date=' + str(date.today()))
        if response.status_code == 200:
            data = response.json()
            if data.is_first:
                try:
                    if is_late:
                        response = requests.patch(base_url + 'get-attendance/' + str(data.id) + '/', data={"check_in_time": timestamp, "status": "L"})
                    else:
                        response = requests.patch(base_url + 'get-attendance/' + str(data.id) + '/', data={"check_in_time": timestamp, "status": "P"})
                except Exception as e:
                    print(f"Error updating attendance: {e}")
            if not data.is_first and 'check_out_time' in kwargs:
                try:
                    check_out_time = kwargs['check_out_time']
                    out_of_sight_duration = kwargs['out_of_sight_duration']
                    response = requests.patch(base_url + 'get-attendance/' + str(data.id) + '/', data={"check_out_time": check_out_time, "out_of_sight_time": out_of_sight_duration})
                except Exception as e:
                    print(f"Error updating attendance: {e}")
        else:
            print("Failed to get attendance id.")
    except Exception as e:
        print(f"Error logging attendance: {e}")