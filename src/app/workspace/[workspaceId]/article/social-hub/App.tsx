import React from 'react';
import { SocialRouter, useSocialRouter } from '@/social-hub/hooks/use-social-router';
import { AppLayout } from '@/social-hub/components/AppLayout';

import Index from '@/social-hub/pages/Index';
import Hashtags from '@/social-hub/pages/Hashtags';
import Rewriter from '@/social-hub/pages/Rewriter';
import Templates from '@/social-hub/pages/Templates';
import Calendar from '@/social-hub/pages/Calendar';
import Docs from '@/social-hub/pages/Docs';
import Analytics from '@/social-hub/pages/Analytics';

const Routes = () => {
    const { currentPath } = useSocialRouter();

    let Component = Index;
    switch (currentPath) {
        case "/hashtags": Component = Hashtags; break;
        case "/rewriter": Component = Rewriter; break;
        case "/templates": Component = Templates; break;
        case "/calendar": Component = Calendar; break;
        case "/docs": Component = Docs; break;
        case "/analytics": Component = Analytics; break;
        default: Component = Index;
    }

    return <Component />;
}

export default function SocialHubApp() {
    return (
        <SocialRouter>
            <AppLayout>
                <Routes />
            </AppLayout>
        </SocialRouter>
    );
}
