'use client';
import React, { useState } from 'react';
import {
  ShieldCheck, UploadCloud, CheckCircle2, FileText, ChevronRight, Activity, Clock, FileCheck, Search, FileSignature, HelpCircle, Check, AlertCircle, CircleDashed, Briefcase
} from 'lucide-react';
import { usePainel } from '../PainelContext';

const HABILITACAO_JURIDICA = [
  { id: '2.1', title: 'Cartão CNPJ' },
  { id: '2.2', title: 'QSA Cartão CNPJ' },
  { id: '2.3', title: 'Cadastro Contribuinte Municipal/Estadual' },
  { id: '2.4', title: 'Alvará de Licença e Funcionamento' },
  { id: '2.5', title: 'Estatuto Social' },
  { id: '2.6', title: 'Ata Constituição/Fundação' },
  { id: '2.7', title: 'Ata Eleição e Posse atual' },
  { id: '2.8', title: 'Relação de Membros atual' },
  { id: '2.9', title: 'Comprovante de Endereço da Entidade' },
  { id: '2.10', title: 'RG/CPF do Representante Legal' },
  { id: '2.11', title: 'Comprovante de Endereço do Representante Legal' },
];

const REGULARIDADE_FISCAL = [
  { id: '3.1', title: 'CND Federal' },
  { id: '3.2', title: 'CND Estadual' },
  { id: '3.3', title: 'CNDA Estadual' },
  { id: '3.4', title: 'CND Municipal' },
  { id: '3.5', title: 'CRF FGTS' },
  { id: '3.6', title: 'CND Trabalhista' },
  { id: '3.7', title: 'CND CAEMA' },
];

const QUALIFICACAO_FINANCEIRA = [
  { id: '4.1', title: 'Certidão de Falência e Concordata' },
  { id: '4.2', title: 'Registro e Regularidade do Contador' },
  { id: '4.3', title: 'Demonstrações Financeiras (Balanço Social) último dois exercícios (ITG 2002)' },
  { id: '4.3.1', title: 'Termo de abertura' },
  { id: '4.3.2', title: 'Balanço Patrimonial' },
  { id: '4.3.3', title: 'Demonstração do Superávit e Déficit' },
  { id: '4.3.4', title: 'Demonstração das Mutações do Patrimônio Líquido' },
  { id: '4.3.5', title: 'Demonstração dos Fluxos de Caixa' },
  { id: '4.3.6', title: 'Notas Explicativas dos dois últimos exercícios sociais' },
  { id: '4.3.7', title: 'Termo de encerramento' },
  { id: '4.4', title: 'Ata de aprovação de contas com parecer do Conselho Fiscal dos últimos dois exercícios sociais da entidade' },
];

const QUALIFICACAO_TECNICA = [
  { id: '5.1.1', title: 'Termo de Compromisso de Destinação de Recursos MPTMA' },
  { id: '5.1.2', title: 'Termo de Contrato (Prefeitura de Presidente Médici/MA)' },
  { id: '5.1.3', title: 'Termo de Contrato (Prefeitura de Presidente Médici/MA)' },
  { id: '5.1.4', title: 'Acordo de Cooperação Técnica (Cachoeira Grande/MA)' },
  { id: '5.1.4.1', title: 'Aditivo Acordo de Cooperação Técnica (Prefeitura Municipal de Cachoeira Grande/MA)' },
  { id: '5.1.5', title: 'Acordo de Cooperação Técnica (Prefeitura Municipal de Morros/MA)' },
  { id: '5.1.6', title: 'Termo de Contrato (Prefeitura Municipal de Lago do Junco/MA)' },
  { id: '5.1.7', title: 'Declaração de Parceria (Defensoria Pública do Estado/MA)' },
  { id: '5.1.8', title: 'Termo de Fomento Prefeitura Municipal de Primeira Cruz/MA' },
  { id: '5.1.9', title: 'Declaração de Cooperação e Parceria Prefeitura Municipal de Icatu/MA' },
  { id: '5.1.10', title: 'Declaração de Parceria e Atuação Conjunta Movimento Nacional da População de Rua MNPR' },
  { id: '5.1.11', title: 'Contrato Ministério do Desenvolvimento e Assistência Social, Família e Combate a Fome' },
  { id: '5.1', title: 'Registro e Regularidade da Entidade em Conselho Classe (se houver)' },
  { id: '5.2', title: 'Registro e Regularidade do Profissional RT da Entidade em Conselho Classe (se houver)' },
];

export default function ProcessoPage() {
  const { perfil } = usePainel();
  const [data, setData] = useState<Record<string, any>>({});

  const handleUpdate = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [id]: {
        ...(prev[id] || {}),
        [field]: value
      }
    }));
  };

  const [entidadeData, setEntidadeData] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (perfil) {
      setEntidadeData({
        cnpj: perfil.cnpj || '',
        natureza_juridica: perfil.natureza_juridica || '',
        razao_social: perfil.razao_social || '',
        nome_fantasia: (perfil as any).nome_fantasia || '',
        cep: perfil.cep || '',
        logradouro: perfil.logradouro || '',
        numero_endereco: perfil.numero_endereco || '',
        bairro: perfil.bairro || '',
        municipio: perfil.municipio || '',
        estado: perfil.estado || '',
        data_abertura_cnpj: perfil.data_abertura_cnpj || '',
        email_osc: perfil.email_osc || '',
        telefone: perfil.telefone || '',
        responsavel: perfil.responsavel || '',
      });
    }
  }, [perfil]);

  const handleEntidadeUpdate = (field: string, value: string) => {
    setEntidadeData(prev => ({ ...prev, [field]: value }));
  };

  const handleConsultarPagamentoEEnviar = () => {
    // Exemplo de integração: a ação enviará para o Admin somente após a liquidação do Selo
    alert('Aviso: O envio deste processo para a Administração requer a confirmação do pagamento referente à certificação (Selo OSC). O sistema validará a compensação antes da geração oficial.');
  };

  const currentProgress = 35; // Mock progress for visual tracking

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60, fontFamily: 'var(--font-sans)', color: 'var(--site-text-primary)' }}>
      {/* HEADER TITLE */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="panel-page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={28} color="var(--site-gold)" /> Meu Processo — Relatório de Conformidade
        </h1>
        <p className="panel-page-subtitle">Acompanhamento e estruturação documental oficial para a certificação do Selo OSC.</p>
      </div>

      {/* PAINEL DE ACOMPANHAMENTO (PROGRESS TRACKER) */}
      <div style={{ 
        background: 'var(--site-primary)', 
        borderRadius: 'var(--site-radius-xl)', 
        padding: '28px 32px', 
        marginBottom: 36,
        boxShadow: '0 12px 32px rgba(13,54,79,0.15)',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, color: '#fff' }}>PAINEL DE ACOMPANHAMENTO</h2>
            <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Status do Processo</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--site-gold)', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <CircleDashed size={16} /> Em Andamento (Edição)
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>Situação da Conformidade</span>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <Search size={16} color="var(--site-gold)" /> Aguardando Preenchimento e Pagamento
                </div>
              </div>
            </div>
          </div>
          <div style={{ width: 140 }}>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', textAlign: 'right', fontWeight: 700 }}>Progresso Geral</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--site-gold)', textAlign: 'right', lineHeight: 1 }}>{currentProgress}%</div>
          </div>
        </div>

        {/* Linha de Evolução */}
        <div style={{ marginTop: 32, position: 'relative' }}>
          <div style={{ position: 'absolute', top: 14, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.15)', zIndex: 0 }} />
          <div style={{ position: 'absolute', top: 14, left: 0, width: `${currentProgress}%`, height: 2, background: 'var(--site-gold)', zIndex: 1, transition: 'width 1s ease' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
            {[
              { label: 'Início', active: true, done: true },
              { label: 'Habilitação Jurídica', active: true, done: false },
              { label: 'Regularidade Fiscal', active: false, done: false },
              { label: 'Qual. Econômica', active: false, done: false },
              { label: 'Qual. Técnica', active: false, done: false },
              { label: 'Finalização', active: false, done: false }
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, width: 80 }}>
                <div style={{ 
                  width: 30, height: 30, borderRadius: '50%', 
                  background: step.done ? 'var(--site-gold)' : (step.active ? 'var(--site-primary)' : 'rgba(255,255,255,0.05)'),
                  border: step.done ? 'none' : (step.active ? '2px solid var(--site-gold)' : '2px solid rgba(255,255,255,0.2)'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: step.done ? '#fff' : (step.active ? 'var(--site-gold)' : 'rgba(255,255,255,0.4)')
                }}>
                  {step.done ? <Check size={16} /> : <span style={{ fontSize: 12, fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <span style={{ fontSize: '0.65rem', fontWeight: step.active ? 700 : 500, color: step.active ? '#fff' : 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.2 }}>{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 1. DADOS DA ENTIDADE */}
      <section style={{ marginBottom: 40, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
        <header style={{ background: 'var(--site-primary)', padding: '16px 24px', borderBottom: '1px solid var(--site-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Briefcase size={20} color="#fff" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>1. DADOS DA ENTIDADE (Editável)</h2>
        </header>
        <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <InputField label="CNPJ" value={entidadeData.cnpj} onChange={(v) => handleEntidadeUpdate('cnpj', v)} />
          <InputField label="Natureza Jurídica" value={entidadeData.natureza_juridica} onChange={(v) => handleEntidadeUpdate('natureza_juridica', v)} />
          <InputField label="Razão Social" value={entidadeData.razao_social} onChange={(v) => handleEntidadeUpdate('razao_social', v)} />
          <InputField label="Nome Fantasia" value={entidadeData.nome_fantasia} onChange={(v) => handleEntidadeUpdate('nome_fantasia', v)} />
          <InputField label="E-mail" value={entidadeData.email_osc} onChange={(v) => handleEntidadeUpdate('email_osc', v)} type="email" />
          <InputField label="Telefone" value={entidadeData.telefone} onChange={(v) => handleEntidadeUpdate('telefone', v)} />
          <InputField label="Representante Legal" value={entidadeData.responsavel} onChange={(v) => handleEntidadeUpdate('responsavel', v)} />
          <InputField label="Data de Abertura do CNPJ" type="date" value={entidadeData.data_abertura_cnpj} onChange={(v) => handleEntidadeUpdate('data_abertura_cnpj', v)} />
          
          <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--site-border)', paddingTop: 20, marginTop: 10 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase', marginBottom: 16 }}>Endereço Completo</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <InputField label="CEP" value={entidadeData.cep} onChange={(v) => handleEntidadeUpdate('cep', v)} />
              <InputField label="Logradouro" value={entidadeData.logradouro} onChange={(v) => handleEntidadeUpdate('logradouro', v)} />
              <InputField label="Número" value={entidadeData.numero_endereco} onChange={(v) => handleEntidadeUpdate('numero_endereco', v)} />
              <InputField label="Bairro" value={entidadeData.bairro} onChange={(v) => handleEntidadeUpdate('bairro', v)} />
              <InputField label="Município" value={entidadeData.municipio} onChange={(v) => handleEntidadeUpdate('municipio', v)} />
              <InputField label="Estado (UF)" value={entidadeData.estado} onChange={(v) => handleEntidadeUpdate('estado', v)} />
            </div>
          </div>
        </div>
      </section>

      {/* RENDER SECTIONS HELPER */}
      <DocumentSection 
        number="2" title="HABILITAÇÃO JURÍDICA" 
        items={HABILITACAO_JURIDICA} data={data} handleUpdate={handleUpdate} 
      />
      
      <DocumentSection 
        number="3" title="REGULARIDADE FISCAL, SOCIAL E TRABALHISTA" 
        items={REGULARIDADE_FISCAL} data={data} handleUpdate={handleUpdate} 
      />
      
      <DocumentSection 
        number="4" title="QUALIFICAÇÃO ECONÔMICO-FINANCEIRA" 
        items={QUALIFICACAO_FINANCEIRA} data={data} handleUpdate={handleUpdate} 
      />
      
      <DocumentSection 
        number="5" title="QUALIFICAÇÃO TÉCNICA" 
        items={QUALIFICACAO_TECNICA} data={data} handleUpdate={handleUpdate} 
      />

      {/* 6. CONCLUSÃO (FORMATO OFICIAL) */}
      <section style={{ marginBottom: 40, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
        <header style={{ background: 'var(--site-primary)', color: '#fff', padding: '16px 24px', borderBottom: '1px solid var(--site-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
            6
          </div>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>CONCLUSÃO (FORMATO OFICIAL)</h2>
        </header>
        <div style={{ padding: '32px 40px', background: 'rgba(197,171,118,0.03)' }}>
          <div style={{ background: '#fff', border: '1px solid rgba(197,171,118,0.3)', padding: 32, borderRadius: 'var(--site-radius-lg)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', fontFamily: '"Times New Roman", Times, serif', fontSize: '1.1rem', lineHeight: 1.8, color: '#222', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, right: 20, opacity: 0.1, pointerEvents: 'none' }}>
              <ShieldCheck size={120} />
            </div>
            
            <p style={{ textAlign: 'justify', marginBottom: 20 }}>
              Após análise documental, constata-se que a entidade, incluindo identificação completa (nome e CNPJ), apresenta a seguinte conformidade:
            </p>
            <ul style={{ listStyleType: 'none', paddingLeft: 0, marginBottom: 20 }}>
              <li style={{ marginBottom: 8 }}><strong>Habilitação Jurídica</strong> – 100% conforme</li>
              <li style={{ marginBottom: 8 }}><strong>Regularidade Fiscal, Social e Trabalhista</strong> – 100% conforme</li>
              <li style={{ marginBottom: 8 }}><strong>Qualificação Econômico-Financeira</strong> – 100% conforme</li>
              <li style={{ marginBottom: 8 }}><strong>Qualificação Técnica</strong> – 100% conforme</li>
            </ul>
            <p style={{ textAlign: 'justify', marginBottom: 20 }}>
              Portanto, recomenda-se certificação independente através do <strong>“SELO OSC GESTÃO DE PARCERIAS”</strong>.
            </p>
            <p style={{ textAlign: 'justify', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee', paddingTop: 16, marginTop: 32 }}>
              A autenticidade do documento deve ser validável por meio de código de verificação e acesso ao website oficial.
            </p>
          </div>
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--site-text-secondary)', fontWeight: 700 }}>
              <AlertCircle size={14} style={{ display: 'inline', position: 'relative', top: 2, marginRight: 4 }} />
              O envio para a administração requer assinatura e pagamento ativo.
            </span>
            <button onClick={handleConsultarPagamentoEEnviar} className="btn btn-gold" style={{ padding: '14px 28px', fontSize: '1rem' }}>
              <CheckCircle2 size={18} /> Validar, Verificar Pagamento e Enviar Processo
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}

/* ── COMPONENTES INTERNOS ── */

function InputField({ label, value, onChange, readonly = false, type = 'text' }: { label: string, value?: string, onChange?: (val: string) => void, readonly?: boolean, type?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)', textTransform: 'uppercase' }}>{label}</label>
      <input 
        type={type} 
        value={value || ''} 
        onChange={e => onChange?.(e.target.value)}
        readOnly={readonly}
        style={{
          padding: '10px 14px',
          borderRadius: 'var(--site-radius-md)',
          border: '1px solid var(--site-border)',
          background: readonly ? 'var(--site-surface-warm)' : '#fff',
          color: readonly ? 'var(--site-text-secondary)' : 'var(--site-text-primary)',
          fontSize: '0.9rem',
          outline: 'none',
          pointerEvents: readonly ? 'none' : 'auto'
        }}
      />
    </div>
  );
}

function DocumentSection({ number, title, items, data, handleUpdate }: { 
  number: string, title: string, items: { id: string, title: string }[], 
  data: Record<string, any>, handleUpdate: (id: string, field: string, val: string) => void 
}) {
  return (
    <section style={{ marginBottom: 40, border: '1px solid var(--site-border)', borderRadius: 'var(--site-radius-xl)', overflow: 'hidden', background: '#fff' }}>
      <header style={{ background: 'var(--site-primary)', padding: '16px 24px', borderBottom: '1px solid var(--site-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--site-gold)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 800 }}>
          {number}
        </div>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#fff' }}>{title}</h2>
      </header>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item, index) => {
          const itemData = data[item.id] || {};
          const status = itemData.status || 'pendente';
          const isLast = index === items.length - 1;
          
          return (
            <div key={item.id} style={{ padding: '24px', borderBottom: isLast ? 'none' : '1px solid var(--site-border)', position: 'relative' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                
                {/* ID Prefix */}
                <div style={{ background: 'rgba(0,0,0,0.04)', padding: '4px 8px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 700, color: 'var(--site-text-secondary)', minWidth: 46, textAlign: 'center', marginTop: 2 }}>
                  {item.id}
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--site-text-primary)', maxWidth: '70%' }}>
                      {item.title}
                    </h3>
                    
                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <select 
                        value={status}
                        onChange={(e) => handleUpdate(item.id, 'status', e.target.value)}
                        style={{
                          appearance: 'none',
                          padding: '6px 12px 6px 30px',
                          borderRadius: 'var(--site-radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          border: 'none',
                          cursor: 'pointer',
                          outline: 'none',
                          backgroundColor: status === 'conforme' ? 'rgba(22,163,74,0.1)' : (status === 'pendente' ? 'rgba(0,0,0,0.05)' : 'rgba(217,119,6,0.1)'),
                          color: status === 'conforme' ? '#16a34a' : (status === 'pendente' ? 'var(--site-text-secondary)' : '#d97706'),
                          backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${status === 'conforme' ? '%2316a34a' : (status === 'pendente' ? '%23666' : '%23d97706')}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 10px center',
                          paddingRight: 28
                        }}
                      >
                        <option value="pendente">Pendente</option>
                        <option value="em_analise">Em Análise</option>
                        <option value="conforme">Conforme (Válido/Vigente)</option>
                        <option value="irregular">Irregular / Vencido</option>
                        <option value="nao_se_aplica">Não se Aplica</option>
                      </select>
                      
                      {status === 'conforme' && <div style={{position:'absolute', right: 236, top: 22}}><CheckCircle2 size={14} color="#16a34a"/></div>}
                      {status === 'pendente' && <div style={{position:'absolute', right: 114, top: 26}}><AlertCircle size={14} color="var(--site-text-secondary)"/></div>}
                      {status === 'em_analise' && <div style={{position:'absolute', right: 120, top: 26}}><Clock size={14} color="#d97706"/></div>}
                      {status === 'irregular' && <div style={{position:'absolute', right: 154, top: 26}}><AlertCircle size={14} color="#dc2626"/></div>}
                    </div>
                  </div>

                  {/* Form Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Código de Controle</label>
                      <input type="text" placeholder="Ex: DOC-2026-001" value={itemData.codigo || ''} onChange={(e) => handleUpdate(item.id, 'codigo', e.target.value)} style={inputStyle} />
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Data de Emissão</label>
                      <input type="date" value={itemData.data_emissao || ''} onChange={(e) => handleUpdate(item.id, 'data_emissao', e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Data de Validade <span style={{ fontWeight: 500 }}>(se houver)</span></label>
                      <input type="date" value={itemData.data_validade || ''} onChange={(e) => handleUpdate(item.id, 'data_validade', e.target.value)} style={inputStyle} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Upload do Documento</label>
                      <label style={{ 
                        border: '1px dashed var(--site-border)', 
                        padding: '10px', 
                        borderRadius: 'var(--site-radius-md)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 8, 
                        cursor: 'pointer',
                        background: 'var(--site-surface-warm)',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        color: 'var(--site-primary)',
                        transition: 'all 0.2s'
                      }}>
                        <UploadCloud size={16} /> 
                        {itemData.file ? 'Documento Anexado' : 'Selecionar Arquivo'}
                        <input type="file" style={{ display: 'none' }} onChange={(e) => handleUpdate(item.id, 'file', e.target.files?.[0]?.name || '')} />
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, gridColumn: '1 / -1' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--site-text-secondary)' }}>Análise da Situação Atual</label>
                      <textarea 
                        placeholder="Descreva observações sobre o documento..." 
                        value={itemData.analise || ''} 
                        onChange={(e) => handleUpdate(item.id, 'analise', e.target.value)} 
                        rows={2} 
                        style={{...inputStyle, resize: 'vertical'}}
                      />
                    </div>

                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const inputStyle = {
  padding: '8px 12px',
  borderRadius: 'var(--site-radius-md)',
  border: '1px solid var(--site-border)',
  fontSize: '0.85rem',
  color: 'var(--site-text-primary)',
  outline: 'none',
  fontFamily: 'var(--font-sans)',
  width: '100%'
};
