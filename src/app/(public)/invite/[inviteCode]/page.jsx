import { db as prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Link as LinkIcon, CheckCircle2, ShieldAlert } from "lucide-react";

export default async function InvitePage({ params }) {
    await params;
    const inviteCode = params.inviteCode;

    if (!inviteCode) {
        return redirect("/");
    }

    // Lookup the workspace by invite code
    const server = await prisma.server.findUnique({
        where: { inviteCode },
        select: {
            id: true,
            name: true,
            description: true,
            imageUrl: true,
        }
    });

    if (!server) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full text-center shadow-2xl">
                    <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tight mb-2">Invalid Invite</h1>
                    <p className="text-muted-foreground mb-8">This invitation link has expired or is no longer valid. Please ask for a new invite.</p>
                    <Button asChild className="w-full text-md font-bold h-12 rounded-xl">
                        <Link href="/">Back to Home</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 bg-background overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="bg-card/60 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] max-w-md w-full relative z-10 shadow-2xl space-y-8 animate-fade-in-up">
                <div className="space-y-4 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 shadow-inner border border-primary/20">
                        {server.imageUrl ? (
                            <img src={server.imageUrl} alt={server.name} className="w-full h-full object-cover rounded-3xl" />
                        ) : (
                            <LinkIcon className="w-10 h-10 text-primary" />
                        )}
                    </div>
                    
                    <div>
                        <p className="text-sm font-bold text-muted-foreground mb-1">You've been invited</p>
                        <h1 className="text-3xl font-black italic tracking-tight text-foreground">{server.name}</h1>
                        {server.description && (
                            <p className="text-sm text-muted-foreground mt-2">{server.description}</p>
                        )}
                    </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 text-center">
                    <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                        To access this workspace and start collaborating, please join using your account.
                    </p>
                </div>

                <div className="space-y-3">
                    <Button asChild className="w-full text-md font-black h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <Link href="/login">
                            <CheckCircle2 className="w-5 h-5 mr-2" />
                            Accept & Login
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full font-bold h-12 rounded-xl text-muted-foreground hover:text-foreground">
                        <Link href="/register">Create new account</Link>
                    </Button>
                </div>
            </div>
            
            <p className="mt-8 text-xs font-bold text-muted-foreground/60 text-center relative z-10">
                Healthyfine • Document Manager PRO
            </p>
        </div>
    );
}
