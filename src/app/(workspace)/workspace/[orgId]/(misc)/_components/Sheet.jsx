import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from "@/components/ui/sheet"






export function RoleFormDialog({ open, onOpenChange, onSubmit }) {




    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className=" min-w-[620px] bg-transparent p-2 border-0">
                <div className='bg-card h-full rounded-lg border overflow-hidden p-4'>
                    <SheetHeader>
                        <SheetTitle>{role ? 'Edit Role' : 'Create New Role'}</SheetTitle>
                        <SheetDescription>
                            {role ? 'Update role details and permissions.' : 'Define a new role with specific permissions.'}
                        </SheetDescription>
                    </SheetHeader>

                </div>

            </SheetContent>
        </Sheet>
    );
}
