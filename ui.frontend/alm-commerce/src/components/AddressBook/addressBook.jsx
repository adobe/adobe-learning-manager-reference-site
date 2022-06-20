/**
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import { TextField, Form } from "@adobe/react-spectrum";
import React, { useEffect, useState } from "react";
import { useAddressBook } from "../../hooks/AddressBook/useAddressBook";
import { getCartId } from "../../utils/global";
import CommerceLoader from "../Common/Loader";
import styles from "./addressBook.module.css";

const mandatorySvg = (<svg class="spectrum-Icon_368b34 spectrum-UIIcon-Asterisk_368b34 spectrum-FieldLabel-requiredIcon_d2db1f" focusable="false" aria-hidden="true" role="img"><path d="M6.573 6.558c.056.055.092.13 0 .204l-1.148.74c-.093.056-.13.02-.167-.073L3.832 4.947l-1.87 2.055c-.02.037-.075.074-.13 0l-.889-.926c-.092-.055-.074-.111 0-.167l2.111-1.76-2.408-.906c-.037 0-.092-.074-.055-.167l.63-1.259a.097.097 0 0 1 .166-.036l2.111 1.37.13-2.704a.097.097 0 0 1 .111-.11L5.277.54c.092 0 .11.037.092.13l-.722 2.647 2.444-.74c.056-.038.111-.038.148.073l.241 1.37c.019.093 0 .13-.074.13l-2.556.204z"></path></svg>)

const REQUIRED_ERROR_MESSAGE = "Is required";
function AddressBook({ setCanPlaceOrder }) {
  const [state, setState] = useState({
    firstName: { value: "", error: REQUIRED_ERROR_MESSAGE },
    middleName: { value: "", error: REQUIRED_ERROR_MESSAGE },
    lastName: { value: "", error: REQUIRED_ERROR_MESSAGE },
    country_code: { value: "US", error: "" },
    streetAddress: { value: "", error: REQUIRED_ERROR_MESSAGE },
    streetAddress2: { value: "", error: REQUIRED_ERROR_MESSAGE },
    city: { value: "", error: REQUIRED_ERROR_MESSAGE },
    region: { value: "", error: REQUIRED_ERROR_MESSAGE },
    postcode: { value: "", error: REQUIRED_ERROR_MESSAGE },
    telephone: { value: "", error: REQUIRED_ERROR_MESSAGE },
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAddressAvailable, setIsAddressAvailable] = useState(false);

  const {
    firstName,
    city,
    country_code,
    lastName,
    middleName,
    postcode,
    region,
    streetAddress,
    streetAddress2,
    telephone,
  } = state;

  const {
    countries,
    getCountryRegions,
    regions,
    addBillingAddress,
    defaultBillingAddress,
    adressLoading,
    addBillingAddressLoading,
    doeCartHasBillingAddress,
  } = useAddressBook();

  useEffect(() => {
    getCountryRegions({ code: country_code.value });
  }, [country_code.value, getCountryRegions]);

  useEffect(() => {
    // console.log("inside default address useeffect", defaultBillingAddress);
    if (defaultBillingAddress?.firstname) {
      setState((prevState) => {
        const street1 = defaultBillingAddress.street?.length
          ? defaultBillingAddress.street[0]
          : "";
        const street2 =
          defaultBillingAddress.street?.length > 0
            ? defaultBillingAddress.street[1]
            : "";
        return {
          ...prevState,
          city: { ...prevState.city, value: defaultBillingAddress.city },
          firstName: { ...prevState.firstName, value: defaultBillingAddress.firstname },
          middleName: { ...prevState.middleName, value: defaultBillingAddress.middleName || "" },
          lastName: { ...prevState.lastName, value: defaultBillingAddress.lastname },
          country_code: { ...prevState.country_code, value: defaultBillingAddress.country_code },
          streetAddress: { ...prevState.streetAddress, value: street1 },
          streetAddress2: { ...prevState.streetAddress2, value: street2 },
          region: { ...prevState.region, value: defaultBillingAddress.region?.region_id },
          postcode: { ...prevState.postcode, value: defaultBillingAddress.postcode },
          telephone: { ...prevState.telephone, value: defaultBillingAddress.telephone },
        };
      });
      setIsAddressAvailable(true)
    }
  }, [defaultBillingAddress]);

  useEffect(() => {
    if (doeCartHasBillingAddress) {
      setCanPlaceOrder && setCanPlaceOrder(doeCartHasBillingAddress)
    }
  }, [doeCartHasBillingAddress, setCanPlaceOrder])

  const changeHandler = (key, value) => {
    setState((prevState) => {
      return { ...prevState, [key]: { ...prevState[key], value } };
    });
  };
  const submitHandler = async () => {
    setIsSubmitted(true);
    let isFormInvalid = Object.keys(state).some((key) => {
      if (key === "middleName" || key === "streetAddress2") {
        return false;
      }
      return state[key].value === "";
    });
    if (!isFormInvalid) {
      let request = {
        region: region.value,
        country_code: country_code.value,
        streetAddress: streetAddress.value,
        streetAddress2: streetAddress2.value || "",
        telephone: telephone.value,
        postcode: postcode.value,
        city: city.value,
        firstName: firstName.value,
        lastName: lastName.value,
        middleName: middleName.value,
        cardId: getCartId(),
      };
      await addBillingAddress(request);
    }
  };

  const getValidationState = (value = "") => {
    return isSubmitted && value.toString().trim() === "" && "invalid";
  };

  const getDropDownClass = (value) => {
    let className = styles.select;
    return getValidationState(value)
      ? `${className} ${styles.error}`
      : className;
  };

  if (adressLoading) {
    <CommerceLoader size="L" />;
  }
  return (
    <section className={styles.addressContainer}>
      <h1 className={styles.heading}>Add Billing Address</h1>
      <Form className={styles.formContainer}>
        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="First Name"
              value={firstName.value}
              width={"100%"}
              onChange={(value) => changeHandler("firstName", value)}
              validationState={getValidationState(firstName.value)}
              errorMessage={firstName.error}
              isRequired={true}
              UNSAFE_className={styles.mandatory}

            />
          </div>
          <div className={styles.half}>
            <TextField
              label="Middle Name"
              value={middleName.value}
              width={"100%"}
              onChange={(value) => changeHandler("middleName", value)}
            />
          </div>
        </div>
        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="Last Name"
              value={lastName.value}
              width={"100%"}
              onChange={(value) => changeHandler("lastName", value)}
              validationState={getValidationState(lastName.value)}
              errorMessage={lastName.error}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          </div>
          <div className={styles.half}>
            <label htmlFor="country" className={styles.label}>
              Country {mandatorySvg}
            </label>
            <select
              id="country"
              className={styles.select}
              value={country_code.value}
              onChange={(event) =>
                changeHandler("country_code", event.target.value)
              }
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            >
              {/* <option>--Select a Country--</option> */}
              {countries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.full_name_english}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="Street Address"
              value={streetAddress.value}
              width={"100%"}
              onChange={(value) => changeHandler("streetAddress", value)}
              validationState={getValidationState(streetAddress.value)}
              errorMessage={streetAddress.error}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          </div>
          <div className={styles.half}>
            <TextField
              label="Street Address 2"
              value={streetAddress2.value}
              width={"100%"}
              onChange={(value) => changeHandler("streetAddress2", value)}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="City"
              value={city.value}
              width={"100%"}
              onChange={(value) => changeHandler("city", value)}
              validationState={getValidationState(city.value)}
              errorMessage={city.error}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          </div>
          <div className={styles.half}>
            <label htmlFor="region" className={styles.label}>
              State
              {mandatorySvg}
            </label>
            <select
              id="region"
              className={getDropDownClass(region.value)}
              value={region.value}
              onChange={(event) => changeHandler("region", event.target.value)}
            >
              <option value="">--Select a State--</option>
              {regions.map((item) => (
                <option key={`region-${item.code}-${item.id}`} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <span className={styles.errorText}>
              {getValidationState(region.value) && region.error}
            </span>
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="ZIP / Postal Code"
              value={postcode.value}
              width={"100%"}
              onChange={(value) => changeHandler("postcode", value)}
              validationState={getValidationState(postcode.value)}
              errorMessage={postcode.error}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          </div>
          <div className={styles.half}>
            <TextField
              label="Phone Number"
              value={telephone.value}
              width={"100%"}
              validationState={getValidationState(telephone.value)}
              errorMessage={telephone.error}
              onChange={(value) => changeHandler("telephone", value)}
              isRequired={true}
              UNSAFE_className={styles.mandatory}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.half}></div>
          <div className={`${styles.half} ${styles.actionButton}`}>

            <button
              type="button"
              onClick={submitHandler}
              disabled={addBillingAddressLoading}
              className={`almButton primary`}
            >
              {addBillingAddressLoading ? (
                <CommerceLoader size="S" />
              ) : (
                isAddressAvailable ? "Confirm Billing Address" : "Add Billing Address"
              )}
            </button>
          </div>
        </div>
      </Form>
    </section>
  );
}

export default AddressBook;
