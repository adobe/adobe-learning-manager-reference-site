import React from "react";

const PrimeTrainingCard = (props: any) => {
  
  const cardModel = props.model;

  return (
    <>
      <div style={{ display: "flex" }}>{cardModel.id}</div>
    </>
  );
};

export default PrimeTrainingCard;
