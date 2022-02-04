import React from "react";

const PrimeTrainingCard = (props: any) => {
  
  const training = props.training;

  return (
    <>
      <div style={{ display: "flex" }}>{training.id}</div>
    </>
  );
};

export default PrimeTrainingCard;
