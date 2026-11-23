/* MecaTech LAB: conversa de boas-vindas com o assistente (só na página inicial).
   Pergunta nome, idade, sobrenome, cidade e estado; guarda no navegador e envia à planilha. */
(function () {
  'use strict';
  var MTA = window.MTA, C = window.MT_CONFIG || {};
  if (!MTA) return;
  function saudar() { var n = MTA.nome(), el = document.getElementById('saud'); if (el && n) { el.textContent = 'Seja bem-vindo, ' + n + '.'; el.hidden = false; } }
  var pulou = false; try { pulou = sessionStorage.getItem('mt_pulou') === '1'; } catch (e) {}
  if (MTA.dados()) { saudar(); return; }
  if (pulou) return;

  var UFS = { AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas', BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal', ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão', MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais', PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco', PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte', RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima', SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins' };
  var PEQ = ['da', 'de', 'do', 'das', 'dos', 'e'], esc = MTA.esc;
  var reduz = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var espera = function (ms) { return new Promise(function (r) { setTimeout(r, window.__rapido || reduz ? 0 : ms); }); };
  function limpa(t) { return String(t || '').replace(/\s+/g, ' ').trim(); }
  function palavra(w) { return w.toLocaleLowerCase('pt-BR').replace(/(^|['’-])(\p{L})/gu, function (m, a, c) { return a + c.toLocaleUpperCase('pt-BR'); }); }
  function bonito(t) { var p = limpa(t).split(' '); return p.map(function (w) { return p.length > 1 && PEQ.indexOf(w.toLowerCase()) >= 0 ? w.toLowerCase() : palavra(w); }).join(' '); }
  var NOME = /^\p{L}[\p{L}'’ -]{1,59}$/u, CIDADE = /^\p{L}[\p{L}'’ .-]{1,59}$/u;
  function agoraSP() { var m = new Date().toLocaleString('sv-SE', { timeZone: 'America/Sao_Paulo' }).match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}:\d{2}:\d{2})/); return m ? m[3] + '/' + m[2] + '/' + m[1] + ' ' + m[4] : ''; }
  function enviar(d) {
    if (!C.urlPlanilha) { console.warn('urlPlanilha não configurada: a entrada não foi enviada.'); return; }
    fetch(C.urlPlanilha, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(d), keepalive: true }).catch(function () {});
  }

  /* janela */
  var ov = document.createElement('div'); ov.id = 'bv'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Boas-vindas ao MecaTech LAB');
  ov.innerHTML = '<div class="bv-card"><div class="bv-h"><i></i><span>Assistente MecaTech LAB</span></div><div id="bv-chat" role="log" aria-live="polite"></div>' +
    '<form id="bv-f" novalidate><input id="bv-in" type="text" maxlength="60" autocomplete="off" aria-label="Sua resposta" disabled><select id="bv-uf" aria-label="Estado" hidden></select>' +
    '<button class="btn btn-primary" id="bv-env" type="submit" disabled>Enviar</button></form>' +
    '<button class="btn" id="bv-pular" type="button">Prefiro não informar</button><button class="btn btn-primary" id="bv-ok" type="button">OK, entendi</button>' +
    '<p class="bv-priv">Suas respostas são registradas, com data e hora, para personalizar a experiência e conhecer o público do MecaTech LAB.' +
    (C.permitirPular !== false ? ' <button id="bv-sair" type="button">Prefiro não me identificar</button>' : '') + '</p></div>';
  document.body.appendChild(ov); ov.classList.add('on'); document.body.style.overflow = 'hidden';
  var $ = function (i) { return document.getElementById(i); };
  var chat = $('bv-chat'), f = $('bv-f'), inp = $('bv-in'), uf = $('bv-uf'), env = $('bv-env'), pularBt = $('bv-pular'), okBt = $('bv-ok');
  uf.innerHTML = '<option value="">Selecione o estado</option>' + Object.keys(UFS).map(function (k) { return '<option value="' + k + '">' + UFS[k] + ' (' + k + ')</option>'; }).join('');
  function fechar() { ov.classList.remove('on'); document.body.style.overflow = ''; }
  if ($('bv-sair')) $('bv-sair').onclick = function () { try { sessionStorage.setItem('mt_pulou', '1'); } catch (e) {} fechar(); };

  function bolha(cls, html) { var d = document.createElement('div'); d.className = 'bv-b ' + cls; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; }
  function ia(html) {
    var d = bolha('ia bv-dig', '<span></span><span></span><span></span>');
    return espera(650).then(function () { d.className = 'bv-b ia'; d.innerHTML = html; chat.scrollTop = chat.scrollHeight; });
  }
  /* faz uma pergunta e devolve o valor (ou null, se a pessoa preferir não informar) */
  function perguntar(texto, op) {
    return ia(texto).then(function () {
      return new Promise(function (res) {
        var ehUf = op.tipo === 'uf';
        inp.hidden = ehUf; uf.hidden = !ehUf; inp.value = ''; uf.value = ''; inp.placeholder = op.ph || ''; inp.inputMode = op.tipo === 'numero' ? 'numeric' : 'text';
        inp.disabled = false; env.disabled = false;
        pularBt.style.display = (op.pular && !C.exigirTudo) ? 'block' : 'none';
        (ehUf ? uf : inp).focus();
        function limparUi() { f.removeEventListener('submit', enviarFn); pularBt.onclick = null; inp.disabled = true; env.disabled = true; pularBt.style.display = 'none'; }
        function enviarFn(e) {
          e.preventDefault(); var v;
          if (ehUf) { v = uf.value; if (!v) { bolha('ia', 'Escolha o seu estado na lista.'); return; } }
          else { v = op.fmt ? op.fmt(inp.value) : bonito(inp.value); if (!op.valida(v)) { bolha('ia', op.erro); return; } }
          limparUi(); bolha('eu', esc(ehUf ? uf.options[uf.selectedIndex].text : v)); res(v);
        }
        f.addEventListener('submit', enviarFn);
        pularBt.onclick = function () { limparUi(); bolha('eu', '<i>Prefiro não informar</i>'); res(null); };
      });
    });
  }
  function instrucoes(n) {
    return '<p><b>Tudo certo, ' + esc(n) + '!</b> Veja como funciona o MecaTech LAB:</p><ol class="mta-passos">' +
      '<li><b>Escolha um laboratório:</b> Multímetro, Circuitos ou Robótica industrial.</li>' +
      '<li><b>Desafios e modo livre:</b> cada laboratório tem desafios guiados e um modo livre para você explorar.</li>' +
      '<li><b>Ajuda:</b> nos botões <b>Dica</b> você encontra apoio quando travar. No robô, toque em <b>HABILITAR</b> antes de mover.</li></ol>' +
      '<p class="nota">Ao concluir os desafios de um laboratório, você recebe um certificado de conclusão.</p>';
  }
  var idadeFmt = function (v) { var m = String(v).match(/^\s*(\d{1,3})\s*(anos?)?\s*$/i); return m ? m[1] : String(v).trim(); };
  var idadeOk = function (v) { return /^\d{1,2}$/.test(v) && +v >= 5 && +v <= 99; };

  (async function () {
    await ia('Olá! Seja bem-vindo ao <b>MecaTech LAB</b>.');
    await ia('Para deixar sua experiência personalizada e conhecer de onde vem o nosso público, preciso de algumas informações.');
    var nome = await perguntar('Como posso chamar você?', { ph: 'Seu nome', valida: function (v) { return NOME.test(v); }, erro: 'Pode digitar só o seu nome, usando letras?' });
    await ia('Prazer, <b>' + esc(nome) + '</b>!');
    var idadeTxt = await perguntar('Quantos anos você tem?', { ph: 'Sua idade', pular: true, fmt: idadeFmt, valida: idadeOk, erro: 'Pode digitar só o número da sua idade?' });
    var idade = idadeTxt === null ? null : +idadeTxt, sobrenome = null, cidade = null, estado = null;
    if (idade !== null && idade >= 18) {
      sobrenome = await perguntar('E qual é o seu sobrenome? Ele aparece no seu certificado.', { ph: 'Seu sobrenome', pular: true, valida: function (v) { return NOME.test(v); }, erro: 'Pode digitar o seu sobrenome, usando letras?' });
      cidade = await perguntar('De qual cidade você fala?', { ph: 'Sua cidade', pular: true, valida: function (v) { return CIDADE.test(v); }, erro: 'Pode digitar o nome da sua cidade, usando letras?' });
      estado = await perguntar('E em qual estado?', { tipo: 'uf', pular: true });
    } else if (idade !== null) await ia('Tudo bem, ' + esc(nome) + '! Por aqui eu registro apenas o seu nome e a idade.');
    else await ia('Sem problemas, ' + esc(nome) + '! Vou registrar apenas o seu nome.');
    var dados = { nome: nome, sobrenome: sobrenome || '', idade: idade === null ? '' : idade, cidade: cidade || '', estado: estado || '' };
    MTA.salvar({ nome: dados.nome, sobrenome: dados.sobrenome, idade: dados.idade, cidade: dados.cidade, estado: dados.estado, ts: new Date().toISOString() });
    enviar({ nome: dados.nome, sobrenome: dados.sobrenome, idade: dados.idade, cidade: dados.cidade, estado: dados.estado, dataHora: agoraSP() });
    await ia('Pronto, ' + esc(nome) + '. Suas respostas foram registradas.');
    await ia(instrucoes(nome));
    f.style.display = 'none'; okBt.style.display = 'block'; okBt.focus();
    okBt.onclick = function () { fechar(); saudar(); window.scrollTo(0, 0); };
  })();
})();
