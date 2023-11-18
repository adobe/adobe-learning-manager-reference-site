import {
  Content,
  Heading,
  Text,
  Flex,
  Header,
  Provider,
  defaultTheme,
} from "@adobe/react-spectrum";
import { Dialog, DialogContainer } from "@react-spectrum/dialog";
import { useState } from "react";
import styles from "./PrimeAnnouncement.module.css";
import { modifyTimeDDMMYY } from "../../../utils/dateTime";
import { useIntl } from "react-intl";
import { Image, View, Grid } from "@adobe/react-spectrum";
import { PrimeAnnouncement, PrimeUserNotification } from "../../../models";
import { ALMLoader } from "../../Common/ALMLoader";
import { getALMConfig, getAccessToken } from "../../../utils/global";
import Apos from "../../../assets/images/aposInv.svg";
import { VIDEO } from "../../../utils/constants";

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

const PrimeAnnouncementContainer: React.FC<{
  notifications: PrimeUserNotification;
  setAnnouncementOpen: Function;
}> = (props: any) => {
  const { locale, formatMessage } = useIntl();
  const notif = props.notifications as PrimeUserNotification;
  const ann = notif?.announcement as PrimeAnnouncement;
  const { description, contentType, contentUrl, sentDate, contentId } = ann;

  const assetId = notif?.modelIds[0];
  const assetType = notif?.modelTypes[0];

  const config = getALMConfig();
  const token = getAccessToken();

  const iframeSrc = `${config.almBaseURL}/app/videoplayer?videoId=${contentId}&context=formal&asset_id=${assetId}&asset_type=${assetType}&csrf_token=${token}&player_type=inline`;

  const [isOpen, setOpen] = useState(true);
  const clickHandler = () => {
    setOpen(false);
    props?.setAnnouncementOpen(false);
  };
  const handleKeyPress = (event: any) => {
    if (event.code === "Enter") {
      clickHandler();
    }
  };
  const videoHtml =
    contentType === VIDEO ? (
      <iframe
        className={styles.primePostVideoIframe}
        src={iframeSrc}
        allow="autoplay"
        frameBorder="0"
        allowFullScreen={true}
        loading="lazy"
        title="primePostVideo"
      ></iframe>
    ) : (
      <ALMLoader />
    );

  return (
    <Provider theme={defaultTheme}>
      <DialogContainer
        isDismissable
        full
        onDismiss={() => clickHandler()}
        {...props}
      >
        {isOpen && (
          <Dialog UNSAFE_className={styles.dialog}>
            <Content UNSAFE_className={styles.contentBody}>
              <Heading UNSAFE_className={styles.heading}>
                <Grid
                  areas={["first content second"]}
                  justifyContent="center"
                  columns={["1fr", "3fr", "auto"]}
                >
                  <View gridArea="first">
                    <Image src={Apos} UNSAFE_className={styles.apos}></Image>
                  </View>
                  <View gridArea="content">
                    <div className={styles.header}>
                      <Text width={10} UNSAFE_className={styles.title}>
                        {formatMessage(
                          {
                            id: "alm.announcement.descriptionText",
                            defaultMessage: description,
                          },
                          { desc: description }
                        )}
                      </Text>
                      <div className={styles.subTitle}>
                        {formatMessage({
                          id: "alm.text.sentOn",
                          defaultMessage: "Sent On ",
                        })}
                        {modifyTimeDDMMYY(sentDate, locale)}
                      </div>
                    </div>
                  </View>
                  <View gridArea="second">
                    <Image src={Apos} UNSAFE_className={styles.aposInv}></Image>
                  </View>
                </Grid>
              </Heading>
              <Flex justifyContent="center">
                <Image src={contentUrl} objectFit={true} />
                {contentType === VIDEO && videoHtml}
              </Flex>
            </Content>
          </Dialog>
        )}
      </DialogContainer>
    </Provider>
  );
};

export default PrimeAnnouncementContainer;
