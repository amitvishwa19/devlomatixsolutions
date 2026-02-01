'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const Header = ({ userRole = 'patient', notificationCount = 0 }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const pathname = usePathname();

    const adminNavItems = [
        { label: 'Dashboard', path: '/service-catalog-dashboard', icon: 'ChartBarIcon' },
        { label: 'Services', path: '/service-management', icon: 'CubeIcon' },
        { label: 'Pricing', path: '/pricing-management', icon: 'CurrencyDollarIcon' },
        { label: 'Billing', path: '/billing-integration', icon: 'DocumentTextIcon' },
    ];

    const patientNavItems = [
        { label: 'Browse Services', path: '/service-catalog-browser', icon: 'MagnifyingGlassIcon' },
        { label: 'Service Details', path: '/service-details', icon: 'InformationCircleIcon' },
    ];

    const navigationItems = userRole === 'admin' ? adminNavItems : patientNavItems;

    const isActivePath = (path) => pathname === path;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const toggleNotifications = () => {
        setIsNotificationOpen(!isNotificationOpen);
    };

    return (
        <header className="sticky top-0 z-[100] w-full bg-card border-b border-border shadow-card">
            <div className="w-full">
                <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                                <Icon name="HeartIcon" size={24} className="text-primary-foreground" variant="solid" />
                            </div>
                            <span className="text-xl font-semibold text-foreground hidden sm:block">HospitalCare</span>
                        </Link>

                        <nav className="hidden lg:flex items-center gap-1">
                            {navigationItems?.map((item) => (
                                <Link
                                    key={item?.path}
                                    href={item?.path}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ease-out ${isActivePath(item?.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <Icon name={item?.icon} size={20} />
                                    <span>{item?.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {userRole === 'admin' && (
                            <div className="relative hidden lg:block">
                                <button
                                    onClick={toggleNotifications}
                                    className="relative p-2 text-foreground hover:bg-muted rounded-md transition-all duration-200 ease-out"
                                    aria-label="Notifications"
                                >
                                    <Icon name="BellIcon" size={24} />
                                    {notificationCount > 0 && (
                                        <span className="absolute top-1 right-1 flex items-center justify-center w-5 h-5 text-xs font-medium text-error-foreground bg-error rounded-full">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )}
                                </button>

                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-popover border border-border rounded-lg shadow-modal z-[200]">
                                        <div className="p-4 border-b border-border">
                                            <h3 className="text-sm font-semibold text-popover-foreground">Notifications</h3>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notificationCount > 0 ? (
                                                <div className="p-4">
                                                    <p className="text-sm text-muted-foreground">You have {notificationCount} new notifications</p>
                                                </div>
                                            ) : (
                                                <div className="p-4">
                                                    <p className="text-sm text-muted-foreground">No new notifications</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-md transition-all duration-200 ease-out"
                            aria-label="Toggle menu"
                        >
                            <Icon name={isMobileMenuOpen ? 'XMarkIcon' : 'Bars3Icon'} size={24} />
                        </button>
                    </div>
                </div>

                {isMobileMenuOpen && (
                    <div className="lg:hidden border-t border-border bg-card">
                        <nav className="flex flex-col p-4 gap-2">
                            {navigationItems?.map((item) => (
                                <Link
                                    key={item?.path}
                                    href={item?.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ease-out ${isActivePath(item?.path)
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground hover:bg-muted'
                                        }`}
                                >
                                    <Icon name={item?.icon} size={20} />
                                    <span>{item?.label}</span>
                                </Link>
                            ))}

                            {userRole === 'admin' && (
                                <button
                                    onClick={() => {
                                        toggleNotifications();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-all duration-200 ease-out"
                                >
                                    <Icon name="BellIcon" size={20} />
                                    <span>Notifications</span>
                                    {notificationCount > 0 && (
                                        <span className="ml-auto flex items-center justify-center w-6 h-6 text-xs font-medium text-error-foreground bg-error rounded-full">
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )}
                                </button>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;