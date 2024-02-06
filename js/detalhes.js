var id = parseInt(localStorage.getItem('detalhe'));
var produtos = JSON.parse(localStorage.getItem('produtos'));
var item = produtos.find(produto => produto.id === id);

if (item){
    console.log('Produto encontrado: ',item);
    $("#imagem-detalhe").attr('src', item.imagem);
    $("#nome-detalhe").html(item.nome);
    $("#descição-detalhe").html(item.descricao);
    $("#preço-detalhe").html(item.preco.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL' }));
    $("#preçopromo-detalhe").html(item.preco_promocional.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL' }));
} else {
    console.log('Produto não encontrado');
}

var carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function adicionarAoCarrinho(item, quantidade) {
    var itemNoCarrinho = carrinho.find(c=> c.item.id === item.id);
    if (itemNoCarrinho) {
        itemNoCarrinho.quantidade += quantidade;
        itemNoCarrinho.total_item = itemNoCarrinho * item.preco_promocional;
    } else {
        carrinho.push({
            item: item,
            quantidade: quantidade,
            total_item: quantidade * item.preco_promocional
        })
    }
    localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

$(".add-cart").on('click', function () {
    adicionarAoCarrinho(item, 1);
    var toastCenter = app.toast.create({
        text: `${item.nome} adicionado ao carrinho`,
        position: 'center',
        closeTimeout: 2000,
      });
      toastCenter.open();
});
// Carregar dados do backend.json
fetch('js/backend.json')
    .then(response => response.json())
    .then(data => {
        localStorage.setItem('produtos', JSON.stringify(data));
        carregarDadosBackend(data); // Chama a função para carregar os dados do backend
    })
    .catch(error => console.error('Erro ao carregar os dados do backend:', error));

// Função para carregar os dados do backend
function carregarDadosBackend(data) {
    // Obter os produtos
    var produtos = data;

    // Renderizar produtos nos recomendados
    var recomendadosContainer = document.getElementById('recomendados-container');
    if (recomendadosContainer) {
        renderizarProdutos(produtos, recomendadosContainer);
    }

    // Adicionar evento de clique para cada produto nos recomendados
    recomendadosContainer.querySelectorAll('.item').forEach(item => {
        item.addEventListener('click', function () {
            var id = this.getAttribute('data-id');
            adicionarAoHistorico(id, produtos);
        });
    });
}

// Função para renderizar produtos na página
function renderizarProdutos(produtos, container) {
    // Limpar container antes de renderizar produtos
    container.innerHTML = '';

    // Renderizar cada produto dentro do container
    produtos.forEach(produto => {
        var produtoHTML = `
            <div class="item-card">
                <a data-id="${produto.id}" href="#" class="item">
                    <div class="img-container">
                        <img src="${produto.imagem}">
                    </div>
                    <div class="nome-ratting">
                        <span class="color-gray">${produto.nome}<br>
                        ${produto.principal_caracteristica}
                        </span>
                        <span class="bold margin-right">
                            <img id="star-favorito" width="24" height="24" src="${produto.estrela}" alt="">
                            <img id="star-gif-favorito" src="${produto.gif_estrela}" alt="">
                        </span>
                    </div>
                    <div class="price">${produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </a>
            </div>`;
        container.insertAdjacentHTML('beforeend', produtoHTML);
    });
}

// Função para adicionar produto ao histórico
function adicionarAoHistorico(id, produtos) {
    console.log("ID do produto selecionado:", id);
    var historicoContainer = document.getElementById('historico-container');
    console.log("Container do histórico:", historicoContainer);
    var produtoSelecionado = produtos.find(produto => produto.id == id);
    console.log("Produto selecionado:", produtoSelecionado);

    if (historicoContainer && produtoSelecionado) {
        // Obter produtos do histórico do Local Storage
        var produtosHistorico = obterHistoricoDoLocalStorage() || [];
        console.log("Produtos no histórico antes de adicionar:", produtosHistorico);

        // Verificar se o produto já está no histórico
        if (!produtosHistorico.find(produto => produto.id == id)) {
            // Adicionar produto ao histórico
            produtosHistorico.unshift(produtoSelecionado);
            console.log("Produtos no histórico após adicionar:", produtosHistorico);

            // Salvar o histórico no Local Storage
            salvarHistoricoNoLocalStorage(produtosHistorico);

            // Atualizar a exibição do histórico
            renderizarProdutos(produtosHistorico, historicoContainer);

            // Redirecionar após adicionar o produto ao histórico
            window.location.href = '/detalhes/'; // ou qualquer outra página que você deseja redirecionar
        }
    }
}

// Função para obter histórico do Local Storage
function obterHistoricoDoLocalStorage() {
    var historicoSalvo = localStorage.getItem('historico-container');
    return historicoSalvo ? JSON.parse(historicoSalvo) : [];
}

// Função para salvar histórico no Local Storage
function salvarHistoricoNoLocalStorage(historico) {
    localStorage.setItem('historico-container', JSON.stringify(historico));
}
