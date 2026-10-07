import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcular } from './calc.js';

const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} ≠ ${b}`);

test('salário sem benefícios, todos os direitos', () => {
  const r = calcular({ salario: 3000, horasMes: 220 });
  // 36000 + 3000 + 1000 = 40000; FGTS 3200 → 43200
  close(r.totalAno, 43200);
  close(r.totalMes, 3600);
  // PJ trabalhando 11 meses × 220h = 2420h
  close(r.valorHoraNecessario, 43200 / 2420);
  close(r.valorHoraIngenuo, 3000 / 220);
  // faturamento mensal 43200/11 ÷ (3000/220)
  close(r.horasNecessariasMes, (43200 / 11) / (3000 / 220));
});

test('benefícios e imposto PJ', () => {
  const r = calcular({
    salario: 5000,
    horasMes: 160,
    beneficios: [{ valor: 800 }, { valor: 400 }],
    impostoPJ: 10,
    feriasComoPJ: false,
  });
  const totalAno = 60000 + 5000 + 5000 / 3 + 0.08 * (65000 + 5000 / 3) + 14400;
  close(r.totalAno, totalAno);
  close(r.valorHoraNecessario, totalAno / 0.9 / (160 * 12));
});

test('valor/hora ofertado e entradas vazias', () => {
  const r = calcular({ salario: 3000, horasMes: 220, valorHoraOfertado: 30 });
  close(r.horasNecessariasMes, 43200 / 11 / 30);
  const z = calcular({ salario: '', horasMes: '' });
  assert.equal(z.valorHoraNecessario, 0);
  assert.equal(z.horasExtrasMes, 0);
});
