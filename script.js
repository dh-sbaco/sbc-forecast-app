const buoyID = "46053";
const forecastLat = 34.060205;
const forecastLon = -119.531650;
const airLat = 34.049548;
const airLon = -119.556973;
const owmKey = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your key

let scrsData = { wind: 0, swellHeight: 0, swellPeriod: 0, waterTemp: 0 };

// NOAA Buoy Data
fetch(`https://www.ndbc.noaa.gov/data/realtime2/${buoyID}.txt`)
  .then(res => res.text())
  .then(data => {
    const lines = data.trim().split('\n');
    const latest = lines[1].split(/\s+/);
    const wind = latest[7]; // Wind Speed
    const swellHeight = latest[8]; // Swell height in meters
    const swellPeriod = latest[9];
    const waterTemp = latest[14];

    document.getElementById('waterTempCard').innerText = `Water Temp: ${waterTemp} °F`;
    document.getElementById('buoyWindCard').innerText = `Buoy Wind: ${wind} kt`;
    document.getElementById('buoySwellCard').innerText = `Buoy Swell: ${swellHeight} m @ ${swellPeriod}s`;

    scrsData.waterTemp = parseFloat(waterTemp);
    updateSCRS();
  });

// NWS Marine Forecast
fetch(`https://api.weather.gov/points/${forecastLat},${forecastLon}`)
  .then(res => res.json())
  .then(data => fetch(data.properties.forecastHourly))
  .then(res => res.json())
  .then(data => {
    const periods = data.properties.periods.slice(0, 12); // Next 12 hours
    let maxWind = 0, maxSwellHeight = 0, maxSwellPeriod = 0;

    for (let period of periods) {
      const windMatch = period.windSpeed.match(/\d+/);
      if (windMatch) {
        maxWind = Math.max(maxWind, parseInt(windMatch[0]));
      }
      if (period.shortForecast.toLowerCase().includes("swell")) {
        // Simplified parsing
        const swellMatch = period.shortForecast.match(/(\d+) ft at (\d+) sec/);
        if (swellMatch) {
          maxSwellHeight = Math.max(maxSwellHeight, parseInt(swellMatch[1]));
          maxSwellPeriod = Math.max(maxSwellPeriod, parseInt(swellMatch[2]));
        }
      }
    }

    document.getElementById('windCard').innerText = `Max Wind Forecast: ${maxWind} kt`;
    document.getElementById('swellCard').innerText = `Max Swell: ${maxSwellHeight} ft @ ${maxSwellPeriod}s`;

    scrsData.wind = maxWind;
    scrsData.swellHeight = maxSwellHeight;
    scrsData.swellPeriod = maxSwellPeriod;
    updateSCRS();
  });

// Air Temperature
fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${airLat}&lon=${airLon}&units=imperial&appid=${owmKey}`)
  .then(res => res.json())
  .then(data => {
    const airTemp = data.main.temp;
    document.getElementById('airTempCard').innerText = `Air Temp: ${airTemp} °F`;
  });

// Tides Placeholder
document.getElementById('tideCard').innerText = "Tide chart for Prisoners Harbor coming soon...";

// SCRS Calculation
function updateSCRS() {
  const { wind, swellHeight, swellPeriod, waterTemp } = scrsData;
  if (!wind || !swellHeight || !swellPeriod || !waterTemp) return;

  const scrs = 43 + wind + 2 * swellHeight + swellPeriod + (72 - waterTemp);
  document.getElementById('scrsCard').innerText = `SCRS: ${scrs.toFixed(2)}`;
}
