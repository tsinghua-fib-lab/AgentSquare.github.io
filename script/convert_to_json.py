import os

import pandas as pd
import json

tasks_type = {
    "Embodied": ["alfworld", "scienceworld", "babyai"],
    "Game": ["jericho", "pddl"],
    "Web": ["webshop", "webarena"],
    "Tools": ["tool-query", "tool-operation"],
    "Avg": ["alfworld", "scienceworld", "babyai", "jericho", "pddl", "webshop", "webarena", "tool-query", "tool-operation"]
}

model_map = ['GPT-4', 'Claude2', 'GPT-3.5-Turbo', 'GPT-3.5-Turbo-16k', 'Text-Davinci-003', 'Llama2-13b', 'Llama2-70b',
             'CodeLlama-13b', 'CodeLlama-34b', 'Vicuna-13b-16k', 'Lemur-70b', 'DeepSeek-67b', 'Mistral-7b']

task_map = {'alfworld': 'AlfWorld', 'scienceworld': 'ScienceWorld', 'babyai': 'BabyAI', 'jericho': 'Jericho', 'pddl': 'PDDL'
            , 'webshop': 'WebShop', 'webarena': 'WebArena', 'tool-operation': 'Tool-Operation', 'tool-query': 'Tool-Query'}

def process_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            data = json.loads(line)
            task_name = task_map.get(data['task_name'].lower(), data['task_name'])
            success_rate = f"{round(data['success_rate'] * 100, 1)}%"
            progress_rate = f"{round(data['progress_rate'] * 100, 1)}%"
            grounding_acc = f"{round(data['grounding_acc'] * 100, 1)}%"
            yield task_name, success_rate, progress_rate, grounding_acc

def compute_average(scores):
    if not scores:
        return {'score': '0%', 'accuracy': '0%', 'grounding': '0%'}
    avg_score = f"{round(sum(float(s['score'][:-1]) for s in scores) / len(scores), 1)}%"
    avg_accuracy = f"{round(sum(float(s['accuracy'][:-1]) for s in scores) / len(scores), 1)}%"
    avg_grounding = f"{round(sum(float(s['grounding'][:-1]) for s in scores) / len(scores), 1)}%"
    return {'score': avg_score, 'accuracy': avg_accuracy, 'grounding': avg_grounding}

def process_folder(folder_path):
    results = []
    for model in model_map:
        model_results = {}
        average_values = {
            "Embodied": [],
            "Game": [],
            "Web": [],
            "Tools": [],
            "Avg": []
        }
        model_path = os.path.join(folder_path, ("").join(model.lower().split('.')))
        if os.path.isdir(model_path):
            file_path = os.path.join(model_path, 'all_results.txt')
            for task, success_rate, progress_rate, grounding_acc in process_file(file_path):
                model_results[task] = {
                    "score": progress_rate,
                    "accuracy": success_rate,
                    "grounding": grounding_acc,
                }
                for category, tasks in tasks_type.items():
                    if task.lower() in tasks:
                        average_values[category].append(model_results[task])

        for category, tasks in tasks_type.items():
            avg_score = compute_average(average_values[category])
            model_results[category] = {
                'score': avg_score['score'],
                'accuracy': avg_score['accuracy'],
                'grounding': avg_score['grounding']
            }
        results.append({
            'model': model,
            'tasks': model_results
        })

    return results

folder_path = '../data/original_data/baseline_results'
final_results = process_folder(folder_path)

with open('../data/To_Release/main_data_new.json', 'w') as outfile:
    json.dump(final_results, outfile, indent=4)
