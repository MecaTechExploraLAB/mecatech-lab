/* MecaTech LAB: mensagens pelo nome e certificado do laboratório de multímetro.
   Só OBSERVA o estado público do simulador (chlIdx, chlSolved, CHALLENGES); não altera a lógica dele. */
(function () {
  'use strict';
  if (typeof CHALLENGES === 'undefined' || !window.MTA) return;
  var feito = {}, certOk = false, total = CHALLENGES.length;
  var cab = document.querySelector('.sim-head'), barra = document.getElementById('challengeBar');
  var coach = document.createElement('p'); coach.id = 'mtaCoach'; coach.className = 'coach'; coach.setAttribute('role', 'status'); coach.setAttribute('aria-live', 'polite');
  coach.textContent = MTA.fmt('{n}, siga os desafios abaixo ou use o modo livre.');
  if (cab) cab.insertAdjacentElement('afterend', coach);
  var nota = document.createElement('small'); nota.className = 'nota'; nota.textContent = 'Ao concluir os ' + total + ' desafios, você recebe um certificado de conclusão.';
  if (barra) barra.insertAdjacentElement('afterend', nota);
  var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn sm'; btn.textContent = 'Ver meu certificado'; btn.style.display = 'none';
  var acts = document.querySelector('.challenge-actions'); if (acts) acts.appendChild(btn);
  function certificado() {
    MTA.certificado({ titulo: 'Laboratório de Multímetro', texto: 'concluiu os ' + total + ' desafios do simulador de multímetro, medindo tensão e testando continuidade.' });
  }
  btn.onclick = certificado;
  setInterval(function () {
    try {
      if (chlActive && chlSolved && !feito[chlIdx]) {
        feito[chlIdx] = 1; var n = Object.keys(feito).length;
        coach.textContent = MTA.fmt('Muito bem, {n}! Desafio ' + (chlIdx + 1) + ' concluído (' + n + '/' + total + ').');
        if (n >= total && !certOk) { certOk = true; btn.style.display = ''; certificado(); }
      }
    } catch (e) {}
  }, 300);
})();
