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
            'SELECT (resources_mem_max/1048576) AS `resources_mem_max`, (resources_mem_min/1048576) AS `resources_mem_min`, summary_connections, summary_duration, name, testcase ' + 
            'FROM `' + global.REPORT_TABLE_NAME + '` ' + 
            `WHERE testcase = '${testcase}' AND summary_connections IN (${SHOWN_CONNECTION_COUNTS.join(', ')})`
        );

        const maxValue = rows.reduce((prev, curr) => (prev > curr.resources_mem_max ? prev : curr.resources_mem_max), 0);
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
    
            vals[row.name][idx] = row.resources_mem_max;
        }

        const valsMin = {};
    
        for (let row of rows) {
            const idx = dim.indexOf(row.summary_connections);
    
            if (!(row.name in valsMin)) {
                valsMin[row.name] = [];
            }
    
            valsMin[row.name][idx] = row.resources_mem_min;
        }

        // Generate chart datasets array
        // ---
        const data = {
            labels: dim.map(x => `${x}`),
            datasets: Object.keys(vals).map((key, i) => {
                const baseColor = Color(technologyKeyToBaseColor(key));

                const errorBars = {};
                for (let i = 0; i < dim.length; i++) {
                    errorBars[`${dim[i]}`] = {
                        plus: 0,
                        minus: vals[key][i] - valsMin[key][i]
                    };
                }
            
                return {
                    label:  technologyKeyToCaption(key),
                    backgroundColor: baseColor.alpha(0.2).rgb().string(),
                    borderColor: baseColor.rgb().string(),
                    borderWidth: 1,
                    data: vals[key],
                    errorBars,
                };
            })
        };



        chartsToGenerate.push({
            filename: `mem-max_sel-conncounts_${testcase}.json`,
            chartData: {
                type: "bar",
                data,
                options: {
                    plugins: {
                        "datalabels": {
                            "align": "end",
                            "anchor": "end",
                            "backgroundColor": null,
                            "borderColor": null,
                            "borderRadius": 4,
                            "borderWidth": 1,
                            "color": "#aaaaaa",
                            "offset": 4,
                            "padding": {
                                "bottom": 20
                            },
                            "rotation": 270,
                            "formatter": "(v) => Math.round(v) + ' MiB';",
                            font: {
                                family: "Roboto",
                            },
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
                            'Maximum memory consumption for analyzed technologies/frameworks',
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
                                },
                                "scaleLabel": {
                                    "display": true,
                                    "labelString": "Peak memory consumed in MiB with minimum value shown (lower is better)",
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