const { mysqlQuery } = require('../util');
const chalk = require('chalk');
const { getTestcaseKeys, computStepSize } = require('./common');
const { technologyKeyToCaption, technologyKeyToBaseColor, testcaseKeyToCaption } = require('../names');
const Color = require('color');

module.exports = async function () {

    const chartsToGenerate = [];

    const rows = await mysqlQuery(
        'SELECT (AVG(latency_mean)/1000) AS `latency_mean`, summary_connections, summary_duration, name ' + 
        'FROM `' + global.REPORT_TABLE_NAME + '` ' + 
        'GROUP BY `name`, summary_connections'
    );

    let maxValue = 0;
    const testDuration = Math.round(rows[0].summary_duration);

    // Aggregate data
    // ---
    let dim = [];

    for (let row of rows) {
        dim.push(row.summary_connections);
    }
    dim = [...new Set(dim)];

    const vals = {};

    for (let row of rows) {
        const idx = dim.indexOf(row.summary_connections);

        if (!(row.name in vals)) {
            vals[row.name] = [];
        }

        vals[row.name][idx] = row.latency_mean;

        maxValue = maxValue > row.latency_mean ? maxValue : row.latency_mean;
    }

    // Generate chart datasets array
    // ---
    const data = {
        labels: dim.map(x => `${x}`),
        datasets: Object.keys(vals).map((key, i) => {
            const baseColor = Color(technologyKeyToBaseColor(key));
        
            return {
                label:  technologyKeyToCaption(key),
                fill: false,
                borderColor: baseColor.rgb().string(),
                borderWidth: 2,
                data: vals[key]
            };
        })
    };


    chartsToGenerate.push({
        filename: `latency.json`,
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
                        'Latency of request for analyzed technologies/frameworks',
                        `averaged over all test cases for different connection counts`
                    ],
                    fontFamily: "Roboto",
                    "fontSize": 21,
                    "padding": 20
                },
                layout: {
                    "padding": {
                        "left": 10,
                        "right": 10,
                        "top": 0,
                        "bottom": 10
                    }
                },
                scales: {
                    "yAxes": [
                        {
                            "ticks": {
                                "beginAtZero": true,
                                "stepSize": computStepSize(maxValue, 10),
                                fontFamily: "Roboto",
                            },
                            "scaleLabel": {
                                "display": true,
                                "labelString": "Latency in seconds (lower is better)",
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