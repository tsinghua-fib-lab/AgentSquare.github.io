document.addEventListener('DOMContentLoaded', function () {
    loadTasks();
    initializeDividerArrows();
});

var taskData;

function loadTasks() {
    fetch('/agentboard/data/To_Release/task_description.json')
        .then(response => response.json())
        .then(data => {
            taskData = data;
            initializeTabs();
        })
        .catch(error => console.error('Error loading the tasks:', error));
}

function initializeTabs() {
    var tabs = document.querySelectorAll('.tabs input[type="radio"]');

    tabs.forEach(tab => {
        tab.addEventListener('change', () => {
            loadContentForTab(tab);
        });
    });

    if (tabs.length > 0) {
        loadContentForTab(tabs[0]);
    }
}

function loadContentForTab(tab) {
    var contentLeft = document.querySelector('.content-left');
    var contentRight = document.querySelector('.content-right');

    contentLeft.innerHTML = '';
    contentRight.innerHTML = '';

    var targetClass = tab.getAttribute('data-target').slice(1);
    var taskKey = targetClass.split('-')[1];

    var task = taskData.find(t => t.Task.toLowerCase() === taskKey);

    if (task) {
        let task_href = ``;
        if (task.Github_url !== '') {
            task_href += `<a class=\"nav-button\" href=\"${task.Github_url}\">\n <img src=\"img/icon/github.png\" alt=\"github\">Gitlab</a>`
        }
        if (task.Paper_url !== '') {
            task_href += `<a class=\"nav-button\" href=\"${task.Paper_url}\">\n <img src=\"img/icon/task_paper.png\" alt=\"task_paper\">Paper</a>`
        }
        if (task.Project_url !== '') {
            task_href += `<a class=\"nav-button\" href=\"${task.Project_url}\">\n <img src=\"img/icon/goto_project.png\" alt=\"goto_project\">Project</a>`
        }
        const taskContent_description = `
            <div class="content-left-content">
                <div class="${targetClass} tab-content">
                    <p style="font-size: 18px; font-weight: bold; margin: 0 0 5px 5px"> > Task Description </p>
                    <img src="${task.Task_image}" alt="${task.Task.toLowerCase()}">
                    <br>
                    &nbsp;&nbsp;${task.Description}
                </div>
            </div>
            <div class="content-left-links">
                ${task_href}
            </div>
        `;
        const taskContent_example = `
            <div class="${targetClass} tab-content">
                <p style="font-size: 18px; font-weight: bold; margin: 0 0 5px 5px"> > Example (By GPT-3.5) </p>
                <div class="container">
                    <div class="top-side">
                        <div id="instruction-top">
                            <img src="img/icon/question_icon.png" alt="question"><strong> Goal</strong>
                            <br>&nbsp;&nbsp;&nbsp;${task.Example.Intent}
                        </div>
                    </div>
                    <div class="bottom-side">
                        <div id="trajectory-long">
                            <img src="img/icon/trajectory_icon.png" alt="example_trajectory"><strong> Example Trajectory</strong>
                            <br>${task.Example.Trajectory}
                        </div>
                        <div id="table-bottom"><a class="nav-button" href=${task.Wandb_url}>
                    <img src="img/icon/more_example.png" alt="more_example">Explore more examples on W&B</a></div>
                    </div>
                </div>
            </div>`;

        contentLeft.innerHTML = taskContent_description;
        contentRight.innerHTML = taskContent_example;
    }
}

function initializeDividerArrows() {
    const contentLeft = document.querySelector('.content-left');
    const contentRight = document.querySelector('.content-right');

    // load left hover
    contentLeft.addEventListener('mouseenter', () => {
        document.querySelector('.divider').classList.add('left-hover');
    });
    contentLeft.addEventListener('mouseleave', () => {
        document.querySelector('.divider').classList.remove('left-hover');
    });

    // load right hover
    contentRight.addEventListener('mouseenter', () => {
        document.querySelector('.divider').classList.add('right-hover');
    });
    contentRight.addEventListener('mouseleave', () => {
        document.querySelector('.divider').classList.remove('right-hover');
    });
}
