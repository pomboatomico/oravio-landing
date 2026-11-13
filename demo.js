/* A DEMONSTRAÇÃO DA HOME (v5, 10/11/2026) e a barra fixa do celular.

   Por quê: quem chega do Instagram decide em segundos. Em vez de pedir a conta antes de mostrar
   qualquer coisa, a página deixa a pessoa VER um orçamento se montando: o cliente pergunta, o
   pedido é contado, os itens entram com os preços e sai o PDF. Depois disso, o convite é "faça
   com os seus preços".

   Desde 13/11/2026 (v5.2) tudo acontece dentro de um celular desenhado com a cara da Início do
   app (index.html e inicio.css): a pergunta chega como notificação, o botão "Montar" é o
   microfone do campo de falar, no pé da tela, e um balão aponta para ele até o primeiro toque.

   Não chama a IA nem o app: os três exemplos são fixos, aqui embaixo, com preços fictícios. Assim
   não gasta o limite da Groq, não abre porta para abuso e funciona sem conta. Os itens e o fluxo
   espelham o que o app faz de verdade (conferir antes de salvar, PDF, PIX, link de aceite).

   Medição (Umami, sem cookies): "demo-montar" (com o ramo) a cada orçamento montado. O toque em
   "Criar conta" continua sendo o "cta-signup" do medicao.js. */
(function () {
  var EXEMPLOS = {
    oficina: {
      cliente: 'Carla Mendes',
      balao: 'Oi! Quanto fica a revisão do Onix? Óleo, pastilha da frente e amortecedor.',
      frase: 'Orçamento pra Carla Mendes. Troca de óleo com filtro, pastilha de freio da frente e amortecedores da frente.',
      itens: [[1, 'Troca de óleo 5W30 + filtro', 28990], [1, 'Pastilha de freio dianteira (par)', 34000], [1, 'Amortecedores dianteiros (par)', 129000]]
    },
    salao: {
      cliente: 'Júlia Prado',
      balao: 'Oi! Quanto fica progressiva com corte e hidratação?',
      frase: 'Orçamento pra Júlia Prado. Progressiva, corte e hidratação.',
      itens: [[1, 'Progressiva (cabelo médio)', 18000], [1, 'Corte feminino', 7000], [1, 'Hidratação', 6000]]
    },
    eletrica: {
      cliente: 'Renato Dias',
      balao: 'Boa tarde! Quanto fica trocar 6 tomadas e instalar 2 ventiladores de teto?',
      frase: 'Orçamento pro Renato Dias. Trocar seis tomadas, instalar dois ventiladores de teto e um disjuntor novo.',
      itens: [[6, 'Troca de tomada', 3500], [2, 'Instalação de ventilador de teto', 12000], [1, 'Troca de disjuntor', 9000]]
    }
  };

  var demo = document.getElementById('demo');
  if (demo) iniciarDemo();
  iniciarBarra();

  function iniciarDemo() {
    var calmo = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ramos = demo.querySelectorAll('[data-ramo]');
    var balao = document.getElementById('demo-balao');
    var frase = document.getElementById('demo-frase');
    var nomes = demo.querySelectorAll('[data-cliente]'); // na notificação e na folha
    var inicial = demo.querySelector('[data-inicial]');
    var lista = document.getElementById('demo-itens');
    var total = document.getElementById('demo-total');
    var procurando = document.getElementById('demo-procurando');
    var aviso = document.getElementById('demo-aviso');
    var botao = document.getElementById('demo-montar');
    var deNovo = document.getElementById('demo-de-novo');
    var atual = 'oficina';
    var vez = 0; // cada montagem nova cancela a anterior

    function brl(centavos) {
      return 'R$ ' + (centavos / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    function soma(ex) {
      return ex.itens.reduce(function (s, i) { return s + i[0] * i[2]; }, 0);
    }
    function depois(ms, minhaVez, fn) {
      setTimeout(function () { if (minhaVez === vez) fn(); }, calmo ? 0 : ms);
    }

    function preparar(ramo) {
      vez++;
      atual = ramo;
      var ex = EXEMPLOS[ramo];
      ramos.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-ramo') === ramo)); });
      demo.classList.remove('montando', 'pronto');
      balao.textContent = ex.balao;
      nomes.forEach(function (el) { el.textContent = ex.cliente; });
      if (inicial) inicial.textContent = ex.cliente.charAt(0);
      frase.textContent = '';
      lista.textContent = '';
      total.textContent = brl(0);
      procurando.textContent = '';
      botao.disabled = false;
    }

    function montar() {
      var minhaVez = ++vez;
      var ex = EXEMPLOS[atual];
      botao.disabled = true;
      demo.classList.add('montando', 'tocou'); // 'tocou': o balão de dica não volta mais
      if (window.umami && typeof window.umami.track === 'function') {
        try { window.umami.track('demo-montar', { ramo: atual }); } catch (e) {}
      }

      // 1. O pedido aparece como se estivesse sendo contado.
      var texto = ex.frase;
      if (calmo) {
        frase.textContent = texto;
        procurar();
      } else {
        var passo = Math.max(1, Math.ceil(texto.length / 45)); // ~0,9 s, qualquer tamanho
        var n = 0;
        (function digitar() {
          if (minhaVez !== vez) return;
          n = Math.min(texto.length, n + passo);
          frase.textContent = texto.slice(0, n);
          if (n < texto.length) setTimeout(digitar, 20);
          else procurar();
        })();
      }

      // 2. "Procurando na sua tabela" e os itens entrando, um a um.
      function procurar() {
        procurando.textContent = 'Procurando na sua tabela de preços…';
        depois(450, minhaVez, function () {
          procurando.textContent = '';
          ex.itens.forEach(function (it, i) {
            var li = document.createElement('li');
            li.className = 'item';
            var q = document.createElement('span'); q.className = 'item-qtd'; q.textContent = it[0] + '×';
            var nome = document.createElement('span'); nome.textContent = it[1];
            var p = document.createElement('span'); p.className = 'item-preco'; p.textContent = brl(it[0] * it[2]);
            li.appendChild(q); li.appendChild(nome); li.appendChild(p);
            lista.appendChild(li);
            depois(40 + i * 120, minhaVez, function () { li.classList.add('entra'); });
          });
          depois(40 + ex.itens.length * 120, minhaVez, contarTotal);
        });
      }

      // 3. O total conta até o valor, e então aparece o que sai dali (PDF, PIX, link).
      function contarTotal() {
        var alvo = soma(ex);
        var fim = function () {
          total.textContent = brl(alvo);
          demo.classList.remove('montando');
          demo.classList.add('pronto');
          aviso.textContent = 'Orçamento montado: ' + ex.itens.length + ' itens, total ' + brl(alvo) + '.';
        };
        if (calmo || !window.requestAnimationFrame) return fim();
        var inicio = null;
        var dur = 600;
        requestAnimationFrame(function quadro(t) {
          if (minhaVez !== vez) return;
          if (inicio === null) inicio = t;
          var k = Math.min(1, (t - inicio) / dur);
          var suave = 1 - Math.pow(1 - k, 3);
          total.textContent = brl(Math.round(alvo * suave));
          if (k < 1) requestAnimationFrame(quadro);
          else fim();
        });
      }
    }

    ramos.forEach(function (b) {
      b.addEventListener('click', function () {
        preparar(b.getAttribute('data-ramo'));
        montar();
      });
    });
    // O microfone continua na tela depois de montar: tocar de novo recomeça, como "Montar de novo".
    botao.addEventListener('click', function () {
      if (demo.classList.contains('pronto')) preparar(atual);
      montar();
    });
    deNovo.addEventListener('click', function () { preparar(atual); montar(); });

    preparar('oficina');
    demo.classList.add('vivo');
  }

  // A BARRA FIXA (só no celular, pelo CSS): aparece quando o botão do herói sai da tela e some
  // quando o convite final aparece, para não haver dois botões iguais à vista.
  function iniciarBarra() {
    var barra = document.getElementById('barra');
    var heroi = document.getElementById('heroi-acao');
    var final = document.getElementById('final');
    if (!barra || !heroi || !final || !('IntersectionObserver' in window)) return;
    var heroiVisivel = true;
    var finalVisivel = false;
    function atualizar() {
      var mostrar = !heroiVisivel && !finalVisivel;
      barra.classList.toggle('visivel', mostrar);
      barra.setAttribute('aria-hidden', String(!mostrar));
      barra.querySelectorAll('a').forEach(function (a) { a.tabIndex = mostrar ? 0 : -1; });
    }
    new IntersectionObserver(function (e) { heroiVisivel = e[0].isIntersecting; atualizar(); }).observe(heroi);
    new IntersectionObserver(function (e) { finalVisivel = e[0].isIntersecting; atualizar(); }).observe(final);
    atualizar();
  }
})();
