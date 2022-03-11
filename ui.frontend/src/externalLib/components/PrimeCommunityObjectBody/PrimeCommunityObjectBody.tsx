import { getALMConfig, getALMObject } from "../../utils/global";
import styles from "./PrimeCommunityObjectBody.module.css";
import { useState } from "react";
import { useIntl } from "react-intl";

const PrimeCommunityObjectBody = (props: any) => {
  const { formatMessage } = useIntl();
  const object = props.object;
  const entityType = props.type;
  const description = entityType === "board" ? object.richTextdescription : object.richText;
  const primeConfig = getALMConfig();
  const hostName = primeConfig.almBaseURL;
  //to-do set below host url
  const iframeSrc = `https://captivateprimedev.adobe.com/app/player?entity_type=${entityType}&entity_id=${object.id}&access_token=${getALMObject().getAccessToken()}&player_type=inline`;
  console.log(iframeSrc);

  const MAX_CHAR_SHOWN = 450;
  const DEFAULT_INDEX_VALUE = 2;
  const [ viewIndex, setViewIndex ] = useState(DEFAULT_INDEX_VALUE);
  const [ viewMore, setViewMore ] = useState(description.length > MAX_CHAR_SHOWN);
  const [ currentDescription, setCurrentDescription ] = useState(description.length > MAX_CHAR_SHOWN ? description.substring(0, MAX_CHAR_SHOWN) : description);
  const getTruncatedDescription = () => {
    const supportedCharacterLength = MAX_CHAR_SHOWN * viewIndex;
    if(description.length <= supportedCharacterLength) {
      setViewMore(false);
      setCurrentDescription(description);
      setViewIndex(DEFAULT_INDEX_VALUE);
    }
    else
      setCurrentDescription(description.substring(0, supportedCharacterLength));
      setViewIndex(viewIndex + 1);
  }

  return (
    <>
      <p
        className={styles.primePostDescription}
        dangerouslySetInnerHTML={{ __html: currentDescription }}
      ></p>
      {viewMore &&
        <button className={styles.primeCommunityViewMoreButton} onClick={getTruncatedDescription}>
          {formatMessage({
            id: "prime.community.viewMore",
            defaultMessage: "View more",
          })}
        </button>
      }
      <div className={styles.primePostPreview}>
        {object.resource && object.resource.contentType === "VIDEO" && (
          <div className="image-box">
            <div className="image-container">
              <iframe
                className={styles.primePostVideoIframe}
                src={iframeSrc}
                // webkitAllowFullScreen="true"
                // mozallowfullscreen="true"
                // msallowfullscreen="true"
                allow="autoplay"
                frameBorder="0"
                loading="lazy"
                title="primePostVideo"
              ></iframe>
            </div>
          </div>
        )}

        {object.resource && object.resource.contentType === "IMAGE" && (
          <div className={styles.primeCommunityImageBox}>
            <div className={styles.primeCommunityImageContainer}>
              <img
                src={object.resource.data!}
                loading="lazy"
                className={styles.primePostImage}
                alt="primePostImage"
              />
            </div>
          </div>
        )}

        {object.resource && object.resource.contentType === "AUDIO" && (
          <div className="image-box">
            <div className="image-container">
              <iframe
                className={styles.primePostVideoIframe}
                src={iframeSrc}
                // allowFullScreen={true}
                // webkitAllowFullScreen={true}
                // mozAllowFullScreen={true}
                // webkitallowfullscreen="true"
                // mozallowfullscreen="true"
                // msallowfullscreen="true"
                allowFullScreen
                allow="autoplay"
                loading="lazy"
                title="primePostAudio"
              ></iframe>
            </div>
          </div>
        )}

        {object.resource &&
          ["PDF", "XLS", "PPTX", "DOC"].includes(
            object.resource.contentType
          ) && (
            <div className="image-box">
              <div className="image-container">
                <iframe
                  className={styles.primePostVideoIframe}
                  src={iframeSrc}
                  allow="autoplay"
                  // webkitallowfullscreen="true"
                  // mozallowfullscreen="true"
                  // msallowfullscreen="true"
                  loading="lazy"
                  title="primePostStatic"
                ></iframe>
              </div>
            </div>
          )}
      </div>
    </>
  );
};
export default PrimeCommunityObjectBody;
