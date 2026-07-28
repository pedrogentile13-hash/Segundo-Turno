import { ATTRIBUTE_BY_ID } from '../data/attributes.js';

/** Cor do valor: rejeição usa a escala invertida (alto = ruim). */
function corDoValor(attrId, valor) {
  const invertido = ATTRIBUTE_BY_ID[attrId]?.inverted;
  const efetivo = invertido ? 99 - valor : valor;
  if (efetivo >= 82) return 'text-brass-300';
  if (efetivo >= 65) return 'text-calm';
  if (efetivo >= 45) return 'text-graphite-200';
  return 'text-alarm';
}

/**
 * Card de um atributo no draft.
 *
 * @param {string}  attrId
 * @param {number}  valor
 * @param {boolean} oculto      modo Pro: mostra "??" no lugar do valor
 * @param {boolean} travado     já foi herdado numa rodada anterior
 * @param {boolean} destaque    é um dos pontos fortes do arquétipo
 */
export default function AttributeCard({ attrId, valor, oculto = false, travado = false, destaque = false, onClick }) {
  const attr = ATTRIBUTE_BY_ID[attrId];
  if (!attr) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={travado}
      className={[
        'panel group relative flex w-full flex-col gap-1 p-4 text-left',
        travado
          ? 'cursor-not-allowed border-graphite-800 bg-graphite-900/30 opacity-40'
          : 'panel-hover cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/40',
        destaque && !travado && !oculto ? 'border-brass-600/50' : '',
      ].join(' ')}
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-graphite-100">{attr.nome}</span>
        <span className={`font-display text-2xl tabular-nums ${oculto ? 'text-graphite-500' : corDoValor(attrId, valor)}`}>
          {oculto ? '??' : valor}
        </span>
      </div>

      <p className="text-xs leading-snug text-graphite-400">{attr.descricao}</p>

      {attr.inverted && (
        <span className="label-caps mt-1 text-alarm/80">quanto menor, melhor</span>
      )}

      {travado && (
        <span className="label-caps absolute right-3 top-3 text-graphite-500">travado</span>
      )}
    </button>
  );
}
