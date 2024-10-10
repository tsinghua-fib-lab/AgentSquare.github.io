def parse_log_line(line):
    """ 解析日志行并提取相关信息 """
    parts = line.split(' | ')
    step_info = parts[2].split(' - ')
    action = step_info[1] if len(step_info) > 1 else ""
    content = parts[-1].strip()
    return action, content


def convert_log_format(log_file):
    output_lines = []

    with open(log_file, 'r') as file:
        for line in file:
            action, content = parse_log_line(line)

            if action == 'GOAL':
                goal_desc = content.split('Goal: ')[-1]
                output_lines.append(f"Step 0 Goal: {goal_desc}")

            elif action == 'Action':
                step_number = content.split(' ')[1]
                action_desc = content.split('[')[-1].split(']')[0]
                output_lines.append(f"\nStep {step_number} Action: {action_desc}")

            elif action == 'Observation':
                step_number = content.split(' ')[1]
                observation_desc = content.split(':')[1].strip()
                output_lines.append(f"Step {step_number} Observation: {observation_desc}")

    return output_lines


# 使用函数
log_file = '../data/baseline_results/gpt-35-turbo/trajectory/webshop.log'  # 替换为您的日志文件路径
converted_content = convert_log_format(log_file)

# 打印转换后的内容
for line in converted_content:
    print(line)
