const fs = require('fs');
let xml = fs.readFileSync('public/docs/temp_docx/word/document.xml', 'utf8');

const replacements = [
  ['CNPJ:</w:t>', 'CNPJ:</w:t><w:t xml:space="preserve"> {cnpj}</w:t>'],
  ['NATUREZA JURÍDICA:</w:t>', 'NATUREZA JURÍDICA:</w:t><w:t xml:space="preserve"> {natureza_juridica}</w:t>'],
  ['RAZÃO SOCIAL:</w:t>', 'RAZÃO SOCIAL:</w:t><w:t xml:space="preserve"> {razao_social}</w:t>'],
  ['NOME FANTASIA:</w:t>', 'NOME FANTASIA:</w:t><w:t xml:space="preserve"> {nome_fantasia}</w:t>'],
  ['ENDEREÇO:</w:t>', 'ENDEREÇO:</w:t><w:t xml:space="preserve\"> {endereco}</w:t>'],
  ['DATA ABERTURA CNPJ:</w:t>', 'DATA ABERTURA CNPJ:</w:t><w:t xml:space="preserve"> {data_abertura}</w:t>'],
  ['E-MAIL:</w:t>', 'E-MAIL:</w:t><w:t xml:space="preserve"> {email}</w:t>'],
  ['TELEFONE:</w:t>', 'TELEFONE:</w:t><w:t xml:space="preserve\"> {telefone}</w:t>'],
  ['N.º 1-18.04/2026/OBGP</w:t>', 'N.º {numero_relatorio}</w:t>'],
  ['INSTITUTO DE GESTAO DE PROJETOS SOCIAIS</w:t>', '{razao_social}</w:t>'],
  ['38.441.651/0001-90</w:t>', '{cnpj}</w:t>'],
  ['RC118042026OBGP</w:t>', '{codigo_controle}</w:t>'],
  ['18 de abril de 2026</w:t>', '{data_hoje}</w:t>']
];

for(const [find, replace] of replacements){
  xml = xml.replace(find, replace);
}

fs.writeFileSync('public/docs/temp_docx/word/document.xml', xml);
console.log('XML atualizado com sucesso!');
