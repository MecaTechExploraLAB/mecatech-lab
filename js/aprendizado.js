/* MecaTech LAB: identidade do visitante (guardada só no navegador), mensagens pelo primeiro nome e certificado. */
(function () {
  'use strict';
  var CH = 'mt_visitante';
  function ler() { try { return JSON.parse(localStorage.getItem(CH) || 'null'); } catch (e) { return null; } }
  function gravar(d) { try { localStorage.setItem(CH, JSON.stringify(d)); } catch (e) {} }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var MTA = { dados: ler, salvar: gravar, esc: esc };
  MTA.nome = function () { var d = ler(); return (d && d.nome) || ''; };
  MTA.completo = function () { var d = ler(); return d ? [d.nome, d.sobrenome].filter(Boolean).join(' ') : ''; };
  /* "Muito bem, {n}!" vira "Muito bem, Rudson!"; sem nome conhecido, vira "Muito bem!" */
  MTA.fmt = function (s) {
    var n = MTA.nome();
    if (n) return s.replace(/\{n\}/g, n);
    return s.replace(/,\s*\{n\}/g, '').replace(/\{n\},\s*(\S)/g, function (m, c) { return c.toUpperCase(); }).replace(/\{n\}/g, '');
  };
  var dataHora = function (d) { return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };

  /* janela de aviso/ajuda */
  var ajudaEl = null;
  MTA.ajuda = function (titulo, html) {
    if (!ajudaEl) {
      ajudaEl = document.createElement('div'); ajudaEl.id = 'mta-ajuda'; ajudaEl.setAttribute('role', 'dialog'); ajudaEl.setAttribute('aria-modal', 'true');
      ajudaEl.innerHTML = '<div class="mta-card mta-ajuda"><h2 id="mta-at"></h2><div id="mta-ab"></div><div class="mta-act"><button class="btn btn-primary" id="mta-ax" type="button">OK</button></div></div>';
      document.body.appendChild(ajudaEl);
      ajudaEl.querySelector('#mta-ax').onclick = function () { ajudaEl.classList.remove('on'); };
      ajudaEl.addEventListener('click', function (e) { if (e.target === ajudaEl) ajudaEl.classList.remove('on'); });
    }
    ajudaEl.querySelector('#mta-at').textContent = titulo; ajudaEl.querySelector('#mta-ab').innerHTML = html;
    ajudaEl.classList.add('on'); ajudaEl.querySelector('#mta-ax').focus();
  };
  MTA.instrucoesRobo = function () {
    return '<p>' + MTA.fmt('<b>Tudo certo, {n}!</b> Veja como operar o robô:') + '</p><ol class="mta-passos">' +
      '<li><b>Habilitar:</b> toque em <b>HABILITAR</b> no Teach Pendant. Sem isso, o robô não se move.</li>' +
      '<li><b>Mover os eixos:</b> segure <b>+</b> ou <b>−</b> na linha do eixo (A1 a A6). Ao soltar, o robô para. Ajuste a <b>Velocidade</b> como quiser.</li>' +
      '<li><b>Segurança:</b> <b>STOP</b> para o robô na hora, e <b>HOME</b> leva à posição inicial.</li>' +
      '<li><b>Como continuar:</b> siga as <b>Missões</b> ou use o <b>Modo livre</b>.</li></ol>';
  };

  /* certificado de conclusão */
  var certEl = null, nomeCert = '', ultimo = null;
  function pintar() {
    var nome = MTA.completo() || nomeCert, f = certEl.querySelector('#mta-f');
    certEl.querySelector('#mta-t').textContent = ultimo.titulo;
    certEl.querySelector('#mta-txt').textContent = ultimo.texto;
    certEl.querySelector('#mta-data').textContent = dataHora(ultimo.quando);
    certEl.querySelector('#mta-nome').textContent = nome || '';
    f.hidden = !!nome; certEl.querySelector('#mta-nome').hidden = !nome;
    certEl.querySelector('#mta-act').hidden = !nome;
  }
  MTA.certificado = function (op) {
    ultimo = { titulo: op.titulo, texto: op.texto, quando: op.quando || new Date() };
    if (!certEl) {
      certEl = document.createElement('div'); certEl.id = 'mta-cert'; certEl.setAttribute('role', 'dialog'); certEl.setAttribute('aria-modal', 'true');
      certEl.innerHTML = '<div class="mta-card"><p class="mta-k">CERTIFICADO DE CONCLUSÃO</p><h2 id="mta-t"></h2><p class="mta-c">MecaTech LAB · laboratórios virtuais gratuitos</p>' +
        '<p>Certificamos que</p><div class="mta-nome" id="mta-nome"></div>' +
        '<form id="mta-f" hidden><label for="mta-in">Como você quer que seu nome apareça no certificado?</label><input id="mta-in" maxlength="60" autocomplete="off"><button class="btn btn-primary" type="submit">Gerar certificado</button><p id="mta-e" role="alert"></p></form>' +
        '<p id="mta-txt"></p><p><b id="mta-data"></b></p><div class="mta-sel" aria-hidden="true">✓</div>' +
        '<div class="mta-act" id="mta-act"><button class="btn btn-primary" id="mta-x" type="button">Fechar</button><button class="btn" id="mta-p" type="button">Imprimir</button></div></div>';
      document.body.appendChild(certEl);
      certEl.querySelector('#mta-x').onclick = function () { certEl.classList.remove('on'); };
      certEl.querySelector('#mta-p').onclick = function () { window.print(); };
      certEl.querySelector('#mta-f').addEventListener('submit', function (e) {
        e.preventDefault(); var v = certEl.querySelector('#mta-in').value.replace(/\s+/g, ' ').trim();
        if (!/^\p{L}[\p{L}'’ .-]{1,59}$/u.test(v)) { certEl.querySelector('#mta-e').textContent = 'Digite seu nome usando apenas letras.'; return; }
        nomeCert = v; certEl.querySelector('#mta-e').textContent = ''; pintar();
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') certEl.classList.remove('on'); });
    }
    pintar(); certEl.classList.add('on'); var f = certEl.querySelector('#mta-f'); (f.hidden ? certEl.querySelector('#mta-x') : certEl.querySelector('#mta-in')).focus();
  };
  window.MTA = MTA;
})();
