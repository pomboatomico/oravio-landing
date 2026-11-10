/* ORIGEM DO CADASTRO: repassa ao app a etiqueta `utm_source` que trouxe a pessoa até aqui.

   O app (app.oravio.com.br/cadastro?utm_source=<canal>) conta de qual canal veio cada conta
   (no repositório do app: docs/origem-do-cadastro.md). Sem este arquivo, quem chegava na landing
   por um link com etiqueta e tocava em "Criar conta" caía no app sem ela e virava "sem etiqueta".

   Regras (as mesmas do app, para os dois lados contarem igual):
   - Lista fechada. Etiqueta fora dela é ignorada (o app também a ignoraria). Canal novo: mudar
     aqui E no app (`ORIGENS` + migração do `check`).
   - Primeiro toque, guardado 7 dias: quem veio pelo Instagram, saiu e voltou digitando o
     endereço continua "instagram".
   - Sem etiqueta no link: página de artigo (`data-origem-padrao="artigo"` na tag deste script)
     vira "artigo"; chegada vinda da busca do Google vira "google". Nada disso → link sem
     etiqueta, como antes.

   Só reescreve links que apontam para app.oravio.com.br/cadastro. Sem localStorage (aba
   anônima, bloqueio), repassa só a etiqueta da própria visita. Nenhum erro chega à tela. */
(function () {
  var ORIGENS = ['folder', 'instagram', 'rua', 'google', 'artigo', 'whatsapp', 'outro'];
  var CHAVE = 'oravio-origem';
  var VALIDADE_MS = 7 * 24 * 60 * 60 * 1000;
  var script = document.currentScript;

  function valida(valor) {
    var v = (valor || '').trim().toLowerCase();
    return ORIGENS.indexOf(v) >= 0 ? v : null;
  }

  function lerGuardada() {
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo && valida(salvo.origem) && Date.now() - salvo.em < VALIDADE_MS) return salvo.origem;
    } catch (e) {}
    return null;
  }

  function guardar(origem) {
    try { localStorage.setItem(CHAVE, JSON.stringify({ origem: origem, em: Date.now() })); } catch (e) {}
  }

  function daVisita() {
    var doLink = null;
    try { doLink = valida(new URL(location.href).searchParams.get('utm_source')); } catch (e) {}
    if (doLink) return doLink;
    if (script && valida(script.getAttribute('data-origem-padrao'))) {
      return valida(script.getAttribute('data-origem-padrao'));
    }
    try {
      if (/(^|\.)google\.[a-z.]+$/.test(new URL(document.referrer).hostname)) return 'google';
    } catch (e) {}
    return null;
  }

  // Primeiro toque: o que já estava guardado vence o desta visita.
  var origem = lerGuardada();
  if (!origem) {
    origem = daVisita();
    if (origem) guardar(origem);
  }
  if (!origem) return;

  var links = document.querySelectorAll('a[href^="https://app.oravio.com.br/cadastro"]');
  for (var i = 0; i < links.length; i++) {
    try {
      var url = new URL(links[i].href);
      if (url.pathname !== '/cadastro' || url.searchParams.has('utm_source')) continue;
      url.searchParams.set('utm_source', origem);
      links[i].href = url.toString();
    } catch (e) {}
  }
})();
