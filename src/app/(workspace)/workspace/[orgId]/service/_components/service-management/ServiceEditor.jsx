import React, { useEffect, useState } from 'react'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useService } from '../../_provider/serviceProvider';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader, Save } from 'lucide-react';
import { toast } from 'sonner';
import { upsertService } from '../../_action/upsert-service';
import { useAction } from '@/hooks/use-action';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ServiceEditor({ isOpen, service, onClose, onSave }) {
    const { department, setServices } = useService()
    const [parentId, setParentId] = useState();
    const [childId, setChildId] = useState();
    const [loading, setLoading] = useState(false)
    const { orgId } = useParams()
    const { data: session } = useSession()

    const selectedParent = React.useMemo(
        () => department?.children?.find((item) => item.id === parentId),
        [parentId, department]
    );



    const [formData, setFormData] = useState({
        id: '',
        title: '',
        category: '',
        subcategory: '',
        description: '',
        price: 0,
        insurancePrice: 0,
        status: true
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (service) {
            setFormData({
                id: service?.id || '',
                title: service?.title || '',
                category: service?.category?.id || '',
                subcategory: service?.subcategory || '',
                description: service?.description || '',
                price: service?.price || '',
                insurancePrice: service?.insurancePrice || '',
                billingCode: service?.billingCode || '',
                status: service?.status || true
            });
        } else if (isOpen) {
            // Reset form when opening modal for new service
            setFormData({
                title: '',
                code: '',
                category: '',
                subcategory: '',
                description: '',
                price: '',
                insurancePrice: '',
                billingCode: '',
                status: true
            });
            setErrors({});
        }
        //console.log(service?.category?.id)


    }, [service, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e?.target;


        //console.log(e?.target)



        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors?.[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData?.name?.trim()) newErrors.name = 'Service name is required';
        if (!formData?.code?.trim()) newErrors.code = 'Service code is required';
        if (!formData?.category) newErrors.category = 'Category is required';
        if (!formData?.price || parseFloat(formData?.price) <= 0) newErrors.price = 'Valid price is required';

        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const { execute } = useAction(upsertService, {
        onSuccess: (data) => {
            console.log('upsert service action response', data)
            setServices(prev =>
                prev.some(item => item.id === data?.service?.id)
                    ? prev.map(item =>
                        item.id === data?.service?.id ? { ...item, ...data?.service } : item
                    )
                    : [data?.service, ...prev]
            );
            setLoading(false)
            onClose()
            toast.success(`Service "${data.service?.title}" updated successfully`)
        },
        onError: (error) => {
            setLoading(false)
        }
    })

    const handleSubmit = async (e) => {
        e?.preventDefault();

        if (formData.title === '') return toast.error('Please define a Title to create service')
        if (formData.category === '') return toast.error('Please select a department to create service')
        setLoading(true)

        await execute({ formData, orgId, userId: session?.user?.userId })

        console.log('formData', formData)
    };

    if (!isOpen) return null;



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>

            <DialogContent className='p-4 [&>button:last-child]:hidden'>

                <DialogHeader className={'hidden'}>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} >

                    <div className="flex flex-col gap-6">

                        {/* Service title */}
                        <div className='flex flex-col gap-2'>
                            <Label >
                                Service Name <span className="text-error">*</span>
                            </Label>
                            <Input
                                type="text"
                                name="title"
                                value={formData?.title}
                                onChange={handleChange}
                                placeholder="Enter service name"
                            />
                            {errors?.name && <p className="text-xs text-error mt-1">{errors?.name}</p>}
                        </div>

                        {/* Service category */}

                        <div className='flex flex-col gap-2 '>
                            <Label>Select Department *</Label>
                            <Select
                                name='category'
                                defaultValue={formData?.category}
                                onValueChange={(value) => {
                                    setParentId(value); setChildId(undefined);
                                    setFormData({ ...formData, category: value })
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>

                                        {department?.children?.map((item) => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Sub department Select */}
                        {selectedParent?.children?.length > 0 && (
                            <div className=''>
                                <div className='flex flex-col gap-2'>
                                    <Label>Select Sub Department</Label>
                                    <Select
                                        name='category'
                                        value={childId}
                                        onValueChange={(value) => {
                                            setChildId(value);
                                            setFormData({ ...formData, category: value })
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select service" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectLabel>Services</SelectLabel>
                                                {selectedParent.children.map((child) => (
                                                    <SelectItem key={child.id} value={child.id}>
                                                        {child.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        {/* Price of service */}
                        <div className='flex flex-col gap-2'>
                            <Label > Standard Price ( ₹ INR ) <span className="text-error">*</span> </Label>
                            <Input
                                type="number"
                                name="price"
                                value={formData?.price}
                                onChange={handleChange}
                                step="50"
                                min="0"
                                placeholder="0.00"
                            />
                            {errors?.price && <p className="text-xs text-error mt-1">{errors?.price}</p>}
                        </div>


                        {/* INsurance Price */}
                        <div className='flex flex-col gap-2'>
                            <Label >Insurance Price  ( ₹ INR )</Label>
                            <Input
                                type="number"
                                name="insurancePrice"
                                value={formData?.insurancePrice}
                                onChange={handleChange}
                                step="50"
                                min="0"
                                placeholder="0.00"
                            />
                        </div>

                        {/* Status */}
                        <div className='flex flex-col gap-2'>
                            <Select name='status' defaultValue={formData.status} onValueChange={(e) => {
                                setFormData({ ...formData, status: e })
                                //console.log(e)
                            }}>
                                <SelectTrigger className="">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={true} >Active</SelectItem>
                                    <SelectItem value={false}>InActive</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Service Description */}
                        <div className='flex flex-col gap-2'>
                            <Label >Description</Label>
                            <Textarea
                                name="description"
                                value={formData?.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Enter service description"
                            />
                        </div>

                    </div>
                </form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" disabled={loading} size={'sm'}>Cancel</Button>
                    </DialogClose>
                    <Button variant={'save'} size={'sm'} disabled={loading} onClick={handleSubmit}>
                        {loading ? <Loader className='animate-spin' /> : <Save />}
                        Save changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
