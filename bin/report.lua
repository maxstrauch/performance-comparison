done = function(summary, latency, requests)

    io.write('---');

    io.write('\n');

    io.write('REQUESTS=')
    io.write('{ "min": ' .. requests.min .. ', "max": ' .. requests.max .. ', "mean": ' .. requests.mean .. ', "stdev": ' .. requests.stdev .. ', "percentile_99_999perc": ' .. requests:percentile(99.999) .. ', "percentile_99_0perc": ' .. requests:percentile(99.0) .. ', "percentile_90perc": ' .. requests:percentile(90) .. ', "percentile_75perc": ' .. requests:percentile(75.0) .. ', "percentile_50perc": ' .. requests:percentile(50.0) .. '}')

    io.write('\n');

    io.write('LATENCY=')
    io.write('{ "min": ' .. latency.min .. ', "max": ' .. latency.max .. ', "mean": ' .. latency.mean .. ', "stdev": ' .. latency.stdev .. ', "percentile_99_999perc": ' .. latency:percentile(99.999) .. ', "percentile_99_0perc": ' .. latency:percentile(99.0) .. ', "percentile_90perc": ' .. latency:percentile(90) .. ', "percentile_75perc": ' .. latency:percentile(75.0) .. ', "percentile_50perc": ' .. latency:percentile(50.0) .. '}')

    io.write('\n');

    io.write('SUMMARY=')
    io.write(dump(summary))

 end

 function dump(o)
    if type(o) == 'table' then
       local s = '{ '
       for k,v in pairs(o) do
          if type(k) ~= 'number' then k = '"'..k..'"' end
          s = s .. ''..k..': ' .. dump(v) .. ','
       end
       return s .. ' "eod": true } '
    else
       return tostring(o)
    end
 end