import { useState, ReactNode } from 'react';
import { User, Phone, Mail, MessageSquare, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { sendInquiryMail } from '../_action/send-mail';
import { useAction } from '@/hooks/use-action';
import { toast } from 'sonner';



const ContactDialog = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name || !formData.email || !formData.message) {
            toast({
                title: "Please fill required fields",
                description: "Name, email, and message are required.",
                variant: "destructive",
            });
            return;
        }

        toast({
            title: "Message Sent!",
            description: "We'll get back to you as soon as possible.",
        });

        setOpen(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
    };

    const { execute } = useAction(sendInquiryMail, {
        onSuccess: (data) => {
            setLoading(false)
            handleOpenClose()
            toast.success('Your inquiry submitted successfully, will book a demo and connect with you', { id: 'new-permission' })
        },
        onError: (error) => {
            console.log(error)
            toast.error('Oops somethig went wrong ! try again later', { id: 'new-invoice' })
            setLoading(false);
        }
    })

    const handleContactSubmit = async () => {
        console.log('handleContactSubmit')
        setLoading(true)
        await execute({ name: formData.name, email: formData.email, phone: formData.email, message: formData.message })
    }

    const handleOpenClose = () => {
        setLoading(false)
        setOpen(!open)
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
        })
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenClose}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-[hsl(220,20%,12%)] border-[hsl(220,15%,20%)] text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">Contact Us</DialogTitle>
                    <DialogDescription className="text-[hsl(220,15%,60%)]">
                        Have a question? Send us a message and we'll respond promptly.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-[hsl(220,15%,80%)]">Full Name *</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,15%,50%)]" />
                            <Input
                                id="name"
                                placeholder="Dr. Rahul Sharma"
                                className="pl-10 bg-[hsl(220,20%,8%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(200,100%,50%)]"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[hsl(220,15%,80%)]">Email *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,15%,50%)]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="rahul@example.com"
                                    className="pl-10 bg-[hsl(220,20%,8%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(200,100%,50%)]"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-[hsl(220,15%,80%)]">Phone</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(220,15%,50%)]" />
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="+91 98765 43210"
                                    className="pl-10 bg-[hsl(220,20%,8%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(200,100%,50%)]"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message" className="text-[hsl(220,15%,80%)]">Message *</Label>
                        <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-[hsl(220,15%,50%)]" />
                            <Textarea
                                id="message"
                                rows='4'
                                placeholder="How can we help you?"
                                className="pl-10 min-h-[120px] bg-[hsl(220,20%,8%)] border-[hsl(220,15%,25%)] text-white placeholder:text-[hsl(220,15%,40%)] focus:border-[hsl(200,100%,50%)] resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        variant='sm'
                        className="w-full bg-[hsl(200,100%,50%)] hover:bg-[hsl(200,100%,45%)] text-white font-medium  h-auto"
                        onClick={handleContactSubmit}
                        disabled={loading}
                    >
                        {loading && <Loader className=' animate-spin' />}
                        Send Message
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ContactDialog;
