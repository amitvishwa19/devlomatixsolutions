import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';

const QuickActionButton = ({ label, icon, onClick, variant, disabled }) => {
    const variantStyles = {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        outline: 'bg-surface text-text-primary border border-border hover:bg-muted'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
        ${variantStyles?.[variant]}
        flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm
        transition-all duration-200 ease-out shadow-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:shadow-md active:scale-95
      `}
        >
            <Icon name={icon} size={20} variant="outline" />
            <span>{label}</span>
        </button>
    );
};

QuickActionButton.propTypes = {
    label: PropTypes?.string?.isRequired,
    icon: PropTypes?.string?.isRequired,
    onClick: PropTypes?.func?.isRequired,
    variant: PropTypes?.oneOf(['primary', 'secondary', 'outline']),
    disabled: PropTypes?.bool
};

QuickActionButton.defaultProps = {
    variant: 'primary',
    disabled: false
};

export default QuickActionButton;