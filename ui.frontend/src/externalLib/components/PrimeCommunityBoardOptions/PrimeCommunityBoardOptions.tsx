import { useBoardOptions } from "../../hooks/community";
import { useIntl } from "react-intl";
import styles from "./PrimeCommunityBoardOptions.module.css";

const PrimeCommunityBoardOptions  = (props: any) => {
    const { formatMessage } = useIntl();
    const { addBoardToFavourite, removeBoardFromFavourite } = useBoardOptions();
    const boardId = props.board.id;
    const isFavourite = props.board.isFavorite;

    const addFavouriteHandler = () => {
        addBoardToFavourite(boardId);
        // if (typeof props.boardOptionsHandler === 'function') {
        //     props.boardOptionsHandler();
        // }
    }
    const removeFavouriteHandler = () => {
        removeBoardFromFavourite(boardId);
        // if (typeof props.boardOptionsHandler === 'function') {
        //     props.boardOptionsHandler();
        // }
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
        <div className={styles.primeBoardOptionsList}>
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
            <div className={styles.primeBoardCriticalOption} onClick={removeFavouriteHandler}>
                {
                    formatMessage({
                    id: "prime.community.board.delete",
                    defaultMessage: "Delete",
                    })
                }
            </div>
            <div className={styles.primeBoardCriticalOption} onClick={removeFavouriteHandler}>
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
