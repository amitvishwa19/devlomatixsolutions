'use client'
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bed, Plus, RefreshCw, LayoutGrid, List, Sparkles, BarChart3, CalendarCheck, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAccommodation } from './hooks';
import { ContentTopbar } from '../../(misc)/_components/ContentTopbar'
import {
    OccupancyStatsCards,
    FloorPlanView,
    RoomListView,
    BedDetailSheet,
    AdmitPatientDialog,
    TransferPatientDialog,
    DischargePatientDialog,
    DischargeBillingDialog,
    HousekeepingPanel,
    AccommodationAnalytics,
    AccommodationFilters,
    WaitingListPanel,
    BedReservationPanel,
    AddRoomDialog,
    EditRoomDialog,
    DeleteRoomDialog,
    BedManagementDialog,
} from './components';





export default function AccomodationPage() {


    return (
        <div className='absolute inset-0 flex flex-col gap-2'>



            <ContentTopbar
                title='Bed & Room Management'
                description='Comprehensive hospital accommodation management system'
                icon='bed-double'

            />

            {/* Stats Cards */}
            <div>

            </div>

            <ScrollArea className='h-[85vh] flex flex-grow  rounded-md'>

            </ScrollArea>


        </div >
    )
}
