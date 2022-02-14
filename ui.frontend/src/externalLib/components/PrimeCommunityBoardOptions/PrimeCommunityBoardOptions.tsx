import { useBoardOptions } from "../../hooks/community";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBoardOptions.module.css";
import { useRef, useEffect } from "react";

const PrimeCommunityBoardOptions  = (props: any) => {
    const ref = useRef<any>();
    const { formatMessage } = useIntl();
    const { addBoardToFavourite, removeBoardFromFavourite, reportBoard } = useBoardOptions();
    const boardId = props.board.id;
    // const accountId = props.board.createdBy.account.id;
    const isFavourite = props.board.isFavorite;

    useEffect(() => {
        const handleClickOutside = (event: any) => {
            console.log(event.target);
            if (ref.current && !ref.current.contains(event.target)) {
                props.boardOptionsHandler && props.boardOptionsHandler();
            }
        };
        document.addEventListener('click', handleClickOutside, true);
        return () => {
          document.removeEventListener('click', handleClickOutside, true);
        };
    });

    const addFavouriteHandler = () => {
        addBoardToFavourite(boardId);
    }
    const removeFavouriteHandler = () => {
        removeBoardFromFavourite(boardId);
    }

    // const deleteBoardHandler = () => {
    //     deleteBoardFromServer(boardId, accountId);
    // }

    const reportBoardHandler = () => {
        reportBoard(boardId);
    }

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url); //need to check in all browsers
    }

    const copyUrlHandler = () => {
        const hostUrl = "https://captivateprimestage1.adobe.com"    //to get from server injections
        const boardUrl = hostUrl + "/app/learner/#/social/board/" + boardId;
        copyUrl(boardUrl);
    }

    return (
        <>
        <div ref={ref} className={styles.primeBoardOptionsList}>
            {isFavourite ? 
                <div className={styles.primeBoardOption} onClick={removeFavouriteHandler}>
                    {
                        formatMessage({
                        id: "prime.community.board.removeFromFavourites",
                        defaultMessage: "Remove from Favourites",
                        })
                    }
                </div>
                : 
                <div className={styles.primeBoardOption} onClick={addFavouriteHandler}>
                    {
                        formatMessage({
                        id: "prime.community.board.addToFavourites",
                        defaultMessage: "Add to Favourites",
                        })
                    }
                </div>
            }
            <div className={styles.primeBoardOption} onClick={copyUrlHandler}>
                {
                    formatMessage({
                    id: "prime.community.board.copyUrl",
                    defaultMessage: "Copy URL",
                    })
                }
            </div>
            <div className={styles.primeSeperator}></div>
            {/* <div className={styles.primeBoardCriticalOption} onClick={deleteBoardHandler}>
                {
                    formatMessage({
                    id: "prime.community.board.delete",
                    defaultMessage: "Delete",
                    })
                }
            </div> */}
            <div className={styles.primeBoardCriticalOption} onClick={reportBoardHandler}>
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

export default PrimeCommunityBoardOptions;
