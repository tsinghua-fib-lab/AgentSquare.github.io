import os
import json

model_map = ['GPT-4', 'Claude2', 'GPT-3.5-Turbo', 'GPT-3.5-Turbo-16k', 'Text-Davinci-003', 'Llama2-13b', 'Llama2-70b',
             'CodeLlama-13b', 'CodeLlama-34b', 'Vicuna-13b-16k', 'Lemur-70b', 'DeepSeek-67b', 'Mistral-7b']

task_map = {'alfworld': 'AlfWorld', 'scienceworld': 'ScienceWorld', 'babyai': 'BabyAI', 'jericho': 'Jericho', 'pddl': 'PDDL'
            , 'webshop': 'WebShop', 'webarena': 'WebArena', 'tool-operation': 'Tool-Operation', 'tool-query': 'Tool-Query'}  # 填入其他任务映射

def process_file(file_path):
    with open(file_path, 'r') as file:
        for line in file:
            data = json.loads(line)
            task_name = task_map.get(data['task_name'].lower(), data['task_name'])
            easy_accuracy = f"{round(data['success_rate_easy'] * 100, 1)}%"
            hard_accuracy = f"{round(data['success_rate_hard'] * 100, 1)}%"
            easy_score = f"{round(data['progress_rate_easy'] * 100, 1)}%"
            hard_score = f"{round(data['progress_rate_hard'] * 100, 1)}%"
            gap_score = f"{round(float(easy_score[:-1]) - float(hard_score[:-1]), 1)}%"
            gap_accuracy = f"{round(float(easy_accuracy[:-1]) - float(hard_accuracy[:-1]), 1)}%"

            yield task_name, easy_score, hard_score, easy_accuracy, hard_accuracy, gap_score, gap_accuracy

def compute_average(scores):
    if not scores:
        return {'score': '0%', 'accuracy': '0%'}
    avg_score = f"{round(sum(float(s['score'][:-1]) for s in scores) / len(scores), 1)}%"
    avg_accuracy = f"{round(sum(float(s['accuracy'][:-1]) for s in scores) / len(scores), 1)}%"
    return {'score': avg_score, 'accuracy': avg_accuracy}

def process_folder(folder_path):
    results = []
    for model in model_map:
        model_path = os.path.join(folder_path, ("").join(model.lower().split('.')))
        if os.path.isdir(model_path):
            model_results = {}
            easy_scores = []
            hard_scores = []
            gap_scores = []
            file_path = os.path.join(model_path, 'all_results.txt')
            for task, easy_s, hard_s, easy_a, hard_a, gap_s, gap_a in process_file(file_path):
                easy = {'score': easy_s, 'accuracy': easy_a}
                hard = {'score': hard_s, 'accuracy': hard_a}
                gap = {'score': gap_s, 'accuracy': gap_a}
                model_results[task] = {
                    'easy': easy,
                    'hard': hard,
                    'gap': gap,
                }
                easy_scores.append(easy)
                hard_scores.append(hard)
                gap_scores.append(gap)

            avg_easy = compute_average(easy_scores)
            avg_hard = compute_average(hard_scores)
            avg_gap = compute_average(gap_scores)

            model_results['Avg'] = {
                'easy': avg_easy,
                'hard': avg_hard,
                'gap': avg_gap
            }

            results.append({
                'model': model,
                'tasks': model_results
            })

    return results

folder_path = '../data/original_data/baseline_results'
final_results = process_folder(folder_path)

with open('../data/To_Release/difficulty.json', 'w') as outfile:
    json.dump(final_results, outfile, indent=4)
