/* A MEDIÇÃO DE VISITAS (Umami Cloud): quais botões são tocados.

   O script do Umami fica no <head> de cada página e cuida sozinho de visitas, origem (inclui
   as UTMs dos anúncios) e aparelho. Aqui só mora a ponte dos TOQUES: reaproveita a marca
   `data-track` que o rastreio.js (Pixel da Meta) também lê, e manda ao Umami um evento com o
   mesmo nome: "cta-signup" (Criar conta, Começar grátis) ou "whatsapp".

   Diferente do Pixel, NÃO espera o aviso de cookies: o Umami não usa cookies. Se um dia isso
   mudar, é aqui e no <head> que se amarra ao consentimento.

   Sem o script do Umami na página (bloqueador de anúncios, endereço de teste fora de
   `data-domains`, rede caída), `window.umami` não existe e o toque segue normalmente, sem erro.
   Botão novo de cadastro ou de WhatsApp precisa da marca `data-track`. */
(function () {
  // "pdf-exemplo": o link "Ver um orçamento de verdade" do passo 3. "aceite-exemplo": o link do
  // passo 4 e o botão Aceitar da página de exemplo (só Umami; o Pixel ignora).
  var EVENTOS = { 'cta-signup': true, 'whatsapp': true, 'pdf-exemplo': true, 'aceite-exemplo': true };

  document.addEventListener('click', function (e) {
    var alvo = e.target.closest && e.target.closest('[data-track]');
    if (!alvo) return;
    var marca = alvo.getAttribute('data-track');
    if (!EVENTOS[marca] || !window.umami || typeof window.umami.track !== 'function') return;
    window.umami.track(marca);
  });
})();
