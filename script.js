const wrapper = document.querySelector(".wrapper");
const inputPart = document.querySelector(".input-part");
const infoTxt = document.querySelector(".info-txt");
const inputField = document.querySelector("input[type='text']");
const locationBtn = document.getElementById("locationBtn");
const weatherPart = document.querySelector(".weather-part");
const wIcon = document.querySelector(".weather-icon");
const arrowBack = document.querySelector("header i");

const API_KEY = "ab3e6ddff324a5a6247b2f80f8dc7065"; // Replace with your OpenWeatherMap API key
let api, forecastApi;

inputField.addEventListener("keyup", (e) => {
  if (e.key === "Enter" && inputField.value.trim() !== "") {
    requestApi(inputField.value.trim());
  }
});

locationBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function requestApi(city) {
  api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
  forecastApi = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
  fetchData();
}

function onSuccess(position) {
  const { latitude, longitude } = position.coords;
  api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  forecastApi = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`;
  fetchData();
}

function onError(error) {
  infoTxt.innerText = error.message;
  infoTxt.classList.add("error");
}

function fetchData() {
  infoTxt.innerText = "Getting weather details...";
  infoTxt.classList.add("pending");

  Promise.all([fetch(api), fetch(forecastApi)])
    .then(([response, forecastResponse]) => {
      if (!response.ok || !forecastResponse.ok) {
        throw new Error("Weather data not found.");
      }
      return Promise.all([response.json(), forecastResponse.json()]);
    })
    .then(([currentWeatherData, forecastData]) => {
      weatherDetails(currentWeatherData);
      displayForecast(forecastData);
    })
    .catch(() => {
      infoTxt.innerText = "Something went wrong.";
      infoTxt.classList.replace("pending", "error");
    });
}

function weatherDetails(data) {
  const { name: city, sys: { country }, weather, main: { temp, feels_like, humidity } } = data;
  const { description, icon } = weather[0];

  // Set weather icon based on icon code provided by API
  wIcon.src = `https://openweathermap.org/img/wn/${icon}.png`;

  // Display current weather details in UI
  weatherPart.querySelector(".temp .numb").textContent = Math.round(temp);
  weatherPart.querySelector(".weather").textContent = description;
  weatherPart.querySelector(".location span").textContent = `${city}, ${country}`;
  weatherPart.querySelector(".temp .numb-2").textContent = Math.round(feels_like);
  weatherPart.querySelector(".humidity span").textContent = `${humidity}%`;

  infoTxt.classList.remove("pending", "error");
  infoTxt.textContent = "";
  inputField.value = "";
  wrapper.classList.add("active");
}

function displayForecast(data) {
  const forecastList = data.list.filter((item) => item.dt_txt.includes("12:00:00")); // Filter to get daily forecasts

  const forecastContainer = document.querySelector(".forecast");
  forecastContainer.innerHTML = ""; // Clear previous forecast content

  forecastList.forEach((item) => {
    const date = new Date(item.dt * 1000);
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const icon = item.weather[0].icon;
    const temp = Math.round(item.main.temp);

    const forecastItem = document.createElement("div");
    forecastItem.classList.add("forecast-item");
    forecastItem.innerHTML = `
      <div class="forecast-day">${day}</div>
      <img src="https://openweathermap.org/img/wn/${icon}.png" alt="Weather Icon">
      <div class="forecast-temp">${temp}°C</div>
    `;

    forecastContainer.appendChild(forecastItem);
  });
}

arrowBack.addEventListener("click", () => {
  wrapper.classList.remove("active");
});
