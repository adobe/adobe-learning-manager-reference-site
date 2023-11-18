/***
 *
 * Please Do not use this Component.
 */

import { useState } from "react";
import styles from "./Badgr.module.css";
import {
  ActionButton,
  Content,
  Dialog,
  DialogTrigger,
  Heading,
  Provider,
  Button,
  Picker,
  Item,
  lightTheme,
} from "@adobe/react-spectrum";
import { useIntl } from "react-intl";
import icon from "../../../assets/images/badgr.svg";

const Badgr = (props: any) => {
  const [instance, setInstance] = useState("");
  const { formatMessage } = useIntl();

  return (
    <Provider theme={lightTheme} colorScheme={"light"}>
      <DialogTrigger isDismissable>
        <ActionButton UNSAFE_className={styles.badgr}>
          <img className={styles.badgrIcon} src={icon} alt="" />
          {formatMessage({ id: "alm.badgr.configureBadgr" })}
        </ActionButton>
        {(close) => (
          <div className={styles.dialog}>
            <Dialog
              UNSAFE_className={styles.dialogBox}
              onDismiss={() => {
                close();
                setInstance("");
              }}
            >
              <Heading>
                <h3 className={styles.heading}>
                  {formatMessage({ id: "alm.badgr.configureBadgr" })}
                </h3>
              </Heading>
              <Content>
                <div className={styles.badgrBody}>
                  <div className={styles.row}>
                    <div className={styles.left}>
                      {formatMessage({ id: "alm.badgr.status" })}
                    </div>
                    <div className={styles.statusText}>
                      {formatMessage({ id: "alm.badgr.notConnected" })}
                    </div>
                  </div>
                  <div className={styles.rowSelect}>
                    <div className={styles.left}>
                      {formatMessage({ id: "alm.badgr.selectInstance" })}
                    </div>
                    <Picker
                      UNSAFE_className={styles.picker}
                      placeholder={formatMessage({
                        id: "alm.badgr.selectInstance",
                      })}
                      onSelectionChange={(key) => {
                        setInstance(JSON.stringify(key));
                      }}
                    >
                      <Item key="US">
                        {formatMessage({ id: "alm.badgr.region.us" })}
                      </Item>
                      <Item key="EU">
                        {formatMessage({ id: "alm.badgr.region.eu" })}
                      </Item>
                      <Item key="CA">
                        {formatMessage({ id: "alm.badgr.region.ca" })}
                      </Item>
                      <Item key="AU">
                        {formatMessage({ id: "alm.badgr.region.au" })}
                      </Item>
                    </Picker>
                    <Button
                      variant="primary"
                      UNSAFE_className={styles.btn}
                      isDisabled={!instance}
                    >
                      {formatMessage({ id: "alm.badgr.connect" })}
                    </Button>
                  </div>
                  <div className={styles.row}>
                    <div className={styles.note}>
                      {formatMessage({ id: "alm.badgr.note" })}
                    </div>
                  </div>
                </div>
              </Content>
            </Dialog>
          </div>
        )}
      </DialogTrigger>
    </Provider>
  );
};

export default Badgr;
