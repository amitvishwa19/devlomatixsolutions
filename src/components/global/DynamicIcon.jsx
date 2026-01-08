import React, { lazy, Suspense } from 'react';
import { LucideProps } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';



// Check if the icon name is valid
const isValidIconName = (name) => {
    return name in dynamicIconImports;
};

const DynamicIcon = ({ name, fallback = null, ...props }) => {
    // Return fallback if icon name is invalid
    if (!name || !isValidIconName(name)) {
        return <>{fallback}</>;
    }

    const LucideIcon = lazy(dynamicIconImports[name]);

    return (
        <Suspense fallback={fallback}>
            <LucideIcon {...props} />
        </Suspense>
    );
};

export default DynamicIcon;
