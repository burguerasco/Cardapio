// ===== ALTERE AQUI AS INFORMAÇÕES DA LOJA =====
const CONFIG = {
  whatsapp: "5577988047525",
  endereco: "Rua Isabel Fernandes, s/n, Guarujá, Macarani - BA",
  taxaEntrega: 3,
  // Para trocar a logo depois, substitua o arquivo src/images/logo.png.
  logo: "src/images/logo.png",
};

// Para adicionar fotos, crie a pasta src/images, coloque os arquivos nela e
// preencha "imagem", por exemplo: imagem: "src/images/cheese-salada.jpg".
const PRODUTOS = [
  {
    id: 1,
    categoria: "burguers",
    nome: "Cheese Salada",
    descricao: "Pão brioche, 1 blend de 160g na brasa, 2 fatias de queijo cheddar, alface, tomate e molho da casa.",
    preco: 25,
    imagem: "src/images/cheese-salada.webp",
  },
  {
    id: 2,
    categoria: "burguers",
    nome: "Cheese Burguer",
    descricao: "Pão brioche, 1 blend de 160g na brasa, 2 fatias de queijo cheddar e molho da casa.",
    preco: 25,
    imagem: "src/images/cheese-burguer.webp",
  },
  {
    id: 3,
    categoria: "burguers",
    nome: "Rústico",
    descricao: "Pão brioche, 1 blend de 160g na brasa, bacon fatiado, 2 fatias de queijo cheddar e molho da casa.",
    preco: 28,
    imagem: "src/images/rustico.webp",
  },
  {
    id: 4,
    categoria: "burguers",
    nome: "Burguerasco",
    descricao: "Pão brioche, 2 blends de 160g na brasa, bacon fatiado, 2 fatias de queijo cheddar e molho da casa.",
    preco: 36,
    imagem: "src/images/burguerasco.webp",
  },
  { id: 5, categoria: "latas", nome: "Coca-Cola lata", descricao: "350 ml • bem gelada", preco: 6, imagem: "src/images/coca-cola-lata.webp" },
  { id: 6, categoria: "latas", nome: "Coca-Cola Zero lata", descricao: "350 ml • sem açúcar", preco: 6, imagem: "src/images/coca-cola-zero-lata.webp" },
  { id: 7, categoria: "latas", nome: "Guaraná Antarctica lata", descricao: "350 ml • bem gelado", preco: 6, imagem: "src/images/guarana-lata.webp" },
  { id: 8, categoria: "litro", nome: "Coca-Cola 1 litro", descricao: "Garrafa de 1 litro", preco: 10, imagem: "src/images/coca-cola-1l.webp" },
  { id: 9, categoria: "litro", nome: "Coca-Cola Zero 1 litro", descricao: "Garrafa de 1 litro • sem açúcar", preco: 10, imagem: "src/images/coca-cola-zero-1l.webp" },
  { id: 10, categoria: "litro", nome: "Guaraná Antarctica 1 litro", descricao: "Garrafa de 1 litro", preco: 10, imagem: "src/images/guarana-1l.webp" },
];

const CATEGORIAS = [
  { id: "burguers", nome: "Burguers", subtitulo: "Preparados na brasa" },
  { id: "latas", nome: "Latas", subtitulo: "Bebidas geladas" },
  { id: "litro", nome: "1 litro", subtitulo: "Para compartilhar" },
];

const estado = {
  categoria: "burguers",
  carrinho: {},
  observacoesItens: {},
  entrega: "entrega",
  pagamento: "",
  campos: { nome: "", telefone: "", endereco: "", troco: "", observacao: "" },
};

const moeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const produtoPorId = (id) => PRODUTOS.find((produto) => produto.id === Number(id));

function itensDoCarrinho() {
  return Object.entries(estado.carrinho)
    .map(([id, quantidade]) => ({ ...produtoPorId(id), quantidade, observacao: estado.observacoesItens[id] || "" }))
    .filter((item) => item.id);
}

function quantidadeTotal() {
  return itensDoCarrinho().reduce((total, item) => total + item.quantidade, 0);
}

function subtotal() {
  return itensDoCarrinho().reduce((total, item) => total + item.preco * item.quantidade, 0);
}

function taxaEntrega() {
  return estado.entrega === "entrega" && quantidadeTotal() > 0 ? CONFIG.taxaEntrega : 0;
}

function totalPedido() {
  return subtotal() + taxaEntrega();
}

function alterarQuantidade(id, diferenca) {
  const novaQuantidade = (estado.carrinho[id] || 0) + diferenca;
  if (novaQuantidade <= 0) {
    delete estado.carrinho[id];
    delete estado.observacoesItens[id];
  } else {
    estado.carrinho[id] = novaQuantidade;
  }
  renderizarTudo();
}

function renderizarCategorias() {
  const container = document.querySelector("#categorias");
  container.innerHTML = CATEGORIAS.map((categoria) => `
    <button type="button" class="${estado.categoria === categoria.id ? "ativo" : ""}" data-categoria="${categoria.id}">
      ${categoria.nome}
    </button>
  `).join("");

  container.querySelectorAll("[data-categoria]").forEach((botao) => {
    botao.addEventListener("click", () => {
      estado.categoria = botao.dataset.categoria;
      renderizarTudo();
    });
  });

  const atual = CATEGORIAS.find((categoria) => categoria.id === estado.categoria);
  document.querySelector("#tituloProdutos").textContent = atual.nome;
  document.querySelector("#subtituloProdutos").textContent = atual.subtitulo;
}

function renderizarProdutos() {
  const produtos = PRODUTOS.filter((produto) => produto.categoria === estado.categoria);
  const container = document.querySelector("#listaProdutos");

  container.innerHTML = produtos.map((produto, indice) => {
    const quantidade = estado.carrinho[produto.id] || 0;
    const estiloImagem = produto.imagem ? `style="background-image:url('${produto.imagem}')"` : "";
    return `
      <article class="produto">
        <div class="produto__imagem ${produto.imagem ? "com-imagem" : ""} ${produto.categoria !== "burguers" ? "produto__imagem--bebida" : ""}" ${estiloImagem}>
          <div class="produto__placeholder"><span>▧</span><small>ESPAÇO PARA FOTO</small></div>
        </div>
        <div class="produto__conteudo">
          <div class="produto__topo">
            <span class="produto__numero">${String(indice + 1).padStart(2, "0")}</span>
            <h3>${produto.nome}</h3>
            <strong class="produto__preco">${moeda(produto.preco)}</strong>
          </div>
          <p class="produto__descricao">${produto.descricao}</p>
          <div class="produto__acoes">
            ${quantidade > 0 ? criarContador(produto.id, quantidade) : `<button class="adicionar" type="button" data-adicionar="${produto.id}">Adicionar +</button>`}
          </div>
          ${quantidade > 0 ? `<input class="observacao-item" data-observacao-item="${produto.id}" value="${escaparHtml(estado.observacoesItens[produto.id] || "")}" placeholder="Observação deste item (ex.: sem cebola)" />` : ""}
        </div>
      </article>
    `;
  }).join("");

  ligarControles(container);
}

function criarContador(id, quantidade) {
  return `
    <div class="contador">
      <button type="button" data-menos="${id}" aria-label="Remover uma unidade">−</button>
      <span>${quantidade}</span>
      <button type="button" data-mais="${id}" aria-label="Adicionar uma unidade">+</button>
    </div>
  `;
}

function ligarControles(container) {
  container.querySelectorAll("[data-adicionar]").forEach((botao) => botao.addEventListener("click", () => alterarQuantidade(botao.dataset.adicionar, 1)));
  container.querySelectorAll("[data-mais]").forEach((botao) => botao.addEventListener("click", () => alterarQuantidade(botao.dataset.mais, 1)));
  container.querySelectorAll("[data-menos]").forEach((botao) => botao.addEventListener("click", () => alterarQuantidade(botao.dataset.menos, -1)));
  container.querySelectorAll("[data-observacao-item]").forEach((campo) => {
    campo.addEventListener("input", () => {
      estado.observacoesItens[campo.dataset.observacaoItem] = campo.value;
      sincronizarObservacoes(campo.dataset.observacaoItem, campo.value, campo);
    });
  });
}

function sincronizarObservacoes(id, valor, origem) {
  document.querySelectorAll(`[data-observacao-item="${id}"]`).forEach((campo) => {
    if (campo !== origem) campo.value = valor;
  });
}

function montarPainel(destino) {
  const template = document.querySelector("#templatePainel");
  destino.replaceChildren(template.content.cloneNode(true));

  const itens = itensDoCarrinho();
  destino.querySelector("[data-resumo-titulo]").textContent = itens.length
    ? `${quantidadeTotal()} ${quantidadeTotal() === 1 ? "item" : "itens"}`
    : "Carrinho vazio";
  destino.querySelector("[data-vazio]").hidden = itens.length > 0;
  destino.querySelector("[data-subtotal]").textContent = moeda(subtotal());
  destino.querySelector("[data-taxa-entrega]").textContent = moeda(taxaEntrega());
  destino.querySelector("[data-total]").textContent = moeda(totalPedido());
  destino.querySelector("[data-aviso-taxa]").textContent = estado.entrega === "entrega"
    ? `Taxa fixa de entrega: ${moeda(CONFIG.taxaEntrega)}.`
    : "Retirada no local: sem taxa de entrega.";

  const lista = destino.querySelector("[data-itens]");
  lista.innerHTML = itens.map((item) => `
    <div class="item-carrinho">
      <div class="item-carrinho__linha">
        <strong>${item.quantidade}x ${item.nome}</strong>
        <strong>${moeda(item.preco * item.quantidade)}</strong>
      </div>
      ${criarContador(item.id, item.quantidade)}
      <input class="observacao-item" data-observacao-item="${item.id}" value="${escaparHtml(item.observacao)}" placeholder="Observação do item" />
    </div>
  `).join("");

  ligarControles(destino);
  configurarBotoesDeEscolha(destino, "[data-tipo-entrega]", estado.entrega, (valor) => {
    capturarCampos(destino);
    estado.entrega = valor;
    renderizarPaineis();
  });
  configurarBotoesDeEscolha(destino, "[data-pagamentos]", estado.pagamento, (valor) => {
    capturarCampos(destino);
    estado.pagamento = valor;
    renderizarPaineis();
  });

  destino.querySelector("[data-endereco-wrap]").hidden = estado.entrega === "retirada";
  destino.querySelector("[data-troco-wrap]").hidden = estado.pagamento !== "dinheiro";

  destino.querySelectorAll("[data-campo]").forEach((campo) => {
    campo.value = estado.campos[campo.dataset.campo] || "";
    campo.addEventListener("input", () => {
      estado.campos[campo.dataset.campo] = campo.value;
      sincronizarCampo(campo.dataset.campo, campo.value, campo);
    });
  });

  destino.querySelector("[data-finalizar]").addEventListener("click", () => enviarPedido(destino));
}

function configurarBotoesDeEscolha(destino, seletor, valorAtual, aoEscolher) {
  destino.querySelectorAll(`${seletor} button`).forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.valor === valorAtual);
    botao.addEventListener("click", () => aoEscolher(botao.dataset.valor));
  });
}

function capturarCampos(destino) {
  destino.querySelectorAll("[data-campo]").forEach((campo) => {
    estado.campos[campo.dataset.campo] = campo.value;
  });
}

function sincronizarCampo(nome, valor, origem) {
  document.querySelectorAll(`[data-campo="${nome}"]`).forEach((campo) => {
    if (campo !== origem) campo.value = valor;
  });
}

function renderizarPaineis() {
  montarPainel(document.querySelector("#painelDesktop"));
  montarPainel(document.querySelector("#painelMobile"));
}

function validarPedido() {
  if (!quantidadeTotal()) return "Adicione pelo menos um item ao pedido.";
  if (!estado.campos.nome.trim()) return "Informe seu nome.";
  if (!estado.campos.telefone.trim()) return "Informe seu WhatsApp.";
  if (estado.entrega === "entrega" && !estado.campos.endereco.trim()) return "Informe o endereço de entrega.";
  if (!estado.pagamento) return "Escolha uma forma de pagamento.";
  return "";
}

function enviarPedido(destino) {
  capturarCampos(destino);
  const erro = validarPedido();
  document.querySelectorAll("[data-validacao]").forEach((elemento) => { elemento.textContent = erro; });
  if (erro) return;

  const itens = itensDoCarrinho();
  const temBebida = itens.some((item) => item.categoria === "latas" || item.categoria === "litro");
  const emojiPagamento = estado.pagamento === "cartao" ? "💳" : estado.pagamento === "dinheiro" ? "💵" : "📱";
  const nomePagamento = { pix: "Pix", cartao: "Cartão", dinheiro: "Dinheiro" }[estado.pagamento];
  const destinoPedido = estado.entrega === "retirada" ? `Retirada — ${CONFIG.endereco}` : `Entrega — ${estado.campos.endereco.trim()}`;

  const linhasProdutos = itens.flatMap((item) => [
    `*${item.quantidade}x ${item.nome}* — ${moeda(item.preco * item.quantidade)}`,
    ...(item.observacao.trim() ? [`  Obs.: ${item.observacao.trim()}`] : []),
  ]);

  const mensagem = [
    "🔥 *NOVO PEDIDO — BURGUERASCO*",
    temBebida ? "🥤 *Pedido com bebida*" : "",
    "",
    ...linhasProdutos,
    "",
    `*Subtotal:* ${moeda(subtotal())}`,
    `*Taxa de entrega:* ${moeda(taxaEntrega())}`,
    `*Total:* ${moeda(totalPedido())}`,
    "",
    `*Cliente:* ${estado.campos.nome.trim()}`,
    `*Telefone:* ${estado.campos.telefone.trim()}`,
    `*Forma:* ${destinoPedido}`,
    `${emojiPagamento} *Pagamento:* ${nomePagamento}`,
    ...(estado.pagamento === "dinheiro" && estado.campos.troco.trim() ? [`*Troco para:* ${estado.campos.troco.trim()}`] : []),
    ...(estado.campos.observacao.trim() ? [`*Observações gerais:* ${estado.campos.observacao.trim()}`] : []),
  ].filter((linha, indice, array) => linha !== "" || array[indice - 1] !== "").join("\n");

  window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
}

function atualizarIndicadores() {
  const quantidade = quantidadeTotal();
  document.querySelector("#quantidadeTopo").textContent = quantidade;
  document.querySelector("#quantidadeBarra").textContent = quantidade;
  document.querySelector("#totalBarra").textContent = moeda(totalPedido());
  document.querySelector("#barraPedido").hidden = quantidade === 0;
}

function renderizarTudo() {
  renderizarCategorias();
  renderizarProdutos();
  renderizarPaineis();
  atualizarIndicadores();
}

function abrirCarrinho() {
  document.querySelector("#modalCarrinho").hidden = false;
  document.body.style.overflow = "hidden";
}

function fecharCarrinho() {
  document.querySelector("#modalCarrinho").hidden = true;
  document.body.style.overflow = "";
}

function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function iniciar() {
  if (CONFIG.logo) {
    const logo = document.querySelector("#logoMarca");
    logo.style.backgroundImage = `url('${CONFIG.logo}')`;
    logo.classList.add("com-imagem");
  }

  document.querySelector("#abrirCarrinho").addEventListener("click", abrirCarrinho);
  document.querySelector("#barraPedido").addEventListener("click", abrirCarrinho);
  document.querySelector("#fecharCarrinho").addEventListener("click", fecharCarrinho);
  document.querySelector("#fecharPeloFundo").addEventListener("click", fecharCarrinho);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharCarrinho();
  });

  renderizarTudo();
}

document.addEventListener("DOMContentLoaded", iniciar);
