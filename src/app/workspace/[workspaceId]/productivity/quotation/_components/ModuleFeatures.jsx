export function ModuleFeatures({ modules }) {
    return (

        <div className="space-y-4">
            {modules.map((module) => (
                <div key={module.id} className="module-section bg-card rounded-lg border p-4">
                    <h3 className="module-title">
                        <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                        {module.name}
                    </h3>
                    <ul className="module-list">
                        {module.features.map((feature, index) => (
                            <li key={index}>{feature}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>

    );
}