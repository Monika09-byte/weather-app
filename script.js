const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const result = document.getElementById("result");
const app = document.getElementById("app");

// 1) Convert city name -> latitude & longitude
async function getCoordinates(city) {
  const geoURL = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`;

  const response = await fetch(geoURL);
  const data = await response.json();

  // if city not found
  if (!data.results || data.results.length === 0) {
    result.innerHTML = `<p>City not found 😭</p>`;
    return;
  }

  const place = data.results[0];
  const latitude = place.latitude;
  const longitude = place.longitude;

  getWeather(latitude, longitude, place.name, place.country);
}

// 2) Use latitude & longitude -> fetch current weather
async function getWeather(lat, lon, cityName, country) {
  const weatherURL = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

  const response = await fetch(weatherURL);
  const data = await response.json();

  const current = data.current_weather;

  // Convert time to readable format
  const dateObj = new Date(current.time);
  const niceTime = dateObj.toLocaleString();

  // Weather condition code
  const code = current.weathercode;

  // reset old theme
  app.classList.remove("sunny", "cloudy", "rainy", "stormy");

  if (code === 0) app.classList.add("sunny");
  else if (code === 1 || code === 2 || code === 3) app.classList.add("cloudy");
  else if (code >= 51 && code <= 82) app.classList.add("rainy");
  else if (code >= 95) app.classList.add("stormy");

  // convert weather code to readable condition
  let condition = "Unknown";

  if (code === 0) condition = "Clear Sky ☀️";
  else if (code === 1 || code === 2) condition = "Partly Cloudy 🌤️";
  else if (code === 3) condition = "Cloudy ☁️";
  else if (code >= 51 && code <= 67) condition = "Drizzle 🌦️";
  else if (code >= 71 && code <= 77) condition = "Snow ❄️";
  else if (code >= 80 && code <= 82) condition = "Rain 🌧️";
  else if (code >= 95) condition = "Thunderstorm ⛈️";

  // show result on UI
  result.innerHTML = `
    <h2>${cityName}, ${country}</h2>
    <p><b>Temperature:</b> ${current.temperature}°C</p>
    <p><b>Wind Speed:</b> ${current.windspeed} km/h</p>
    <p><b>Time:</b> ${niceTime}</p>
    <p><b>Condition:</b> ${condition}</p>
  `;
}

// Search button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();

  if (city === "") {
    result.innerHTML = "<p>Please enter a city name</p>";
    return;
  }

  result.innerHTML = "<p>Fetching weather... 🌦️</p>";
  getCoordinates(city);
});

// Enter key search
cityInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});
