import styles from "./PrimeCommunityMobileScrollToTop.module.css";
import ChevronUp from "@spectrum-icons/workflow/ChevronUp";

const PrimeCommunityMobileScrollToTop = (props: any) => {
    return (
        <>
            <div className={styles.primeCommunityTopBack} onClick={() => window.scrollTo(0,0)}>
                <button className={styles.primeCommunityScrollToTopButton}>
                    <ChevronUp></ChevronUp>
                </button>
            </div>
        </>
    );
};
export default PrimeCommunityMobileScrollToTop;