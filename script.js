fetch("data/data.json")
  .then(res => res.json())
  .then(data => {
    document.getElementById("waterTempCard").innerText = `Water Temp: ${data.buoy.waterTemp} °F`;
    document.getElementById("buoyWindCard").innerText = `Wind: ${data.buoy.wind} kt`;
    document.getElementById("buoySwellCard").innerText = `Swell: ${data.buoy.swellHeight} m @ ${data.buoy.swellPeriod}s`;
    document.getElementById("windCard").innerText = `Forecast Wind: ${data.forecast.maxWind} kt`;
    document.getElementById("swellCard").innerText = `Forecast Swell: ${data.forecast.maxSwellHeight} ft @ ${data.forecast.maxSwellPeriod}s`;
    document.getElementById("scrsCard").innerText = `SCRS: ${data.scrs.toFixed(2)}`;
  });

// Load next 3 tide predictions from NOAA CO-OPS Station 9411340
fetch("https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?begin_date=today&range=24&station=9411340&product=predictions&datum=MLLW&units=english&time_zone=lst_ldt&format=json")
  .then(res => res.json())
  .then(data => {
    const nextTides = data.predictions.slice(0, 3);
    const tidesText = nextTides.map(t => {
      const date = new Date(t.t);
      return `${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}: ${t.v} ft`;
    }).join("<br>");
    document.getElementById("tideList").innerHTML = `<strong>Next Tides:</strong><br>${tidesText}`;
  })
  .catch(err => {
    document.getElementById("tideList").innerText = "Tide data unavailable.";
  });
const scorpionLat = 34.049548;
const scorpionLon = -119.556973;

fetch(`https://api.weather.gov/points/${scorpionLat},${scorpionLon}`)
  .then(res => res.json())
  .then(data => fetch(data.properties.forecastHourly))
  .then(res => res.json())
  .then(data => {
    const periods = data.properties.periods;
    const forecastRows = periods
      .filter(p => p.isDaytime && p.temperatureUnit === "F")
      .slice(0, 6) // 6 entries (~18 hours)
      .map(p => `<tr><td>${p.startTime.slice(11, 16)}</td><td>${p.temperature}°F</td></tr>`)
      .join("");

    document.getElementById("airTempForecastCard").innerHTML = `
      <strong>Forecast Max Air Temps (Scorpion)</strong>
      <table style="width: 100%; margin-top: 10px;">
        <thead><tr><th>Time</th><th>Temp</th></tr></thead>
        <tbody>${forecastRows}</tbody>
      </table>
    `;
  })
  .catch(() => {
    document.getElementById("airTempForecastCard").innerText = "Air temp forecast unavailable.";
  });

