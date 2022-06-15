/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { useCallback, useMemo, useEffect } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import { useNavigate } from "react-router-dom";

import {
    GET_COUNTRIES, GET_COUNTRY_REGIONS,
    ADD_DEFAULT_BILLING_ADDRESS, GET_ADDRESSES,
    SET_BILLING_ADDRESS
} from './addressBook.gql';
import { SIGN_IN_PATH } from "../../utils/constants";
import { getCommerceToken } from "../../utils/global";




export const useAddressBook = (props) => {
    let navigate = useNavigate();

    const { data: countriesData, error: fetchCountriesError } = useQuery(GET_COUNTRIES);
    const { data: addressData, loading: addressDataLoading, error: fetchAddressesError } = useQuery(GET_ADDRESSES);
    const [fetchRegions, { error: fetchRegionsError, data: regionsData }] = useLazyQuery(GET_COUNTRY_REGIONS);
    const [addDefaultBillingAddress,
        { error: addBillingAddressError }
    ] = useMutation(ADD_DEFAULT_BILLING_ADDRESS);

    const [addBillingAddressOnCart,
        { error: addBillingAddressOnCartError, data: addBillingAddressData, loading: addBillingAddressLoading }
    ] = useMutation(SET_BILLING_ADDRESS);

    const getCountryRegions = useCallback(async ({ code } = {}) => {
        await fetchRegions({
            variables: {
                code,
            },
        });

    }, [fetchRegions]);


    useEffect(() => {
        if (!getCommerceToken()) {
            navigate(SIGN_IN_PATH);
        }
    }, [navigate])

    const addBillingAddress = useCallback(async (input = {}) => {
        await addDefaultBillingAddress({
            variables: {
                address: input.address
            }
        });
        let request = {
            cart_id: input.cartId,
            "billing_address": {
                address: {
                    firstname: input.address.firstname,
                    lastname: input.address.lastname,
                    street: input.address.street,
                    city: input.address.city,
                    region: input.address.region["region_id"] || input.address.region["region"],
                    postcode: input.address.postcode,
                    country_code: input.address.country_code,
                    telephone: input.address.telephone
                }
            }
        }
        await addBillingAddressOnCart({
            variables: {
                request
            }
        });

    }, [addBillingAddressOnCart, addDefaultBillingAddress]);

    const doeCartHasBillingAddress = !!addBillingAddressData;

    const countries = useMemo(() => {
        if (countriesData?.countries) {
            let countries = countriesData.countries.filter((item) => item.full_name_english);
            return countries.sort((a, b) => a.full_name_english.localeCompare(b.full_name_english));
        }
        return []
    }, [countriesData]);

    const regions = useMemo(() => {
        if (regionsData?.country?.available_regions) {
            return regionsData.country.available_regions;
        }
        return []
    }, [regionsData]);

    const defaultBillingAddress = useMemo(() => {
        if (addressData?.customer?.addresses) {
            let defaultAddress = addressData?.customer?.addresses.filter((item) => item.default_billing);
            return defaultAddress && defaultAddress[0] ? defaultAddress[0] : {}
        }
        return {};
    }, [addressData]);


    const error = useMemo(
        () => {
            return {
                fetchCountries: fetchCountriesError?.message,
                fetchRegions: fetchRegionsError?.message,
                addBillingAddressError: addBillingAddressError?.message,
                fetchAddressesError: fetchAddressesError?.message,
                addBillingAddressOnCartError: addBillingAddressOnCartError?.message
            }
        },
        [fetchCountriesError?.message, fetchRegionsError?.message,
        addBillingAddressError?.message, fetchAddressesError?.message,
        addBillingAddressOnCartError?.message
        ]
    );
    return {
        error,
        countries,
        getCountryRegions,
        regions,
        addBillingAddress,
        defaultBillingAddress,
        adressLoading: addressDataLoading,
        addBillingAddressLoading,
        doeCartHasBillingAddress
    };
};