'use client'
import { useEffect } from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useAction } from "@/hooks/use-action";




export default function GoogleOAuthCallback() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { orgId } = useParams();

    const code = searchParams.get("code");

    const { execute, status } = useAction(saveGoogleIntegrationAction, {
        onSuccess: () => {
            router.replace(
                `/workspace/${orgId}?settings=integrations`
            );
        },
    });

    useEffect(() => {
        if (code) {
            execute({ code, orgId });
        }
    }, [code]);

    return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-muted-foreground">
                Connecting Google account…
            </p>
        </div>
    );
}