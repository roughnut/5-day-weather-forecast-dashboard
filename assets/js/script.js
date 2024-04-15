// OpenWeather API key
const weatherApiKey = "930ab72ef79543069c0462a5f5878d1a";
const currentWeatherEl = $("#current-weather");
const forecastWeatherEl = $("#forecast-weather");
city = "";

// Render saved cities from local storage
function renderSavedCities() {
  // clear the list of saved cities
  $("#saved-cities").empty();
  const cities = JSON.parse(localStorage.getItem("cities")) || [];
  // use for of loop to iterate over the cities array
  // if array is empty, append a p tag with text "No saved cities"
  console.log(cities.length);
  if (cities.length === 0) {
    currentWeatherEl.append($("<p>").text("Search for a city to get the weather!"));
    return;
  }
  for (const city of cities) {
    $("#saved-cities").append($("<li>").addClass("saved-city").text(city));
  }
  // get the weather data for the first city in the array
  city = cities[0];
  getCityLatLon(city);
}

function handleCitySubmit(event) {
  event.preventDefault();
  const city = $("#city-input").val().trim();
  storeCity(city);
  // clear input field
  $("#city-input").val("");
   renderSavedCities(city);
}

function storeCity(city) {
  let cities = JSON.parse(localStorage.getItem("cities")) || [];
  // add the new city to the beginning of the array
  cities.unshift(city);
  localStorage.setItem("cities", JSON.stringify(cities));
}

function getCityLatLon(city) {
  const cityQueryUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${weatherApiKey}`;
  fetch(cityQueryUrl)
    .then((response) => response.json())
    .then((data) => {
      getLatitudeLongitude(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getLatitudeLongitude(data) {
  const latitude = data[0].lat;
  const longitude = data[0].lon;
  console.log(latitude, longitude);
  getWeatherData(latitude, longitude);
}

function getWeatherData(latitude, longitude) {
  const currentWeatherQueryUrl = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;
  const forecastWeatherQueryUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`;

  fetch(currentWeatherQueryUrl)
    .then((response) => response.json())
    .then((data) => {
      currentWeatherData(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });

  fetch(forecastWeatherQueryUrl)
    .then((response) => response.json())
    .then((data) => {
      forecastWeatherData(data);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function currentWeatherData(data) {
  // convert the date to a human-readable format using Day.js
  const date = dayjs.unix(data.dt).format("DD/MM/YYYY");
  const temp = Math.round(data.main.temp *10) / 10;
  const humidity = data.main.humidity;
  const windSpeed = Math.round(data.wind.speed * 10) / 10;
  const iconUrl = `http://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
  appendCurrentData(city, date, temp, humidity, windSpeed, iconUrl);
}

function appendCurrentData(city, date, temp, humidity, windSpeed, iconUrl) {
  currentWeatherEl.empty();
  // append an h3 tag with "current weather" to the currentWeatherEl
  currentWeatherEl.addClass("w-100")
  currentWeatherEl.append($("<h3>").text("Current Weather"));
  const img = $("<img>")
    .attr("src", iconUrl);
  const card = $("<div>").addClass("card col-12 bg-primary text-white w-75");
  const cardBody = $("<div>").addClass("card-body");

  const cityAndImageDiv = $("<div>").addClass("d-flex align-items-center");
  cityAndImageDiv.append($("<h5>").addClass("card-title mr-2").text(city));
  cityAndImageDiv.append(img);

  cardBody.append(cityAndImageDiv);
  cardBody.append($("<p>").addClass("card-text").text(`Date: ${date}`));
  cardBody.append($("<p>").addClass("card-text").text(`Temp: ${temp} C`));
  cardBody.append($("<p>").addClass("card-text").text(`Humidity: ${humidity}%`));
  cardBody.append(
    $("<p>").addClass("card-text").text(`Wind Speed: ${windSpeed} km/h`)
  );

  card.append(cardBody);
  currentWeatherEl.append(card);
}

function forecastWeatherData(data) {
  forecastWeatherEl.empty();
  // loop through the data to get the forecast when the time is 12:00:00
  for (let i = 0; i < data.list.length; i++) {
    if (data.list[i].dt_txt.includes("12:00:00")) {
      const date = dayjs.unix(data.list[i].dt).format("ddd");
      const temp = Math.round(data.list[i].main.temp * 10) / 10;
      const humidity = data.list[i].main.humidity;
      const windSpeed = Math.round(data.list[i].wind.speed * 10) / 10;
      const icon = data.list[i].weather[0].icon;
      const iconUrl = `http://openweathermap.org/img/wn/${icon}.png`;
      appendForecastData(date, temp, humidity, windSpeed, iconUrl);
    }
  }
}

function appendForecastData(date, temp, humidity, windSpeed, iconUrl) {
  const forecastWeatherEl = $("#forecast-weather");
  const img = $("<img>").attr("src", iconUrl);
  const card = $("<div>").addClass("card col-11 col-lg-2 bg-warning text-dark my-2 mx-2");
  const cardBody = $("<div>").addClass("card-body");

    cardBody.append($("<h5>").addClass("card-title").text(date));
    cardBody.append(img);

  cardBody.append($("<p>").addClass("card-text").text(`Temp: ${temp} C`));
  cardBody.append($("<p>").addClass("card-text").text(`Humidity: ${humidity}%`));
  cardBody.append(
    $("<p>").addClass("card-text").text(`Wind Speed: ${windSpeed} km/h`)
  );

  card.append(cardBody);
  forecastWeatherEl.append(card);
}

$(document).ready(function () {
  // Get the saved cities from local storage
  renderSavedCities();
  // Get the city name from the form
  $("#city-form").on("submit", handleCitySubmit);
  // Get the city name from the saved cities list
  $("#saved-cities").on("click", ".saved-city", function () {
    city = $(this).text();
    getCityLatLon(city);
  });
});
