/* cronômetro */
let fimMs = null, pausadoS = null;
const elTimer = document.getElementById("timer");

function aplicarCronometro(c) {
  if (!c) return;
  if (c.fim) { fimMs = Date.parse(c.fim); pausadoS = null; }
  else if (typeof c.restante === "number") {
    if (c.rodando === false) { fimMs = null; pausadoS = c.restante; }
    else { fimMs = Date.now() + c.restante * 1000; pausadoS = null; }
  }
}
function restanteS() {
  if (fimMs !== null) return Math.max(0, Math.round((fimMs - Date.now()) / 1000));
  return pausadoS !== null ? pausadoS : CONFIG.DURACAO_PADRAO_S;
}
function desenharTimer() {
  const s = restanteS();
  const p = (n) => String(n).padStart(2, "0");
  elTimer.textContent = `${p(Math.floor(s / 3600))}:${p(Math.floor((s % 3600) / 60))}:${p(s % 60)}`;
  elTimer.className = s === 0 ? "fim" : s <= 60 ? "critico" : s <= 300 ? "atencao" : "";
}
setInterval(desenharTimer, 250);

/* equipes */
const elEquipes = document.getElementById("equipes");
function el(tag, cls, texto) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texto !== undefined) e.textContent = texto;
  return e;
}

function desenharEquipes(lista) {
  elEquipes.replaceChildren();
  lista.slice(0, 5).forEach((eq, i) => {
    const nivel = Math.max(0, Math.min(CONFIG.TOTAL_NIVEIS, Number(eq.nivel) || 0));
    const status = STATUS[eq.status] ? eq.status : "andamento";

    const card = el("section", "equipe");
    card.style.setProperty("--cor", CORES[i % CORES.length]);

    const topo = el("div", "topo");
    topo.append(el("h2", "nome", eq.nome || `Equipe ${i + 1}`), el("span", `status ${status}`, STATUS[status]));

    const pips = el("div", "pips");
    for (let n = 1; n <= CONFIG.TOTAL_NIVEIS; n++) {
      pips.append(el("i", n < nivel || (n === nivel && status === "concluido") ? "feito" : n === nivel ? "atual" : ""));
    }

    card.append(topo, el("div", "nivel", String(nivel)), el("div", "desafio", eq.desafio || "Sem desafio"), pips);
    elEquipes.append(card);
  });
}

/* API */
const elConexao = document.getElementById("conexao");
function mostrarConexao(ok, msg) {
  elConexao.classList.toggle("erro", !ok);
  elConexao.title = msg;
}

async function atualizar() {
  if (!CONFIG.API_URL) {
    desenharEquipes(DEMO.equipes);
    mostrarConexao(true, "Modo demonstração (sem API)");
    return;
  }
  try {
    const r = await fetch(CONFIG.API_URL, { cache: "no-store" });
    if (!r.ok) throw new Error(r.status);
    const dados = await r.json();
    aplicarCronometro(dados.cronometro);
    desenharEquipes(dados.equipes || []);
    mostrarConexao(true, "Atualizado às " + new Date().toLocaleTimeString("pt-BR"));
  } catch (e) {
    mostrarConexao(false, "Sem conexão com a API. Mostrando os últimos dados.");
  }
}
atualizar();
setInterval(atualizar, CONFIG.INTERVALO_MS);
desenharTimer();

/* atalhos: F tela cheia, Espaço pausa/retoma, R reinicia (modo demonstração) */
document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  else if (e.key === " ") {
    e.preventDefault();
    if (fimMs !== null) { pausadoS = restanteS(); fimMs = null; }
    else { fimMs = Date.now() + restanteS() * 1000; pausadoS = null; }
  } else if (k === "r") { fimMs = null; pausadoS = CONFIG.DURACAO_PADRAO_S; }
});