import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Save, X, Tag as TagIcon, MapPin, Phone, User, Hash, Info, Briefcase, Plus, Loader2, Loader } from 'lucide-react'

export default function SaveContact({ open, setOpen, leads, selectedLeadIds }) {
    const lead = leads?.[0] || {};
    const [saving, setSaving] = useState(false);



    const handleContactSave = () => {
        setSaving(true);
        setTimeout(() => {
            setSaving(false);

        }, 1000);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className=" bg-card border gap-0 overflow-hidden rounded-xl p-4">




                <div className="">
                    <DialogHeader className="pb-4">
                        <DialogTitle className="text-lg font-semibold  flex items-center gap-2 ">
                            Add to Contacts
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs">
                            Verify and enrich lead details before saving to your workspace.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        {/* Left Column: Essential Info */}
                        <div className="space-y-4">

                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <Briefcase className="w-3 h-3" />
                                    Business/Company Name
                                </Label>
                                <Input
                                    placeholder="e.g. Property Agent"
                                    className="bg-transparent border transition-all rounded-md"
                                />
                            </div>


                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <User className="w-3 h-3" />
                                    Full Name
                                </Label>
                                <Input
                                    placeholder="Enter full name"
                                    className="bg-transparent border transition-all rounded-md"
                                    defaultValue={lead.name}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <Phone className="w-3 h-3" />
                                    Phone Number
                                </Label>
                                <Input
                                    placeholder="+1 (555) 000-0000"
                                    className="bg-transparent border transition-all rounded-md"
                                    defaultValue={lead.phone}
                                />
                            </div>


                        </div>

                        {/* Right Column: Categorization */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <Hash className="w-3 h-3" />
                                    Category
                                </Label>
                                <Input
                                    placeholder="Industry or Type"
                                    className="bg-transparent border transition-all rounded-md"
                                    defaultValue={lead.category}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <TagIcon className="w-3 h-3" />
                                    Tags
                                </Label>
                                <Input
                                    placeholder="Warm Lead, Priority..."
                                    className="bg-transparent border transition-all rounded-md"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium    flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    Address
                                </Label>
                                <Input
                                    placeholder="City, Country"
                                    className="bg-transparent border transition-all rounded-md"
                                    defaultValue={lead.address}
                                />
                            </div>
                        </div>

                        {/* Full Width Description */}
                        <div className="col-span-2 space-y-2 pt-2">
                            <Label className="text-sm font-medium    flex items-center gap-2">
                                <Info className="w-3 h-3" />
                                Description / Notes
                            </Label>
                            <Textarea
                                rows='6'
                                placeholder="Add context or notes about this interaction..."
                                className="bg-transparent border transition-all rounded-md resize-none"
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter className="pt-4  border-t  flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className=" font-medium"
                    >
                        Discard
                    </Button>
                    <Button
                        variant="default"
                        className=" font-semibold px-6 flex items-center gap-2 group"
                        onClick={() => { handleContactSave() }}
                    >

                        {saving ? <Loader className=' animate-spin' /> : <Save className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />}
                        {saving ? "Saving..." : "Save Contact"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
