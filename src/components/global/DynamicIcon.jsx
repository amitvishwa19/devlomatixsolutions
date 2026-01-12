import React, { memo } from "react";
import * as LucideIcons from "lucide-react";

const DynamicIcon = memo(({ name, ...props }) => {
    const IconComponent = LucideIcons[name]; // Access icon by name dynamically
    if (!IconComponent) {
        // If icon name is invalid, return a default icon or null
        return <LucideIcons.AlertTriangle {...props} />; // fallback icon
    }
    return <IconComponent {...props} />;
});

export default DynamicIcon;
