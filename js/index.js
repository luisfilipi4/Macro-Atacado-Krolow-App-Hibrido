fetch('js/backend.json')
.then(response => response.json())
.then(data=> {
    localStorage.setItem('produtos', JSON.stringify(data));

    setTimeout(() => {
        $("#produtos").empty();
        data.forEach(produto =>{
            var produtoHTML = `
            <div class="item-card">
            <a data-id="${produto.id}" href="#" class="item">
                <div class="img-container">
                    <img src="${produto.imagem}">
                </div>
            </a>
                <div class="nome-ratting">
                    <span class="color-gray">${produto.nome}<br>
                    ${produto.principal_caracteristica}
                    </span>
                    <span class="bold margin-right">
                    </span>
                </div>
                    <div class="price">${produto.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</div>
       
            </div>`;
            $("#produtos").append(produtoHTML);
        });
        $(".item").on('click', function () {
            var id = $(this).attr('data-id');
            localStorage.setItem('detalhe', id);
            app.views.main.router.navigate('/detalhes/');
            exibirHistorico()
        });

    }, 0);

    })
    .catch(error => console.error('Erro ao fazer fetch dos dados: '+error))

    setTimeout(() => {
        var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
        $('.btn-cart').attr('data-count', carrinho.length);
    }, 300);
///////////////////////HORAS ABAIXO//////////////////////////////////////
function atualizarDataHoraCurta() {
    const dataHoraCurtaElement = document.getElementById('data-hora-curta');
    const abreEmBreveElement = document.getElementById('abre-em-breve');
    const abertoElement = document.getElementById('aberto');
    const fechaEmBreveElement = document.getElementById('fecha-em-breve');
    const fechadoElement = document.getElementById('fechado');

    const agora = new Date();
    const diaDaSemana = agora.getDay();
    const hora = agora.getHours();

    const dia = String(agora.getDate()).padStart(2, '0');
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    const dataHoraCurta = `${dia}/${mes}/${ano}:${horas}:${minutos}:${segundos}`;
    dataHoraCurtaElement.textContent = dataHoraCurta;

    if (diaDaSemana === 0 || (diaDaSemana === 1 && hora < 7)) {
        abreEmBreveElement.style.display = 'none';
        abertoElement.style.display = 'none';
        fechaEmBreveElement.style.display = 'none';
        fechadoElement.style.display = 'block';
    } else if (hora < 7) {
        abreEmBreveElement.style.display = 'block';
        abertoElement.style.display = 'none';
        fechaEmBreveElement.style.display = 'none';
        fechadoElement.style.display = 'none';
    } else if (hora >= 8 && hora < 18) {
        abreEmBreveElement.style.display = 'none';
        abertoElement.style.display = 'block';
        fechaEmBreveElement.style.display = 'none';
        fechadoElement.style.display = 'none';
    } else if (hora >= 19 && hora < 20) {
        abreEmBreveElement.style.display = 'none';
        abertoElement.style.display = 'none';
        fechaEmBreveElement.style.display = 'block';
        fechadoElement.style.display = 'none';
    } else {
        //  das 20:00 em dias que não sejam domingo ///
        abreEmBreveElement.style.display = 'none';
        abertoElement.style.display = 'none';
        fechaEmBreveElement.style.display = 'none';
        fechadoElement.style.display = 'block';
    }
}

setInterval(atualizarDataHoraCurta, 1000);
atualizarDataHoraCurta();
////////////////SCIRPT DE PESQUISA CLIMA////////////////////////////////////
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
////////////////////////COPIAR NUMERO////////////////////
// Seleciona todos os elementos com a classe ".span-copiar" e atribui um evento de clique a eles
$('.span-copiar').on('click', function() {
    var textoCopiar = $(this).text(); // Obtém o texto do span clicado

    // Cria um elemento de área de transferência temporário
    var inputTemporario = $('<input>');
    $('body').append(inputTemporario);
    inputTemporario.val(textoCopiar).select();

    // Copia o texto selecionado
    document.execCommand('copy');
    inputTemporario.remove();

    // Exibe um toast informando que o texto foi copiado
    var toastCenter = app.toast.create({
        text: 'Copiado',
        position: 'center',
        closeTimeout: 2000
    });
    toastCenter.open();
});
//////////////////preload//////////////////////////////
document.addEventListener('DOMContentLoaded', function() {
    var app = document.getElementById('app');

    // Ocultar o conteúdo da página ao iniciar
    app.style.display = 'none';

    // Tempo em milissegundos para o conteúdo reaparecer (por exemplo, 3000 milissegundos = 3 segundos)
    var tempoEspera = 3000;

    // Após o tempo especificado, mostrar novamente o conteúdo da página
    setTimeout(function() {
        app.style.display = 'block';
    }, tempoEspera);
});
///////////////////////////////////////////////