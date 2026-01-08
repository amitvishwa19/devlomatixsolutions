import { ScrollArea } from "@/components/ui/scroll-area";
import { Save } from "lucide-react";

export function SettingsSection({ title, description, children, onSave, action = true }) {





    return (
        <div className="flex flex-col h-full">
            <div className="p-2 h-16 border-b w-full flex flex-row items-center justify-between">
                <div className="sticky top-0 z-10  p-2 pb-4 mt-2 ">
                    <h3 className="text-md font-semibold text-foreground">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                </div>
                {action && <Save className="h-5 w-5 cursor-pointer text-sky-500 mr-4" onClick={onSave} />}

            </div>
            <ScrollArea className=" h-[68vh] mt-2">
                <div className="p-8 pt-6 space-y-6">
                    {children}
                </div>
            </ScrollArea>
        </div>
    );
}
