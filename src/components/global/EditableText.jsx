import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"



export function EditableText({ label, value, onChange, type = 'text', options = [] }) {
    const [editing, setEditing] = useState(false);




    if (!editing) {
        return (
            <div>
                <label className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {value || "-"}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        type="button"
                        onClick={() => setEditing(true)}
                    >
                        ✎
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <label className="block text-sm font-medium text-text-secondary">
                {label}
            </label>
            <div className="flex items-center gap-2">

                {(type === 'text' || type === 'number' || type === 'date') && (
                    <Input
                        type={type}
                        className="h-8"
                        value={value || ""}
                        onChange={e => onChange(e.target.value)}
                        autoFocus
                        onBlur={() => setEditing(false)}
                        onKeyDown={e => {
                            if (e.key === "Enter") setEditing(false);
                            if (e.key === "Escape") setEditing(false);
                        }}
                    />
                )}

                {(type === 'select') && (
                    <Select
                        onBlur={() => setEditing(false)}
                        onKeyDown={e => {
                            if (e.key === "Enter") setEditing(false);
                            if (e.key === "Escape") setEditing(false);
                        }}
                    >
                        <SelectTrigger className="">
                            <SelectValue placeholder="Theme" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="light">Light</SelectItem>
                            <SelectItem value="dark">Dark</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                )}

            </div>
        </div>
    );
}