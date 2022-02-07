import { useCatalog } from "../../hooks/catalog";
import { useLoadMore } from "../../hooks/loadMore";
import { PrimeTrainingCard } from "../PrimeTrainingCard";

const PrimeTrainingsContainer = () => {
  const { trainings, loadMoreTraining } = useCatalog();
  const [elementRef] = useLoadMore({
    trainings,
    callback: loadMoreTraining,
  });
  return (
    <>
      <div
        style={{
          margin: "10px",
          padding: "10px",
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {trainings?.map((training) => (
          <PrimeTrainingCard
            training={training}
            key={training.id}
          ></PrimeTrainingCard>
        ))}
      </div>
      <div ref={elementRef}>TO DO add Loading more..</div>
    </>
  );
};

export default PrimeTrainingsContainer;
