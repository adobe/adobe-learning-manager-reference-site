import { useCallback, useMemo } from 'react';
import { useQuery, useLazyQuery, useMutation } from '@apollo/client';
import {
    GET_COUNTRIES, GET_COUNTRY_REGIONS,
    ADD_DEFAULT_BILLING_ADDRESS, GET_ADDRESSES,
    SET_BILLING_ADDRESS
} from './addressBook.gql';



export const useAddressBook = (props) => {
    const { data: countriesData, error: fetchCountriesError } = useQuery(GET_COUNTRIES);
    const { data: addressData, error: fetchAddressesError } = useQuery(GET_ADDRESSES);
    const [fetchRegions, { error: fetchRegionsError, data: regionsData }] = useLazyQuery(GET_COUNTRY_REGIONS);
    const [addDefaultBillingAddress,
        { error: addBillingAddressError }
    ] = useMutation(ADD_DEFAULT_BILLING_ADDRESS);

    const [addBillingAddressOnCart,
        { error: addBillingAddressOnCartError }
    ] = useMutation(SET_BILLING_ADDRESS);



    const getCountryRegions = useCallback(async ({ code } = {}) => {
        await fetchRegions({
            variables: {
                code,
            },
        });

    }, [fetchRegions]);

    const addBillingAddress = useCallback(async (variables = {}) => {
        await addDefaultBillingAddress({
            variables
        });
        await addBillingAddressOnCart({ variables });

    }, [addBillingAddressOnCart, addDefaultBillingAddress]);


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
        defaultBillingAddress
    };
};