import { getALMConfig, getALMObject } from "../../../utils/global";
import styles from "./PrimeCommunityObjectBody.module.css";

const PrimeCommunityObjectBody = (props: any) => {
  const object = props.object;
  const entityType = props.type;
  const primeConfig = getALMConfig();
  const hostName = primeConfig.almBaseURL;
  //to-do set below host url
  const iframeSrc = `${
    primeConfig.almBaseURL
  }/app/player?entity_type=${entityType}&entity_id=${
    object.id
  }&access_token=${getALMObject().getAccessToken()}&player_type=inline`;
  console.log(iframeSrc);
  return (
    <>
      <p
        className={styles.primePostDescription}
        dangerouslySetInnerHTML={{ __html: object.richText }}
      ></p>
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
