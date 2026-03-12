import React, { useEffect, useState } from "react";

export function WatchlistPanel() {
  const [items, setItems] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [symbol, setSymbol] = useState("");

  // Filtering controls
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterDelivered, setFilterDelivered] = useState("");
  const [filterSymbol, setFilterSymbol] = useState("");

  useEffect(() => {
    async function fetchWatchlist() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/watchlist");
        if (!res.ok) throw new Error("Failed to fetch watchlist");
        const data = await res.json();
        setItems(data.items || []);
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlist();
  }, []);

  async function handleAddSymbol() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/watchlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (!res.ok) throw new Error("Failed to add symbol");
      await res.json();
      setSymbol("");
      // Refresh watchlist
      const updated = await fetch("/api/watchlist");
      const data = await updated.json();
      setItems(data.items || []);
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveSymbol(sym) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/watchlist?symbol=${encodeURIComponent(sym)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove symbol");
      await res.json();
      // Refresh watchlist
      const updated = await fetch("/api/watchlist");
      const data = await updated.json();
      setItems(data.items || []);
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    setLoading(true);
    setError(null);
    try {
      const params = [];
      if (filterSeverity) params.push(`severity=${encodeURIComponent(filterSeverity)}`);
      if (filterDelivered) params.push(`delivered=${encodeURIComponent(filterDelivered)}`);
      if (filterSymbol) params.push(`symbol=${encodeURIComponent(filterSymbol)}`);
      const query = params.length ? `?${params.join("&")}` : "";
      const res = await fetch(`/api/watchlist${query}`);
      if (!res.ok) throw new Error("Failed to filter alerts");
      const data = await res.json();
      setAlerts(data.alerts || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkDelivered(summary) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/watchlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, delivered: true }),
      });
      if (!res.ok) throw new Error("Failed to mark delivered");
      await res.json();
      // Refresh alerts
      await handleFilter();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSnooze(summary) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/watchlist`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary, snoozed: true }),
      });
      if (!res.ok) throw new Error("Failed to snooze alert");
      await res.json();
      // Refresh alerts
      await handleFilter();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading watchlist...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ margin: 24 }}>
      <h2>Watchlist Management</h2>
      <div>
        <input
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="Add symbol"
        />
        <button onClick={handleAddSymbol}>Add</button>
      </div>
      <ul>
        {items.map((item, idx) => (
          <li key={idx}>
            {item.symbol}
            <button onClick={() => handleRemoveSymbol(item.symbol)}>Remove</button>
          </li>
        ))}
      </ul>
      <h3>Alerts</h3>
      <div style={{ marginBottom: 12 }}>
        <input
          value={filterSymbol}
          onChange={e => setFilterSymbol(e.target.value)}
          placeholder="Filter by symbol"
        />
        <select value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          <option value="watch">Watch</option>
          <option value="urgent">Urgent</option>
        </select>
        <select value={filterDelivered} onChange={e => setFilterDelivered(e.target.value)}>
          <option value="">All Status</option>
          <option value="true">Delivered</option>
          <option value="false">Pending</option>
        </select>
        <button onClick={handleFilter}>Apply Filter</button>
      </div>
      <ul>
        {alerts.map((alert, idx) => (
          <li key={idx}>
            {alert.summary} ({alert.severity})
            {alert.delivered ? " - Delivered" : " - Pending"}
            {alert.snoozed ? " - Snoozed" : ""}
            <span style={{ fontSize: 10, color: '#888' }}> {alert.timestamp}</span>
            {!alert.delivered && (
              <button onClick={() => handleMarkDelivered(alert.summary)}>Mark Delivered</button>
            )}
            {!alert.snoozed && (
              <button onClick={() => handleSnooze(alert.summary)}>Snooze</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
