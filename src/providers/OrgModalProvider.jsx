"use client";

import { NewOrgModal } from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/NewOrgModal";
import AddMemberModal from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/_components/AddMemberModal";
import { DeleteOrdModal } from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/_components/DeleteOrdModal";
import SettingsModal from "@/app/(workspace)/workspace/[orgId]/(misc)/_components/settings/SettingsModal";
import { AIPostGenerator } from "@/app/(workspace)/workspace/[orgId]/(modules)/content/_components/AIPostGenerator";
import { PreviewDialouge } from "@/app/(workspace)/workspace/[orgId]/(modules)/content/_components/post-generator/components/PreviewDialouge";

import { DeletePatient } from "@/app/(workspace)/workspace/[orgId]/(modules)/patient/_component/DeleteModal";
import PatientCrudModal from "@/app/(workspace)/workspace/[orgId]/(modules)/patient/_component/PatientCrudModal";
import { AddInvoice } from "@/app/(workspace)/workspace/[orgId]/(modules)/payment/_components/AddInvoice";
import DeleteServerModal from "@/app/(workspace)/workspace/_components/general/DeleteServerModal";
import InviteModal from "@/app/(workspace)/workspace/_components/general/InviteModal";
import LeaveServerModal from "@/app/(workspace)/workspace/_components/general/LeaveServerModal";
import ManageAccount from "@/app/(workspace)/workspace/_components/general/ManageAccount";
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

            <ManageAccount />


            <DeleteOrdModal />


            <SettingsModal />

            <PatientCrudModal />
            <DeletePatient />

            <AddInvoice />

            <AIPostGenerator />
            <PreviewDialouge />


            {/* <DeletePost /> */}

        </>
    )
}