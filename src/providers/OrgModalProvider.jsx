"use client";

import { NewOrgModal } from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/NewOrgModal";
import AddMemberModal from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/_components/AddMemberModal";
import { DeleteOrdModal } from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/_components/DeleteOrdModal";
import SettingsModal from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/SettingsModal";
import AddAppointmentModal from "@/app/(workspace)/workspace/[orgId]/appointment/_components/AddAppointmentModal";
import AppointmentCrud from "@/app/(workspace)/workspace/[orgId]/appointment/_components/AppointmentCrud";
import NewAppointmentModal from "@/app/(workspace)/workspace/[orgId]/appointment/_components/NewAppointmentModal";
import { AIPostGenerator } from "@/app/(workspace)/workspace/[orgId]/content/_components/AIPostGenerator";
import { DeletePost } from "@/app/(workspace)/workspace/[orgId]/content/_components/DeletePostModal";
import NewPost from "@/app/(workspace)/workspace/[orgId]/content/_components/NewPost";
import { PreviewDialouge } from "@/app/(workspace)/workspace/[orgId]/content/_components/post-generator/components/PreviewDialouge";
import { AddInvoice } from "@/app/(workspace)/workspace/[orgId]/invoice/_components/AddInvoice";
import { DeleteUser } from "@/app/(workspace)/workspace/[orgId]/management/user/DeleteModal";
import { EditUser } from "@/app/(workspace)/workspace/[orgId]/management/user/EditModal";
import { DeletePatient } from "@/app/(workspace)/workspace/[orgId]/patient/_component/DeleteModal";
import PatientCrudModal from "@/app/(workspace)/workspace/[orgId]/patient/_component/PatientCrudModal";
import DeleteServerModal from "@/app/(workspace)/workspace/_components/DeleteServerModal";
import InviteModal from "@/app/(workspace)/workspace/_components/InviteModal";
import LeaveServerModal from "@/app/(workspace)/workspace/_components/LeaveServerModal";
import ManageAccount from "@/app/(workspace)/workspace/_components/ManageAccount";
import { useEffect, useState } from "react";





export const OrgModalProvider = () => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <>
            <AddMemberModal />
            <NewOrgModal />
            <InviteModal />

            <LeaveServerModal />
            <DeleteServerModal />
            <AddAppointmentModal />
            <AppointmentCrud />


            <ManageAccount />
            <EditUser />
            <DeleteUser />

            <DeleteOrdModal />


            <SettingsModal />

            <PatientCrudModal />
            <DeletePatient />

            <AddInvoice />

            <NewPost />

            <AIPostGenerator />
            <PreviewDialouge />

            <NewAppointmentModal />

            {/* <DeletePost /> */}

        </>
    )
}