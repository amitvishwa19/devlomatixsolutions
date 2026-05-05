"use client";

import axios from "@/utils/axios";
import { data } from "autoprefixer";
import React, { createContext, useContext, useEffect, useMemo } from "react";
import { toast } from "sonner";

const EcommContext = createContext(null);

export const EcommProvider = ({ children,appConfig}) => {
     
    
    const value = useMemo(() => {
        return {
            appConfig,
        };
    }, [appConfig]);

    useEffect(() => {
        console.log('EcommProvider mounted with config:', appConfig);
        storeInf()
    }, [appConfig]);

    const storeInf=async() =>{
        try {
            const res= await axios.post(appConfig?.webhookUrl,appConfig)
                console.log('App config stored:', res.data);
        } catch (error) {
            toast.error("Failed to connect  to store, Invalid Configuration");
        }
        
    }
    



    console.log('app-config',value)

    return (
        <EcommContext.Provider value={value} appConfig={appConfig}>
            {children}
        </EcommContext.Provider>
    );
};

export const useEcomm = () => useContext(EcommContext)