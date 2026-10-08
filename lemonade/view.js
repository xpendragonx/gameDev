// Shared ASCII screen for the terminal demo and the browser page.
(function () {
  const bar = (v, max, w = 20) => '#'.repeat(Math.round(Math.min(v / max, 1) * w)).padEnd(w, '.');
  const usd = (n) => '$' + n.toFixed(2);
  const num = (n) => Math.floor(n).toLocaleString('en-US');

  function render(s, m) {
    const f = m.forecast(s.price, { mktLvl: s.mktLvl });
    const rate = m.autoRate(s);
    const trendTag = { cheap: '<< CHEAP, stock up!', pricey: '>> PRICEY, wait', normal: '' }[m.lemonTrend(s)];
    const bCost = m.boostCost(s);
    const mega = s.squeezers < m.MEGA_UNLOCK_SQUEEZERS ? `unlocks at ${m.MEGA_UNLOCK_SQUEEZERS} squeezers`
      : s.megaUnlocked ? `buy ${usd(m.megaCost(s.megas))} (own ${s.megas})` : `unlock ${usd(m.MEGA_UNLOCK_COST)}`;
    return [
      '   ___  LEMONADE STAND',
      '  (o o) cash ' + usd(s.cash) + '   cups sold ' + num(s.sold),
      '',
      ` lemons ${num(s.lemons).padStart(8)}   crate (${num(m.LEMON_SUPPLY)}) $${s.lemonPrice} ${trendTag}`,
      ` cups   ${num(s.stock).padStart(8)}   making ${rate.toFixed(2)}/s  (${s.squeezers} squeezers x${s.boost.toFixed(2)})`,
      '',
      ` sell price ${usd(s.price)}   demand ${bar(f.demand, 10)} ${f.demand.toFixed(2)}`,
      ` expected sales ${f.salesPerSec.toFixed(2)}/s  revenue ${usd(f.revenuePerSec)}/s`,
      ` sells-out price ~${usd(m.clearingPrice(rate || 0.5, { mktLvl: s.mktLvl }))}`,
      ` marketing lvl ${s.mktLvl}`,
      '',
      ` [s] squeeze lemon      [b] buy crate of lemons $${s.lemonPrice}`,
      ` [a] auto squeezer ${usd(m.squeezerCost(s.squeezers))}`,
      ` [u] improve squeezers ${bCost === null ? (s.squeezers < 1 ? '(buy one first)' : 'MAX') : usd(bCost)}   (lvl ${s.boostLvl}/${m.BOOSTS.length})`,
      ` [g] mega squeezer ${mega}`,
      ` [+]/[-] sell price     [m] marketing ${usd(s.adCost)}`,
      '',
      m.isStuck(s) ? ' !! Out of everything. Press [r] to beg for a free crate of lemons' :
      s.lemons < 1 && rate > 0 ? ' !! Out of lemons: squeezers idle' :
      s.stock < 1 ? ' !! No cups to sell: squeeze, or raise the price' : '',
    ].join('\n');
  }
  if (typeof module !== 'undefined') module.exports = { render };
  else window.LemonadeView = { render };
})();
