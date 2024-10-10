let rawData;
let chartPerformance = null;
let chartModules = null;
let currentTask = 'Avg';

// Task Subtask Mapping
const taskSubtaskMapping = {
    'Avg': ['AlfWorld', 'WebShop', 'SciWorld', 'M3Tool', 'TravelPlanner', 'PDDL'],
    'Webshop': ['WebShop'],
    'ALFWorld': ['AlfWorld'],
    'SciWorld': ['SciWorld'],
    'M3Tool': ['M3Tool'],
    'TravelPlanner': ['TravelPlanner'],
    'PDDL': ['PDDL']
};

const moduleNames = ['Planning', 'Reasoning', 'Tooluse', 'Memory']; // Four modules for second chart

// Generate charts
function createCharts() {
    const taskScores = getScoresForTask(rawData, currentTask);

    const labels = taskScores.map(item => item.model);
    const performance = taskScores.map(item => item.performance);
    const modules = taskScores.map(item => [item.planning, item.reasoning, item.tooluse, item.memory]);

    // Destroy existing charts if they exist
    if (chartPerformance) chartPerformance.destroy();
    if (chartModules) chartModules.destroy();

    // First chart: Performance
    const ctxPerformance = document.getElementById('chart-performance');
    chartPerformance = new Chart(ctxPerformance, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Performance',
                data: performance,
                backgroundColor: '#78b5f1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Agent' } },
                y: { title: { display: true, text: 'Performance (%)' }, beginAtZero: true, max: 100 }
            }
        }
    });

    // Second chart: Planning, Reasoning, Tooluse, Memory
    const ctxModules = document.getElementById('chart-modules');
    chartModules = new Chart(ctxModules, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: moduleNames.map((moduleName, index) => ({
                label: moduleName,
                data: modules.map(item => item[index]),
                backgroundColor: `rgba(${(index * 50) % 255}, ${(index * 100) % 255}, 200, 0.6)`
            }))
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Agent' } },
                y: { title: { display: true, text: 'Module (%)' }, beginAtZero: true, max: 100 }
            }
        }
    });
}

// Function to get task scores based on current task
function getScoresForTask(rawData, task) {
    return rawData.map(model => {
        const taskData = model.tasks[task] || {};
        return {
            model: model.model,
            performance: parseFloat(taskData.performance) || 0, // Use 'performance' instead of separate metrics
            planning: parseFloat(taskData.planning) || 0,
            reasoning: parseFloat(taskData.reasoning) || 0,
            tooluse: parseFloat(taskData.tooluse) || 0,
            memory: parseFloat(taskData.memory) || 0
        };
    });
}

// Update charts when task is changed
document.querySelectorAll('.btn-group.task-filter-selector .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        currentTask = btn.id.replace('filter-by-', '');

        // Remove 'active' class from all buttons and add to clicked one
        document.querySelectorAll('.btn-group.task-filter-selector .btn.active').forEach(active => {
            active.classList.remove('active');
        });
        btn.classList.add('active');

        // Re-generate charts based on selected task
        createCharts();
    });
});

// Fetch data and initialize charts
document.addEventListener('DOMContentLoaded', function () {
    fetch('/agentboard/data/To_Release/main_data_new.json').then(response => response.json()).then((loadedData) => {
        rawData = loadedData;
        createCharts(); // Initial chart creation
    });
});
