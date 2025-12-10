'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PropTypes from 'prop-types';

export default function AccountsReceivableChart({ data }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-6">Accounts Receivable Aging</h2>
            <div className="w-full h-80" aria-label="Accounts Receivable Aging Bar Chart">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="period" stroke="#64748B" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748B" style={{ fontSize: '12px' }} />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#FFFFFF',
                                border: '1px solid #E2E8F0',
                                borderRadius: '8px',
                                fontSize: '12px'
                            }}
                        />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="amount" fill="#2563EB" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

AccountsReceivableChart.propTypes = {
    data: PropTypes?.arrayOf(
        PropTypes?.shape({
            period: PropTypes?.string?.isRequired,
            amount: PropTypes?.number?.isRequired
        })
    )?.isRequired
};