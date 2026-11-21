/* MecaTech LAB: cabeçalho, menu, rodapé e página atual (compartilhados). */
(function () {
  'use strict';
  var HOTMART = 'https://mecatechexplora.hotmart.host/projetos';
  var YOUTUBE = 'https://youtube.com/@mecatechexplora?si=Xlm0DWXoSkHV9nT5';
  var ROOT = new URL('../', document.currentScript.src).href; /* raiz do portal, em qualquer subpasta */
  var PAGES = [
    ['inicio', 'index.html', 'Início'],
    ['multimetro', 'laboratorios/multimetro.html', 'Multímetro'],
    ['circuitos', 'laboratorios/circuitos.html', 'Circuitos'],
    ['componentes', 'laboratorios/componentes.html', 'Componentes'],
    ['diagnostico', 'laboratorios/diagnostico.html', 'Diagnóstico'],
    ['produtos', 'produtos/index.html', 'Materiais e Cursos']
  ];
  var current = document.body.getAttribute('data-page');

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }
  function logo(size) {
    var img = el('img', { alt: 'Logo MecaTech LAB', width: size, height: size });
    img.onerror = function () { img.onerror = null; img.src = ROOT + 'imagens/logo.svg'; };
    img.src = ROOT + 'imagens/logo.png'; /* se logo.png não existir, usa logo.svg */
    return img;
  }
  function ext(a) { a.target = '_blank'; a.rel = 'noopener noreferrer'; return a; }

  /* cabeçalho */
  var header = el('header', { 'class': 'mt-header' });
  var bar = el('div', { 'class': 'mt-bar' });
  var brand = el('a', { 'class': 'mt-brand', href: ROOT + 'index.html', 'aria-label': 'MecaTech LAB, página inicial' });
  brand.appendChild(logo(42));
  brand.appendChild(el('span', {}, 'MecaTech <b>LAB</b>'));
  var burger = el('button', { 'class': 'mt-burger', type: 'button', 'aria-label': 'Abrir menu', 'aria-expanded': 'false', 'aria-controls': 'mtNav' }, '<span></span>');
  var nav = el('nav', { 'class': 'mt-nav', id: 'mtNav', 'aria-label': 'Navegação principal' });
  PAGES.forEach(function (p) {
    var a = el('a', { href: ROOT + p[1] }, p[2]);
    if (p[0] === current) a.setAttribute('aria-current', 'page');
    nav.appendChild(a);
  });
  nav.appendChild(ext(el('a', { 'class': 'mt-ext', href: HOTMART }, 'Materiais &amp; Projetos ↗')));
  bar.appendChild(brand); bar.appendChild(burger); bar.appendChild(nav);
  header.appendChild(bar);
  document.body.insertBefore(header, document.body.firstChild);

  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) setMenu(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 1020) setMenu(false); });

  /* rodapé */
  var footer = el('footer', { 'class': 'mt-footer' });
  var labs = PAGES.slice(1, 5).map(function (p) { return '<a href="' + ROOT + p[1] + '">' + p[2] + '</a>'; }).join('');
  footer.innerHTML =
    '<div class="mt-foot">' +
    '<div><strong>MecaTech LAB</strong><p>Laboratórios virtuais gratuitos de eletrônica e mecatrônica, do canal MecaTechExplora.</p></div>' +
    '<div><h4>Laboratórios</h4><a href="' + ROOT + 'index.html">Início</a>' + labs + '</div>' +
    '<div><h4>Materiais</h4><a href="' + ROOT + 'produtos/index.html">Materiais e Cursos</a>' +
    '<a href="' + HOTMART + '" target="_blank" rel="noopener noreferrer">Materiais &amp; Projetos ↗</a></div>' +
    '<div><h4>Canal</h4><a href="' + YOUTUBE + '" target="_blank" rel="noopener noreferrer">MecaTechExplora no YouTube ↗</a></div>' +
    '</div><div class="mt-copy">© ' + new Date().getFullYear() + ' MecaTech LAB · MecaTechExplora. Os laboratórios são gratuitos.</div>';
  document.body.appendChild(footer);
})();
