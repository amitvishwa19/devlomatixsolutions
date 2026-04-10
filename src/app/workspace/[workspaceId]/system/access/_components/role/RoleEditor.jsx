import React from'react'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger, } from"@/components/ui/sheet"
import { Save, ShieldUser } from'lucide-react'
import { useEffect } from'react';
import { useForm } from'react-hook-form';
import { z } from'zod';
import { zodResolver } from'@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from'@/components/ui/form';
import { Button } from"@/components/ui/button"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Checkbox } from'@/components/ui/checkbox';
import { ScrollArea } from'@/components/ui/scroll-area';
import { Textarea } from'@/components/ui/textarea';
import { useManagement } from'../../_provider/accessProvider';


const roleSchema = z.object({
 name: z.string().min(2,'Role name must be at least 2 characters').max(50),
 description: z.string().min(10,'Description must be at least 10 characters').max(200),
 color: z.string().regex(/^#[0-9A-Fa-f]{6}$/,'Invalid color format'),
 permissions: z.array(z.string()).min(1,'Select at least one permission'),
 categoryId: z.string().optional(),
});

const colorPresets = [
'#0d9488','#3b82f6','#8b5cf6','#f59e0b','#10b981','#ec4899','#6366f1','#ef4444'
];

export default function RoleEditor({ isOpen, onClose, mode, role }) {
 const { permissions } = useManagement()




 const form = useForm({
 resolver: zodResolver(roleSchema),
 defaultValues: {
 name:'',
 description:'',
 color:'#0d9488',
 permissions: [],
 },
 });


 useEffect(() => {
 if (role) {
 form.reset({
 name: role.name,
 description: role.description,
 color: role.color,
 permissions: role.permissions,
 categoryId: role.categoryId
 });
 } else {
 form.reset({
 name:'',
 description:'',
 color:'#0d9488',
 permissions: [],
 categoryId:''
 });
 }
 }, [role, form]);


 const handleOpenChange = () => {
 onClose()
 }

 const handleSubmit = (data) => {
 console.log('@role submit', data)
 //onSubmit(data);
 //onOpenChange(false);
 };



 return (
 <Sheet open={isOpen} onOpenChange={handleOpenChange}>
 <SheetContent className='md:min-w-[620px] bg-transparent border-l-0 p-2'>
 <div className='bg-card h-full rounded-md flex flex-col'>
 <SheetHeader>
 <SheetTitle className='flex flex-row items-center gap-2'>
 <ShieldUser className='w-5 h-5 text-sky-500'/>
 {role ?'Edit Role':'Create New Role'}
 </SheetTitle>
 <SheetDescription className='text-xs text-muted-foreground'>
 {role ?'Update role details and permissions.':'Define a new role with specific permissions.'}
 </SheetDescription>
 </SheetHeader>
 <ScrollArea className="p-2 h-[80vh]">
 <div className='p-2'>
 <Form {...form}>
 <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
 <div className="flex flex-col gap-4">

 {/* ROle Title */}
 <FormField
 control={form.control}
 name="name"
 render={({ field }) => (
 <FormItem>
 <FormLabel className='text-xs'>Role Name</FormLabel>
 <FormControl>
 <Input placeholder="e.g., Senior Doctor"{...field} />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* ROle color */}
 <FormField
 control={form.control}
 name="color"
 render={({ field }) => (
 <FormItem>
 <FormLabel className='text-xs'>Color</FormLabel>
 <FormControl>
 <div className="flex items-center gap-2">
 <div
 className="h-8 w-8 rounded-md border border-input"
 style={{ backgroundColor: field.value }}
 />
 <div className="flex flex-wrap gap-1.5">
 {colorPresets.map((color) => (
 <button
 key={color}
 type="button"
 className="h-6 w-6 rounded-md border border-input transition-transform hover:scale-110"
 style={{ backgroundColor: color }}
 onClick={() => field.onChange(color)}
 />
 ))}
 </div>
 </div>
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />

 {/* Description */}
 <FormField
 control={form.control}
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel>Description</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Describe what this role is responsible for..."
 className="resize-none"
 rows='2'
 {...field}
 />
 </FormControl>
 <FormDescription>
 A brief description of this role's responsibilities.
 </FormDescription>
 <FormMessage />
 </FormItem>
 )}
 />












 </div>
 </form>
 </Form>
 </div>
 </ScrollArea>
 <SheetFooter className='flex flex-row items-center justify-end'>
 <SheetClose asChild>
 <Button variant="outline"size='sm'>Close</Button>
 </SheetClose>
 <Button variant='save'size='sm'>
 <Save />
 Create Role
 </Button>
 </SheetFooter>
 </div>
 </SheetContent>
 </Sheet>
 )
}