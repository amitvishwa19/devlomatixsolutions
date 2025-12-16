import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { EditableText } from '@/components/global/EditableText';
import { useState } from 'react';
import { CircleX, ClosedCaption, Pencil, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

export default function DemographicsCard({ demographics }) {
    const [edit, setEdit] = useState(false)
    const [userData, setUserdata] = useState({
        name: "Sarah Johnson",
        socialId: "MRN-2024-001",
        dob: "1985-03-15",
        gender: "female",
        maratialStatus: 'single',
        language: 'hindi',
        phone: "(555) 123-4567",
        emrPhone: "(555) 123-4567",
        email: "sarah.johnson@email.com",
        bloodType: "A+",
        lastVisit: "12/05/2025",
        status: "Active",
        avatar: "https://img.rocket.new/generatedImages/rocket_gen_img_10608de73-1763295287117.png",
        avatarAlt: "Professional headshot of woman with brown hair in white medical coat smiling at camera",
        address: '',
        alerts: [
            "Severe penicillin allergy - documented anaphylaxis",
            "Type 2 Diabetes - requires insulin monitoring"]

    })


    const handleChange = (e) => {

        const { name, value } = e?.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors?.[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData?.name?.trim()) {
            newErrors.name = 'Category name is required';
        }
        if (formData?.name?.trim()?.length < 2) {
            newErrors.name = 'Category name must be at least 2 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors)?.length === 0;
    };

    const handleSubmit = (e) => {
        e?.preventDefault();
        // if (validate()) {

        //     //onClose();
        // }

        console.log('handleSubmit', e)
        console.log('userData', userData)
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm w-full" onBlur={() => { console.log('blur') }}>

            <div className="flex items-center justify-between mb-6 w-full">

                <div className='flex flex-row gap-2'>
                    <Icon name="UserCircleIcon" size={24} className="text-primary" />
                    Demographics & Contact
                </div>
                <div>
                    {!edit ? <Pencil onClick={() => { setEdit(true) }} size={18} className=' cursor-pointer' /> : (
                        <div className='flex flex-row items-center gap-2'>
                            <Save size={18} onClick={handleSubmit} className=' cursor-pointer' />
                            <CircleX onClick={() => { setEdit(false) }} size={18} className=' cursor-pointer' />
                        </div>
                    )}
                </div>

            </div>

            <div className="space-y-4">
                <form onSubmit={handleSubmit}>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Full Name</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.name}</div> :
                                <Input name='name' value={userData.name} onChange={(e) => { setUserdata({ ...userData, name: e.target.value }) }} />}
                        </div>


                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Date of Birth</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.dob}</div> :
                                <Input name='dob' type='date' value={userData.dob} onChange={(e) => { setUserdata({ ...userData, dob: e.target.value }) }} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Gender</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.name}</div> :
                                <Select name='gender' defaultValue={userData.gender} onValueChange={(e) => { setUserdata({ ...userData, gender: e }) }}>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="arital Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Marital Status</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground capitalize">{userData?.maratialStatus}</div> :
                                <Select name='maritalStatus' defaultValue={userData.maratialStatus} onValueChange={(e) => { setUserdata({ ...userData, maratialStatus: e }) }}>
                                    <SelectTrigger className="">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="married">Married</SelectItem>
                                        <SelectItem value="single">Single</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Social ID Number</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.socialId}</div> :
                                <Input name='socialId' value={userData.socialId} onChange={(e) => { setUserdata({ ...userData, socialId: e.target.value }) }} />}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Preferred Language</label>
                            {!edit ? <div className="text-base text-sm text-muted-foreground capitalize">{userData?.language}</div> :
                                <Input name='language' value={userData.language} onChange={(e) => { setUserdata({ ...userData, language: e.target.value }) }} />}
                        </div>
                    </div>

                    <Separator className='my-4' />

                    <div className="">
                        <h3 className="text-base font-semibold text-foreground mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Primary Phone</label>
                                {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.phone}</div> :
                                    <Input name='phone' value={userData.phone} onChange={(e) => { setUserdata({ ...userData, phone: e.target.value }) }} />}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-secondary">Emergency Phone</label>
                                {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.emrPhone}</div> :
                                    <Input name='emrPhone' value={userData.emrPhone} onChange={(e) => { setUserdata({ ...userData, emrPhone: e.target.value }) }} />}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary">Email Address</label>
                                {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.email}</div> :
                                    <Input name='email' value={userData.email} onChange={(e) => { setUserdata({ ...userData, email: e.target.value }) }} />}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-text-secondary">Home Address</label>
                                {!edit ? <div className="text-base text-sm text-muted-foreground">{userData?.address}</div> :
                                    <Textarea name='address' rows='2' value={userData.address} onChange={(e) => { setUserdata({ ...userData, address: e.target.value }) }} />}
                            </div>
                        </div>
                    </div>

                </form>

            </div>
        </div>
    );
}

