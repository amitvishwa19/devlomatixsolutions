import { CheckCheck, Trash2, RefreshCw, Plus } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { NotificationStats } from '@/components/notifications/NotificationStats';
import { NotificationFilters } from '@/components/notifications/NotificationFilters';
import { NotificationList } from '@/components/notifications/NotificationList';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

const Index = () => {
  const {
    notifications,
    filteredNotifications,
    unreadCount,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    postDummyNotification,
    refetch,
  } = useNotifications();

  return (
    <div className="min-h-screen bg-background">
      <Header unreadCount={unreadCount} />
      
      <main className="container px-4 py-6 md:py-8">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Notifications
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Stay updated with patient alerts, appointments, and system notifications
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="default"
                size="sm"
                onClick={refetch}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Fetch</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={postDummyNotification}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Post Dummy</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={notifications.length === 0}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Clear all</span>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <NotificationStats notifications={notifications} />
        </div>
        
        <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border border-border bg-card p-4 shadow-card">
              <h2 className="mb-4 text-sm font-semibold text-foreground">Filters</h2>
              <NotificationFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedType={selectedType}
                onTypeChange={setSelectedType}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
            </div>
          </aside>
          
          <section>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </p>
            </div>
            
            <NotificationList
              notifications={filteredNotifications}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
