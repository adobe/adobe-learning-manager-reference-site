import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./ALMGoToTop.module.css";
import { getWindowObject } from "../../utils/global";
import { debounce } from "../../utils/catalog";
import { LEFT_ARROW_SVG } from "../../utils/inline_svg";

const scrollThreshold = 300;

const ALMGoToTop = () => {
  const [showGoToTopButton, setShowGoToTopButton] = useState(false);

  const toggleVisible = useCallback(() => {
    const showButton = document.documentElement.scrollTop > scrollThreshold;
    setShowGoToTopButton(showButton);
  }, []);

  useEffect(() => {
    const almWindowObject = getWindowObject();
    const debouncedScroll = debounce(toggleVisible, 100);
    almWindowObject.addEventListener("scroll", debouncedScroll);
    return () => {
      almWindowObject.removeEventListener("scroll", debouncedScroll);
    };
  }, [toggleVisible]);

  const scrollToTop = useCallback(() => {
    getWindowObject().scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  const classes = useMemo(() => {
    return showGoToTopButton ? `${styles.goToTopButton} ${styles.show}` : styles.goToTopButton;
  }, [showGoToTopButton]);

  return (
    <button onClick={scrollToTop} className={classes}>
      {LEFT_ARROW_SVG()}
    </button>
  );
};

export default ALMGoToTop;
