'use client';
import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) => {
    if (!isOpen) return null;

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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogTrigger>Open</DialogTrigger>
            <DialogContent className='dark:bg-darkPrimaryBackground p-4 w-full max-w-md'>

                <DialogHeader className={''}>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {message}
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="ghost" size={'sm'}>Cancel</Button>
                    </DialogClose>
                    <Button variant={'save'} size={'sm'} onClick={() => {
                        onConfirm();
                        onClose();
                    }}>
                        {confirmText}</Button>
                </DialogFooter>

            </DialogContent>
        </Dialog>
    );
};



export default ConfirmDialog;