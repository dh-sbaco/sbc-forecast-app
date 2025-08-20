const fs = require("fs");
const fetch = require("node-fetch");

const buoyID = "46053";
const lat = 34.060205;
const lon = -119.531650;

async function main() {
  const result = {
    time: new Date().toISOString(),
    buoy: {},
    forecast: {},
    scrs: null
  };

  try {
    const text = await fetch(`https://www.ndbc.noaa.gov/data/realtime2/${buoyID}.txt`).then(res => res.text());
    const lines = text.trim().split("\n");
    const latest = lines[1].split(/\s+/);
    result.buoy = {
      waterTemp: parseFloat(latest[14]),
      wind: parseFloat(latest[7]),
      swellHeight: parseFloat(latest[8]),
      swellPeriod: parseFloat(latest[9])
    };
  } catch (e) {
    console.error("Buoy error:", e);
  }

  try {
    const gridUrl = await fetch(`https://api.weather.gov/points/${lat},${lon}`)
      .then(res => res.json())
      .then(data => data.properties.forecast);
    const forecastData = await fetch(gridUrl).then(res => res.json());
    const periods = forecastData.properties.periods.slice(0, 12);

    let maxWind = 0, maxSwellHeight = 0, maxSwellPeriod = 0;

    for (let p of periods) {
      const windMatch = p.windSpeed.match(/\d+/);
      if (windMatch) {
        maxWind = Math.max(maxWind, parseInt(windMatch[0]));
      }

      const swellMatch = p.shortForecast.match(/(\d+) ft at (\d+) sec/);
      if (swellMatch) {
        maxSwellHeight = Math.max(maxSwellHeight, parseInt(swellMatch[1]));
        maxSwellPeriod = Math.max(maxSwellPeriod, parseInt(swellMatch[2]));
      }
    }

    result.forecast = {
      maxWind,
      maxSwellHeight,
      maxSwellPeriod
    };

    const { waterTemp } = result.buoy;
    result.scrs = (
      43 +
      maxWind +
      2 * maxSwellHeight +
      maxSwellPeriod +
      (72 - waterTemp)
    );
  } catch (e) {
    console.error("Forecast error:", e);
  }

  fs.writeFileSync("data/data.json", JSON.stringify(result, null, 2));
}

main();