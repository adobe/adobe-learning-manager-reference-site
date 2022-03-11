import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { useIntl } from "react-intl";
import Edit from "@spectrum-icons/workflow/Edit";
import { useProfile } from "../../../hooks";

import styles from "./ALMProfilePage.module.css";
import ALMBackButton from "../../Common/ALMBackButton/ALMBackButton";
import { useRef } from "react";

const ALMProfilePage = () => {
  const { formatMessage } = useIntl();
  const { user, updateProfileImage } = useProfile();
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

  const startFileUpload = () => {
    (inputRef?.current as HTMLInputElement)?.click();
  };

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <div className={styles.pageContainer}>
        <div className={styles.upperSectionContainer}>
          <section className={styles.upperSection}>
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
      </div>
    </Provider>
  );
};

export default ALMProfilePage;
