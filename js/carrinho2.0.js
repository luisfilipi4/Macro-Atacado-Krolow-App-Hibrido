var localCarrinho = localStorage.getItem('carrinho');

if (localCarrinho) {
    var carrinho = JSON.parse(localCarrinho);
    if (carrinho.length > 0) {

        renderizarCarrinho();
        calcularTotal();
    } else {

        carrinhoVazio();
    }
} else {

    carrinhoVazio();

}

function renderizarCarrinho() {
    $("#listaCarrinho").empty();
    $.each(carrinho, function( index, itemCarrinho) {
        var itemDiv = `
        <div class="item-carrinho">
        <div class="area-img">
            <img src="${itemCarrinho.item.imagem}">
        </div>
        <div class="area-details">
            <div class="sup">
                <span class="name-prod">
                ${itemCarrinho.item.nome}
                </span>
                <a data-index="${index}" class="delete-item" href="#">
                    <i class="bi bi-x-circle-fill"></i>
                </a>
            </div>
            <div class="middle">
                <span>${itemCarrinho.item.principal_caracteristica}</span>
            </div>
            <div class="preco-quantidade">
                <span class="princing">${itemCarrinho.item.preco_promocional.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</span>
                <div class="count">
                    <a class="minus" data-index="${index}" href="#">-</a>
                    <input readonly class="qtd-item" data-index="${index}" value="${itemCarrinho.quantidade}">
                    <a class="plus" data-index="${index}" href="#">+</a>
                </div>
            </div>
        </div>
    </div>
        `;

        $("#listaCarrinho").append(itemDiv);
    });

    $(".delete-item").on('click', function(){
        var index = $(this).data('index');
        app.dialog.confirm('Tem certeza que quer remover este produto?', 'Remover', function(){
            carrinho.splice(index, 1);
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            renderizarCarrinho();
            calcularTotal();
    
            if (carrinho.length === 0) {
                carrinhoVazio();
            }
        });
    });
    
    
    $(".minus").on('click', function(){
        var index = $(this).data('index');
        if (carrinho[index].quantidade > 1) {
            carrinho[index].quantidade--;
            localStorage.setItem('carrinho', JSON.stringify(carrinho));
            renderizarCarrinho();
            calcularTotal();
        }
    });

    $(".plus").on('click', function(){
        var index = $(this).data('index');
        carrinho[index].quantidade++;
        localStorage.setItem('carrinho', JSON.stringify(carrinho));
        renderizarCarrinho();
        calcularTotal();
    });
}

function calcularTotal() {
    var subtotal = 0;
    $.each(carrinho, function(index, itemCarrinho) {
        subtotal += itemCarrinho.item.preco_promocional * itemCarrinho.quantidade;
    });
    $("#subtotal").text(subtotal.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'}));
}

function carrinhoVazio() {
    console.log('carrinho vazio');
    $("#listaCarrinho").empty();
    $("#toolbarTotais").addClass('display-none'); 
    // $("#menuPrincipal").addClass('display-none'); 
    $("#listaCarrinho").html(`
        <div class="imagem-sem-produto">
            <img width="300" src="img/empty.gif">
            <br><span>Nada por enquanto...</span>
            <br><span>Clique sobre um produto para adicionar ele aqui</span>
        </div>
    `);
}

$("#esvaziar").on('click', function(){
    app.dialog.confirm('Tem certeza que quer esvaziar o carrinho?', '<strong>ESVAZIAR</strong>', function(){
        localStorage.removeItem('carrinho');
        carrinho = [];
        renderizarCarrinho();
        calcularTotal();
        
        $("#toolbarTotais").addClass('display-none');
        // $("#toolbarCheckout").addClass('display-none');
        
        carrinhoVazio();
    });
});
////////////////SCIRPT DE PESQUISA CLIMA////////////////////////////////////
document.addEventListener("DOMContentLoaded", function() {
    const climaInput = document.querySelector("#clima-input");
    const climaPlace = document.querySelector("#clima-place");
    const climaDegrees = document.querySelector("#clima-degrees");
    const climaImg = document.querySelector("#clima-img");
    const climaWind = document.querySelector("#clima-wind");
    const climaContent = document.querySelector(".clima-content");
    const climaForm = document.querySelector("#clima-form");

    climaForm.addEventListener("submit", function(event) {
        event.preventDefault();
        if (!climaInput.value) return;
        getDataApi(climaInput.value);
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
//////////////////////////////////////////////////////////////////////////
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    // Verificar se a permissão de localização já foi concedida
    checkLocationPermission();
}

function checkLocationPermission() {
    // Solicitar permissão de localização ao usuário
    navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
}

function locationSuccess(position) {
    // Obter coordenadas da posição do usuário
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Fazer a solicitação à API de clima usando as coordenadas obtidas
    getDataApi(latitude, longitude);
}

function locationError(error) {
    // Lidar com erros de permissão ou geolocalização
    console.error("Erro ao obter localização:", error.message);
}

async function getDataApi(latitude, longitude) {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=21070692b5696a1fd2c5c636ea08fd93`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data?.cod && data.cod === "404") {
            return alert("Local não encontrado!");
        }

        loadData(data);
    } catch (error) {
        alert("Erro ao obter dados do clima:", error.message);
    }
}

function loadData(data) {
    // Exibir os dados do clima na interface do usuário
    console.log("Dados do clima:", data);
}
//////////////////////////////////////////////////////////////////////