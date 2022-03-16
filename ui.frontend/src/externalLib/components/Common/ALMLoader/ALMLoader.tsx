import loadingImage from "../../../assets/images/LoadingButton.gif";

import styles from "./ALMLoader.module.css";

const ALMLoader: React.FC<{ classes?: string }> = ({ classes = "" }) => {
  const loadingContainerClass = `${styles.loadingContainer} ${classes}`;
  return (
    <section className={loadingContainerClass}>
      <img src={loadingImage} alt="loading"></img>
    </section>
  );
};

export default ALMLoader;
