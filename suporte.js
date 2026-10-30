/* O SUPORTE NO WHATSAPP: a cada toque, sorteia entre os dois contatos, como o botão
   "Falar com o suporte" do app faz (oravio: src/lib/plano.ts, CONTATOS_DO_SUPORTE e
   sortearSuporte). Mudou um número lá, muda aqui também.

   Sorteia no TOQUE, e não ao abrir a página: senão a mesma pessoa cairia sempre com o
   mesmo contato. O número do href é a reserva: sem JavaScript, o link continua abrindo.
   Troca só o número e mantém a mensagem pronta (?text=) de cada página. */
(function () {
  var NUMEROS = ['5599991113679', '5586988197951'];

  function sortear() {
    return NUMEROS[Math.floor(Math.random() * NUMEROS.length)];
  }

  // O número é trocado antes de o navegador seguir o link (o clique ainda não terminou).
  // 'auxclick' cobre o botão do meio; 'contextmenu', o toque longo de "copiar link".
  ['click', 'auxclick', 'contextmenu'].forEach(function (evento) {
    document.addEventListener(evento, function (e) {
      var link = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
      if (link) link.href = link.href.replace(/wa\.me\/\d+/, 'wa.me/' + sortear());
    });
  });
})();
