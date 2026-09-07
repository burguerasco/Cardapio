// ===== ALTERE AQUI AS INFORMAÇÕES DA LOJA =====
const CONFIG = {
  whatsapp: "5577988047525",
  chavePix: "77988047525",
  endereco: "Rua Isabel Fernandes, s/n, Guarujá, Macarani - BA",
  taxaEntrega: 3,
  // ===== DIAS E HORÁRIOS: ALTERE SOMENTE ESTE BLOCO =====
  // 0 = domingo, 1 = segunda, 2 = terça, 3 = quarta,
  // 4 = quinta, 5 = sexta, 6 = sábado.
  // Use horários entre aspas, no formato "HH:MM" (ex.: "19:30").
  // O texto do aviso acompanha estas configurações automaticamente.
  funcionamento: {
    fusoHorario: "America/Bahia",
    dias: [1, 2, 3, 4, 5, 6], // Segunda a sábado; domingo fechado.
    abertura: "19:00",
    fechamento: "23:00", // Pode ser após a meia-noite, como "01:00".
  },
  // Para trocar a logo depois, substitua o arquivo src/images/logo.png.
  logo: "src/images/logo.png",
};

// Para adicionar fotos, crie a pasta src/images, coloque os arquivos nela e
// preencha "imagem", por exemplo: imagem: "src/images/cheese-salada.jpg".
// Para deixar um produto indisponível, adicione disponivel: false.
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
  // Foto do Kuat Zero: https://www.gbarbosa.com.br/refrigerante-guarana-kuat-zero-lata-350ml/p
  { id: 11, categoria: "latas", nome: "Guaraná Kuat Zero lata", descricao: "350 ml • sem açúcar", preco: 6, imagem: "src/images/guarana-kuat-zero-lata.webp" },
  { id: 7, categoria: "latas", nome: "Guaraná Antarctica lata", descricao: "350 ml • bem gelado", preco: 6, imagem: "src/images/guarana-lata.webp", disponivel: false },
  { id: 8, categoria: "litro", nome: "Coca-Cola 1 litro", descricao: "Garrafa de 1 litro", preco: 10, imagem: "src/images/coca-cola-1l.webp" },
  { id: 9, categoria: "litro", nome: "Coca-Cola Zero 1 litro", descricao: "Garrafa de 1 litro • sem açúcar", preco: 10, imagem: "src/images/coca-cola-zero-1l.webp" },
  { id: 10, categoria: "litro", nome: "Guaraná Antarctica 1 litro", descricao: "Garrafa de 1 litro", preco: 10, imagem: "src/images/guarana-1l.webp" },
];

const CATEGORIAS = [
  { id: "burguers", nome: "Burguers", subtitulo: "Preparados na brasa" },
  { id: "latas", nome: "Latas", subtitulo: "Bebidas geladas" },
  { id: "litro", nome: "1 litro", subtitulo: "Para compartilhar" },
];

const CHAVE_CARRINHO = "burguerasco:carrinho:v1";

const estado = {
  categoria: "burguers",
  carrinho: {},
  observacoesItens: {},
  entrega: "entrega",
  pagamento: "",
  pixCopia: "",
  avisoCarrinho: "",
  campos: { nome: "", telefone: "", endereco: "", troco: "", observacao: "" },
};

let rolagemPagina = 0;
let tentativaCopiaPix = 0;
let categoriaRenderizada = null;
let temporizadorFuncionamento = null;

const moeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const produtoPorId = (id) => PRODUTOS.find((produto) => produto.id === Number(id));

function horarioEmMinutos(horario) {
  const partes = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(horario);
  return partes ? Number(partes[1]) * 60 + Number(partes[2]) : null;
}

function diasDeFuncionamento() {
  return [...new Set(CONFIG.funcionamento.dias)]
    .filter((dia) => Number.isInteger(dia) && dia >= 0 && dia <= 6)
    .sort((a, b) => a - b);
}

function lojaEstaAberta(agora = new Date()) {
  const abertura = horarioEmMinutos(CONFIG.funcionamento.abertura);
  const fechamento = horarioEmMinutos(CONFIG.funcionamento.fechamento);
  if (abertura === null || fechamento === null || abertura === fechamento) return false;

  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.funcionamento.fusoHorario,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(agora);
  const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    .indexOf(partes.find((parte) => parte.type === "weekday").value);
  const minutos = Number(partes.find((parte) => parte.type === "hour").value) * 60
    + Number(partes.find((parte) => parte.type === "minute").value);
  const dias = diasDeFuncionamento();

  if (abertura < fechamento) {
    return dias.includes(dia) && minutos >= abertura && minutos < fechamento;
  }

  // Quando termina após a meia-noite, a madrugada pertence ao dia de abertura.
  return (dias.includes(dia) && minutos >= abertura)
    || (dias.includes((dia + 6) % 7) && minutos < fechamento);
}

function textoHorarioFuncionamento() {
  const dias = diasDeFuncionamento();
  const abertura = horarioEmMinutos(CONFIG.funcionamento.abertura);
  const fechamento = horarioEmMinutos(CONFIG.funcionamento.fechamento);
  if (!dias.length || abertura === null || fechamento === null || abertura === fechamento) {
    return "Consulte nossos horários de atendimento pelo WhatsApp.";
  }

  const nomesDias = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const diasRecorrentes = ["aos domingos", "às segundas", "às terças", "às quartas", "às quintas", "às sextas", "aos sábados"];
  let textoDias;
  if (dias.length === 7) {
    textoDias = "todos os dias";
  } else if (dias.length > 1 && dias.every((dia, indice) => dia === dias[0] + indice)) {
    textoDias = `de ${nomesDias[dias[0]]} a ${nomesDias[dias[dias.length - 1]]}`;
  } else {
    const nomes = dias.map((dia) => diasRecorrentes[dia]);
    textoDias = nomes.length === 1 ? nomes[0] : `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
  }

  const formatarHora = (minutos) => `${Math.floor(minutos / 60)}h${minutos % 60 ? String(minutos % 60).padStart(2, "0") : ""}`;
  const fimNoDiaSeguinte = fechamento < abertura ? " do dia seguinte" : "";
  return `Funcionamos ${textoDias}, das ${formatarHora(abertura)} às ${formatarHora(fechamento)}${fimNoDiaSeguinte}.`;
}

function atualizarFuncionamento() {
  window.clearTimeout(temporizadorFuncionamento);
  const aviso = document.querySelector("#avisoFuncionamento");
  if (!aviso) return;

  const descricao = aviso.querySelector("[data-horario-funcionamento]");
  const texto = textoHorarioFuncionamento();
  if (descricao && descricao.textContent !== texto) descricao.textContent = texto;
  // O aviso informa o horário; o cardápio continua aceitando encomendas.
  aviso.hidden = lojaEstaAberta();
  // Reconfere na virada de cada minuto, sem recarregar ou alterar o carrinho.
  temporizadorFuncionamento = window.setTimeout(atualizarFuncionamento, 60000 - (Date.now() % 60000));
}

function animarElemento(elemento, quadros, opcoes = {}) {
  if (!elemento || typeof elemento.animate !== "function") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  try {
    if (typeof elemento.getAnimations === "function") {
      elemento.getAnimations().forEach((animacao) => animacao.cancel());
    }
    elemento.animate(quadros, {
      duration: 280,
      easing: "cubic-bezier(0.22, 0.68, 0.25, 1)",
      fill: "backwards",
      ...opcoes,
    });
  } catch {
    // O pedido continua funcionando mesmo sem suporte a animações.
  }
}

function removerCarrinhoSalvo() {
  try {
    window.localStorage.removeItem(CHAVE_CARRINHO);
  } catch {
    // O pedido continua funcionando se o navegador bloquear o armazenamento.
  }
}

function salvarCarrinho() {
  const itens = itensDoCarrinho().map(({ id, quantidade, observacao }) => ({ id, quantidade, observacao }));
  if (!itens.length) {
    removerCarrinhoSalvo();
    return;
  }

  try {
    window.localStorage.setItem(CHAVE_CARRINHO, JSON.stringify({
      versao: 1,
      itens,
      categoria: estado.categoria,
      entrega: estado.entrega,
      pagamento: estado.pagamento,
      campos: estado.campos,
    }));
  } catch {
    // Falhas no salvamento não impedem adicionar itens ou enviar o pedido.
  }
}

function recuperarCarrinho() {
  try {
    const texto = window.localStorage.getItem(CHAVE_CARRINHO);
    if (!texto) return;
    const salvo = JSON.parse(texto);
    if (!salvo || salvo.versao !== 1 || !Array.isArray(salvo.itens)) {
      removerCarrinhoSalvo();
      return;
    }

    const carrinho = {};
    const observacoesItens = {};
    let houveRemocao = false;
    salvo.itens.forEach((item) => {
      if (!item || !Number.isInteger(item.id) || !Number.isSafeInteger(item.quantidade) || item.quantidade <= 0) return;
      const produto = produtoPorId(item.id);
      if (!produto || produto.disponivel === false) {
        houveRemocao = true;
        return;
      }
      if (carrinho[produto.id]) return;
      carrinho[produto.id] = item.quantidade;
      observacoesItens[produto.id] = typeof item.observacao === "string" ? item.observacao : "";
    });

    estado.carrinho = carrinho;
    estado.observacoesItens = observacoesItens;
    estado.avisoCarrinho = houveRemocao
      ? "Produtos que não estão mais disponíveis foram removidos do carrinho."
      : "";

    if (Object.keys(carrinho).length) {
      estado.categoria = CATEGORIAS.some((categoria) => categoria.id === salvo.categoria) ? salvo.categoria : "burguers";
      estado.entrega = salvo.entrega === "retirada" ? "retirada" : "entrega";
      estado.pagamento = ["pix", "cartao", "dinheiro"].includes(salvo.pagamento) ? salvo.pagamento : "";
      const campos = salvo.campos && typeof salvo.campos === "object" ? salvo.campos : {};
      Object.keys(estado.campos).forEach((nome) => {
        estado.campos[nome] = typeof campos[nome] === "string" ? campos[nome] : "";
      });
    }

    // Só os IDs são recuperados: preços e disponibilidade vêm do cardápio atual.
    salvarCarrinho();
  } catch {
    removerCarrinhoSalvo();
  }
}

function limparCarrinho() {
  estado.carrinho = {};
  estado.observacoesItens = {};
  estado.entrega = "entrega";
  estado.pagamento = "";
  estado.pixCopia = "";
  estado.avisoCarrinho = "";
  Object.keys(estado.campos).forEach((nome) => { estado.campos[nome] = ""; });
  tentativaCopiaPix += 1;
  removerCarrinhoSalvo();
  renderizarTudo();
}

function itensDoCarrinho() {
  return Object.entries(estado.carrinho)
    .map(([id, quantidade]) => ({ ...produtoPorId(id), quantidade, observacao: estado.observacoesItens[id] || "" }))
    .filter((item) => item.id && item.disponivel !== false);
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
  const produto = produtoPorId(id);
  if (!produto || produto.disponivel === false) return;

  const novaQuantidade = (estado.carrinho[id] || 0) + diferenca;
  if (novaQuantidade <= 0) {
    delete estado.carrinho[id];
    delete estado.observacoesItens[id];
  } else {
    estado.carrinho[id] = novaQuantidade;
  }
  salvarCarrinho();
  renderizarTudo();
  animarElemento(document.querySelector("#quantidadeBarra"), [
    { transform: "scale(1)" },
    { transform: "scale(1.18)", offset: 0.45 },
    { transform: "scale(1)" },
  ], { duration: 240 });
  document.querySelectorAll("[data-total]").forEach((elemento) => {
    animarElemento(elemento, [
      { opacity: 0.55, transform: "translateY(3px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 200 });
  });
}

function renderizarCategorias() {
  const container = document.querySelector("#categorias");
  if (!container.querySelector("[data-categoria]")) {
    container.innerHTML = CATEGORIAS.map((categoria) => `
      <button type="button" data-categoria="${categoria.id}">
        ${categoria.nome}
      </button>
    `).join("");

    container.querySelectorAll("[data-categoria]").forEach((botao) => {
      botao.addEventListener("click", () => {
        if (estado.categoria === botao.dataset.categoria) return;
        estado.categoria = botao.dataset.categoria;
        salvarCarrinho();
        renderizarTudo();
      });
    });
  }

  container.querySelectorAll("[data-categoria]").forEach((botao) => {
    const ativo = estado.categoria === botao.dataset.categoria;
    botao.classList.toggle("ativo", ativo);
    botao.setAttribute("aria-pressed", String(ativo));
  });

  const atual = CATEGORIAS.find((categoria) => categoria.id === estado.categoria);
  document.querySelector("#tituloProdutos").textContent = atual.nome;
  document.querySelector("#subtituloProdutos").textContent = atual.subtitulo;
}

function renderizarProdutos() {
  const animarEntrada = categoriaRenderizada !== estado.categoria;
  const produtos = PRODUTOS.filter((produto) => produto.categoria === estado.categoria);
  const container = document.querySelector("#listaProdutos");

  const cards = produtos.map((produto, indice) => {
    const indisponivel = produto.disponivel === false;
    const quantidade = indisponivel ? 0 : estado.carrinho[produto.id] || 0;
    const estiloImagem = produto.imagem ? `style="background-image:url('${produto.imagem}')"` : "";
    return `
      <article class="produto${indisponivel ? " produto--indisponivel" : ""}">
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
            ${indisponivel
              ? `<button class="adicionar" type="button" disabled>Indisponível</button>`
              : quantidade > 0
                ? criarContador(produto.id, quantidade)
                : `<button class="adicionar" type="button" data-adicionar="${produto.id}">Adicionar +</button>`}
          </div>
          ${quantidade > 0 ? `<input class="observacao-item" data-observacao-item="${produto.id}" value="${escaparHtml(estado.observacoesItens[produto.id] || "")}" placeholder="Observação deste item (ex.: sem cebola)" />` : ""}
        </div>
      </article>
    `;
  }).join("");

  const avisoNovidades = estado.categoria === "burguers" ? `
    <div class="aviso-novidades">
      <div>
        <small>NOVIDADES</small>
        <p>Em breve teremos mais novidades.</p>
      </div>
    </div>
  ` : "";

  container.innerHTML = cards + avisoNovidades;

  ligarControles(container);
  categoriaRenderizada = estado.categoria;

  if (animarEntrada) {
    container.querySelectorAll(".produto, .aviso-novidades").forEach((elemento, indice) => {
      animarElemento(elemento, [
        { opacity: 0, transform: "translateY(14px)" },
        { opacity: 1, transform: "translateY(0)" },
      ], { duration: 320, delay: Math.min(indice, 4) * 40 });
    });
    animarElemento(document.querySelector(".secao-titulo"), [
      { opacity: 0.45, transform: "translateY(4px)" },
      { opacity: 1, transform: "translateY(0)" },
    ], { duration: 220 });
  }
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
      salvarCarrinho();
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
  const avisoCarrinho = destino.querySelector("[data-aviso-carrinho]");
  avisoCarrinho.hidden = !estado.avisoCarrinho;
  avisoCarrinho.textContent = estado.avisoCarrinho;
  const botaoLimpar = destino.querySelector("[data-limpar-carrinho]");
  botaoLimpar.hidden = !itens.length;
  botaoLimpar.addEventListener("click", limparCarrinho);
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
    salvarCarrinho();
    renderizarPaineis();
  });
  configurarBotoesDeEscolha(destino, "[data-pagamentos]", estado.pagamento, (valor) => {
    capturarCampos(destino);
    if (estado.pagamento !== valor) {
      tentativaCopiaPix += 1;
      estado.pixCopia = "";
    }
    estado.pagamento = valor;
    salvarCarrinho();
    renderizarPaineis();
  });

  atualizarPix(destino);
  destino.querySelector("[data-copiar-pix]").addEventListener("click", () => copiarChavePix(destino));

  destino.querySelector("[data-endereco-wrap]").hidden = estado.entrega === "retirada";
  destino.querySelector("[data-troco-wrap]").hidden = estado.pagamento !== "dinheiro";
  destino.querySelector("[data-aviso-cartao]").hidden = estado.pagamento !== "cartao";

  destino.querySelectorAll("[data-campo]").forEach((campo) => {
    campo.value = estado.campos[campo.dataset.campo] || "";
    campo.addEventListener("input", () => {
      estado.campos[campo.dataset.campo] = campo.value;
      salvarCarrinho();
      sincronizarCampo(campo.dataset.campo, campo.value, campo);
    });
  });

  destino.querySelector("[data-finalizar]").addEventListener("click", () => enviarPedido(destino));
}

function atualizarPix(destino = document) {
  destino.querySelectorAll("[data-pix]").forEach((painel) => {
    painel.hidden = estado.pagamento !== "pix";
    painel.querySelector("[data-chave-pix]").value = CONFIG.chavePix;

    const botao = painel.querySelector("[data-copiar-pix]");
    botao.disabled = estado.pixCopia === "copiando";
    botao.textContent = botao.disabled ? "Copiando..." : "Copiar chave Pix";

    const terminou = estado.pixCopia === "copiado" || estado.pixCopia === "erro";
    painel.querySelector("[data-pix-retorno]").hidden = !terminou;
    painel.querySelector("[data-pix-status]").textContent = estado.pixCopia === "copiado"
      ? "Chave Pix copiada!"
      : estado.pixCopia === "erro"
        ? "Não foi possível copiar automaticamente. Selecione e copie a chave acima."
        : "";
  });
}

async function copiarChavePix(destino) {
  if (estado.pagamento !== "pix" || estado.pixCopia === "copiando") return;

  const tentativa = ++tentativaCopiaPix;
  estado.pixCopia = "copiando";
  atualizarPix();

  let copiado = false;
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(CONFIG.chavePix);
      copiado = true;
    }
  } catch {
    // Se o navegador bloquear a cópia, tenta copiar pela seleção do campo.
  }

  if (tentativa !== tentativaCopiaPix || estado.pagamento !== "pix") return;

  if (!copiado) {
    const campo = destino.querySelector("[data-chave-pix]");
    try {
      campo.focus({ preventScroll: true });
      campo.select();
      campo.setSelectionRange(0, campo.value.length);
      copiado = document.execCommand("copy");
    } catch {
      copiado = false;
    }
  }

  estado.pixCopia = copiado ? "copiado" : "erro";
  atualizarPix();
  if (copiado) destino.querySelector("[data-copiar-pix]").focus({ preventScroll: true });
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
  const painelMobile = document.querySelector("#painelMobile");
  const rolagemCarrinho = painelMobile.scrollTop;
  montarPainel(document.querySelector("#painelDesktop"));
  montarPainel(painelMobile);
  requestAnimationFrame(() => { painelMobile.scrollTop = rolagemCarrinho; });
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
  if (erro) {
    salvarCarrinho();
    return;
  }

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

  try {
    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(mensagem)}`, "_blank", "noopener,noreferrer");
  } catch {
    document.querySelectorAll("[data-validacao]").forEach((elemento) => {
      elemento.textContent = "Não foi possível abrir o WhatsApp. Tente novamente.";
    });
    salvarCarrinho();
    return;
  }
  // A limpeza acontece ao acionar o WhatsApp; a mensagem é confirmada no aplicativo.
  limparCarrinho();
}

function atualizarIndicadores() {
  const quantidade = quantidadeTotal();
  const quantidadeTopo = document.querySelector("#quantidadeTopo");
  if (quantidadeTopo) quantidadeTopo.textContent = quantidade;
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
  const modal = document.querySelector("#modalCarrinho");
  if (!modal.hidden) return;
  rolagemPagina = window.scrollY;
  document.body.style.top = `-${rolagemPagina}px`;
  document.body.classList.add("carrinho-aberto");
  modal.hidden = false;
  animarElemento(modal.querySelector(".modal__fundo"), [
    { opacity: 0 },
    { opacity: 1 },
  ], { duration: 200 });
  animarElemento(modal.querySelector(".modal__conteudo"), [
    { opacity: 0, transform: "translateY(28px)" },
    { opacity: 1, transform: "translateY(0)" },
  ], { duration: 300 });
  document.querySelector("#fecharCarrinho").focus({ preventScroll: true });
}

function fecharCarrinho() {
  const modal = document.querySelector("#modalCarrinho");
  if (modal.hidden) return;
  modal.hidden = true;
  document.body.classList.remove("carrinho-aberto");
  document.body.style.top = "";
  window.scrollTo(0, rolagemPagina);
}

function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function iniciar() {
  recuperarCarrinho();
  if (CONFIG.logo) {
    const logo = document.querySelector("#logoMarca");
    if (logo) {
      logo.style.backgroundImage = `url('${CONFIG.logo}')`;
      logo.classList.add("com-imagem");
    }
  }

  const botaoTopo = document.querySelector("#abrirCarrinho");
  if (botaoTopo) botaoTopo.addEventListener("click", abrirCarrinho);
  document.querySelector("#barraPedido").addEventListener("click", abrirCarrinho);
  document.querySelector("#fecharCarrinho").addEventListener("click", fecharCarrinho);
  document.querySelector("#fecharPeloFundo").addEventListener("click", fecharCarrinho);
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") fecharCarrinho();
  });

  renderizarTudo();
  atualizarFuncionamento();
  window.addEventListener("focus", atualizarFuncionamento);
  window.addEventListener("pageshow", atualizarFuncionamento);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) atualizarFuncionamento();
  });
}

document.addEventListener("DOMContentLoaded", iniciar);
