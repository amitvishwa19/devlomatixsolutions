'use client';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Loader, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAction } from '@/hooks/use-action';
import { deleteCategory } from '../../_actions/delete-category';
import { toast } from 'sonner';
import { useTaxonomy } from '../../_provider/taxanomyProvider';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning', data }) => {
    if (!isOpen) return null;
    const [loading, setLoading] = useState(false)
    const { categories, setCategories } = useTaxonomy()

    const config = {
        warning: {
            icon: 'ExclamationTriangleIcon',
            iconColor: 'text-warning',
            iconBg: 'bg-warning/10',
            confirmText: 'Confirm',
            confirmClass: 'bg-warning hover:bg-warning/90 text-warning-foreground'
        },
        danger: {
            icon: 'XCircleIcon',
            iconColor: 'text-error',
            iconBg: 'bg-error/10',
            confirmText: 'Delete',
            confirmClass: 'bg-error hover:bg-error/90 text-error-foreground'
        },
        info: {
            icon: 'InformationCircleIcon',
            iconColor: 'text-primary',
            iconBg: 'bg-primary/10',
            confirmText: 'Confirm',
            confirmClass: 'bg-primary hover:bg-primary/90 text-primary-foreground'
        }
    };

    const { icon, iconColor, iconBg, confirmText, confirmClass } = config?.[type] || config?.warning;

    const { execute } = useAction(deleteCategory, {
        onSuccess: (data) => {
            setLoading(false)
            onClose()
            setCategories(categories.filter(cat => cat.id !== data?.category?.id))
            toast.success(`Category "${data?.category?.name}" deleted successfully`);
        },
        onError: (error) => {
            toast.error(`Oops!, something went wrong, please try again later`, { id: 'new-cat' });
            setLoading(false)
        }
    })

    const handleDelete = (data) => {
        setLoading(true)
        execute({ categoryId: data.id })
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className='dark:bg-darkPrimaryBackground p-4 w-full max-w-md'>

                <DialogHeader className={''} disabled={loading}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" size={'sm'}>Cancel</Button>
                    </DialogClose>
                    <Button variant={'save'} disabled={loading} size={'sm'} onClick={() => { handleDelete(data) }}>
                        {loading ? <Loader className=' animate-spin' /> : <Trash2 />}
                        {confirmText}
                    </Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
};



export default ConfirmDialog;