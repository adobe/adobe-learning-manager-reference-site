import { Button, lightTheme, Provider } from "@adobe/react-spectrum";
import { useIntl } from "react-intl";
import Edit from "@spectrum-icons/workflow/Edit";
import { useProfile } from "../../../hooks";

import styles from "./ALMProfilePage.module.css";
import ALMBackButton from "../../Common/ALMBackButton/ALMBackButton";

const ALMProfilePage = () => {
  const { formatMessage } = useIntl();
  const { user } = useProfile();
  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <div className={styles.pageContainer}>
        <div className={styles.upperSectionContainer}>
          <section className={styles.upperSection}>
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
