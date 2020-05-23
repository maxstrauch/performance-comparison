const { mysqlQuery } = require('../util');
const chalk = require('chalk');
const { getTestcaseKeys, computStepSize } = require('./common');
const { technologyKeyToCaption, technologyKeyToBaseColor, testcaseKeyToCaption } = require('../names');
const Color = require('color');

const SHOWN_CONNECTION_COUNTS = [100, 200, 400, 800];

module.exports = async function () {

    const testcases = await getTestcaseKeys();
    console.log(chalk.green(`--> ${testcases.length} testcases to analyze`));

    const chartsToGenerate = [];

    for (let testcase of testcases) {
        console.log(chalk.green(`--> Testcase: ${testcase}`));

        const rows = await mysqlQuery(
            'SELECT resources_cpu_avg, resources_cpu_stder, summary_connections, name, summary_duration ' + 
            'FROM `' + global.REPORT_TABLE_NAME + '` ' + 
            `WHERE testcase = '${testcase}' AND summary_connections IN (${SHOWN_CONNECTION_COUNTS.join(', ')})`
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
    
            vals[row.name][idx] = {
                avg: row.resources_cpu_avg,
                stdev: row.resources_cpu_stder,
            };

            maxValue = maxValue > row.resources_cpu_avg ? maxValue : row.resources_cpu_avg;
            maxValue = maxValue > (row.resources_cpu_avg+row.resources_cpu_stder) ? maxValue : (row.resources_cpu_avg+row.resources_cpu_stder);
        }
    
        // Generate chart datasets array
        // ---
        const data = {
            labels: dim.map(x => `${x}`),
            datasets: Object.keys(vals).map((key, i) => {
                const baseColor = Color(technologyKeyToBaseColor(key));
            
                let errorBars = {};
                dim.forEach((x, i) => {
                    errorBars[`${x}`] = {
                        plus: vals[key][i].stdev,
                        minus: -vals[key][i].stdev
                    };
                });

                return {
                    label:  technologyKeyToCaption(key),
                    backgroundColor: baseColor.alpha(0.2).rgb().string(),
                    borderColor: baseColor.rgb().string(),
                    borderWidth: 1,
                    data: vals[key].map(v => v.avg),
                    errorBars,
                };
            })
        };


        chartsToGenerate.push({
            filename: `cpu_sel-conncounts_${testcase}.json`,
            chartData: {
                type: "bar",
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
                            `Relative CPU usage over the test time of ${testDuration}s, `,
                            `for testcase: ${testcaseKeyToCaption(testcase)}`
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
                                    suggestedMax: maxValue,
                                },
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Relative CPU usage from \"docker stats\"",
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

    }

    return chartsToGenerate;
}