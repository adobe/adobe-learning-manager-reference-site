import { useTraining } from "../../hooks/catalog/useTraining";

const PrimeTrainingCard = (props: any) => {
  const training = props.training;

  //const {cardColor, localizedTrainingName, format, description, progress, price, rating, cardIcon, onClickHandler} = useTraining(training);
  const {
    id,
    format,
    type,
    rating,
    state,
    authorNames,
    name,
    description,
    cardBgStyle,
    enrollment,
  } = useTraining(training);
  return (
    <>
      <div style={{ padding: "10px", marginBottom: "40px", color: "red" }}>
        <div
          style={{
            width: "256px",
            height: "205px",
            cursor: "pointer",
            boxShadow: "0 0 5px rgb(0 0 0 / 20%)",
            ...cardBgStyle,
          }}
        >
          <div>
            {id}, {format},{type},
          </div>

          <div>
           {state}, {authorNames?.join(",")}
          </div>

          <div>
            {name} , {description}
          </div>
          {rating ? (
            <div>
              {rating.ratingsCount > 0
                ? `rated ${rating.averageRating}`
                : "Not Rated"}
            </div>
          ) : (
            ""
          )}
          {enrollment ? (
            <span>{enrollment.progressPercent}</span>
          ) : (
            "Not enrolled yet"
          )}
        </div>
      </div>
    </>
  );
};

export default PrimeTrainingCard;
