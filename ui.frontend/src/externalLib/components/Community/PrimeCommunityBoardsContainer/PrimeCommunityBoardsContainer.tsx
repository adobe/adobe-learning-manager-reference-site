import { useRef } from "react";
import { useLoadMore } from "../../../hooks/loadMore";
import { PrimeBoard } from "../../../models/PrimeModels";
import { ALMLoader } from "../../Common/ALMLoader";
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";

const PrimeBoardsContainer: React.FC<{
    boards: PrimeBoard[] | null;
    loadMoreBoards: () => void;
    hasMoreItems: boolean;
}> = ({ boards, loadMoreBoards, hasMoreItems }) => {
    const elementRef = useRef(null);
    useLoadMore({
        items: boards,
        callback: loadMoreBoards,
        elementRef,
    });
    const listHtml = boards?.map((board) => (
        <PrimeCommunityBoard
        board={board}
        key={board.id}
        ></PrimeCommunityBoard>
    ));

    return (
        <div>
            {listHtml}
            <div ref={elementRef} id="load-more-boards">
                {hasMoreItems ? <ALMLoader /> : ""}
            </div>
        </div>
    );
};

export default PrimeBoardsContainer;
