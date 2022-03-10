import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBackBanner.module.css";
import ChevronLeft from "@spectrum-icons/workflow/ChevronLeft";

const PrimeCommunityBackBanner = (props: any) => {
    const { formatMessage } = useIntl();
    return (
        <>
            <div className={styles.primeCommunityTopRow}>
                <div className={styles.primeCommunityTopBack} onClick={() => window.history.back()}>
                    <div className={styles.primeCommunityChevronLeftSvg}>
                        <ChevronLeft></ChevronLeft>
                    </div>
                    <button className={styles.primeCommunityBackButton}>
                        {formatMessage({id: "prime.community.back.label", defaultMessage: "Back",})}    
                    </button>
                </div>
            </div>
        </>
    );
};
export default PrimeCommunityBackBanner;