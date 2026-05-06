"use client";

import axios from "@/utils/axios";
import { data } from "autoprefixer";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const EcommContext = createContext(null);

export const EcommProvider = ({ children, appIdentifier }) => {

    const [appConfig, setAppConfig] = useState({id:'',appIdentifier:'',storeName:'',storeId:'',webhookUrl:'',apiKey:''});
    const [storeInfo,setStoreInfo] = useState(null);

    useEffect(() => {
        if (appIdentifier) {
            //fetchConfig();
        }
    }, [appIdentifier]);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(`/api/workspace/ecommerce/config/${appIdentifier}`);
            console.log('Ecomm Config Response:', res.data);
            if (res.data.success) {
                setAppConfig(res.data.config);
                // After getting config, fetch store info if needed
                if (res.data.config.webhookUrl) {
                    fetchStoreInfo(res.data.config);
                }
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
            toast.error("Failed to load store configuration");
        }
    };

    const fetchStoreInfo = async (config) => {
        try {
            const res = await axios.post(config.webhookUrl, config);
            if (res.data.success) {
                setStoreInfo(res.data.store);
            }
        } catch (error) {
            console.error('Failed to fetch store info:', error);
            // toast.error("Failed to connect to store engine");
        }
    };

    return (
        <EcommContext.Provider value={{ storeInfo, appConfig,appIdentifier }}>
            {children}
        </EcommContext.Provider>
    );
};

export const useEcomm = () => useContext(EcommContext)