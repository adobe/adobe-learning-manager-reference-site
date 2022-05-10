import { Button, TextField } from "@adobe/react-spectrum";
import React, { useEffect, useState } from "react";
import { useAddressBook } from "../../hooks/AddressBook/useAddressBook";
import { getCartId } from "../../utils/global";
import CommerceLoader from "../Common/Loader";
import styles from "./addressBook.module.css";

const REQUIRED_ERROR_MESSAGE = "Is required";
function AddressBook({ props }) {
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
          city: { value: defaultBillingAddress.city },
          firstName: { value: defaultBillingAddress.firstname },
          middleName: { value: defaultBillingAddress.middleName || "" },
          lastName: { value: defaultBillingAddress.lastname },
          country_code: { value: defaultBillingAddress.country_code },
          streetAddress: { value: street1 },
          streetAddress2: { value: "" },
          region: { value: defaultBillingAddress.region?.region_id },
          postcode: { value: defaultBillingAddress.postcode },
          telephone: { value: defaultBillingAddress.telephone },
        };
      });
    }
  }, [defaultBillingAddress]);

  // useEffect(() => {
  //     if(doeCartHasBillingAddress)
  // }, [doeCartHasBillingAddress])

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
        streetAddress2: streetAddress2.value,
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
      <form className={styles.formContainer}>
        <div className={styles.row}>
          <div className={styles.half}>
            <TextField
              label="First Name"
              value={firstName.value}
              width={"100%"}
              onChange={(value) => changeHandler("firstName", value)}
              validationState={getValidationState(firstName.value)}
              errorMessage={firstName.error}
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
            />
          </div>
          <div className={styles.half}>
            <label htmlFor="country" className={styles.label}>
              Country
            </label>
            <select
              id="country"
              className={styles.select}
              value={country_code.value}
              onChange={(event) =>
                changeHandler("country_code", event.target.value)
              }
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
            />
          </div>
          <div className={styles.half}>
            <label htmlFor="region" className={styles.label}>
              State
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
            />
          </div>
        </div>

        {/* <div className={styles.row}>
                    <div className={styles.half}>
                        <Checkbox value={save_in_address_book} onChange={(value) => changeHandler('save_in_address_book', value)}>
                            Save Address in Profile
                        </Checkbox>
                    </div>
                </div> */}

        <div className={styles.row}>
          <div className={styles.half}></div>
          <div className={`${styles.half} ${styles.actionButton}`}>
            {!doeCartHasBillingAddress ? (
              <Button
                variant="cta"
                type="button"
                onPress={submitHandler}
                isDisabled={addBillingAddressLoading}
              >
                {addBillingAddressLoading ? (
                  <CommerceLoader size="S" />
                ) : (
                  "Add Billing Address"
                )}
              </Button>
            ) : (
              <Button variant="cta" type="button" isDisabled={true}>
                Billing Address added
              </Button>
            )}
          </div>
        </div>
      </form>
    </section>
  );
}

export default AddressBook;
