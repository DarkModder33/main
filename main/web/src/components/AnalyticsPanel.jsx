import React, { useEffect, useState } from "react";

export function AnalyticsPanel() {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analytics?metric=signals");
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const data = await res.json();
        setMetrics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) return <div>Loading analytics...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ margin: 24 }}>
      <h2>Signal Performance Analytics</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Signal Type</th>
            <th>Total Signals</th>
            <th>Avg Confidence</th>
            <th>Avg Quality</th>
            <th>Validation Pass Rate</th>
            <th>Avg Latency (ms)</th>
          </tr>
        </thead>
        <tbody>
          {metrics.map((row, idx) => (
            <tr key={idx}>
              <td>{row.signal_type}</td>
              <td>{row.total_signals}</td>
              <td>{row.avg_confidence}</td>
              <td>{row.avg_quality}</td>
              <td>{row.validation_pass_rate}%</td>
              <td>{row.avg_latency_ms}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

