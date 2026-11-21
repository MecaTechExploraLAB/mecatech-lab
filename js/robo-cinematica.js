/* MecaTech LAB: cinemática do robô didático de 6 eixos (milímetros e graus).
   Eixos: A1 gira em Z; A2 e A3 em Y; A4 e A6 em X (eixo do braço); A5 em Y. Punho esférico. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.RoboCin = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  var D2R = Math.PI / 180, R2D = 180 / Math.PI;
  var G = { a1: 25, d1: 400, L2: 440, L3: 420, d6: 100, tool: 120 };
  var LIM = [[-170, 170], [-135, 35], [-120, 158], [-185, 185], [-120, 120], [-350, 350]];
  var HOME = [0, -90, 90, 0, 90, 0];
  var cl = function (x, a, b) { return Math.max(a, Math.min(b, x)); };
  function Rx(a) { var c = Math.cos(a), s = Math.sin(a); return [[1, 0, 0], [0, c, -s], [0, s, c]]; }
  function Ry(a) { var c = Math.cos(a), s = Math.sin(a); return [[c, 0, s], [0, 1, 0], [-s, 0, c]]; }
  function Rz(a) { var c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; }
  function mul(A, B) { var C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]; for (var i = 0; i < 3; i++) for (var j = 0; j < 3; j++) for (var k = 0; k < 3; k++) C[i][j] += A[i][k] * B[k][j]; return C; }
  function mv(A, v) { return [A[0][0] * v[0] + A[0][1] * v[1] + A[0][2] * v[2], A[1][0] * v[0] + A[1][1] * v[1] + A[1][2] * v[2], A[2][0] * v[0] + A[2][1] * v[1] + A[2][2] * v[2]]; }
  function tr(A) { return [[A[0][0], A[1][0], A[2][0]], [A[0][1], A[1][1], A[2][1]], [A[0][2], A[1][2], A[2][2]]]; }
  function add(a, b) { return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]; }
  function n180(x) { x = ((x % 360) + 360) % 360; return x > 180 ? x - 360 : x; }
  function near(x, ref) { return x + 2 * Math.PI * Math.round((ref - x) / (2 * Math.PI)); }

  /* cinemática direta: posições (mm) e orientação do flange */
  function fk(q) {
    var r = q.map(function (d) { return d * D2R; });
    var R = Rz(r[0]), sh = mv(R, [G.a1, 0, G.d1]);
    R = mul(R, Ry(r[1])); var el = add(sh, mv(R, [G.L2, 0, 0]));
    R = mul(R, Ry(r[2])); var wr = add(el, mv(R, [G.L3, 0, 0]));
    R = mul(mul(mul(R, Rx(r[3])), Ry(r[4])), Rx(r[5]));
    return { shoulder: sh, elbow: el, wrist: wr, tcp: add(wr, mv(R, [G.d6 + G.tool, 0, 0])), R: R };
  }
  /* orientação da ferramenta como A, B, C (rotações em Z, Y, X), no estilo industrial */
  function abc(R) {
    var T = mul(mul(R, Ry(Math.PI / 2)), Rz(Math.PI));
    return [n180(Math.atan2(T[1][0], T[0][0]) * R2D), n180(-Math.asin(cl(T[2][0], -1, 1)) * R2D), n180(Math.atan2(T[2][1], T[2][2]) * R2D)];
  }
  /* devolve null se estiver tudo bem, ou a mensagem do problema */
  function check(q) {
    for (var i = 0; i < 6; i++) if (q[i] < LIM[i][0] - 1e-6 || q[i] > LIM[i][1] + 1e-6) return 'LIMITE A' + (i + 1);
    var f = fk(q);
    if (f.tcp[2] < 15 || f.wrist[2] < 40 || f.elbow[2] < 40) return 'COLISÃO COM O PISO';
    return null;
  }
  /* cinemática inversa analítica (cotovelo para cima, braço à frente) para posição + orientação do flange */
  function ik(pos, Rf, qc) {
    var Dd = G.d6 + G.tool, pw = [pos[0] - Rf[0][0] * Dd, pos[1] - Rf[1][0] * Dd, pos[2] - Rf[2][0] * Dd];
    var rr = Math.hypot(pw[0], pw[1]);
    var q1 = rr < 1e-6 ? qc[0] * D2R : near(Math.atan2(pw[1], pw[0]), qc[0] * D2R);
    var u = rr - G.a1, v = pw[2] - G.d1, d2 = Math.hypot(u, v);
    if (d2 > G.L2 + G.L3 - 1e-3 || d2 < Math.abs(G.L2 - G.L3) + 1e-3) return { err: 'FORA DO ALCANCE' };
    var E = Math.acos(cl((G.L2 * G.L2 + G.L3 * G.L3 - d2 * d2) / (2 * G.L2 * G.L3), -1, 1)), q3 = Math.PI - E;
    var de = Math.acos(cl((G.L2 * G.L2 + d2 * d2 - G.L3 * G.L3) / (2 * G.L2 * d2), -1, 1));
    var q2 = -(Math.atan2(v, u) + de);
    var M = mul(tr(mul(Rz(q1), Ry(q2 + q3))), Rf), cb = M[0][0], sb = Math.hypot(M[0][1], M[0][2]), c = [];
    if (sb < 1e-6) { var s = Math.atan2(M[2][1], M[1][1]); c.push([qc[3] * D2R, 0, s - qc[3] * D2R]); }
    else [1, -1].forEach(function (sg) { var b = Math.atan2(sg * sb, cb), sbb = Math.sin(b); c.push([Math.atan2(M[1][0] / sbb, -M[2][0] / sbb), b, Math.atan2(M[0][1] / sbb, M[0][2] / sbb)]); });
    var best = null, bc = 1e9, why = null;
    c.forEach(function (w) {
      var q = [q1 * R2D, q2 * R2D, q3 * R2D, near(w[0], qc[3] * D2R) * R2D, w[1] * R2D, near(w[2], qc[5] * D2R) * R2D];
      var bad = null; for (var i = 0; i < 6; i++) if (q[i] < LIM[i][0] - 1e-6 || q[i] > LIM[i][1] + 1e-6) { bad = 'LIMITE A' + (i + 1); break; }
      if (bad) { why = why || bad; return; }
      var cost = 0; for (var k = 0; k < 6; k++) cost += (q[k] - qc[k]) * (q[k] - qc[k]);
      if (cost < bc) { bc = cost; best = q; }
    });
    return best ? { q: best } : { err: why || 'FORA DO ALCANCE' };
  }
  return { G: G, LIM: LIM, HOME: HOME, fk: fk, ik: ik, abc: abc, check: check, n180: n180 };
});
