import PropTypes from 'prop-types';
import Icon from '@/components/ui/AppIcon';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { EditableText } from '@/components/global/EditableText';
import { CircleX, Pencil, Save } from 'lucide-react';

export default function InsuranceCard({ insurance }) {
    const [edit, setEdit] = useState(false)
    const [insuranceInfo, setInsuranceInfo] = useState({
        provider: "Blue Cross Blue Shield",
        planType: "PPO Premium",
        policyNumber: "BCBS-2024-789456",
        groupNumber: "GRP-456789",
        effectiveDate: "01/01/2024",
        expirationDate: "12/31/2025",
        status: "Active",
        copay: "$25",
        deductible: "$1,500",
        outOfPocketMax: "$5,000",
        subscriberName: "Sarah Johnson",
        relationshipToPatient: "Self",
        subscriberDOB: "03/15/1985",
        subscriberId: "SUB-789456123"
    })

    const handleChange = (e) => {

        const { name, value } = e?.target;
        setInsuranceInfo(prev => ({
            ...prev,
            [name]: value
        }));

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

    };

    return (
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                    <Icon name="ShieldCheckIcon" size={24} className="text-primary" />
                    Insurance Information
                </h2>
                <div>
                    {!edit ? <Pencil onClick={() => { setEdit(true) }} size={18} className=' cursor-pointer' /> : (
                        <div className='flex flex-row items-center gap-2'>
                            <Save size={18} onClick={handleSubmit} className=' cursor-pointer' />
                            <CircleX onClick={() => { setEdit(false) }} size={18} className=' cursor-pointer' />
                        </div>
                    )}
                </div>
            </div>
            {/* <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Insurance Provider</label>
                        <div className="text-base text-sm font-muted-semibold text-muted-foreground">{insurance?.provider}</div>
                    </div>

                    <EditableText
                        label="Insurance Provider"
                        value={'test'}
                        onChange={val => { }}
                    />

                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Plan Type</label>
                        <div className="text-base text-sm text-muted-foreground">{insurance?.planType}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Policy Number</label>
                        <div className="text-base text-sm text-muted-foreground font-mono">{insurance?.policyNumber}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Group Number</label>
                        <div className="text-base text-sm text-muted-foreground font-mono">{insurance?.groupNumber}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Effective Date</label>
                        <div className="text-base text-sm text-muted-foreground">{insurance?.effectiveDate}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-text-secondary">Expiration Date</label>
                        <div className="text-base text-sm text-muted-foreground">{insurance?.expirationDate}</div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Coverage Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Copay</label>
                            <div className="text-base text-sm font-semibold text-muted-foreground">{insurance?.copay}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Deductible</label>
                            <div className="text-base text-sm font-semibold text-muted-foreground">{insurance?.deductible}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Out-of-Pocket Max</label>
                            <div className="text-base text-sm font-semibold text-muted-foreground">{insurance?.outOfPocketMax}</div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">Subscriber Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Subscriber Name</label>
                            <div className="text-base text-sm text-muted-foreground">{insurance?.subscriberName}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Relationship to Patient</label>
                            <div className="text-base text-sm text-muted-foreground">{insurance?.relationshipToPatient}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Subscriber DOB</label>
                            <div className="text-base text-sm text-muted-foreground">{insurance?.subscriberDOB}</div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Subscriber ID</label>
                            <div className="text-base text-sm text-muted-foreground font-mono">{insurance?.subscriberId}</div>
                        </div>
                    </div>
                </div>
            </div> */}


            <div className="space-y-4">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Insurance Provider */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Insurance Provider
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm font-muted-semibold text-muted-foreground">
                                {insurance?.provider}
                            </div>
                        ) : (
                            <Input
                                name='provider'
                                value={insuranceInfo.provider ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    {/* Plan Type */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Plan Type
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm text-muted-foreground">
                                {insurance?.planType}
                            </div>
                        ) : (
                            <Input
                                name='planType'
                                value={insuranceInfo.planType ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    {/* Policy Number */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Policy Number
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm text-muted-foreground font-mono">
                                {insurance?.policyNumber}
                            </div>
                        ) : (
                            <Input
                                name='policyNumber'
                                value={insuranceInfo.policyNumber ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    {/* Group Number */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Group Number
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm text-muted-foreground font-mono">
                                {insuranceInfo?.groupNumber}
                            </div>
                        ) : (
                            <Input
                                name='groupNumber'
                                value={insuranceInfo.groupNumber ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    {/* Effective Date */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Effective Date
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm text-muted-foreground">
                                {insuranceInfo?.effectiveDate}
                            </div>
                        ) : (
                            <Input
                                type="date"
                                name='effectiveDate'
                                value={insuranceInfo.effectiveDate ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>

                    {/* Expiration Date */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary">
                            Expiration Date
                        </label>
                        {!edit ? (
                            <div className="text-base text-sm text-muted-foreground">
                                {insuranceInfo?.expirationDate}
                            </div>
                        ) : (
                            <Input
                                type="date"
                                name='expirationDate'
                                value={insuranceInfo.expirationDate ?? ''}
                                onChange={handleChange}
                            />
                        )}
                    </div>
                </div>

                {/* Coverage Details */}
                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">
                        Coverage Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Copay */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Copay
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm font-semibold text-muted-foreground">
                                    {insuranceInfo?.copay}
                                </div>
                            ) : (
                                <Input
                                    name='copay'
                                    value={insuranceInfo.copay ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* Deductible */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Deductible
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm font-semibold text-muted-foreground">
                                    {insuranceInfo?.deductible}
                                </div>
                            ) : (
                                <Input
                                    name='deductible'
                                    value={insuranceInfo.deductible ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* Out-of-Pocket Max */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Out-of-Pocket Max
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm font-semibold text-muted-foreground">
                                    {insuranceInfo?.outOfPocketMax}
                                </div>
                            ) : (
                                <Input
                                    name='outOfPocketMax'
                                    value={insuranceInfo.outOfPocketMax ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Subscriber Information */}
                <div className="pt-6 border-t border-border">
                    <h3 className="text-base font-semibold text-foreground mb-4">
                        Subscriber Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Subscriber Name */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Subscriber Name
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm text-muted-foreground">
                                    {insuranceInfo?.subscriberName}
                                </div>
                            ) : (
                                <Input
                                    name='subscriberName'
                                    value={insuranceInfo.subscriberName ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* Relationship to Patient */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Relationship to Patient
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm text-muted-foreground">
                                    {insuranceInfo?.relationshipToPatient}
                                </div>
                            ) : (
                                <Input
                                    name='relationshipToPatient'
                                    value={insuranceInfo.relationshipToPatient ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* Subscriber DOB */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Subscriber DOB
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm text-muted-foreground">
                                    {insuranceInfo?.subscriberDOB}
                                </div>
                            ) : (
                                <Input
                                    name='subscriberDOB'
                                    type="date"
                                    value={insuranceInfo.subscriberDOB ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>

                        {/* Subscriber ID */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">
                                Subscriber ID
                            </label>
                            {!edit ? (
                                <div className="text-base text-sm text-muted-foreground font-mono">
                                    {insuranceInfo?.subscriberId}
                                </div>
                            ) : (
                                <Input
                                    name='subscriberId'
                                    value={insuranceInfo.subscriberId ?? ''}
                                    onChange={handleChange}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}



