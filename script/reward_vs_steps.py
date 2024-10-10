import json
import re
from collections import defaultdict

STEPS = 30
INTERVAL = 6
PROJECT_PATH = "../data"


def extract_variables(line):
    pattern = r"\[EXP\] (\d+): \[success_rate\]: (.*), \[progress_rate\]: (.*), \[grounding_acc\]: (.*), \[score_state\]: (.*)"
    match = re.match(pattern, line)
    if match:
        i = int(match.group(1))
        sr = float(1.0 if match.group(2) else 0.0)
        score = float(match.group(3))
        grounding_acc = float(match.group(4))
        score_state_str = match.group(5)
        score_state = eval(score_state_str)

        # Since Webarena use string to indicate step, we need to convert it to int
        score_state = [(int(item[0]), item[1]) for item in score_state]

        return_dict = {
            "EXP": i,
            "sr": sr,
            "score": score,
            "grounding_acc": grounding_acc,
            "score_state": score_state
        }
        return return_dict


def complete_score_state(score_state):
    complete_state = []
    current_score = 0
    for step in range(31):
        if score_state and step == score_state[0][0]:
            current_score = score_state.pop(0)[1]
        complete_state.append((step, current_score))
    return complete_state


def extract_reward_score_4_model(model, datasets):
    cal_category = 0
    if datasets == "Avg":
        datasets = ['alfworld', 'scienceworld', 'babyai', 'pddl', 'jericho', 'webshop', 'webarena', 'tool-query',
                    'tool-operation']
        cal_category = 1
    if datasets == "embodied":
        datasets = ['alfworld', 'scienceworld', 'babyai']
        cal_category = 1
    if datasets == "game":
        datasets = ['pddl', 'jericho']
        cal_category = 1
    if datasets == "web":
        datasets = ['webshop', 'webarena']
        cal_category = 1
    if datasets == "tools":
        datasets = ['tool-query', 'tool-operation']
        cal_category = 1

    results = []

    # Since we have a different model name when we save results, we should change the model name here
    model_dict = {
        "GPT-4": "gpt-4",
        "Claude2": "claude2",
        "GPT-3.5-Turbo-16k": "gpt-35-turbo-16k",
        "Text-Davinci-003": "text-davinci-003",
        "GPT-3.5-Turbo": "gpt-35-turbo",
        "Llama2-13b": "llama2-13b",
        "Llama2-70b": "llama2-70b",
        "Codellama-13b": "codellama-13b",
        "Codellama-34b": "codellama-34b",
        "Vicuna-13b-16k": "vicuna-13b-16k",
        "Lemur-70b": "lemur-70b",
        # "DeepSeek-67b": "deepseek-67b",
        "Mistral-7b": "mistral-7b",
    }

    if cal_category:
        for dataset in datasets:
            f = open(f"{PROJECT_PATH}/original_data/baseline_results/{model_dict[model]}/{dataset}.txt", "r")
            for line in f:
                result = extract_variables(line)
                result['score_state'] = complete_score_state(result['score_state'])
                results.append(result)
            f.close()
    else:
        f = open(f"{PROJECT_PATH}/original_data/baseline_results/{model_dict[model]}/{datasets}.txt", "r")
        for line in f:
            result = extract_variables(line)
            result['score_state'] = complete_score_state(result['score_state'])
            results.append(result)
        f.close()


    # acculated score
    reward_score_list = []

    # initialize reward score
    for i in range(31):
        reward_score_list.append(0)

    for result in results:
        for step, score in result['score_state']:
            reward_score_list[step] += score

    # normalize reward score
    for i in range(31):
        reward_score_list[i] /= len(results)

    reward_score_list = [i * 100 for i in reward_score_list[:STEPS]]

    # at step 0, reward score is 0
    reward_score_list.insert(0, 0)

    return reward_score_list


# dataset_list = ["graph", "movie", "weather"]
# model_list = ["gpt-4", "codellama-34b", "llama-70b"]
model_list = [
    "GPT-4",
    "Claude2",
    "GPT-3.5-Turbo",
    "GPT-3.5-Turbo-16k",
    "Text-Davinci-003",
    "Llama2-13b",
    "Llama2-70b",
    "Codellama-13b",
    "Codellama-34b",
    "Vicuna-13b-16k",
    "Lemur-70b",
    # "DeepSeek-67b",
    "Mistral-7b",
]

results_list = []

dataset_list = ["alfworld", "scienceworld", "jericho", "babyai", "pddl", "webshop", "webarena",
                "tool-query", "tool-operation", "Avg", "embodied", "game", "web", "tools"]

for model in model_list:
    temp_data = {}
    temp_data["task"] = {}
    temp_data["model"] = model
    for dataset in dataset_list:
        temp_data["task"][dataset] = extract_reward_score_4_model(model, dataset)
    results_list.append(temp_data)


file_path_reward_steps = '../data/To_Release/reward_vs_steps.json'

with open(file_path_reward_steps, 'w') as file:
    json.dump(results_list, file, indent=4)