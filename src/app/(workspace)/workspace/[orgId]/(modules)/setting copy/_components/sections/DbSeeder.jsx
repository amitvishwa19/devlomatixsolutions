import React, { useState } from 'react'
import { SettingsSection } from '../SettingsSection'
import { toast } from '@/hooks/use-toast';
import { Users, UserCheck, Wrench, Shield, KeyRound, Calendar, Building2, Pill, Accessibility, Stethoscope, LayoutList, CirclePile, } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SeedButton from '../SeederButton';
import { useDatabaseSeed } from '../../_hooks/useDatabaseSeed';
import { seeder } from '@/utils/seeder';




export default function DbSeeder() {
    const { seedDatabase } = useDatabaseSeed();
    const { userSeed, patientSeed, doctorSeed, roleSeed, permissionSeed, categorySeed, inventorySeed, serviceSeed, paymentSeed, invoicesSeed, departmentSeed } = seeder()


    const seedItems = [
        { name: "user", label: "Users", icon: <Users className="h-4 w-4" />, seeder: userSeed },
        { name: "patient", label: "Patients", icon: <Accessibility className="h-4 w-4" />, seeder: patientSeed },
        { name: "doctor", label: "Doctors", icon: <Stethoscope className="h-4 w-4" />, seeder: doctorSeed },
        { name: "service", label: "Services", icon: <Wrench className="h-4 w-4" />, seeder: serviceSeed },
        { name: "role", label: "Roles", icon: <KeyRound className="h-4 w-4" />, seeder: roleSeed },
        { name: "permission", label: "Permissions", icon: <Shield className="h-4 w-4" />, seeder: permissionSeed },
        { name: "categories", label: "Categories", icon: <LayoutList className="h-4 w-4" />, seeder: categorySeed },
        { name: "appointments", label: "Appointments", icon: <Calendar className="h-4 w-4" />, seeder: '' },
        { name: "department", label: "Departments", icon: <Building2 className="h-4 w-4" />, seeder: departmentSeed },
        { name: "medications", label: "Medications", icon: <Pill className="h-4 w-4" />, seeder: '' },
        { name: "inventories", label: "Inventories", icon: <CirclePile className="h-4 w-4" />, seeder: '' },
    ];


    return (
        <div>
            <SettingsSection
                title="Database Seeding"
                description="Initialize your database with sample data for testing and development."
                action={false}
            >
                <div className="grid grid-cols-2 gap-2">
                    <AnimatePresence>
                        {seedItems.map((item, index) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.2 }}
                            >
                                <SeedButton
                                    name={item.name}
                                    label={item.label}
                                    icon={item.icon}
                                    seeder={item.seeder}
                                    seedDatabase={seedDatabase}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>


            </SettingsSection>



        </div>
    )
}
