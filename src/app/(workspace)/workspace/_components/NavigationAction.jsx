"use client";

import { ActionTooltip } from "@/components/global/ActionTooltip";
import { useModal } from "@/hooks/useModal";
import { Plus } from "lucide-react";




export const NavigationAction = () => {
    const { onOpen } = useModal();

    return (
        <div>
            <ActionTooltip
                side="right"
                align="center"
                label="Add new Organization"
            >
                <button
                    onClick={() => onOpen("neworgmodal")}
                    className="group flex items-center"
                >
                    <div className="flex mx-3 h-[48px] w-[48px] rounded-lg group-hover:rounded-lg transition-all overflow-hidden items-center justify-center bg-background dark:bg-neutral-700 group-hover:bg-emerald-500">
                        <Plus
                            className="group-hover:text-white transition text-emerald-500"
                            size={25}
                        />
                    </div>
                </button>
            </ActionTooltip>
        </div>
    )
}