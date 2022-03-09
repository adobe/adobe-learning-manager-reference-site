import { useIntl } from "react-intl";
import styles from "./PrimeCommunityObjectOptions.module.css";
import { useRef, useEffect } from "react";
import { useUserContext } from "../../contextProviders";

const PrimeCommunityObjectOptions  = (props: any) => {
    const ref = useRef<any>();
    const { user } = useUserContext();
    const { formatMessage } = useIntl();

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            console.log(props.object.createdBy.id);
            console.log("userid=" + user.id);   //to-do user_id is empty
            if (ref.current && !ref.current.contains(event.target)) {
                props.toggleOptions && props.toggleOptions();
            }
        };
        document.addEventListener('click', handleClickOutside, true);
        return () => {
          document.removeEventListener('click', handleClickOutside, true);
        };
    });

    const deleteObjectHandler = () => {
        if(typeof props.deleteHandler === 'function') {
            props.deleteHandler();
        }

    }

    const reportObjectHandler = () => {
        if(typeof props.reportAbuseHandler === 'function') {
            props.reportAbuseHandler();
        }    
    }

    const editObjectHandler = () => {
        if(typeof props.editHandler === 'function') {
            props.editHandler();
        }    
    }

    return (
        <>
        <div ref={ref} className={styles.primeObjectOptionsList}>
            {props.object.createdBy.id === user.id &&
                <div className={styles.primeObjectRegularOption} onClick={editObjectHandler}>
                {
                    formatMessage({
                        id: "prime.community.board.edit",
                        defaultMessage: "Edit",
                    })
                }
                </div> 
            }
            <div className={styles.primeSeperator}></div>
            {props.object.createdBy.id === user.id &&
                <div className={styles.primeObjectCriticalOption} onClick={deleteObjectHandler}>
                {
                    formatMessage({
                        id: "prime.community.board.delete",
                        defaultMessage: "Delete",
                    })
                }
                </div> 
            }
            <div className={styles.primeObjectCriticalOption} onClick={reportObjectHandler}>
                {
                    formatMessage({
                        id: "prime.community.board.report",
                        defaultMessage: "Report",
                    })
                }
            </div>
        </div>
        </>
    );
};

export default PrimeCommunityObjectOptions;
