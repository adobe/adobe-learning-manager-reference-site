import { useState } from "react";
import { PrimeAccount, PrimeCatalog, PrimeUser } from "../../../models";
import { GetTileColorFromIndex } from "../../../utils/themes";
import { Widget } from "../../../utils/widgets/common";
import styles from "./ALMBrowseCatalog.module.css";
import { getALMObject } from "../../../utils/global";

const ALMBrowseCatalog: React.FC<{
  widget?: Widget;
  catalog: PrimeCatalog;
  account: PrimeAccount;
  user: PrimeUser;
  index: number;
}> = ({ catalog, index }) => {
  const [tileColor] = useState<string>(() => {
    return GetTileColorFromIndex(index);
  });

  const getBackgroundStyle = () => {
    const imageUrl = catalog.imageUrl || "";
    return imageUrl ? { backgroundImage: `url(${imageUrl})` } : { backgroundColor: tileColor };
  };

  const cardClickHandler = () => {
    getALMObject().navigateToCatalogPage({ selectedListableCatalogIds: catalog.id });
  };
  return (
    <button
      className={`${styles.card} ${catalog.imageUrl ? styles.hasImage : ""}`}
      style={{ ...getBackgroundStyle() }}
      onClick={cardClickHandler}
      data-automationid={catalog.name}
      aria-label={catalog.name}
    >
      <span className={styles.textContainer}>{catalog.name}</span>
    </button>
  );
};

export default ALMBrowseCatalog;
