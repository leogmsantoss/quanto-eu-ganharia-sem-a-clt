// Cálculo do pacote anual CLT e do equivalente em trabalho por hora.
// Comparação feita em valores brutos (antes de INSS/IR do CLT).

export const FGTS_RATE = 0.08;

export function calcular({
  salario,
  horasMes,
  beneficios = [],
  incluir13 = true,
  incluirFerias = true,
  incluirFgts = true,
  feriasComoPJ = true,
  impostoPJ = 0, // percentual (0–99) de impostos/custos como PJ/autônomo
  valorHoraOfertado = 0, // opcional; se 0, usa salário ÷ horas
}) {
  const s = Math.max(0, Number(salario) || 0);
  const h = Math.max(0, Number(horasMes) || 0);

  const salariosAno = 12 * s;
  const decimoTerceiro = incluir13 ? s : 0;
  const tercoFerias = incluirFerias ? s / 3 : 0;
  const fgts = incluirFgts ? FGTS_RATE * (salariosAno + decimoTerceiro + tercoFerias) : 0;
  const beneficiosMes = beneficios.reduce((acc, b) => acc + Math.max(0, Number(b.valor) || 0), 0);
  const beneficiosAno = 12 * beneficiosMes;

  const totalAno = salariosAno + decimoTerceiro + tercoFerias + fgts + beneficiosAno;
  const totalMes = totalAno / 12;

  // Na CLT, as férias são remuneradas: você recebe 12 meses trabalhando 11.
  const mesesTrabalhadosCLT = incluirFerias ? 11 : 12;
  const horasAnoCLT = h * mesesTrabalhadosCLT;
  const valorHoraCLT = horasAnoCLT > 0 ? totalAno / horasAnoCLT : 0;

  // Como PJ, se quiser tirar 30 dias de folga, esse mês não é pago.
  const mesesTrabalhadosPJ = feriasComoPJ ? 11 : 12;
  const taxa = Math.min(Math.max(Number(impostoPJ) || 0, 0), 99) / 100;
  const brutoNecessarioAno = totalAno / (1 - taxa);
  const horasAnoPJ = h * mesesTrabalhadosPJ;
  const valorHoraNecessario = horasAnoPJ > 0 ? brutoNecessarioAno / horasAnoPJ : 0;
  const faturamentoMensalPJ = brutoNecessarioAno / mesesTrabalhadosPJ;

  // Quantas horas a mais seriam necessárias cobrando um valor/hora "ingênuo".
  const valorHoraIngenuo = h > 0 ? s / h : 0;
  const ofertado = Number(valorHoraOfertado) > 0 ? Number(valorHoraOfertado) : valorHoraIngenuo;
  const horasNecessariasMes = ofertado > 0 ? faturamentoMensalPJ / ofertado : 0;
  const horasExtrasMes = Math.max(0, horasNecessariasMes - h);

  return {
    composicao: {
      salariosAno,
      decimoTerceiro,
      tercoFerias,
      fgts,
      beneficiosAno,
    },
    beneficiosMes,
    totalAno,
    totalMes,
    valorHoraCLT,
    valorHoraIngenuo,
    valorHoraNecessario,
    faturamentoMensalPJ,
    mesesTrabalhadosPJ,
    valorHoraUsado: ofertado,
    usandoOfertado: Number(valorHoraOfertado) > 0,
    horasNecessariasMes,
    horasExtrasMes,
    percentualAMais: valorHoraIngenuo > 0 ? valorHoraNecessario / valorHoraIngenuo - 1 : 0,
  };
}
