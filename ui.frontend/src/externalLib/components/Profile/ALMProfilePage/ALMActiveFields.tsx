import { Item, Picker, Switch, TextField } from "@adobe/react-spectrum";
import { maxHeaderSize } from "http";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { PrimeDropdown } from "../..";
import { AccountActiveFields, PrimeUser } from "../../../models";
import styles from "./ALMActiveFields.module.css";

const ALMActiveFields: React.FC<{
  activeFields: string;
  description: string;
  title: string;
  user: PrimeUser;
  accountActiveFields: AccountActiveFields;
  onActiveFieldUpdate: Function;
  onActiveFieldSwitchValueUpdate: Function;
  userFieldData: any
}> = (props) => {
  // const { formatMessage } = useIntl();
  // const config = getALMConfig();

  const { activeFields, description, title, user, accountActiveFields, onActiveFieldUpdate, onActiveFieldSwitchValueUpdate, userFieldData } = props;

  const [activeFieldSwitchList, setActiveFieldSwitchList] = useState([false]);

  useEffect(() => {
    let isSelectedActiveFieldList: any = [];
    fields?.map((activeField) => {
      activeField?.allowedValues.map((allowedValue) => {
        let present: boolean = false;
        let userFields: any = user.fields;
        let switchCollection = userFields[activeField.name];

        for (let i = 0; i < switchCollection.length; i++) {
          if (switchCollection[i] === allowedValue) {
            isSelectedActiveFieldList.push(true);
            present = true;
          }
        }
        if (present == false) {
          isSelectedActiveFieldList.push(false);
        }
      });
    });
    setActiveFieldSwitchList(isSelectedActiveFieldList);
  }, [user]);

  const updateActiveFieldSwitchList = (index: any, value: boolean) => {
    let activeFieldSwitchListTemp = [...activeFieldSwitchList];
    activeFieldSwitchListTemp[index] = value;
    setActiveFieldSwitchList(activeFieldSwitchListTemp);
  }

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
            interface dropDown {
              id: string;
              name: string;
            }
            const dropDownValue = () => {
              if (showDropdown) {
                let options: dropDown[] = [];
                activeField?.allowedValues.map((allowedValue) => {
                  let obj: dropDown = { id: "", name: "" };
                  obj.id = allowedValue;
                  obj.name = allowedValue;
                  options.push(obj);
                });
                return options;
              }
            };

            return (
              <React.Fragment key={activeField.name}>
                <div className={styles.activeFieldSectionBottom}>
                  <div className={styles.activeFieldName}>
                    {activeField.name}
                  </div>
                  <div>
                    {showTextField && !isMultiValue && (
                      <TextField
                        value={userFieldData.fields[activeField.name]}
                        onChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        width={"115%"}
                        height={"38px"}
                      />
                    )}
                    {showDropdown && (
                      <Picker
                        items={dropDownValue()}
                        onSelectionChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        selectedKey={userFieldData.fields[activeField.name]}
                      >
                        {(item) => <Item>{item.name}</Item>}
                      </Picker>
                    )}
                    {isMultiValuedTextField && (
                      <TextField
                        value={userFieldData.fields[activeField.name]}
                        onChange={(value) => {
                          onActiveFieldUpdate(value, activeField.name);
                        }}
                        width={"115%"}
                        height={"38px"}
                        UNSAFE_className={styles.customInput}
                      />
                    )}
                    {hasPredefinedMultiValues &&
                      activeField?.allowedValues.map((allowedValue, index) => {
                        return (
                          <div className={styles.alignSwitchItem}>
                            <span className={styles.allowedActiveFieldValues}>
                              {allowedValue}
                            </span>
                            <span>No</span>
                            <Switch
                              isEmphasized
                              width={"50px"}
                              left={"20px"}
                              UNSAFE_className={styles.switchSize}
                              isSelected={activeFieldSwitchList[index]}
                              onChange={(value) => {
                                updateActiveFieldSwitchList(index, value);
                                onActiveFieldSwitchValueUpdate(
                                  allowedValue,
                                  value,
                                  activeField.name
                                );
                              }}
                            ></Switch>
                            <span>Yes</span>
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
