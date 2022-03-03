import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { useBoard } from "../../hooks/community";
import styles from  "./PrimeCommunityBoardPage.module.css";
import { PrimeCommunityAddPost } from "../PrimeCommunityAddPost";
import { PrimeCommunityPosts } from "../PrimeCommunityPosts";
const PrimeCommunityBoardPage  = () => {
    const boardId = "10285"; //to-do remove hardcoded value
    const { item } = useBoard(boardId);
    return (
        <>
        <div className={styles.primeBoardParent}>
            {item && <PrimeCommunityBoard board={item}></PrimeCommunityBoard>}
        </div>
        <PrimeCommunityAddPost boardId={boardId}></PrimeCommunityAddPost>
        {item && <PrimeCommunityPosts boardId={item.id}></PrimeCommunityPosts>}
        </>
    );
};

export default PrimeCommunityBoardPage;
