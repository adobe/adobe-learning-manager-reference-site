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
import { Item, Picker, Switch, TextField } from "@adobe/react-spectrum";
import React from "react";
import { AccountActiveFields, PrimeUser } from "../../../models";
import styles from "./ALMActiveFields.module.css";

const ALMActiveFields: React.FC<{
  activeFields: string;
  description: string;
  title: string;
  user: PrimeUser;
  accountActiveFields: AccountActiveFields;
  onActiveFieldUpdate: Function;
  onSwitchValueUpdate: Function;
  updateSelectedMultiValues: Function;
  userFieldData: any;
  predefinedMultiValues: any;
}> = (props) => {
  // const { formatMessage } = useIntl();
  // const config = getALMConfig();

  const {
    activeFields,
    description,
    title,
    user,
    accountActiveFields,
    onActiveFieldUpdate,
    onSwitchValueUpdate,
    updateSelectedMultiValues,
    userFieldData,
    predefinedMultiValues,
  } = props;

  const configuredActiveFields = activeFields
    ? activeFields.split(",").map((item) => item.trim())
    : [];

  const fields = accountActiveFields.fields?.filter((activeField) => {
    return configuredActiveFields.indexOf(activeField.name) !== -1;
  });

  console.log(fields);
  return (
    <>
      {title && (
        <section className={styles.activeFields}>
          <div className={styles.title}>{title}</div> <hr />
          <div className={styles.description}>{description}</div>
          {fields?.map((activeField) => {
            const allowedValuesPresent = activeField.allowedValues.length > 0;
            const isMultiValue = activeField.isMultiValue;
            const showTextField = !allowedValuesPresent;
            const showDropdown = allowedValuesPresent && !isMultiValue;
            const isMultiValuedTextField = isMultiValue && showTextField;
            const hasPredefinedMultiValues =
              isMultiValue && allowedValuesPresent;
            let textFieldValues =
              JSON.stringify(userFieldData?.fields) === "{}" ||
              userFieldData?.fields == undefined
                ? null
                : userFieldData?.fields[activeField.name];
            interface dropDown {
              id: string;
              name: string;
            }
            const fields = userFieldData.fields;
            let fieldValue = "";
            if (fields) {
              fieldValue = fields[activeField.name];
            }
            const dropDownValue = () => {
              if (showDropdown) {
                let options: dropDown[] = [];
                activeField?.allowedValues.map((allowedValue) => {
                  let option: dropDown = { id: "", name: "" };
                  option.id = allowedValue;
                  option.name = allowedValue;
                  options.push(option);
                });
                return options;
              }
            };
            return (
              <React.Fragment key={activeField.name}>
                <div className={styles.activeFieldSectionBottom}>
                  <div className={styles.activeFieldName}>
                    {activeField.name}
                    {isMultiValuedTextField || hasPredefinedMultiValues ? (
                      <div className={styles.multiValueLabelText}>
                        (Supports one or more
                        <span className={styles.multiValueLabelText}>
                          values)
                        </span>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                  <div>
                    {showTextField && !isMultiValue && (
                      <TextField
                        value={textFieldValues}
                        placeholder="Type here..."
                        onChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        UNSAFE_className={styles.textFieldAlign}
                      />
                    )}
                    {showDropdown && (
                      <Picker
                        items={dropDownValue()}
                        onSelectionChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        selectedKey={
                          JSON.stringify(userFieldData?.fields) === "{}" ||
                          userFieldData?.fields == undefined
                            ? null
                            : userFieldData?.fields[activeField.name]
                        }
                      >
                        {(item) => <Item>{item.name}</Item>}
                      </Picker>
                    )}
                    {isMultiValuedTextField && (
                      <TextField
                        value={textFieldValues}
                        placeholder="Use comma to separate multiple values"
                        onChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        UNSAFE_className={styles.textFieldAlign}
                      />
                    )}
                    {hasPredefinedMultiValues &&
                      activeField?.allowedValues.map((allowedValue, index) => {
                        return (
                          <div className={styles.alignSwitchItem}>
                            <span className={styles.allowedActiveFieldValues}>
                              {allowedValue}
                            </span>
                            <span
                              style={
                                predefinedMultiValues?.get(allowedValue)
                                  ? { fontWeight: "normal" }
                                  : { fontWeight: "bold" }
                              }
                            >
                              No
                            </span>
                            <Switch
                              isEmphasized
                              UNSAFE_className={styles.switch}
                              isSelected={predefinedMultiValues?.get(
                                allowedValue
                              )}
                              onChange={(value) => {
                                updateSelectedMultiValues(allowedValue, value);
                                onSwitchValueUpdate(
                                  allowedValue,
                                  value,
                                  activeField.name
                                );
                              }}
                            ></Switch>
                            <span
                              style={
                                predefinedMultiValues?.get(allowedValue)
                                  ? { fontWeight: "bold" }
                                  : { fontWeight: "normal" }
                              }
                            >
                              Yes
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </section>
      )}
    </>
  );
};

export default ALMActiveFields;
