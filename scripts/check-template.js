const fs = require('fs');
const data = fs.readFileSync('public/docs/temp_docx_new/word/document.xml', 'utf-8');

const checks = [
  'Cartão CNPJ', 'QSA', 'CND Federal', 'Termo de abertura',
  'Registro e regularidade Contador', 'Termo de Contrato',
  'Acordo', 'Atestado de Exist', 'CNEAS', 'CNES', 'SICAF',
  'Conselho Classe', 'Alvará',
];

for (const c of checks) {
  const re = new RegExp(c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const matches = (data.match(re) || []).length;
  console.log(`${c.padEnd(35)} ${matches}x`);
}
