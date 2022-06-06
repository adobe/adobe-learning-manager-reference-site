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
import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { useProfile } from "../../hooks";
import {
  getALMConfig,
  getConfigurableAttributes,
  PrimeConfig,
} from "../../utils/global";
import { ALMErrorBoundary } from "../Common/ALMErrorBoundary";
import styles from "./ActiveFieldsContainter.module.css";
import ALMActiveFields from "./ALMActiveFields";

const getActiveFieldAttributes = (config: PrimeConfig) => {
  let cssSelector = config.mountingPoints.activeFieldsContainer;
  const activeFieldAttributes = getConfigurableAttributes(cssSelector) || {};
  return activeFieldAttributes;
};

const ActiveFieldsContainter = () => {
  const { formatMessage } = useIntl();
  const config = getALMConfig();
  const {
    profileAttributes,
    updateAccountActiveFields,
    userFieldData,
    setUserFieldData,
  } = useProfile();
  const { user, accountActiveFields } = profileAttributes;
  const [predefinedMultiValues, setPredefinedMultiValues] = useState(new Map());

  const activeFieldAttributes = getActiveFieldAttributes(config);
  const {
    section1ActiveFields,
    section1Description,
    section1Title,
    section2ActiveFields,
    section2Description,
    section2Title,
  } = activeFieldAttributes;

  let showActiveFieldButton = accountActiveFields?.fields || user.fields;

  useEffect(() => {
    let multiValues: any;
    let selectedMultiValues = new Map();
    const userFields: any = user.fields;
    if (userFields == undefined) {
      accountActiveFields?.fields?.map((field: any) => {
        selectedMultiValues.set(field, false);
      });
      setPredefinedMultiValues(selectedMultiValues);
    } else {
      accountActiveFields?.fields?.map((activeField) => {
        if (activeField.allowedValues.length > 0 && activeField.isMultiValue) {
          if (userFields[activeField.name] != undefined) {
            multiValues = userFields[activeField.name].filter((value: string) =>
              activeField.allowedValues.includes(value)
            );
          }
          multiValues?.map((multiValue: any) => {
            selectedMultiValues.set(multiValue, true);
          });
        }
      });
      setPredefinedMultiValues(selectedMultiValues);
    }
  }, [user]);

  const updateSelectedMultiValues = (allowedValue: any, value: boolean) => {
    let selectedMultiValues = new Map(predefinedMultiValues);
    selectedMultiValues.set(allowedValue, value);
    setPredefinedMultiValues(selectedMultiValues);
  };

  const onActiveFieldUpdate = (value: string, name: string) => {
    let fields: any = userFieldData.fields || {};
    fields[name] = value;
    setUserFieldData({ fields });
  };

  const onSwitchValueUpdate = (
    attrName: string,
    attrValue: string,
    fieldName: string
  ) => {
    let fields: any = userFieldData.fields || {};
    if (attrValue) {
      if (!fields[fieldName]) {
        fields[fieldName] = [];
      }
      fields[fieldName].push(attrName);
    }
    // Remove the value from data if user switch off.
    else {
      fields[fieldName] = fields[fieldName]?.filter(
        (x: string) => x !== attrName
      );
      setUserFieldData({ fields });
    }
  };

  const UpdateAccountActiveFields = async () => {
    let data: any = userFieldData.fields;
    await updateAccountActiveFields(data, user?.id);
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <ALMActiveFields
            title={section1Title}
            description={section1Description}
            activeFields={section1ActiveFields}
            user={user}
            accountActiveFields={accountActiveFields}
            onActiveFieldUpdate={onActiveFieldUpdate}
            onSwitchValueUpdate={onSwitchValueUpdate}
            userFieldData={userFieldData}
            updateSelectedMultiValues={updateSelectedMultiValues}
            predefinedMultiValues={predefinedMultiValues}
          />
          <ALMActiveFields
            title={section2Title}
            description={section2Description}
            activeFields={section2ActiveFields}
            user={user}
            accountActiveFields={accountActiveFields}
            onActiveFieldUpdate={onActiveFieldUpdate}
            onSwitchValueUpdate={onSwitchValueUpdate}
            userFieldData={userFieldData}
            updateSelectedMultiValues={updateSelectedMultiValues}
            predefinedMultiValues={predefinedMultiValues}
          />
          {showActiveFieldButton && (
            <section className={styles.saveActiveFieldButton}>
              <hr />
              <div className={styles.activeFieldButtonContainer}>
                <Button
                  UNSAFE_className={styles.activeFieldsSaveOption}
                  variant="cta"
                  onPress={UpdateAccountActiveFields}
                >
                  {formatMessage({
                    id: "alm.profile.fields.saveProfileChanges",
                    defaultMessage: "Save Changes",
                  })}
                </Button>
              </div>
            </section>
          )}
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ActiveFieldsContainter;
