import {
  SOCIAL_LIKE_SVG,
  SOCIAL_LIKE_FILLED_SVG,
  SOCIAL_DISLIKE_SVG,
  SOCIAL_DISLIKE_FILLED_SVG
} from "../../../utils/inline_svg"
import styles from "./PrimeCommunityObjectActions.module.css";

const PrimeCommunityObjectActions  = (props: any) => {

    const viewButtonClickHandler = () => {
        if (typeof props.viewButtonClickHandler === 'function') {
            props.viewButtonClickHandler();
        }
    }

    const upVoteButtonClickHandler = () => {
        if (typeof props.upVoteButtonClickHandler === 'function') {
            props.upVoteButtonClickHandler();
        }
    }

    const downVoteButtonClickHandler = () => {
        if (typeof props.downVoteButtonClickHandler === 'function') {
            props.downVoteButtonClickHandler();
        }
    }

    const actionClickHandler = () => {
        if (typeof props.downVoteButtonClickHandler === 'function') {
            props.actionClickHandler();
        }
    }

    return (
        <>
        <div className={styles.primePostOptions}>
            {props.type === "comment" &&
                <button className={styles.primePostCommentsCount} onClick={actionClickHandler}>
                    {props.actionLabel}
                </button>
            }
            {props.type !== "reply" &&
                <button className={styles.primePostCommentsCount} onClick={viewButtonClickHandler}>
                {props.buttonLabel} ({props.buttonCount})
                </button>
            }
            <button className={styles.primePostUpVoteIcon} onClick={upVoteButtonClickHandler}>
                {props.myUpVoteStatus === true ? 
                    SOCIAL_LIKE_FILLED_SVG() : SOCIAL_LIKE_SVG()} 
                <span className={styles.primePostUpVoteCount}>{props.upVoteCount}</span>
            </button>
            <button className={styles.primePostDownVoteIcon} onClick={downVoteButtonClickHandler}>
                {props.myDownVoteStatus ?
                    SOCIAL_DISLIKE_FILLED_SVG() : SOCIAL_DISLIKE_SVG()
                } <span className={styles.primePostDownVoteCount}>{props.downVoteCount}</span>
            </button>
        </div>
        </>
    );
};

export default PrimeCommunityObjectActions;
