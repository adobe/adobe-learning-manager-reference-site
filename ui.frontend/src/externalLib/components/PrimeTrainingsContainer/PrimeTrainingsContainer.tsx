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
     {trainings?.map((training) => (
        <div style={{ margin: "10px", padding: "10px" }} key={training.id}>
         <PrimeTrainingCard training={training}></PrimeTrainingCard>
        </div>
      ))}
       <div ref={elementRef}>TO DO add Loading more..</div>
    </>
  );
};





export default PrimeTrainingsContainer;
