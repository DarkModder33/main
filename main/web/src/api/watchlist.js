let watchlist = [];
let alerts = [];

export async function GET(req) {
  // Support filtering by severity, symbol, delivery status
  const url = new URL(req.url);
  const severity = url.searchParams.get('severity');
  const symbol = url.searchParams.get('symbol');
  const delivered = url.searchParams.get('delivered');

  let filteredAlerts = alerts;
  if (severity) filteredAlerts = filteredAlerts.filter(a => a.severity === severity);
  if (symbol) filteredAlerts = filteredAlerts.filter(a => a.summary.includes(symbol));
  if (delivered) filteredAlerts = filteredAlerts.filter(a => String(a.delivered) === delivered);

  return Response.json({ items: watchlist, alerts: filteredAlerts });
}

export async function POST(req) {
  const { symbol } = await req.json();
  if (symbol && !watchlist.some(item => item.symbol === symbol)) {
    watchlist.push({ symbol });
    // Simulate alert creation
    alerts.push({ summary: `Alert for ${symbol}`, severity: 'watch', delivered: false, snoozed: false, timestamp: new Date().toISOString() });
  }
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const symbol = url.searchParams.get('symbol');
  watchlist = watchlist.filter(item => item.symbol !== symbol);
  alerts = alerts.filter(alert => !alert.summary.includes(symbol));
  return Response.json({ ok: true });
}

export async function PATCH(req) {
  // Mark alert as delivered or snoozed
  const { summary, delivered, snoozed } = await req.json();
  alerts = alerts.map(alert =>
    alert.summary === summary
      ? { ...alert, delivered: delivered ?? alert.delivered, snoozed: snoozed ?? alert.snoozed }
      : alert
  );
  return Response.json({ ok: true });
}
