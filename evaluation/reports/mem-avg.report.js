const { mysqlQuery } = require('../util');
const chalk = require('chalk');
const { getTestcaseKeys, computStepSize } = require('./common');
const { technologyKeyToCaption, technologyKeyToBaseColor, testcaseKeyToCaption } = require('../names');
const Color = require('color');

module.exports = async function () {

    const chartsToGenerate = [];

    const rows = await mysqlQuery(
        'SELECT AVG(resources_mem_avg/1048576) AS `resources_mem_avg`, summary_connections, '+ 
        'summary_duration, name FROM `' + global.REPORT_TABLE_NAME + '` GROUP BY name, summary_connections'
    );

    // Aggregate data
    // ---
    let dim = [];

    for (let row of rows) {
        dim.push(row.summary_connections);
    }
    dim = [...new Set(dim)];

    let maxValue = 0;

    const vals = {};
    for (let row of rows) {
        const idx = dim.indexOf(row.summary_connections);

        if (!(row.name in vals)) {
            vals[row.name] = [];
        }

        vals[row.name][idx] = row.resources_mem_avg;

        maxValue = maxValue > row.resources_mem_avg ? maxValue : row.resources_mem_avg;
    }

    const testDuration = Math.round(rows[0].summary_duration);

    const data = {
        labels: dim.map(x => `${x}`),
        datasets: Object.keys(vals).map((key, i) => {
            const baseColor = Color(technologyKeyToBaseColor(key));

            return {
                label:  technologyKeyToCaption(key),
                borderColor: baseColor.rgb().string(),
                borderWidth: 1,
                data: vals[key],
                fill: false,
            };
        })
    };

    chartsToGenerate.push({
        filename: `mem-avg.json`,
        chartData: {
            type: "line",
            data,
            options: {
                plugins: {
                    datalabels: {
                        display: false
                    }
                },
                legend: {
                    "position": "bottom",
                    "align": "center",
                    "fullWidth": false,
                    "labels": {
                        "boxWidth": 20
                    },
                    fontFamily: "Roboto",
                },
                title: {
                    "display": true,
                    "text": [
                        'Average memory consumption for different parallel connections and analyzed',
                        `technologies/frameworks, average over all test cases`
                    ],
                    fontFamily: "Roboto",
                    "fontSize": 21,
                    "padding": 20
                },
                "layout": {
                    "padding": {
                        "left": 10,
                        "right": 10,
                        "top": 0,
                        "bottom": 10
                    }
                },
                "scales": {
                    "yAxes": [
                        {
                            "ticks": {
                                "beginAtZero": true,
                                "stepSize": computStepSize(maxValue, 10),
                                fontFamily: "Roboto",
                                suggestedMax: maxValue * 1.1
                            },
                            "scaleLabel": {
                                "display": true,
                                "labelString": "Memory consumed in MiB (lower is better)",
                                "fontFamily": "Roboto",
                                "fontSize": 13,
                                "padding": 10,
                            }
                        }
                    ],
                    "xAxes": [
                        {
                            ticks: {
                                fontFamily: "Roboto",
                            },
                            "scaleLabel": {
                                "display": true,
                                "labelString": `Number of parallel concurrent connections for a duration of ${testDuration}s`,
                                "fontSize": 13,
                                "padding": 10,
                                "fontFamily": "Roboto"
                            }
                        }
                    ]
                }
            }
        }
    });


    return chartsToGenerate;
}