document.addEventListener("DOMContentLoaded", function() {
    const climaInput = document.querySelector("#clima-input");
    const climaPlace = document.querySelector("#clima-place");
    const climaDegrees = document.querySelector("#clima-degrees");
    const climaImg = document.querySelector("#clima-img");
    const climaWind = document.querySelector("#clima-wind");
    const climaContent = document.querySelector(".clima-content");
    const climaForm = document.querySelector("#clima-form");

    climaForm.addEventListener("submit", async function(event) {
        event.preventDefault(); // Evita a submissão padrão do formulário que recarrega a página
        const climaInput = document.querySelector("#clima-input");
        const cityName = climaInput.value;
    
        if (!cityName) return;
    
        try {
            localStorage.setItem("savedLocation", cityName);
            const data = await getDataApi(cityName);
            loadData(data);
        } catch (error) {
            console.error("Erro ao carregar dados do clima:", error);
            alert("Erro ao carregar dados do clima.");
        }
    
        return false; // Evita que o formulário seja enviado e a página recarregada
    });
    getLocation();    

    async function getLocation() {
        try {
            const savedLocation = localStorage.getItem("savedLocation");
            if (savedLocation) {
                getDataApi(savedLocation);
            } else {
       
                if ("geolocation" in navigator) {
                 
                    navigator.geolocation.getCurrentPosition(async function(position) {
                       
                        const latitude = position.coords.latitude;
                        const longitude = position.coords.longitude;

                    
                        const locationData = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`);
                        const locationJson = await locationData.json();

                    
                        const cityName = locationJson.locality;

                        localStorage.setItem("savedLocation", cityName);

                        getDataApi(cityName);
                    });
                } else {
                    console.error("Geolocalização não é suportada pelo navegador.");
                }
            }
        } catch (error) {
            console.error("Erro ao obter localização:", error);
        }
    }

    async function getDataApi(cityName) {
        let url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURI(
            cityName
        )}&units=metric&appid=21070692b5696a1fd2c5c636ea08fd93`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data?.cod && data.cod === "404") {
                return alert("Local não encontrado!");
            }

            loadData(data);
        } catch (error) {
            alert(error);
        }
    }

    function loadData(data) {
        climaPlace.innerHTML = `${data.name}, ${data.sys.country}`;
        climaDegrees.innerHTML = `Temperatura: ${Math.floor(data.main.temp)}° C`;
        climaImg.src = `http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        climaWind.innerHTML = `Vento: ${data.wind.speed} km/h`;
        climaContent.style.display = "flex";
    }
});
//////////////////preload//////////////////////////////
// document.addEventListener('DOMContentLoaded', function() {
//     var app = document.getElementById('app');

//     // Ocultar o conteúdo da página ao iniciar
//     app.style.display = 'none';

//     // Tempo em milissegundos para o conteúdo reaparecer (por exemplo, 3000 milissegundos = 3 segundos)
//     var tempoEspera = 3000;

//     // Após o tempo especificado, mostrar novamente o conteúdo da página
//     setTimeout(function() {
//         app.style.display = 'block';
//     }, tempoEspera);
// });
///////////////////////////////////////////////