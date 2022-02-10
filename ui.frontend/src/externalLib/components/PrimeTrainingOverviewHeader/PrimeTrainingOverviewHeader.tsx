import React from "react";

const PrimeTrainingOverviewHeader: React.FC<{
  format: string;
  title: string;
  color: string;
}> = (props) => {
  const { format, title, color } = props;
  return (
    <div style={{ backgroundColor: color }}>
      <h6>{format}</h6>
      <h5>{title}</h5>
    </div>
  );
};

export default PrimeTrainingOverviewHeader;
