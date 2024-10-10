import json
import re
import os

def update_json_with_log(log_file_path, json_file_path):
    with open(log_file_path, 'r') as file:
        log_lines = [line.strip() for line in file if line.strip()]  # Read and remove blank lines

    with open(json_file_path, 'r', encoding='utf-8') as file:
        json_data = json.load(file)

    # Extract Task name from the log file name
    task_name = os.path.splitext(os.path.basename(log_file_path))[0]

    # Find the corresponding task in the JSON data
    task = next((item for item in json_data if item["Task"].casefold() == task_name.casefold()), None)
    if not task:
        print(f"Task '{task_name}' not found in JSON")
        return

    # Extracting the Intent
    goal = log_lines[0].split(':', 1)[1].strip()
    observation = log_lines[1].split(':', 1)[1].strip()
    task['Example']['Intent'] = f"{goal}<br>&nbsp;&nbsp;&nbsp;Init observation: {observation}"

    # Extracting Trajectory
    trajectory = ""
    previous_reward = 0.0
    for i in range(2, len(log_lines), 3):  # Process each step
        action = log_lines[i].split(':', 1)[1].strip()
        trajectory += f"<strong>&gt; {action}</strong><br>"

        observation = log_lines[i+1].split(':', 1)[1].strip()
        reward = float(log_lines[i+2].split(':', 1)[1])
        if reward > previous_reward:
            observation = f"<span style=\"color:red; white-space: pre-wrap;\">{observation} (reward: {reward})</span><br><br>"
        else:
            observation = f"<span style=\"white-space: pre-wrap;\">{observation}</span><br><br>"
        trajectory += observation
        previous_reward = reward

    task['Example']['Trajectory'] = trajectory

    # Save the updated JSON data back to the file
    with open(json_file_path, 'w', encoding='utf-8') as file:
        json.dump(json_data, file, indent=4, ensure_ascii=False)

# Example usage:

def update_all_logs_in_directory(log_dir, json_file):
    for filename in os.listdir(log_dir):
        if filename.endswith(".log"):
            log_path = os.path.join(log_dir, filename)
            update_json_with_log(log_path, json_file)

log_directory = '../data/baseline_results/gpt-35-turbo/trajectory'
json_path = '../data/To_Release/task_description.json'

update_all_logs_in_directory(log_directory, json_path)

# update_json_with_log('../data/baseline_results/gpt-35-turbo/trajectory/alfworld.log', '../data/To_Release/task_description.json')
