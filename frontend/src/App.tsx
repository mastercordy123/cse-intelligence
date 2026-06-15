import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Clock, Activity, Minus, Zap, AlertCircle } from 'lucide-react';
import './App.css';

interface SectorData {
  name: string;
  code: string;
  peRatio: number;
  prevPeRatio: number | null;
  pbvRatio: number;
  prevPbvRatio: number | null;
  lastUpdated: string;
}

interface MarketStatus {
  isOpen: boolean;
  message: string;
  reason: 'CLOSED' | 'OPEN' | 'WEEKEND' | 'HOLIDAY';
}

function App() {
  const [sectors, setSectors] = useState<SectorData[]>([]);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const processData = (data: { sectors: SectorData[], marketStatus: MarketStatus }) => {
    if (data.sectors && data.sectors.length > 0) {
      const sortedData = [...data.sectors].sort((a, b) => a.name.localeCompare(b.name));
      setSectors(sortedData);
    }
    setMarketStatus(data.marketStatus);
    setLastRefresh(new Date());
  };

  const fetchSectors = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sectors');
      const data = await response.json();
      processData(data);
    } catch (error) {
      console.error('Failed to fetch sectors:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerScrape = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/scrape', { method: 'POST' });
      const data = await response.json();
      processData(data);
    } catch (error) {
      console.error('Manual scrape failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    const interval = setInterval(fetchSectors, 30000);
    return () => clearInterval(interval);
  }, []);

  const getMetricTrend = (current: number, previous: number | null) => {
    if (previous === null || current === previous) {
      return { className: 'trend-neutral', icon: <Minus size={14} />, label: 'Steady', color: 'inherit' };
    }
    if (current > previous) {
      return { className: 'trend-up', icon: <TrendingUp size={14} />, label: 'Rising', color: 'var(--accent-success)' };
    }
    return { className: 'trend-down', icon: <TrendingDown size={14} />, label: 'Falling', color: 'var(--accent-danger)' };
  };

  return (
    <div className="container">
      {marketStatus && !marketStatus.isOpen && (
        <div className="market-alert-banner">
          <AlertCircle size={18} />
          <span>{marketStatus.message}. Data may not reflect real-time changes until market reopens.</span>
        </div>
      )}

      <header>
        <div className="brand-section">
          <h1>CSE Intelligence</h1>
          <div className="subtitle">
            <span className={`live-indicator ${marketStatus?.isOpen ? '' : 'indicator-off'}`}>
              <div className="pulse-dot"></div>
              {marketStatus?.isOpen ? 'Live Terminal' : 'Terminal Idle'}
            </span>
            <span>Real-time Industry Valuations</span>
          </div>
        </div>
        <button onClick={triggerScrape} disabled={loading} className="btn-refresh">
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Executing Scrape...' : 'Refresh Terminal'}
        </button>
      </header>

      <main>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Market Sectors</span>
              <div className="stat-icon-wrapper"><Activity size={18} /></div>
            </div>
            <span className="stat-value">{sectors.length}</span>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Last Transmission</span>
              <div className="stat-icon-wrapper"><Clock size={18} /></div>
            </div>
            <span className="stat-value">{lastRefresh.toLocaleTimeString([], { hour12: false })}</span>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span className="stat-label">Market Status</span>
              <div className="stat-icon-wrapper">
                <Zap size={18} style={{ color: marketStatus?.isOpen ? 'var(--accent-success)' : 'var(--accent-danger)' }} />
              </div>
            </div>
            <span className="stat-value" style={{ 
              color: marketStatus?.isOpen ? 'var(--accent-success)' : 'var(--accent-danger)', 
              fontSize: '1.25rem' 
            }}>
              {marketStatus?.reason === 'OPEN' ? 'OPERATIONAL' : marketStatus?.reason || 'OFFLINE'}
            </span>
          </div>
        </div>

        <div className="table-wrapper">
          {sectors.length === 0 && !loading ? (
            <div className="empty-state">System Idle. Awaiting initial scrape...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Industry Group</th>
                  <th className="text-right">Prev P/E</th>
                  <th className="text-right">Cur P/E</th>
                  <th className="text-right">Prev P/BV</th>
                  <th className="text-right">Cur P/BV</th>
                  <th className="text-center">Trends (P/E | P/BV)</th>
                </tr>
              </thead>
              <tbody>
                {sectors.map((sector) => {
                  const peTrend = getMetricTrend(sector.peRatio, sector.prevPeRatio);
                  const pbvTrend = getMetricTrend(sector.pbvRatio, sector.prevPbvRatio);
                  
                  return (
                    <tr key={sector.code}>
                      <td>
                        <div className="sector-name">{sector.name}</div>
                      </td>
                      <td className="text-right">
                        <span className="prev-pe">
                          {sector.prevPeRatio !== null ? sector.prevPeRatio.toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="pe-value" style={{ color: peTrend.color }}>
                          {sector.peRatio.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="prev-pe">
                          {sector.prevPbvRatio !== null ? sector.prevPbvRatio.toFixed(2) : '0.00'}
                        </span>
                      </td>
                      <td className="text-right">
                        <span className="pe-value" style={{ color: pbvTrend.color }}>
                          {sector.pbvRatio.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <div className="text-center" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <span className={`trend-badge ${peTrend.className}`} title="P/E Trend">
                            {peTrend.icon}
                          </span>
                          <span className={`trend-badge ${pbvTrend.className}`} title="P/BV Trend">
                            {pbvTrend.icon}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
