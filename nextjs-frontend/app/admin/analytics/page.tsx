'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';

interface RevenueData {
  [date: string]: number;
}

interface AnalyticsData {
  revenue_by_date: RevenueData;
  total_revenue: number;
  average_daily_revenue: number;
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchAnalytics(days);
  }, [days]);

  const fetchAnalytics = async (dayCount: number) => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/admin/analytics/revenue?days=${dayCount}`);
      console.log('[Analytics] Data fetched:', response.data);
      
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error('[Analytics] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading analytics...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>📈 Analytics</h1>
      </div>

      <div className="section-card">
        <div className="filter-header">
          <h3>Revenue Analytics</h3>
          <div className="filter-buttons">
            <button
              onClick={() => setDays(7)}
              className={`btn-filter ${days === 7 ? 'active' : ''}`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDays(30)}
              className={`btn-filter ${days === 30 ? 'active' : ''}`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDays(90)}
              className={`btn-filter ${days === 90 ? 'active' : ''}`}
            >
              Last 90 Days
            </button>
          </div>
        </div>

        {data && (
          <>
            <div className="analytics-summary">
              <div className="summary-card">
                <div className="summary-label">Total Revenue ({days} days)</div>
                <div className="summary-value">
                  {formatCurrency(data.total_revenue)}
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Average Daily Revenue</div>
                <div className="summary-value">
                  {formatCurrency(data.average_daily_revenue)}
                </div>
              </div>
            </div>

            <div className="revenue-chart">
              <h4>Daily Revenue</h4>
              <div className="chart-bars">
                {Object.entries(data.revenue_by_date)
                  .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                  .map(([date, revenue]) => {
                    const maxRevenue = Math.max(
                      ...Object.values(data.revenue_by_date)
                    );
                    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={date} className="chart-bar-group">
                        <div className="chart-bar-wrapper">
                          <div
                            className="chart-bar"
                            style={{ height: `${percentage}%` }}
                            title={`${date}: ${formatCurrency(revenue)}`}
                          />
                        </div>
                        <div className="chart-label">
                          {new Date(date).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="revenue-table">
              <h4>Revenue by Date</h4>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(data.revenue_by_date)
                      .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
                      .map(([date, revenue]) => (
                        <tr key={date}>
                          <td>
                            {new Date(date).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </td>
                          <td>{formatCurrency(revenue)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
