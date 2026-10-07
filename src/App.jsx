import { useMemo, useState } from 'react';
import { calcular } from './calc.js';

const BENEFICIOS_SUGERIDOS = [
  'Vale refeição',
  'Vale alimentação',
  'Vale transporte',
  'Plano de saúde',
  'Plano odontológico',
  'Auxílio creche',
  'Seguro de vida',
  'Auxílio home office',
  'Gympass / academia',
];

const brl = (v) =>
  (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (v, d = 1) =>
  (Number.isFinite(v) ? v : 0).toLocaleString('pt-BR', { maximumFractionDigits: d, minimumFractionDigits: 0 });

let nextId = 1;

export default function App() {
  const [salario, setSalario] = useState('');
  const [horasMes, setHorasMes] = useState('220');
  const [beneficios, setBeneficios] = useState([]);
  const [incluir13, setIncluir13] = useState(true);
  const [incluirFerias, setIncluirFerias] = useState(true);
  const [incluirFgts, setIncluirFgts] = useState(true);
  const [feriasComoPJ, setFeriasComoPJ] = useState(true);
  const [impostoPJ, setImpostoPJ] = useState('0');
  const [valorHoraOfertado, setValorHoraOfertado] = useState('');

  const r = useMemo(
    () =>
      calcular({
        salario,
        horasMes,
        beneficios,
        incluir13,
        incluirFerias,
        incluirFgts,
        feriasComoPJ,
        impostoPJ,
        valorHoraOfertado,
      }),
    [salario, horasMes, beneficios, incluir13, incluirFerias, incluirFgts, feriasComoPJ, impostoPJ, valorHoraOfertado]
  );

  const adicionar = (nome = '') =>
    setBeneficios((bs) => [...bs, { id: nextId++, nome, valor: '' }]);
  const atualizar = (id, campo, valor) =>
    setBeneficios((bs) => bs.map((b) => (b.id === id ? { ...b, [campo]: valor } : b)));
  const remover = (id) => setBeneficios((bs) => bs.filter((b) => b.id !== id));

  const usados = new Set(beneficios.map((b) => b.nome));
  const sugestoes = BENEFICIOS_SUGERIDOS.filter((n) => !usados.has(n));
  const preenchido = Number(salario) > 0 && Number(horasMes) > 0;

  return (
    <div className="page">
      <header className="hero">
        <h1>Quanto eu ganharia sem a CLT?</h1>
        <p>
          Some salário, 13º, férias, FGTS e benefícios e descubra quanto você precisaria cobrar por hora
          para ganhar o mesmo trabalhando por conta própria.
        </p>
      </header>

      <main className="grid">
        <section className="card">
          <h2>Seu contrato CLT</h2>

          <label className="field">
            <span>Salário bruto mensal</span>
            <div className="input-prefix">
              <em>R$</em>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Ex.: 5000"
                value={salario}
                onChange={(e) => setSalario(e.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Carga horária mensal (horas)</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              value={horasMes}
              onChange={(e) => setHorasMes(e.target.value)}
            />
            <div className="chips">
              {[
                ['220', '44h/sem'],
                ['200', '40h/sem'],
                ['180', '36h/sem'],
                ['150', '30h/sem'],
              ].map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  className={'chip' + (horasMes === v ? ' active' : '')}
                  onClick={() => setHorasMes(v)}
                >
                  {v}h · {l}
                </button>
              ))}
            </div>
          </label>

          <h3>Benefícios <small>(opcionais, valor mensal)</small></h3>
          {beneficios.length === 0 && <p className="muted">Nenhum benefício adicionado.</p>}
          <ul className="beneficios">
            {beneficios.map((b) => (
              <li key={b.id}>
                <input
                  className="nome"
                  placeholder="Nome do benefício"
                  value={b.nome}
                  onChange={(e) => atualizar(b.id, 'nome', e.target.value)}
                />
                <div className="input-prefix">
                  <em>R$</em>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                    value={b.valor}
                    onChange={(e) => atualizar(b.id, 'valor', e.target.value)}
                  />
                </div>
                <button type="button" className="remove" onClick={() => remover(b.id)} aria-label="Remover">
                  ×
                </button>
              </li>
            ))}
          </ul>
          <div className="chips">
            {sugestoes.map((n) => (
              <button key={n} type="button" className="chip add" onClick={() => adicionar(n)}>
                + {n}
              </button>
            ))}
            <button type="button" className="chip add" onClick={() => adicionar()}>
              + Outro
            </button>
          </div>
          <p className="hint">
            Plano de saúde: informe quanto a empresa paga (o valor de mercado do plano), não sua coparticipação.
          </p>

          <h3>Direitos considerados</h3>
          <Toggle checked={incluir13} onChange={setIncluir13} label="13º salário" />
          <Toggle checked={incluirFerias} onChange={setIncluirFerias} label="Férias remuneradas + 1/3" />
          <Toggle checked={incluirFgts} onChange={setIncluirFgts} label="FGTS (8%)" />

          <details className="advanced">
            <summary>Ajustes do cenário sem CLT</summary>
            <Toggle
              checked={feriasComoPJ}
              onChange={setFeriasComoPJ}
              label="Quero tirar 30 dias de férias por ano (não remuneradas)"
            />
            <label className="field">
              <span>Impostos e custos como PJ/autônomo (%)</span>
              <input
                type="number"
                min="0"
                max="99"
                step="0.5"
                value={impostoPJ}
                onChange={(e) => setImpostoPJ(e.target.value)}
              />
              <small className="hint">
                Ex.: Simples Nacional, contador, INSS próprio. Deixe 0 para comparar bruto com bruto.
              </small>
            </label>
            <label className="field">
              <span>Valor/hora que te ofereceram (opcional)</span>
              <div className="input-prefix">
                <em>R$</em>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder={r.valorHoraIngenuo ? num(r.valorHoraIngenuo, 2) : '0,00'}
                  value={valorHoraOfertado}
                  onChange={(e) => setValorHoraOfertado(e.target.value)}
                />
              </div>
              <small className="hint">Se vazio, usamos salário ÷ horas (o cálculo "ingênuo").</small>
            </label>
          </details>
        </section>

        <section className="card results">
          {!preenchido ? (
            <div className="empty">
              <p>Preencha o salário e a carga horária para ver o resultado.</p>
            </div>
          ) : (
            <>
              <div className="highlight">
                <span>Você precisaria cobrar</span>
                <strong>{brl(r.valorHoraNecessario)}<small>/hora</small></strong>
                <span>
                  trabalhando {num(Number(horasMes), 0)}h/mês por {r.mesesTrabalhadosPJ} meses no ano, faturando{' '}
                  {brl(r.faturamentoMensalPJ)} por mês.
                </span>
              </div>

              <div className="stats">
                <Stat label="Seu ganho real por mês na CLT" value={brl(r.totalMes)} sub={`${brl(r.totalAno)} por ano`} />
                <Stat
                  label="Salário ÷ horas"
                  value={`${brl(r.valorHoraIngenuo)}/h`}
                  sub={`o valor/hora real é ${num(r.percentualAMais * 100, 0)}% maior`}
                />
              </div>

              <div className="extra">
                <h3>
                  E se você cobrar {brl(r.valorHoraUsado)}/h
                  {r.usandoOfertado ? ' (valor ofertado)' : ' (salário ÷ horas)'}?
                </h3>
                {r.horasExtrasMes > 0.05 ? (
                  <p>
                    Precisaria trabalhar <b>{num(r.horasNecessariasMes)}h por mês</b> — ou seja,{' '}
                    <b className="warn">+{num(r.horasExtrasMes)}h a mais</b> (cerca de{' '}
                    {num(r.horasExtrasMes / 4.33)}h extras por semana) para ganhar o mesmo.
                  </p>
                ) : (
                  <p className="ok">
                    Esse valor já cobre tudo: você precisaria de apenas {num(r.horasNecessariasMes)}h por mês.
                  </p>
                )}
              </div>

              <h3>Composição do que você recebe por ano</h3>
              <table className="breakdown">
                <tbody>
                  <Row label="12 salários" value={r.composicao.salariosAno} total={r.totalAno} />
                  {incluir13 && <Row label="13º salário" value={r.composicao.decimoTerceiro} total={r.totalAno} />}
                  {incluirFerias && <Row label="1/3 de férias" value={r.composicao.tercoFerias} total={r.totalAno} />}
                  {incluirFgts && <Row label="FGTS" value={r.composicao.fgts} total={r.totalAno} />}
                  {beneficios
                    .filter((b) => Number(b.valor) > 0)
                    .map((b) => (
                      <Row key={b.id} label={b.nome || 'Benefício'} value={12 * Number(b.valor)} total={r.totalAno} />
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{brl(r.totalAno)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>

              <p className="hint">
                Valores brutos. Não consideramos INSS/IR do CLT, multa de 40% do FGTS, aviso prévio, seguro-desemprego
                nem feriados. Na CLT seu valor/hora efetivo é {brl(r.valorHoraCLT)}, já que as férias são pagas.
              </p>
            </>
          )}
        </section>
      </main>

      <footer>
        <p>Simulação educativa — não substitui a orientação de um contador.</p>
        <p>Ajude a manter o site de pé. Pix: 1afb988e-db09-46af-a550-f14ff8eff962</p>
      </footer>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  );
}

function Row({ label, value, total }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <tr>
      <td>{label}</td>
      <td>{brl(value)}</td>
      <td className="bar-cell">
        <div className="bar" style={{ width: `${pct}%` }} />
      </td>
    </tr>
  );
}
