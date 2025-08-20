const buoyID = "46053";
const forecastLat = 34.060205;
const forecastLon = -119.531650;

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
  .then(data => fetch(data.properties.forecast))
  .then(res => res.json())
  .then(data => {
    const periods = data.properties.periods;
    let maxWind = 0;
    let swellInfo = {
      height: 0,
      period: 0,
      count: 0
    };

    periods.forEach(period => {
      const windMatch = period.windSpeed.match(/\d+/);
      if (windMatch) {
        maxWind = Math.max(maxWind, parseInt(windMatch[0]));
      }
    });

    // Fetch swell details from NWS marine zone text product
    fetch('https://marine.weather.gov/MapClick.php?lat=34.060205&lon=-119.531650&FcstType=text&TextType=2')
      .then(res => res.text())
      .then(text => {
        const swellMatch = text.match(/SWELL.*?(\d+)(?:\s*TO\s*\d+)?\s*FT.*?(\d+)\s*SEC/si);
        if (swellMatch) {
          swellInfo.height = parseInt(swellMatch[1]);
          swellInfo.period = parseInt(swellMatch[2]);
        }

        document.getElementById('windCard').innerText = `Max Wind Forecast: ${maxWind} kt`;
        document.getElementById('swellCard').innerText = `Forecast Swell: ${swellInfo.height} ft @ ${swellInfo.period}s`;

        scrsData.wind = maxWind;
        scrsData.swellHeight = swellInfo.height;
        scrsData.swellPeriod = swellInfo.period;
        updateSCRS();
      });
  });

// Placeholder for Air Temp (NWS API text response)
fetch(`https://forecast.weather.gov/MapClick.php?lat=34.049548&lon=-119.556973&unit=0&lg=english&FcstType=dwml`)
  .then(res => res.text())
  .then(text => {
    const tempMatch = text.match(/<value>(\d+)<\/value>/);
    if (tempMatch) {
      const temp = tempMatch[1];
      document.getElementById('airTempCard').innerText = `Air Temp: ${temp} °F`;
    } else {
      document.getElementById('airTempCard').innerText = "Air Temp: Unavailable";
    }
  });

// Tide Placeholder
document.getElementById('tideCard').innerText = "Tide chart for Prisoners Harbor coming soon...";

// SCRS Calculation
function updateSCRS() {
  const { wind, swellHeight, swellPeriod, waterTemp } = scrsData;
  if (!wind || !swellHeight || !swellPeriod || !waterTemp) return;

  const scrs = 43 + wind + 2 * swellHeight + swellPeriod + (72 - waterTemp);
  document.getElementById('scrsCard').innerText = `SCRS: ${scrs.toFixed(2)}`;
}
