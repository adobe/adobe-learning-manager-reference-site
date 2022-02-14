// import React from "react";
import { PrimeCommunityBoard } from "../PrimeCommunityBoard";
import { PrimeCommunityBoardFilters } from "../PrimeCommunityBoardFilters";
import { useBoard } from "../../hooks/community";

const PrimeCommunityBoardList  = () => {
    const { items, fetchBoards } = useBoard();

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
            <div style={{ margin: "10px", padding: "10px" }} key={board.id}>
            <PrimeCommunityBoard board={board}></PrimeCommunityBoard>
            </div>
        ))}
        </>
    );
};

export default PrimeCommunityBoardList;
