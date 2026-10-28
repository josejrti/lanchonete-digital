const textoCardapio = `[
    {"id": 1, "nome": "Coxinha", "preco": 5.00},
    {"id": 2, "nome": "Pastel", "preco": 8.00},
    {"id": 3, "nome": "Açaí", "preco": 18.00},
    {"id": 4, "nome": "Suco", "preco": 6.00},
    {"id": 5, "nome": "X-tudo", "preco": 22.00},
    {"id": 6, "nome": "Bolo de rolo", "preco": 7.00},
    {"id": 7, "nome": "Empada", "preco": 6.00},
    {"id": 8, "nome": "Hambúrguer", "preco": 15.00},
    {"id": 9, "nome": "Pão de queijo", "preco": 4.00},
    {"id": 10, "nome": "Suco de caju", "preco": 6.00}
]`;

const cardapio = JSON.parse(textoCardapio);
const elementoBuscar = document.querySelector("#buscar");
const formularioBusca = document.querySelector("#formulariobusca");
const elementoResultadoBusca = document.querySelector("#resultado-busca");
const elementoItensCardapio = document.querySelector("#itenscardapio");
const elementoItensCarrinho = document.querySelector("#itenscarrinho");
const elementoTotalItens = document.querySelector("#total-itens");
const elementoValorTotal = document.querySelector("#valor-total");
const elementoResumoQuantidade = document.querySelector("#resumo-quantidade");
const botaoLimparCarrinho = document.querySelector("#limpar-carrinho");
const formularioPedido = document.querySelector("#formulariopedido");
const campoNome = document.querySelector("#nome");
const campoTelefone = document.querySelector("#tel");
const erroTelefone = document.querySelector("#tel-erro");
const confirmacaoPedido = document.querySelector("#confirmacaopedido");
const detalhesPedido = document.querySelector("#detalhespedido");

function recuperarCarrinho() {
    try {
        const textoSalvo = localStorage.getItem("carrinho");

        if (textoSalvo === null) {
            return [];
        }

        const carrinhoSalvo = JSON.parse(textoSalvo);

        if (!Array.isArray(carrinhoSalvo)) {
            return [];
        }

        // Aceita somente produtos existentes no cardápio.
        return carrinhoSalvo
            .filter((item) =>
                item !== null &&
                typeof item === "object" &&
                Number.isInteger(item.id) &&
                cardapio.some((produto) => produto.id === item.id)
            )
            .map((item) =>
                cardapio.find((produto) => produto.id === item.id)
            );
    } catch (erro) {
        console.error("Não foi possível recuperar o carrinho:", erro);
        return [];
    }
}
const carrinho = recuperarCarrinho();


function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function normalizarTexto(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function salvarCarrinho() {
    try {
        localStorage.setItem("carrinho", JSON.stringify(carrinho));
    } catch (erro) {
        console.error("Não foi possível salvar o carrinho:", erro);
    }
}


// 5. RENDERIZAR O CARDÁPIO

function renderizarCardapio(itens) {
    // Remove os elementos da renderização anterior.
    elementoItensCardapio.replaceChildren();

    for (const produto of itens) {
        const item = document.createElement("div");
        const nomePreco = document.createElement("span");
        const botao = document.createElement("button");

        item.classList.add("item-cardapio");

        nomePreco.textContent =
            `${produto.nome} - ${formatarPreco(produto.preco)}`;

        botao.type = "button";
        botao.classList.add("botao", "botao-adicionar");
        botao.textContent = "Adicionar";

        // O botão guarda o ID do produto.
        botao.dataset.id = produto.id;
        botao.dataset.acao = "adicionar";

        item.append(nomePreco, botao);
        elementoItensCardapio.append(item);
    }

    if (itens.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.classList.add("mensagem");
        mensagem.textContent = "Nenhum produto encontrado.";

        elementoItensCardapio.append(mensagem);
    }
}


// 6. BUSCAR PRODUTOS

function buscarNoCardapio() {
    const termo = normalizarTexto(elementoBuscar.value);

    const produtosEncontrados = cardapio.filter((produto) =>
        normalizarTexto(produto.nome).includes(termo)
    );

    renderizarCardapio(produtosEncontrados);

    if (termo !== "") {
        elementoResultadoBusca.textContent =
            `${produtosEncontrados.length} produto(s) encontrado(s).`;
    } else {
        elementoResultadoBusca.textContent = "";
    }
}

elementoBuscar.addEventListener("input", buscarNoCardapio);

formularioBusca.addEventListener("submit", (evento) => {
    evento.preventDefault();
});


// 7. ADICIONAR PRODUTO AO CARRINHO

function adicionarAoCarrinho(id) {
    const produto = cardapio.find((item) => item.id === id);

    if (!produto) {
        return;
    }

    // Cada adição representa uma unidade do produto.
    carrinho.push(produto);

    salvarCarrinho();
    atualizarCarrinho();

    elementoResultadoBusca.textContent =
        `${produto.nome} adicionado ao carrinho.`;
}


// 8. REMOVER PRODUTO DO CARRINHO

function removerDoCarrinho(indice) {
    if (indice < 0 || indice >= carrinho.length) {
        return;
    }

    const produtoRemovido = carrinho[indice];

    carrinho.splice(indice, 1);

    salvarCarrinho();
    atualizarCarrinho();
    
    elementoResultadoBusca.textContent =
        `${produtoRemovido.nome} removido do carrinho.`;
}


// 9. RENDERIZAR O CARRINHO

function renderizarCarrinho() {
    elementoItensCarrinho.replaceChildren();

    carrinho.forEach((produto, indice) => {
        const item = document.createElement("div");
        const nomePreco = document.createElement("span");
        const botao = document.createElement("button");

        item.classList.add("item-carrinho");

        nomePreco.textContent =
            `${produto.nome} - ${formatarPreco(produto.preco)}`;

        botao.type = "button";
        botao.classList.add("botao", "botao-remover");
        botao.textContent = "Remover";

        // O índice identifica a unidade que será removida.
        botao.dataset.indice = indice;
        botao.dataset.acao = "remover";

        item.append(nomePreco, botao);
        elementoItensCarrinho.append(item);
    });

    if (carrinho.length === 0) {
        const mensagem = document.createElement("p");

        mensagem.classList.add("mensagem");
        mensagem.textContent = "Seu carrinho está vazio.";

        elementoItensCarrinho.append(mensagem);
    }
}


// 10. ATUALIZAR QUANTIDADE E VALOR TOTAL

function atualizarCarrinho() {
    renderizarCarrinho();

    const totalItens = carrinho.length;

    const valorTotal = carrinho.reduce(
        (total, produto) => total + produto.preco,
        0
    );

    elementoTotalItens.textContent = totalItens;
    elementoValorTotal.textContent = formatarPreco(valorTotal);

    elementoResumoQuantidade.textContent =
        `${totalItens} ${totalItens === 1 ? "item" : "itens"} no carrinho`;

    botaoLimparCarrinho.disabled = carrinho.length === 0;
}


// 11. DELEGAÇÃO DE EVENTOS NO CARDÁPIO

elementoItensCardapio.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao='adicionar']");

    if (!botao || !elementoItensCardapio.contains(botao)) {
        return;
    }

    const id = Number(botao.dataset.id);

    adicionarAoCarrinho(id);
});


// 12. DELEGAÇÃO DE EVENTOS NO CARRINHO

elementoItensCarrinho.addEventListener("click", (evento) => {
    const botao = evento.target.closest("button[data-acao='remover']");

    if (!botao || !elementoItensCarrinho.contains(botao)) {
        return;
    }

    const indice = Number(botao.dataset.indice);

    removerDoCarrinho(indice);
});


// 13. LIMPAR O CARRINHO

botaoLimparCarrinho.addEventListener("click", () => {
    carrinho.length = 0;

    salvarCarrinho();
    atualizarCarrinho();

    elementoResultadoBusca.textContent = "Carrinho limpo.";
});


// 14. VALIDAR O TELEFONE

function validarTelefone(telefone) {
    const numeros = telefone.replace(/\D/g, "");

    // Aceita DDD + telefone com 10 ou 11 dígitos.
    return numeros.length === 10 || numeros.length === 11;
}

campoTelefone.addEventListener("input", () => {
    erroTelefone.textContent = "";
    erroTelefone.hidden = true;

    campoTelefone.removeAttribute("aria-invalid");
});


// 15. PROCESSAR O PEDIDO

formularioPedido.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const telefone = campoTelefone.value.trim();

    if (carrinho.length === 0) {
        alert("Adicione pelo menos um produto ao carrinho.");
        elementoBuscar.focus();
        return;
    }

    if (nome === "") {
        campoNome.focus();
        return;
    }

    if (!validarTelefone(telefone)) {
        erroTelefone.textContent =
            "Informe um WhatsApp válido com DDD (10 ou 11 dígitos).";

        erroTelefone.hidden = false;

        campoTelefone.setAttribute("aria-invalid", "true");
        campoTelefone.focus();

        return;
    }

    const valorTotal = carrinho.reduce(
        (total, produto) => total + produto.preco,
        0
    );

    // Criar os detalhes sem inserir dados do usuário como HTML.
    detalhesPedido.replaceChildren();

    const mensagem = document.createElement("p");
    mensagem.textContent = `Pedido de ${nome}`;

    const tituloItens = document.createElement("h4");
    tituloItens.textContent = "Itens do pedido";

    const lista = document.createElement("ul");

    for (const produto of carrinho) {
        const item = document.createElement("li");

        item.textContent =
            `${produto.nome} - ${formatarPreco(produto.preco)}`;

        lista.append(item);
    }

    const total = document.createElement("p");
    total.textContent = `Valor total: ${formatarPreco(valorTotal)}`;

    const contato = document.createElement("p");
    contato.textContent = `WhatsApp: ${telefone}`;

    detalhesPedido.append(
        mensagem,
        tituloItens,
        lista,
        total,
        contato
    );

    confirmacaoPedido.hidden = false;

    // Leva o usuário até o resumo do pedido.
    confirmacaoPedido.scrollIntoView({
        behavior: "smooth",
        block: "nearest"
    });
});


buscarNoCardapio();
atualizarCarrinho();
