import requests
import json

url = "http://localhost:8000/api/generate"
payload = {
    "prompt": "sap b1 module rh",
    "schema_type": "application",
    "model": "tngtech/deepseek-r1t2-chimera:free"
}
headers = {
    "Content-Type": "application/json"
}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, json=payload, headers=headers, timeout=120)
    print(f"Status Code: {response.status_code}")
    print(f"Response Text: {response.text}")
    try:
        print(f"JSON: {response.json()}")
    except:
        print("Could not parse JSON")
except Exception as e:
    print(f"Request failed: {e}")
