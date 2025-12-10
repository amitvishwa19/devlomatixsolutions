import { Bell, Fingerprint, GlobeLock, Handshake, Mail, MonitorIcon, Settings, User } from "lucide-react";

export const menus = {
    settingMenu: [
        {
            title: 'General',
            icon: <Settings size={16} />,
            link: '/admin/setting'
        },
        {
            title: 'Appereance',
            icon: <MonitorIcon size={16} />,
            link: '/admin/setting/appearance'
        },
        {
            title: 'Notifications',
            icon: <Bell size={16} />,
            link: '/admin/setting/notifications'
        },
        {
            title: 'Profile',
            icon: <User size={16} />,
            link: '/admin/setting/profile'
        },
        {
            title: 'Mail',
            icon: <Mail size={16} />,
            link: '/admin/setting/email'
        },
        {
            title: 'Auth',
            icon: <Fingerprint size={16} />,
            link: '/admin/setting/auth'
        },
        {
            title: 'Terms & Conditions',
            icon: <Handshake size={16} />,
            link: '/admin/setting/terms-condition'
        },
        {
            title: 'Privacy Policy',
            icon: <GlobeLock size={16} />,
            link: '/admin/setting/privacy-policy'
        }
    ]
}