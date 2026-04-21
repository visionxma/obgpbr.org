import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';

export async function gerarRelatorioDocx(dados: Record<string, any>): Promise<Blob> {
  // 1. Fetch template from public folder
  const response = await fetch('/docs/MODEL_RELATORIO_CONFORMIDADE_OSC_REV00_20.04.2026_.docx');
  if (!response.ok) {
    throw new Error('Não foi possível carregar o template do relatório.');
  }
  
  const arrayBuffer = await response.arrayBuffer();

  // 2. Load Zip
  const zip = new PizZip(arrayBuffer);

  // 3. Initialize Docxtemplater
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    nullGetter: () => '' // Return empty string for undefined placeholders
  });

  // 4. Set Data
  doc.render(dados);

  // 5. Generate Output
  const out = doc.getZip().generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    compression: 'DEFLATE'
  });

  return out;
}
