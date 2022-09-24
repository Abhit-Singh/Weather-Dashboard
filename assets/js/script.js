var cityFormElement = document.querySelector("#city-form");
var cityInputElement = document.querySelector("#cityname");
var todaysCityName = document.querySelector("#city-and-date");
var iconElement = document.querySelector(".icon");
var futureForecastContainer = document.querySelector(".future-forecast-container");
var recentInquiresUl = document.querySelector(".recent-inquires-ul");
var searchContentElement = document.querySelector(".search-bar");


var apiKey = "8aff7017aa429b9bc201a6c2e43c57c4";


//loading recent searches to the page
function loadRecentCities() {
    var cities = JSON.parse(localStorage.getItem("cities"));

    if (!cities) {
        cities = [];
    } else {
        cities.forEach((item) => {
            var searchHistory = document.createElement("li");
            searchHistory.innerHTML = item.toUpperCase();
            searchHistory.classList = "clicked-city"
            recentInquiresUl.prepend(searchHistory)
        })
    }
};
loadRecentCities();

//getting city name from user input and making sure input is not empty
cityFormElement.addEventListener("submit", function(event) {
    event.preventDefault();

    var city = cityInputElement.value.trim();

    if (city) {
        getWeather(city);
        cityInputElement.value = "";
    } else {
        alert("Please enter a city name")
    }
});

// function to get weather for the city
function getWeather(cityName) {
    //API call to get city's latitude and longtitude
    var latAndlonApi = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + apiKey;

    fetch(latAndlonApi).then(function(response) {
        response.json().then(function(data) {
            //conditional statement to make sure the city input is correct and returns a result
            if (data.length > 0) {

                var { lat } = data[0];
                var { lon } = data[0];

                //transforming city name into latitude and longtitude 
                var forecastApi = "https://api.openweathermap.org/data/2.5/onecall?lat=" + lat + "&lon=" + lon + "&exclude=hourly,current,minutely,alerts&appid=" + apiKey + "&units=imperial";

                fetch(forecastApi).then(function(response) {
                    response.json().then(function(data) {
                        displayCityWeather(data, cityName);
                        futureForecastContainer.innerHTML = "";
                        var dailyList = data.daily;

                        for (var i = 1; i <= 5; i++) {
                            var dailyWeather = dailyList[i];
                            createForecastCards(dailyWeather);
                        }
                        var list = JSON.parse(localStorage.getItem("cities")) || [];
                        list.push(cityName);
                        let uniqueCities = [...new Set(list)];
                        localStorage.setItem("cities", JSON.stringify(uniqueCities))
                    });
                }).catch(function(err) {
                    console.log(err);
                    alert("Something went wrong");
                });
            } else {
                alert("Your search did not return any result. Please try a different city name")
            }
        });
    }).catch(function(err) {
        console.log(err);
        alert("Something went wrong");
    });
};

// displaying API call results into the page
function displayCityWeather(data, searchInput) {

    //getting the date and converting from epoch format
    var { dt } = data.daily[0];
    let timeUTC = new Date(dt * 1000);
    var timeOut = timeUTC.toLocaleDateString("en-US");
    //displaying date to the page along with city name
    todaysCityName.textContent = searchInput.toUpperCase() + " (" + timeOut + ")";
    //getting rest of the info 
    var { icon } = data.daily[0].weather[0];
    var { day } = data.daily[0].temp;
    var { humidity } = data.daily[0];
    var { wind_speed } = data.daily[0];
    var { uvi } = data.daily[0];

    document.querySelector("#icon-sourse").src = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
    document.querySelector(".temp").innerText = "Temp: " + Math.round(day) + "°F";
    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
    document.querySelector(".wind-speed").innerText = "Wind speed: " + Math.round(wind_speed) + " mph";
    //getting UV index and assigning the color depending on safety
    var uviIndex = document.querySelector(".uv-index");
    uviIndex.innerText = "UV Index: " + uvi;
    if (uvi < 6) {
        uviIndex.classList = "uv-index green"
    } else if (uvi < 8) {
        uviIndex.classList = "uv-index yellow"
    } else {
        uviIndex.classList = "uv-index red"
    }
};

//creating the 5 day forecast info cards
function createForecastCards(daily) {

    var { dt } = daily;
    let timeUTC = new Date(dt * 1000);
    var timeOut = timeUTC.toLocaleDateString("en-US");

    var { icon } = daily.weather[0];
    var { day } = daily.temp;
    var { wind_speed } = daily;
    var { humidity } = daily;

    var forecastDateOut = document.createElement("h4");
    forecastDateOut.innerHTML = timeOut;

    var iconOut = document.createElement("div");
    iconOut.innerHTML = "<img src='https://openweathermap.org/img/wn/" + icon + "@2x.png' />";
    iconOut.classList = "class='future-icon-container'";

    var tempOut = document.createElement("span");
    tempOut.innerHTML = "Temp: " + Math.round(day) + "°F";

    var speedOut = document.createElement("span");
    speedOut.innerHTML = "Wind Speed: " + Math.round(wind_speed) + " mph";

    var humidityOut = document.createElement("span");
    humidityOut.innerHTML = "Humidity: " + humidity + "%";

    var futureCardDiv = document.createElement("div");
    futureCardDiv.classList = "col mb-3 future-card-div card text-white bg-secondary p-3 "
    futureCardDiv.appendChild(forecastDateOut);
    futureCardDiv.appendChild(iconOut);
    futureCardDiv.appendChild(tempOut);
    futureCardDiv.appendChild(speedOut);
    futureCardDiv.appendChild(humidityOut);
    futureForecastContainer.appendChild(futureCardDiv)
}

//getting the weather for the city picked from recent searches
searchContentElement.addEventListener("click", (event) => {
    var targetEl = event.target;
    var cityText = targetEl.textContent;

    if (targetEl.matches(".clicked-city")) {
        getWeather(cityText);
    }
});