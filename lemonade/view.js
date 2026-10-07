// Shared ASCII screen for the terminal demo and the browser page.
(function () {
  const bar = (v, max, w = 20) => '#'.repeat(Math.round(Math.min(v / max, 1) * w)).padEnd(w, '.');
  const usd = (n) => '$' + n.toFixed(2);

  function render(s, m) {
    const f = m.forecast(s.price, { mktLvl: s.mktLvl });
    const rate = m.autoRate(s);
    const aCost = m.autoCost(s);
    const trend = m.lemonTrend(s);
    const trendTag = { cheap: '<< CHEAP, stock up!', pricey: '>> PRICEY, wait', normal: '' }[trend];
    const autoLine = s.autoLvl === 0 ? 'not owned'
      : `lvl ${s.autoLvl}/${m.AUTO_MAX}  ${rate.toFixed(1)} cups/s`;
    const autoBuy = aCost === null ? 'MAX' : `${s.autoLvl === 0 ? 'buy' : 'upgrade'} ${usd(aCost)}`;
    return [
      '   ___  LEMONADE STAND',
      '  (o o) cash ' + usd(s.cash) + '   sold ' + s.sold,
      '',
      ` lemons  ${bar(s.lemons, m.MAX_LEMONS)} ${s.lemons}   price ${usd(s.lemonPrice)} ${trendTag}`,
      ` cups    ${bar(s.stock, s.maxStock)} ${s.stock}/${s.maxStock}`,
      ` auto squeezer  ${autoLine}`,
      '',
      ` sell price ${usd(s.price)}   demand ${bar(f.demand, 10)} ${f.demand.toFixed(2)}`,
      ` expected sales ${f.salesPerSec.toFixed(2)}/s  revenue ${usd(f.revenuePerSec)}/s`,
      ` sells-out price ~${usd(m.clearingPrice(rate || 0.5, { mktLvl: s.mktLvl }))}`,
      ` marketing lvl ${s.mktLvl}`,
      '',
      ` [s] squeeze lemon    [b] buy ${m.LEMON_BATCH} lemons (${usd(m.LEMON_BATCH * s.lemonPrice)})`,
      ` [a] auto squeezer: ${autoBuy}`,
      ` [+]/[-] sell price   [m] marketing ${usd(m.marketingCost(s.mktLvl))}`,
      '',
      s.lemons === 0 && rate > 0 ? ' !! Out of lemons: auto squeezer idle' :
      s.stock >= s.maxStock ? ' !! Cups piling up: price too high' :
      s.stock === 0 ? ' !! Sold out: squeeze more or raise the price' : '',
    ].join('\n');
  }
  if (typeof module !== 'undefined') module.exports = { render };
  else window.LemonadeView = { render };
})();
