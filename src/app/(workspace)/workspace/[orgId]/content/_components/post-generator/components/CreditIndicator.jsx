import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const CreditIndicator = ({ creditCost, remainingCredits }) => {
    const willExceedLimit = creditCost > remainingCredits;

    return (
        <div className={`
      p-4 rounded-lg border-2 transition-all duration-200
      ${willExceedLimit
                ? 'border-destructive bg-destructive/5' : 'border-accent bg-accent/5'
            }
    `}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Icon
                        name="BoltIcon"
                        size={20}
                        className={willExceedLimit ? 'text-destructive' : 'text-accent'}
                        variant="solid"
                    />
                    <span className="text-sm font-semibold text-foreground">Generation Cost</span>
                </div>
                <span className={`text-lg font-mono font-bold ${willExceedLimit ? 'text-destructive' : 'text-accent'}`}>
                    {creditCost} credits
                </span>
            </div>
            <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    <span className={`font-semibold ${willExceedLimit ? 'text-destructive' : 'text-foreground'}`}>
                        {remainingCredits?.toLocaleString()} credits
                    </span>
                </div>
            </div>
            {willExceedLimit && (
                <div className="mt-3 flex items-start space-x-2 p-3 bg-destructive/10 rounded-lg">
                    <Icon name="ExclamationTriangleIcon" size={16} className="text-destructive mt-0.5" variant="solid" />
                    <p className="text-xs text-destructive">
                        Insufficient credits. Please reduce options or purchase more credits.
                    </p>
                </div>
            )}
        </div>
    );
};

CreditIndicator.propTypes = {
    creditCost: PropTypes?.number?.isRequired,
    remainingCredits: PropTypes?.number?.isRequired
};

export default CreditIndicator;