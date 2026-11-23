/* MecaTech LAB: registro das boas-vindas. Grava na PRIMEIRA aba da planilha, colunas:
   A Nome | B Sobrenome | C Idade | D Cidade | E Estado | F Data e Hora
   Cole este código em Extensões > Apps Script, na própria planilha. */

/* Só preencha se este script NÃO foi criado por Extensões > Apps Script dentro da planilha. */
var ID_PLANILHA = '';
var UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

function planilha() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss && ID_PLANILHA) ss = SpreadsheetApp.openById(ID_PLANILHA);
  return ss;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    var nome = limpa(d.nome);
    if (!nome) return resp({ ok: false });               /* só o nome é obrigatório */
    var sobrenome = limpa(d.sobrenome), cidade = limpa(d.cidade);
    var estado = String(d.estado || '').toUpperCase().trim();
    if (UFS.indexOf(estado) < 0) estado = '';
    var idade = parseInt(d.idade, 10);
    if (!(idade >= 5 && idade <= 99)) idade = '';
    var sh = planilha().getSheets()[0];
    if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, 6).setValues([['Nome', 'Sobrenome', 'Idade', 'Cidade', 'Estado', 'Data e Hora']]);
    var dataHora = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'dd/MM/yyyy HH:mm:ss');
    var linha = sh.getLastRow() + 1;
    sh.getRange(linha, 1, 1, 6).setNumberFormat('@');   /* texto: nunca interpretado como fórmula */
    sh.getRange(linha, 3).setNumberFormat('0');          /* a idade fica como número, para médias */
    sh.getRange(linha, 1, 1, 6).setValues([[nome, sobrenome, idade, cidade, estado, dataHora]]);
    return resp({ ok: true });
  } catch (err) {
    return resp({ ok: false });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet() { return resp({ ok: true, servico: 'registro de boas-vindas' }); }
function limpa(v) { return String(v || '').replace(/\s+/g, ' ').trim().slice(0, 60); }
function resp(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
