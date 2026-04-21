const fs = require('fs');
let xml = fs.readFileSync('public/docs/temp_docx/word/document.xml', 'utf8');

// The template has tables where the first column is the label, and the second column is empty (or has something we can overwrite).
// E.g. "CNPJ:", we want to put {cnpj} in the cell right next to it.
const mapTop = {
  'CNPJ:': '{cnpj}',
  'NATUREZA JURÍDICA:': '{natureza_juridica}',
  'RAZÃO SOCIAL:': '{razao_social}',
  'NOME FANTASIA:': '{nome_fantasia}',
  'ENDEREÇO:': '{endereco}',
  'DATA ABERTURA CNPJ:': '{data_abertura}',
  'E-MAIL:': '{email}',
  'TELEFONE:': '{telefone}'
};

for (const [label, tag] of Object.entries(mapTop)) {
  // We look for the label
  const idx = xml.indexOf(label);
  if (idx !== -1) {
    // The structure typically is: `</w:tc><w:tc>...<w:p>...</w:p>` next to it.
    // Instead of regex, let's insert it after the end of the label's cell.
    const tcEnd = xml.indexOf('</w:tc>', idx);
    const nextTcEnd = xml.indexOf('</w:tc>', tcEnd + 5);
    // Find the last <w:p> inside the next cell
    const pEnd = xml.lastIndexOf('</w:p>', nextTcEnd);
    if (pEnd !== -1 && pEnd > tcEnd) {
      // Inject our tag right before </w:p> in the next cell
      const inject = `<w:r><w:t>${tag}</w:t></w:r>`;
      xml = xml.substring(0, pEnd) + inject + xml.substring(pEnd);
    }
  }
}

// For the checklists, it has 5 columns: 
// Descrição | Código | Data emissão | Data validade | Análise
// Let's replace each row's 2nd to 5th columns.
// But it's easier to use a loop: Let's find "Cartão CNPJ", and do the same for 4 columns.

// Habilitação
const hj = ['Cartão CNPJ','QSA Cartão CNPJ','Cadastro Contribuinte Municipal/Estadual','Alvará de licença e funcionamento','Estatuto Social','Ata Constituição/Fundação','Ata Eleição e Posse atual','Relação de Membros atual','Comprovante endereço entidade','RG/CPF representante legal','Comprovante endereço representante legal'];
for(let i=0; i<hj.length; i++) {
   injectRowTags(hj[i], `hj_2_${i+1}`);
}

// Regularidade
const rf = ['CND Federal','CND Estadual','CNDA Estadual','CND Municipal','CR FGTS','CND Trabalhista','CND CAEMA'];
for(let i=0; i<rf.length; i++) { injectRowTags(rf[i], `rf_3_${i+1}`); }

// Econômica
const qe = ['Certidão de Falência e Concordata','Registro e regularidade Contador','Termo de abertura','Balanço Patrimonial','Demonstração do Superavit e Déficit','Demonstração das Mutações do Patrimonio Líquido','Demonstração dos Fluxos de Caixa','Notas Explicativas dos dois últimos exercícios sociais','Termo de encerramento','Ata aprovando prestação de contas com parecer do conselho fiscal dos últimos dois exercícios sociais da entidade.'];
for(let i=0; i<qe.length; i++) { injectRowTags(qe[i], `qe_4_${i+1}`); }

// Técnica
const qt = ['Termo de Contrato','Convênio','Termo de Colaboração','Termo de Fomento','Acordo de Cooperação Técnica'];
for(let i=0; i<qt.length; i++) { injectRowTags(qt[i], `qt_5_${i+1}`); }

// Outros
const or = ['Atestado de Existência e Regular Funcionamento – AERFE MP/MA (se houver)','Cadastro Nacional de Entidades de Assistência Social - CNEAS (se houver)','Cadastro Nacional de Estabelecimento de Saúde – CNES (se houver)','Conselho Municipal da Assistência Social – CMAS (se houver)','Conselho Municipal dos Direitos da Criança e Adolescente - CMDCA (se houver)','Alvará de autorização sanitária (se houver)','Sistema de Cadastramento Unificado de Fornecedores - SICAF (se houver)','Registro e Regularidade no Conselho Classe (se houver)----','Registro e Regularidade do Profissional RT no Conselho Classe (se houver)----'];
for(let i=0; i<or.length; i++) { injectRowTags(or[i], `or_6_${i+1}`); }

function injectRowTags(label, prefix) {
  let idx = xml.indexOf(label);
  if (idx === -1) {
    console.log('Not found:', label);
    return;
  }
  let currTcEnd = xml.indexOf('</w:tc>', idx);
  
  // cell 2: codigo
  currTcEnd = injectCol(currTcEnd, `{${prefix}_codigo}`);
  // cell 3: emissao
  currTcEnd = injectCol(currTcEnd, `{${prefix}_emissao}`);
  // cell 4: validade
  currTcEnd = injectCol(currTcEnd, `{${prefix}_validade}`);
  // cell 5: status
  currTcEnd = injectCol(currTcEnd, `{${prefix}_status}`);
}

function injectCol(prevTcEnd, tag) {
  let nextTcEnd = xml.indexOf('</w:tc>', prevTcEnd + 5);
  let pEnd = xml.lastIndexOf('</w:p>', nextTcEnd);
  if (pEnd !== -1 && pEnd > prevTcEnd) {
    let inject = `<w:r><w:t>${tag}</w:t></w:r>`;
    xml = xml.substring(0, pEnd) + inject + xml.substring(pEnd);
  }
  return nextTcEnd;
}

xml = xml.replace('1-DT.MM/ANOX/OBGP', '{numero_relatorio}');
xml = xml.replace('XX.XXX.XXX/XXXX-XX', '{cnpj}');
xml = xml.replace('RC1DTMMANOXOBGP', '{codigo_controle}');
xml = xml.replace('DT de MES de ANO', '{data_hoje}');
// percentages in conclusion:
xml = xml.replace('Habilitação Jurídica – XX% conforme', 'Habilitação Jurídica – {hj_conforme}% conforme');
xml = xml.replace('Regularidade Fiscal, Social e Trabalhista - XX% conforme', 'Regularidade Fiscal, Social e Trabalhista - {rf_conforme}% conforme');
xml = xml.replace('Qualificação Econômico-financeira -XX% conforme', 'Qualificação Econômico-financeira - {qe_conforme}% conforme');
xml = xml.replace('Qualificação Técnica -XX% conforme', 'Qualificação Técnica - {qt_conforme}% conforme');
xml = xml.replace('Outros registros -XX% conforme', 'Outros registros - {or_conforme}% conforme');

fs.writeFileSync('public/docs/temp_docx/word/document.xml', xml);
console.log('Patched XML successfully.');
