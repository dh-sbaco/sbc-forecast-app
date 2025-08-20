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
