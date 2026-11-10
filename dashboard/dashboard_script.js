/* cronômetro */
let fimMs = null, pausadoS = null;
const elTimer = document.getElementById("timer");

function aplicarCronometro(c) {
  if (!c) return;
  if (c.fim) { fimMs = Date.parse(c.fim); pausadoS = null; }
  else if (typeof c.restante === "number") {
    fimMs = c.rodando === false ? null : Date.now() + c.restante * 1000;
    pausadoS = c.rodando === false ? c.restante : null;
  }
}

function restanteS() {
  return fimMs !== null ? Math.max(0, Math.round((fimMs - Date.now()) / 1000)) : (pausadoS ?? CONFIG.DURACAO_PADRAO_S);
}

function desenharTimer() {
  const s = restanteS(), p = (n) => String(n).padStart(2, "0");
  elTimer.textContent = `${p(s / 3600 | 0)}:${p((s % 3600) / 60 | 0)}:${p(s % 60)}`;
}
setInterval(desenharTimer, 250);

const elEquipes = document.getElementById("equipes");
const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };

const POR_ETAPA = 3;

function segmentosConcluidos(eq) {
  const total = CONFIG.TOTAL_NIVEIS * POR_ETAPA;
  const feitos = new Set();
  if (Array.isArray(eq.concluidos)) {
    eq.concluidos.forEach((n) => {
      n = Number(n);
      if (n >= 1 && n <= total) feitos.add(n);
    });
  } else {
    const nivel = Math.max(0, Math.min(CONFIG.TOTAL_NIVEIS, Number(eq.nivel) || 0));
    for (let n = 1; n <= nivel * POR_ETAPA; n++) feitos.add(n);
  }
  return feitos;
}

function desenharEquipes(lista) {
  elEquipes.replaceChildren();
  lista.slice(0, 5).forEach((eq, i) => {
    const status = STATUS[eq.status] ? eq.status : "andamento";
    const feitos = segmentosConcluidos(eq);

    const card = el("section", `equipe status-${status}`);

    const topo = el("div", "topo");
    topo.append(el("h2", "nome", eq.nome || `Equipe ${i + 1}`));

    const pips = el("div", "pips");
    for (let e = 0; e < CONFIG.TOTAL_NIVEIS; e++) {
      const etapa = el("div", `etapa etapa-${e + 1}`);
      const segs = el("div", "segs");
      let contagem = 0;

      for (let d = 1; d <= POR_ETAPA; d++) {
        const ok = feitos.has(e * POR_ETAPA + d);
        if (ok) contagem++;
        segs.append(el("i", ok ? `feito seg-etapa-${e + 1}` : ""));
      }

      if (contagem === POR_ETAPA) etapa.classList.add("completa");
      etapa.append(el("div", "etapa-num", String(e + 1)), segs);
      pips.append(etapa);
    }

    card.append(topo, el("div", "desafio", eq.desafio || "Sem desafio"), pips);
    elEquipes.append(card);
  });
}

const elConexao = document.getElementById("conexao");
const mostrarConexao = (ok, msg) => { elConexao.classList.toggle("erro", !ok); elConexao.title = msg; };

async function atualizar() {
  if (!CONFIG.API_URL) {
    desenharEquipes(DEMO.equipes);
    mostrarConexao(true, "Modo demonstração");
    return;
  }
  try {
    const r = await fetch(CONFIG.API_URL, { cache: "no-store" });
    if (!r.ok) throw new Error();
    const dados = await r.json();
    aplicarCronometro(dados.cronometro);
    desenharEquipes(dados.equipes || []);
    mostrarConexao(true, "Atualizado");
  } catch {
    mostrarConexao(false, "Sem conexão com a API.");
  }
}
atualizar();
setInterval(atualizar, CONFIG.INTERVALO_MS);
desenharTimer();

document.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (k === "f") document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
  else if (e.key === " ") {
    e.preventDefault();
    if (fimMs !== null) { pausadoS = restanteS(); fimMs = null; }
    else { fimMs = Date.now() + restanteS() * 1000; pausadoS = null; }
  } else if (k === "r") { fimMs = null; pausadoS = CONFIG.DURACAO_PADRAO_S; }
});
