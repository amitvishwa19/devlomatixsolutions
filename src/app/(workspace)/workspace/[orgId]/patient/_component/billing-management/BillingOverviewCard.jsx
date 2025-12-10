import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

export default function BillingOverviewCard({ title, amount, change, changeType, icon, iconBg }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${iconBg} rounded-lg flex items-center justify-center`}>
                    <Icon name={icon} size={24} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${changeType === 'increase' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                    <Icon name={changeType === 'increase' ? 'ArrowTrendingUpIcon' : 'ArrowTrendingDownIcon'} size={14} />
                    <span>{change}</span>
                </div>
            </div>
            <h3 className="text-sm font-medium text-text-secondary mb-1">{title}</h3>
            <p className="text-2xl font-bold text-foreground">{amount}</p>
        </div>
    );
}

BillingOverviewCard.propTypes = {
    title: PropTypes?.string?.isRequired,
    amount: PropTypes?.string?.isRequired,
    change: PropTypes?.string?.isRequired,
    changeType: PropTypes?.oneOf(['increase', 'decrease'])?.isRequired,
    icon: PropTypes?.string?.isRequired,
    iconBg: PropTypes?.string?.isRequired
};