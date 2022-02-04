import React from "react";

const PrimeTrainingCard = (props: any) => {
  
  const training = props.training;

  //const {cardColor, localizedTrainingName, format, description, progress, price, rating, cardIcon, onClickHandler} = useTraining(training);
  return (
    <>
      <div style={{ display: "flex" }}>{training.id}</div>
    </>
  );
};

export default PrimeTrainingCard;
