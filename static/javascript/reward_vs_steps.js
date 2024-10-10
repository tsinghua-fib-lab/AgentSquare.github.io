
const colors = [
    'rgba(255, 99, 132, 1)',
    'rgba(54, 162, 235, 1)',
    'rgba(255, 206, 86, 1)',
    'rgba(75, 192, 192, 1)',
    'rgba(153, 102, 255, 1)',
    'rgba(255, 159, 64, 1)',
    'rgba(199, 199, 199, 1)',
    'rgba(83, 102, 255, 1)',
    'rgba(40, 159, 64, 1)',
    'rgba(143, 162, 235, 1)',
    'rgba(255, 99, 75, 1)',
    'rgba(63, 185, 63, 1)',
    'rgba(220, 42, 107, 1)',
    'rgba(12, 126, 101, 1)'
];


const borders = [
    {
        borderWidth: 2,
        borderDash: [],
    },
    {
        borderWidth: 2,
        borderDash: [5, 5],
    },
    {
        borderWidth: 2,
        borderDash: [10, 5],
    },
    {
        borderWidth: 2,
        borderDash: [2, 2],
    },
    {
        borderWidth: 2,
        borderDash: [8, 4],
    },
    {
        borderWidth: 2,
        borderDash: [5, 10],
    },
    {
        borderWidth: 2,
        borderDash: [15, 5],
    },
    {
        borderWidth: 2,
        borderDash: [5, 15],
    },
    {
        borderWidth: 2,
        borderDash: [10, 10],
    },
    {
        borderWidth: 2,
        borderDash: [10, 2],
    },
    {
        borderWidth: 2,
        borderDash: [2, 10],
    },
    {
        borderWidth: 2,
        borderDash: [5, 3],
    },
    {
        borderWidth: 2,
        borderDash: [3, 5],
    },
    {
        borderWidth: 2,
        borderDash: [2, 4],
    },
];

document.addEventListener('DOMContentLoaded', function () {
    const taskSubtaskMapping = {
        'Avg': ['Avg'],
        'Embodied': ['Avg', 'Alfworld', 'Scienceworld', 'Babyai'],
        'Game': ['Avg', 'pddl', 'Jericho'],
        'Web': ['Avg', 'webshop', 'webarena'],
        'Tools': ['Avg', 'Tool-Query', 'Tool-Operation'],
    };

    let currentTask = 'Avg';
    let currentSubTask = 'Avg';
    let chart = null;

    function updateSubtasks(task) {
        const subtasks = taskSubtaskMapping[task];
        const subtaskContainer = document.querySelector('.sub-task-filter-selector-for-rewards');
        const filterButton = subtaskContainer.querySelector('.btn-container');

        while (filterButton.nextSibling) {
            subtaskContainer.removeChild(filterButton.nextSibling);
        }

        subtasks.forEach(subtask => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-container';
            btn.textContent = subtask === 'Avg' ? 'Avg' : subtask;
            if (subtask === 'Avg') {
                btn.classList.add('active');
                currentSubTask = task === 'Avg' ? 'Avg' : task;
            }
            btn.addEventListener('click', () => {
                currentSubTask = subtask === 'Avg' ? task : subtask;
                document.querySelectorAll('.sub-task-filter-selector-for-rewards .btn.active').forEach(active => {
                    active.classList.remove('active');
                });
                btn.classList.add('active');
                loadAndDrawChart(currentTask, currentSubTask);
            });
            subtaskContainer.appendChild(btn);
        });
    }


    updateSubtasks(currentTask);


    document.querySelectorAll('.btn-group.task-filter-selector-for-rewards .btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTask = btn.id.replace('task-filter-', '');
            document.querySelectorAll('.btn-group.task-filter-selector-for-rewards .btn.active').forEach(active => {
                active.classList.remove('active');
            });
            btn.classList.add('active');

            updateSubtasks(currentTask);
            loadAndDrawChart(currentTask, currentSubTask);
        });
    });


    function loadAndDrawChart(task, subTask) {
        fetch('/agentboard/data/To_Release/reward_vs_steps.json')
            .then(response => response.json())
            .then(data => {
                const subTaskKey = subTask === 'Avg' ? 'Avg' : subTask.toLowerCase();
                const datasets = data.map((model, index) => {
                    const taskData = model.task[subTaskKey] || [];
                    const colorIndex = index % colors.length;
                    const borderStyle = borders[colorIndex];

                    return {
                        label: model.model,
                        data: taskData,
                        fill: false,
                        borderColor: colors[colorIndex],
                        borderWidth: borderStyle.borderWidth,
                        borderDash: borderStyle.borderDash,
                        pointBackgroundColor: colors[colorIndex],
                        pointRadius: 2,
                    };
                });

                if (chart) {
                    chart.destroy();
                }

                chart = new Chart(document.getElementById('rewardChart'), {
                    type: 'line',
                    data: {
                        labels: Array.from({length: 31}, (_, i) => i),
                        datasets: datasets
                    },
                    options: {
                        scales: {
                            x: {
                                ticks: {
                                    font: {
                                        size: 12,
                                        family: "'Noto Sans', sans-serif",
                                        weight: 'bold'
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Steps',
                                    font: {
                                        size: 14,
                                        fontFamily: "'Noto Sans', sans-serif",
                                        weight: 'bold'
                                    },
                                },
                            },
                            y: {
                                ticks: {
                                    font: {
                                        size: 12,
                                        family: "'Noto Sans', sans-serif",
                                        weight: 'bold'
                                    }
                                },
                                title: {
                                    display: true,
                                    text: 'Progress Rate (%)',
                                    font: {
                                        size: 14,
                                        fontFamily: "'Noto Sans', sans-serif",
                                        weight: 'bold'
                                    },
                                },
                                beginAtZero: true
                            }
                        }, onHover: (event, activeElements) => {
                            chart.data.datasets.forEach((dataset, i) => {
                                if (activeElements.length && activeElements[0].datasetIndex === i) {
                                    dataset.borderColor = 'black';
                                    dataset.borderWidth = 3;
                                    dataset.borderDash = [];
                                } else {
                                    dataset.borderColor = colors[i % colors.length];
                                    dataset.borderWidth = borders[i % borders.length].borderWidth;
                                    dataset.borderDash = borders[i % borders.length].borderDash;
                                }
                            });
                            chart.update();
                        },
                        plugins: {
                            legend: {
                                display: true,
                                labels: {
                                    font: {
                                        size: 12,
                                        family: "'Noto Sans', sans-serif",
                                        weight: 'bold'
                                    },
                                },
                            },
                            tooltip: {
                                callbacks: {
                                    title: function (tooltipItems) {
                                        if (tooltipItems.length > 0) {
                                            const index = tooltipItems[0].dataIndex;
                                            return `Step ${index}`;
                                        }
                                        return '';
                                    }
                                }
                            },
                        }
                    }
                });
            });
    }

    loadAndDrawChart(currentTask, currentSubTask);
});
