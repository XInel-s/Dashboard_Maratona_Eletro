const API_IP = "10.99.1.19"; // Altere pelo IP da sua máquina se rodar noutro PC ou "localhost// Altere para "localhost" se estiver no mesmo PC da API ou coloque o IP atual da rede 
const API_BASE = `http://${API_IP}:8080/api/enigma`;
const TOTAL_ENIGMAS = 5;

// --- CRONÔMETRO ---
async function atualizarCronometro() {
    const timerEl = document.getElementById("timer");
    if (!timerEl) return;

    try {
        const resposta = await fetch(`${API_BASE}/cronometro`);
        if (!resposta.ok) return;

        const dados = await resposta.json();
        const segundos = dados.tempoRestanteSegundos || 0;

        // Formata os segundos recebidos em HH:MM:SS
        const h = String(Math.floor(segundos / 3600)).padStart(2, '0');
        const m = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
        const s = String(segundos % 60).padStart(2, '0');

        timerEl.textContent = `${h}:${m}:${s}`;

        // Atualiza as cores do timer conforme o CSS
        timerEl.classList.remove("atencao", "critico", "fim");

        if (!dados.ativo && segundos === 0) {
            timerEl.classList.add("fim");
        } else if (segundos <= 60 && segundos > 0) { // Menos de 1 minuto
            timerEl.classList.add("critico");
        } else if (segundos <= 300 && segundos > 0) { // Menos de 5 minutos
            timerEl.classList.add("atencao");
        }
    } catch (erro) {
        console.error("Erro ao buscar cronômetro:", erro);
    }
}

// --- DASHBOARD DAS EQUIPES ---
async function atualizarDashboard() {
    const conexaoEl = document.getElementById("conexao");
    const containerEquipes = document.getElementById("equipes");

    if (!containerEquipes) return;

    try {
        const resposta = await fetch(`${API_BASE}/dashboard`);
        if (!resposta.ok) throw new Error("Erro na requisição: " + resposta.status);

        const equipes = await resposta.json();

        if (conexaoEl) {
            conexaoEl.classList.remove("erro");
            conexaoEl.title = "Conectado ao servidor";
        }

        // Ordenação: 1º Pontos (desc) | 2º Menor número de erros (asc) | 3º Quem pontuou primeiro (asc)
        equipes.sort((a, b) => {
            const pontA = a.pontuacao || 0;
            const pontB = b.pontuacao || 0;
            if (pontB !== pontA) return pontB - pontA;

            const errosA = a.tentativasErradas || 0;
            const errosB = b.tentativasErradas || 0;
            if (errosA !== errosB) return errosA - errosB;

            return (a.ultimaAtualizacao || 0) - (b.ultimaAtualizacao || 0);
        });

        renderizarEquipes(equipes, containerEquipes);
    } catch (erro) {
        console.error("Erro ao carregar dados do dashboard:", erro);
        if (conexaoEl) {
            conexaoEl.classList.add("erro");
            conexaoEl.title = "Erro de conexão com o servidor";
        }
    }
}

function renderizarEquipes(equipes, container) {
    container.innerHTML = "";

    equipes.forEach((equipe) => {
        const qtdConcluidas = equipe.tarefasConcluidas ? equipe.tarefasConcluidas.length : 0;
        const totalSubTarefas = TOTAL_ENIGMAS * 3; // 15 sub-tarefas no total (5 etapas * 3)
        const todosConcluidos = qtdConcluidas >= totalSubTarefas;

        let pipsHtml = "";
        for (let i = 1; i <= TOTAL_ENIGMAS; i++) {
            const sub1Feita = equipe.tarefasConcluidas && (equipe.tarefasConcluidas.includes(`${i}.1`) || equipe.tarefasConcluidas.includes(i * 3 - 2));
            const sub2Feita = equipe.tarefasConcluidas && (equipe.tarefasConcluidas.includes(`${i}.2`) || equipe.tarefasConcluidas.includes(i * 3 - 1));
            const sub3Feita = equipe.tarefasConcluidas && (equipe.tarefasConcluidas.includes(`${i}.3`) || equipe.tarefasConcluidas.includes(i * 3));

            const questaoCompleta = sub1Feita && sub2Feita && sub3Feita;
            const classeCompleta = questaoCompleta ? "completa" : "";

            pipsHtml += `
                <div class="etapa etapa-${i} ${classeCompleta}">
                    <span class="etapa-num">${i}</span>
                    <div class="segs">
                        <i class="${sub1Feita ? "feito" : ""} seg-etapa-${i}"></i>
                        <i class="${sub2Feita ? "feito" : ""} seg-etapa-${i}"></i>
                        <i class="${sub3Feita ? "feito" : ""} seg-etapa-${i}"></i>
                    </div>
                </div>
            `;
        }

        let statusClasse = "status";
        let statusTexto = `${equipe.pontuacao || 0} pts`;

        if (todosConcluidos) {
            statusClasse += " concluido";
            statusTexto = "CONCLUÍDO";
        }

        const divEquipe = document.createElement("div");
        divEquipe.className = "equipe";

        divEquipe.innerHTML = `
            <div class="topo">
                <h2 class="nome">${equipe.nome || equipe.id}</h2>
                <span class="${statusClasse}">${statusTexto}</span>
            </div>
            <div class="desafio">${equipe.pontuacao || 0} pts (${equipe.tentativasErradas || 0} erros)</div>
            <div class="pips">
                ${pipsHtml}
            </div>
        `;

        container.appendChild(divEquipe);
    });
}

// --- ARRANQUE E EXECUÇÃO CONTÍNUA ---
document.addEventListener("DOMContentLoaded", () => {
    atualizarDashboard();
    atualizarCronometro();

    // Atualiza o ranking a cada 3 segundos e o cronômetro a cada 1 segundo
    setInterval(atualizarDashboard, 3000);
    setInterval(atualizarCronometro, 1000);
});

Não se esqueça também de incluir a pequena linha `gap: 2px;` no CSS (`dashboard_style.css`) dentro de `.equipe .segs` para que as 3 barrinhas de cada número fiquem separadas visualmente e bonitas[cite: 3].
