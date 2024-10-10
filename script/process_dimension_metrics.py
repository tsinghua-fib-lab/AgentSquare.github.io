import os
import json
tasks_type = {
    "embodied": ["alfworld", "scienceworld", "babyai"],
    "game": ["jericho", "pddl"],
    "web": ["webshop", "webarena"],
    "tool": ["tool-query", "tool-operation"],
    "all": ["alfworld", "scienceworld", "babyai", "jericho", "pddl", "webshop", "webarena", "tool-query", "tool-operation"]
}

dimension_scoring = {  
            "Memory": {"alfworld": 1, "scienceworld": 2, "babyai": 1, "jericho": 1, "pddl": 2, "webshop": 1, "webarena": 3, "tool-query": 2, "tool-operation": 3},  
            "Planning": {"alfworld": 1, "scienceworld": 2, "babyai": 2, "jericho": 3, "pddl": 3, "webshop": 2, "webarena": 3, "tool-query": 2, "tool-operation": 2},  
            "World Modeling": {"alfworld": 3, "scienceworld": 3, "babyai": 2, "jericho": 3, "pddl": 1, "webshop": 1, "webarena": 3, "tool-query": 1, "tool-operation": 1},  
            "Self-reflection": {"alfworld": 3, "scienceworld": 2, "babyai": 2, "jericho": 1, "pddl": 3, "webshop": 2, "webarena": 2, "tool-query": 1, "tool-operation": 1},  
            "Grounding": {"alfworld": 2, "scienceworld": 3, "babyai": 2, "jericho": 1, "pddl": 3, "webshop": 3, "webarena": 3, "tool-query": 3, "tool-operation": 3},  
            "Spatial Navigation": {"alfworld": 2, "scienceworld": 2, "babyai": 2, "jericho": 2, "pddl": 1, "webshop": 1, "webarena": 2, "tool-query": 1, "tool-operation": 1}  
        }

model_map = ['GPT-4', 'Claude2', 'GPT-3.5-Turbo', 'GPT-3.5-Turbo-16k', 'Text-Davinci-003', 'Llama2-13b', 'Llama2-70b',
             'CodeLlama-13b', 'CodeLlama-34b', 'Vicuna-13b-16k', 'Lemur-70b', 'DeepSeek-67b', 'Mistral-7b']

saved_results = []
model_result = {}

def load_baseline_results(task_name, baseline_dir):
    # load baseline success rate, reward score, grounding accuracy from baseline_dir
    baseline_results = {}
    for model_name in os.listdir(baseline_dir):
        model_path = os.path.join(baseline_dir, model_name)
        file_path = os.path.join(model_path, "all_results.txt")
        if not os.path.exists(file_path):
            continue
        else:
            for line in open(file_path, "r"):
                try:
                    result = json.loads(line.strip())
                    if result["task_name"] == task_name:
                        baseline_results[model_name] = result
                except:
                    continue
    
    return baseline_results

baseline_dir = '../data/original_data/baseline_results'
baselines = load_baseline_results("alfworld", baseline_dir).keys()

for baseline in baselines:
    model_result = {}
    results = dict()
    for task in tasks_type["all"]:
        results[task] = load_baseline_results(task, baseline_dir)[baseline]
    
    
    dimension_metrics = {}
    DIMENSION_CATEGORIES = dimension_scoring.keys()
    for dimension in DIMENSION_CATEGORIES:
        weights = dimension_scoring[dimension]
        weights_sum = sum([weights[task_name] for task_name in tasks_type["all"]] )
        score = 0
        for task_result in results:
            task_name = task_result
            score += weights[task_name] * results[task_name]["success_rate"] * 100 
        score /= weights_sum
        dimension_metrics[dimension] = score

    for model_name in model_map:
        model_name_tmp = model_name
        if baseline.lower() == model_name_tmp.replace('.', '').lower():
            baseline = model_name
    model_result["model"] = baseline
    model_result["dimensions"] = dimension_metrics
    saved_results.append(model_result)
    # print(baseline, dimension_metrics)

dimension_file_path = '../data/To_Release/dimension_score_all.json'

with open(dimension_file_path, 'w') as file:
    json.dump(saved_results, file, indent=4)

