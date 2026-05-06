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
            fetchConfig();
        }
    }, [appIdentifier]);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(`https://dev.devlomatix.com/api/workspace/ecommerce/stores/config/${appIdentifier}`);
            console.log('Ecomm Config Response:', res.data);
            if (res.data.success) {
                console.log('Setting App Config:', res.data.config);
                setAppConfig(res.data.config);
                // After getting config, fetch store catalog
                if (res.data.config.storeId && res.data.config.webhookUrl) {
                    fetchCatalog(res.data.config);
                }
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
            // toast.error("Failed to load store configuration");
        }
    };

    const fetchCatalog = async (config) => {
        try {
            // webhookUrl is usually the base stores API path, e.g., .../ecommerce/stores
            const catalogUrl = `${config.webhookUrl}/${config.storeId}/catalog`;
            console.log('Fetching Catalog from:', catalogUrl);
            const res = await axios.get(catalogUrl);
            if (res.data.success) {
                setStoreInfo({
                    ...res.data.store,
                    catalog: res.data.catalog
                });
                console.log('Store Catalog Loaded:', res.data.catalog);
            }
        } catch (error) {
            console.error('Failed to fetch store catalog:', error.response?.data || error.message);
        }
    };

    return (
        <EcommContext.Provider value={{ storeInfo, appConfig,appIdentifier }}>
            {children}
        </EcommContext.Provider>
    );
};

export const useEcomm = () => useContext(EcommContext)