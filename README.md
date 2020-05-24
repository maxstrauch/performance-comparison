Code to conduct a real-world performance comparison of web frameworks
===

This repo contains the sources for the article ["A real-world comparison of web frameworks with a focus on NodeJS" published on Medium](https://medium.com/@maxstrauch/a-real-world-comparison-of-web-frameworks-with-a-focus-on-nodejs-c00efe1df7ca?sk=87528f12850cb7162cd6052f478a1306) which gives an overview and compares the performance of current state-of-the-art technologies for developing web services. In this repo fourteen technologies and frameworks are tested against seven real-world test cases to emphasize the strengths and weaknesses of the technologies under test.

The analyzed technologies are:

  - .NET Core and ASP<i></i>.NET Core – 2 test cases
  - Go – 1 test case
  - NodeJS – 6 test cases
  - Nginx / OpenResty – 1 test case
  - PHP – 1 test case
  - Python – 1 test case
  - Java – 2 test case

### Results

The following diagrams show part of the results. Under `results/**/{pdf|svg|png}/**` you can find all results.

![Throughput (Request/sec) for different technologies](/results/test_2020-05-16_23-47/png/req-per-sec.png?raw=true "Throughput (Request/sec) for different technologies")

![Throughput (Request/sec) for computing a JWT token](/results/test_2020-05-16_23-47/png/req-per-sec_sel-conncounts_jwt-generate.png?raw=true "Throughput (Request/sec) for computing a JWT token")

![Average memory consumption](/results/test_2020-05-16_23-47/png/mem-avg.png?raw=true "Average memory consumption")

### Project struture

  - `bin` contains the main script file (`run.js` is the main, executed by `./run.sh`) to run the tests
  - `evaluation` contains the utility programs to generate the charts
  - `results` contains all the raw data
  - `test-**` contains all test cases where each directory represents one test case for a technology

# Get results

Run from within the `evaluation/` subdirectory the command:

   $ node run.js -f ../results/test_2020-05-16_23-47.json

which will then generate the diagrams into `results/test_2020-05-16_23-47/`.