async function fetchData() {
    const response = await fetch('/agentboard/data/To_Release/dimension_score_all.json');
    const models = await response.json();
    return models;
}

function createRadarChart(models) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    const colors = [
        'rgba(173, 107, 24, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(75, 192, 192, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
        'rgba(199, 199, 199, 1)',
        'rgba(83, 102, 255, 1)',
        'rgba(40, 159, 64, 1)',
        'rgba(143, 162, 235, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(71 ,150 ,87, 1)',
        'rgba(210 ,102 ,95, 1)',
        'rgba(51 ,47 ,180, 1)',
    ];
    const borderStyles = [
        [], [5, 5], [10, 5], [15, 10], [20, 5, 10, 5], [20, 15, 10, 5],
        [25, 10], [30, 5], [35, 5, 20, 5], [40, 10], [45, 15, 10, 5],
        [5, 20, 10, 20], [60, 15, 5, 15], [50, 10]
    ];
    // const defaultModelsToShow = ['GPT4-8k', 'Claude2-100k', 'ChatGPT3.5-4k', 'llama2-70b-4k', 'codellama-34b-16k', 'lemur-70b-chat', 'codellama-13b-16k'];
    const datasets = models.map((model, index) => {
        const backColor = colors[index].replace(/[\d\.]+\)$/g, '0.15)');
        return {
            label: model.model,
            data: Object.values(model.dimensions).map(value => parseFloat(value)),
            backgroundColor: backColor,
            borderColor: colors[index],
            borderWidth: 2,
            borderDash: borderStyles[index],
            // hidden: !defaultModelsToShow.includes(model.model)
        };
    });

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: Object.keys(models[0].dimensions),
            datasets: datasets
        },
        options: {
            scales: {
                r: {
                    pointLabels: {
                        font: {
                            size: 12,
                            family: "'Noto Sans', sans-serif",
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 12,
                            family: "'Noto Sans', sans-serif",
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        font: {
                            size: 12,
                            family: "'Noto Sans', sans-serif",
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    bodyFont: {
                        size: 12,
                        family: "'Noto Sans', sans-serif",
                        weight: 'bold'
                    }
                }
            },
            elements: {
                line: {
                    tension: 0
                }
            },
        }
    });
}

fetchData().then(models => createRadarChart(models));


// save as PNG
// function saveAsPNG(chartId, filename) {
//     const canvas = document.getElementById(chartId);
//
//     const multiplier = 3; // 3 * resolution
//     const width = canvas.width;
//     const height = canvas.height;
//
//     var tempCanvas = document.createElement('canvas');
//     var tempCtx = tempCanvas.getContext('2d');
//     tempCanvas.width = width * multiplier;
//     tempCanvas.height = height * multiplier;
//
//     tempCtx.drawImage(canvas, 0, 0, tempCanvas.width, tempCanvas.height);
//
//     tempCanvas.toBlob(function(blob) {
//         const newImg = document.createElement('img');
//         const url = URL.createObjectURL(blob);
//
//         var downloadLink = document.createElement("a");
//         downloadLink.href = url;
//         downloadLink.download = filename;
//         document.body.appendChild(downloadLink);
//         downloadLink.click();
//         document.body.removeChild(downloadLink);
//     }, 'image/png');
// }
//
// document.getElementById('save-png-button').addEventListener('click', function () {
//     saveAsPNG('radarChart', 'chart.png');
// });


