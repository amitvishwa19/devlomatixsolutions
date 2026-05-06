"use client";

import axios from "@/utils/axios";
import { data } from "autoprefixer";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const EcommContext = createContext(null);

export const EcommProvider = ({ children, appIdentifier,storeConfigUrl }) => {

    const [appConfig, setAppConfig] = useState({id:'',appIdentifier:'',storeName:'',storeId:'',webhookUrl:'',apiKey:''});
    const [storeInfo,setStoreInfo] = useState(null);
    const [loading,setLoading] = useState(true);
    const [showError,setShowError] = useState(false);

    const path = `${storeConfigUrl}/${appIdentifier}`

   

    useEffect(() => {
        if (appIdentifier) {
            fetchConfig();
        }
    }, [appIdentifier]);

    const fetchConfig = async () => {
        try {
            const res = await axios.get(path, {
                validateStatus: function (status) {
                    return status < 500; // Resolve only if the status code is less than 500
                }
            });

            if(res.status !== 200){
                return toast.error('Failed  to connect target store , please try again later');
            }

            if(res.status === 200){
                setAppConfig(res.data)
                setLoading(false);
            }

            console.log('fetching details', res.status);
        } catch (error) {
            setLoading(false)
            setShowError(true)
        }finally{
            setLoading(false)
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
        <EcommContext.Provider value={{ storeInfo, appConfig, appIdentifier, loading }}>
            {children}
        </EcommContext.Provider>
    );
};

export const useEcomm = () => useContext(EcommContext)