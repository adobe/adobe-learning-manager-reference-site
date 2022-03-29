import React from "react";
import { AccountActiveFields, PrimeUser } from "../../../models";
import styles from "./ALMActiveFields.module.css";

const ALMActiveFields: React.FC<{
  activeFields: string;
  description: string;
  title: string;
  user: PrimeUser;
  accountActiveFields: AccountActiveFields;
}> = (props) => {
  // const { formatMessage } = useIntl();
  // const config = getALMConfig();

  const { activeFields, description, title, user, accountActiveFields } = props;

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

            return (
              <React.Fragment key={activeField.name}>
                <div className={styles.activeFieldName}>{activeField.name}</div>
                {showTextField && !isMultiValue && (
                  <input type="text" defaultValue=""></input>
                )}
                {showDropdown && "Show dropdown"}
                {isMultiValuedTextField && "Show multi value text field"}
                {hasPredefinedMultiValues &&
                  "Show multi value with radio buttons"}
              </React.Fragment>
            );
          })}
        </section>
      )}
    </>
  );
};

export default ALMActiveFields;
