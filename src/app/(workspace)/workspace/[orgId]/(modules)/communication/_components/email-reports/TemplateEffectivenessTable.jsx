import Icon from '@/components/ui/AppIcon';



const TemplateEffectivenessTable = ({ templates }) => {
    const getRateColor = (rate) => {
        if (rate >= 80) return 'text-success';
        if (rate >= 60) return 'text-warning';
        return 'text-error';
    };

    return (
        <div className="bg-card rounded-lg shadow-elevation-md overflow-hidden">
            <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground mb-1">Template Effectiveness</h2>
                <p className="text-sm text-muted-foreground">Performance metrics for email templates</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-muted">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Template Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-foreground uppercase tracking-wider">
                                Category
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Sent
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Delivered
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Opened
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Delivery Rate
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Open Rate
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-foreground uppercase tracking-wider">
                                Click Rate
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {templates.map((template) => (
                            <tr key={template.id} className="hover:bg-muted/50 transition-smooth">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="DocumentTextIcon" size={18} className="text-primary" />
                                        <span className="text-sm font-medium text-foreground">{template.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {template.category}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                                    {template.sent.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                                    {template.delivered.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-foreground">
                                    {template.opened.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`text-sm font-medium ${getRateColor(template.deliveryRate)}`}>
                                        {template.deliveryRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`text-sm font-medium ${getRateColor(template.openRate)}`}>
                                        {template.openRate.toFixed(1)}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`text-sm font-medium ${getRateColor(template.clickRate)}`}>
                                        {template.clickRate.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TemplateEffectivenessTable;