// Configuração direta da API e do evento
const API_URL = "http://localhost:8080/api/enigma/dashboard"; // Altere pelo IP se rodar noutro PC
const TOTAL_ENIGMAS = 5;

async function atualizarDashboard() {
    const conexaoEl = document.getElementById("conexao");
    const containerEquipes = document.getElementById("equipes");

    if (!containerEquipes) return;

    try {
        const resposta = await fetch(API_URL);
        if (!resposta.ok) throw new Error("Erro na requisição: " + resposta.status);

        const equipes = await resposta.json();

        // Atualiza a bolinha de status no topo (Verde)
        if (conexaoEl) {
            conexaoEl.classList.remove("erro");
            conexaoEl.title = "Conectado ao servidor";
        }

        // Ordenação não-linear:
        // 1. Maior quantidade de enigmas resolvidos fica no topo
        // 2. Desempate: menor timestamp (quem acertou primeiro)
        equipes.sort((a, b) => {
            const qtdA = a.tarefasConcluidas ? a.tarefasConcluidas.length : 0;
            const qtdB = b.tarefasConcluidas ? b.tarefasConcluidas.length : 0;

            if (qtdB !== qtdA) {
                return qtdB - qtdA;
            }
            return (a.ultimaAtualizacao || 0) - (b.ultimaAtualizacao || 0);
        });

        renderizarEquipes(equipes, containerEquipes);
    } catch (erro) {
        console.error("Erro ao carregar dados do dashboard:", erro);
        // Atualiza a bolinha de status para Vermelho em caso de falha
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
        const todosConcluidos = qtdConcluidas >= TOTAL_ENIGMAS;

        // Monta os marcadores da barra de progresso (.pips)
        let pipsHtml = "";
        for (let i = 1; i <= TOTAL_ENIGMAS; i++) {
            const foiFeito = equipe.tarefasConcluidas && equipe.tarefasConcluidas.includes(i);
            pipsHtml += `<i class="${foiFeito ? 'feito' : ''}"></i>`;
        }

        // Define a classe da tag de status (.status)
        let statusClasse = "status";
        let statusTexto = `${qtdConcluidas} / ${TOTAL_ENIGMAS}`;
        
        if (todosConcluidos) {
            statusClasse += " concluido";
            statusTexto = "CONCLUÍDO";
        }

        // Cria o elemento da equipa formatado conforme o HTML e CSS
        const divEquipe = document.createElement("div");
        divEquipe.className = "equipe";

        divEquipe.innerHTML = `
            <div class="topo">
                <h2 class="nome">${equipe.nome || equipe.id}</h2>
                <span class="${statusClasse}">${statusTexto}</span>
            </div>
            <div class="nivel">${qtdConcluidas}</div>
            <div class="desafio">enigmas resolvidos</div>
            <div class="pips">
                ${pipsHtml}
            </div>
        `;

        container.appendChild(divEquipe);
    });
}

// Inicia a busca assim que o HTML carregar e atualiza a cada 3 segundos
document.addEventListener("DOMContentLoaded", () => {
    atualizarDashboard();
    setInterval(atualizarDashboard, 3000);
});