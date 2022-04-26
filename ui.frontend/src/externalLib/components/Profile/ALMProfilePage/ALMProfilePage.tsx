import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import Edit from "@spectrum-icons/workflow/Edit";
import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { useProfile } from "../../../hooks";
import {
  getALMConfig,
  getConfigurableAttributes,
  PrimeConfig,
} from "../../../utils/global";
import ALMBackButton from "../../Common/ALMBackButton/ALMBackButton";
import { ALMErrorBoundary } from "../../Common/ALMErrorBoundary";
import ALMActiveFields from "./ALMActiveFields";
import ALMSkillComponent from "./ALMSkillComponent";
import styles from "./ALMProfilePage.module.css";

const getActiveFieldAttributes = (config: PrimeConfig) => {
  let cssSelector = config.mountingPoints.profilePageContainer;
  const activeFieldAttributes = getConfigurableAttributes(cssSelector) || {};
  return activeFieldAttributes;
};

let userActiveFields : any = {};

const ALMProfilePage = () => {
  const { formatMessage } = useIntl();
  const config = getALMConfig();
  const { profileAttributes, updateProfileImage, updateAccountActiveFields, userFieldData, setUserFieldData} = useProfile();
  const { user, accountActiveFields } = profileAttributes;

  console.log("Active fields :: " + accountActiveFields);
  const activeFieldAttributes = getActiveFieldAttributes(config);

  const {
    section1ActiveFields,
    section1Description,
    section1Title,
    section2ActiveFields,
    section2Description,
    section2Title,
  } = activeFieldAttributes;


  const inputRef = useRef<null | HTMLInputElement>(null);
  const imageUploaded = async (event: any) => {
    let file: any;
    const fileList = (event.target as HTMLInputElement).files;
    for (let i = 0; i < fileList!.length; i++) {
      if (fileList![i].type.match(/^image\//)) {
        file = fileList![i];
        break;
      }
    }
    await updateProfileImage(file.name, file);
  };

  const onActiveFieldUpdate= (value: any,name:any)=>{ 
    userActiveFields[name] = value;
    let fields: any = userFieldData.fields;
    fields[name] = value;
    let data: any = {};
    data.fields = userFieldData.fields;
    setUserFieldData(data);
  }

  const onSwitchValueUpdate=(attrName:any ,attrValue:any, fieldName:any)=>{
    if (attrValue) {
      if (userActiveFields[fieldName] == undefined) {
        userActiveFields[fieldName] = [];
      }
      userActiveFields[fieldName].push(attrName);
    }
    // Remove the value from data if user switch off.
    else {
      userActiveFields[fieldName] = userActiveFields[fieldName].filter(
        (x: any) => x !== attrName
      );
    }
  }

  const UpdateAccountActiveFields=async (e: any)=>{
   await updateAccountActiveFields(userActiveFields,user?.id);
  }

  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  return (
    <ALMErrorBoundary>
      <Provider theme={lightTheme} colorScheme={"light"}>
        <div className={styles.pageContainer}>
          <div className={styles.userProfileContainer}>
            <section className={styles.userProfile}>
              <input
                type="file"
                id="uploadAvatar"
                accept="image/*"
                onChange={(event: any) => imageUploaded(event)}
                ref={inputRef}
              />
              <h1 className={styles.profileHeader}>Your Profile</h1>
              <ALMBackButton />
              <div className={styles.detailsContainer}>
                <div className={styles.image}>
                  <img
                    className={styles.profileImage}
                    src={user.avatarUrl}
                    alt="profile"
                  />
                  <Button
                    variant="primary"
                    isQuiet
                    UNSAFE_className={styles.button}
                    onPress={startFileUpload}
                  >
                    {formatMessage({
                      id: "prime.profile.change.image",
                      defaultMessage: "Change image",
                    })}
                  </Button>
                  <Button
                    variant="cta"
                    isQuiet
                    UNSAFE_className={styles.editIcon}
                    onPress={startFileUpload}
                  >
                    <Edit />
                  </Button>
                </div>
                <div className={styles.details}>
                  <h2 className={styles.name}>{user.name}</h2>
                  <h3 className={styles.email}>{user.email}</h3>
                </div>
              </div>
            </section>
          </div>

          <ALMSkillComponent></ALMSkillComponent>
          <ALMActiveFields
            title={section1Title}
            description={section1Description}
            activeFields={section1ActiveFields}
            user={user}
            accountActiveFields={accountActiveFields}
            onActiveFieldUpdate={onActiveFieldUpdate}
            onSwitchValueUpdate={onSwitchValueUpdate}
            userFieldData={userFieldData}
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
          />
          <section>
            <></><hr style={{ width: "1100px" }} />
            <div className={styles.activeFieldButtonContainer}>
              <Button
                UNSAFE_className={styles.activeFieldsSaveOption}
                variant="cta" onPress={UpdateAccountActiveFields}>
                {formatMessage({
                  id: "alm.profile.fields.saveProfileChanges",
                  defaultMessage: "Save Changes",
                })}
              </Button>
            </div>
          </section>
        </div>
      </Provider>
    </ALMErrorBoundary>
  );
};

export default ALMProfilePage;
