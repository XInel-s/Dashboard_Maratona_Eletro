const texto = document.getElementById('meuTexto');
const btnColar = document.getElementById('colar');
const btnCopiar = document.getElementById('copiar');
const btnLimpar = document.getElementById('limpar');
const btnVoltar = document.getElementById('voltar');

function feedback(botao, msg) {
  const original = botao.textContent;
  botao.textContent = msg;
  setTimeout(() => { botao.textContent = original; }, 1200);
}

btnCopiar.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(texto.value);
  } catch {
    texto.select();
    document.execCommand('copy');
  }
  feedback(btnCopiar, 'Copiado!');
});

btnColar.addEventListener('click', async () => {
  try {
    texto.value = await navigator.clipboard.readText();
    feedback(btnColar, 'Colado!');
  } catch {
    texto.focus();
    feedback(btnColar, 'Use Ctrl+V');
  }
});

btnLimpar.addEventListener('click', () => {
  texto.value = '';
  texto.focus();
});

btnVoltar.addEventListener('click', () => {
  window.location.href = 'index.html';
});