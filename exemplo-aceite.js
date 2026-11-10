/* O ACEITE DE EXEMPLO: troca as três telas do aceite (botão, pergunta, "aceito") como a página
   real do app (aceitar-orcamento.tsx), mas sem gravar nada em lugar nenhum. Recarregar volta ao
   começo. Sem JavaScript, a página aparece inteira e o botão só não responde. */
(function () {
  var estados = document.querySelectorAll('#aceite [data-estado]');
  var depois = document.getElementById('depois');

  function ir(nome) {
    for (var i = 0; i < estados.length; i++) {
      estados[i].hidden = estados[i].getAttribute('data-estado') !== nome;
    }
    if (nome === 'aceito' && depois) {
      depois.hidden = false;
      // Rola só até onde precisa, sem pular a tela de quem lê.
      depois.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  var aceitar = document.getElementById('ex-aceitar');
  var voltar = document.getElementById('ex-voltar-pergunta');
  var sim = document.getElementById('ex-sim');
  if (aceitar) aceitar.addEventListener('click', function () { ir('confirmando'); });
  if (voltar) voltar.addEventListener('click', function () { ir('pode'); });
  if (sim) sim.addEventListener('click', function () { ir('aceito'); });
})();
