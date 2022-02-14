// import React from "react";
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { useBoard } from "../../hooks/community";
// import { useLoadMore } from "../../hooks/loadMore";

const PrimeCommunityBoardList  = () => {
    const { items } = useBoard();
    return (
        <>
        {items?.map((board) => (
            <div style={{ margin: "10px", padding: "10px" }} key={board.id}>
            <PrimeCommunityBoard board={board}></PrimeCommunityBoard>
            </div>
        ))}
        </>
    );
};

export default PrimeCommunityBoardList;
