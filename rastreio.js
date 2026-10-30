/* O RASTREIO DA META: aviso de cookies + Pixel, só depois do aceite (LGPD).

   Como funciona, do começo ao fim:
   1. Sem consentimento gravado, mostra o aviso. NADA da Meta é baixado: o fbevents.js só
      é pedido depois do "Aceitar". Recusou, ou ainda não escolheu = zero rastreio.
   2. O consentimento fica no cookie `oravio_consent` com Domain=.oravio.com.br, para valer
      no site (oravio.com.br) e no app (app.oravio.com.br) ao mesmo tempo: quem aceitou
      aqui não vê o aviso de novo lá, e o app só dispara CompleteRegistration com "granted".
   3. Eventos: PageView (ao carregar), Contact (toque no WhatsApp) e CtaSignupClick
      (toque em "Criar conta"/"Começar grátis"). Quem marca o botão é o `data-track` no
      HTML: "cta-signup" ou "whatsapp". O CompleteRegistration é do app, não daqui.

   O ID do Pixel mora SÓ aqui embaixo. Enquanto estiver vazio, a página inteira se
   comporta como antes: sem aviso, sem Pixel. Assim o código pode ir ao ar antes de o
   Pixel existir. */
(function () {
  var PIXEL_ID = '';
  var COOKIE = 'oravio_consent';
  var SEIS_MESES = 60 * 60 * 24 * 180;

  if (!PIXEL_ID) return;

  function lerConsentimento() {
    var m = document.cookie.match(new RegExp('(?:^|; )' + COOKIE + '=([^;]*)'));
    return m ? m[1] : null;
  }

  function gravarConsentimento(valor, validade) {
    // Domain só no domínio de verdade: em localhost o navegador recusaria o cookie.
    var dominio = /(^|\.)oravio\.com\.br$/.test(location.hostname) ? '; Domain=.oravio.com.br' : '';
    var seguro = location.protocol === 'https:' ? '; Secure' : '';
    var idade = validade === undefined ? SEIS_MESES : validade;
    document.cookie = COOKIE + '=' + valor + '; Path=/; Max-Age=' + idade + '; SameSite=Lax' + dominio + seguro;
  }

  var carregado = false;
  function carregarPixel() {
    if (carregado) return;
    carregado = true;
    // Snippet oficial da Meta, só reformatado.
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    // autoConfig desligado: sem ele o Pixel dispara eventos de clique e de página por conta própria, além dos nossos.
    window.fbq('set', 'autoConfig', false, PIXEL_ID);
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // Marcas do HTML. Só dispara com o Pixel carregado (= com consentimento).
  document.addEventListener('click', function (e) {
    var alvo = e.target.closest && e.target.closest('[data-track]');
    if (!alvo || !window.fbq || !carregado) return;
    var marca = alvo.getAttribute('data-track');
    if (marca === 'cta-signup') window.fbq('trackCustom', 'CtaSignupClick');
    else if (marca === 'whatsapp') window.fbq('track', 'Contact');
  });

  function mostrarAviso() {
    var aviso = document.createElement('div');
    aviso.className = 'cookies';
    aviso.setAttribute('role', 'dialog');
    aviso.setAttribute('aria-label', 'Aviso de cookies');
    aviso.innerHTML =
      '<p class="cookies-texto">Usamos cookies da Meta para saber de onde vêm os cadastros e mostrar o Oravio para quem pode precisar. ' +
      'Você escolhe. <a href="https://app.oravio.com.br/privacidade">Política de privacidade</a></p>' +
      '<div class="cookies-acoes">' +
      '<button type="button" class="btn btn-ghost" data-cookies="denied">Recusar</button>' +
      '<button type="button" class="btn btn-primary" data-cookies="granted">Aceitar</button>' +
      '</div>';
    aviso.addEventListener('click', function (e) {
      var botao = e.target.closest('[data-cookies]');
      if (!botao) return;
      var escolha = botao.getAttribute('data-cookies');
      gravarConsentimento(escolha);
      aviso.remove();
      if (escolha === 'granted') carregarPixel();
    });
    document.body.appendChild(aviso);
  }

  // "Cookies" no rodapé: quem mudou de ideia apaga a escolha e a página recarrega sem Pixel, já
  // com o aviso de volta (a LGPD pede que desfazer seja tão fácil quanto aceitar). Escondido no HTML
  // e mostrado só aqui, porque sem ID de Pixel não há o que escolher.
  document.querySelectorAll('[data-cookies-abrir]').forEach(function (a) {
    a.hidden = false;
    a.addEventListener('click', function (e) {
      e.preventDefault();
      gravarConsentimento('', 0);
      location.reload();
    });
  });

  var consentimento = lerConsentimento();
  if (consentimento === 'granted') carregarPixel();
  else if (consentimento !== 'denied') mostrarAviso();
})();
