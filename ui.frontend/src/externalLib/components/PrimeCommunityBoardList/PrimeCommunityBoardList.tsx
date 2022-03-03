import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { PrimeCommunityBoardFilters } from "../PrimeCommunityBoardFilters";
import { useBoards } from "../../hooks/community";

const PrimeCommunityBoardList  = () => {
    const { items, fetchBoards } = useBoards();

    const sortFilterChangeHandler = (sortValue: any) => {
        fetchBoards(sortValue, null);
    }

    const skillFilterChangeHandler = (skill: any) => {
        fetchBoards(null, skill);
    }

    return (
        <>
        <PrimeCommunityBoardFilters sortFilterChangeHandler={sortFilterChangeHandler} skillFilterChangeHandler={skillFilterChangeHandler}></PrimeCommunityBoardFilters>
        {items?.map((board) => (
            <PrimeCommunityBoard board={board} key={board.id}></PrimeCommunityBoard>
        ))}
        </>
    );
};

export default PrimeCommunityBoardList;
