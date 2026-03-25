'use client';



export default function MessageLayout({ children }) {
    return (
        <div className="h-[calc(100vh-72px)] flex overflow-hidden bg-background">
            {/* Main Content Area (Sidebars are handled within pages or a simpler wrapper) */}
            <main className="h-full flex flex-1">
                {children}
            </main>
        </div>
    );
}
