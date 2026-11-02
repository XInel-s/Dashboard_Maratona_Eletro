/* Formato JSON esperado da API:
   { "cronometro": { "fim": "2026-10-29T15:00:00-04:00" },   // ou { "restante": 1800, "rodando": true }
     "equipes": [ { "nome": "Equipe 1", "nivel": 3, "desafio": "Circuito lógico", "status": "andamento" } ] }
   status: andamento | concluido | travado | aguardando
   Com API_URL vazio, usa dados de demonstração. */
const CONFIG = {
  API_URL: "",
  INTERVALO_MS: 5000,
  TOTAL_NIVEIS: 5,
  DURACAO_PADRAO_S: 3600
};

const CORES = ["#7fd6f5", "#ffd166", "#8fe3a2", "#c9a6ff", "#ff9eb5"];
const STATUS = { andamento: "Em andamento", concluido: "Concluído", travado: "Precisa de ajuda", aguardando: "Aguardando" };

const DEMO = {
  equipes: [
    { nome: "Equipe 1", nivel: 3, desafio: "Circuito lógico", status: "andamento" },
    { nome: "Equipe 2", nivel: 2, desafio: "Cifra de César", status: "andamento" },
    { nome: "Equipe 3", nivel: 4, desafio: "Rota do robô", status: "andamento" },
    { nome: "Equipe 4", nivel: 1, desafio: "Montagem do circuito", status: "travado" },
    { nome: "Equipe 5", nivel: 5, desafio: "Desafio final", status: "concluido" }
  ]
};