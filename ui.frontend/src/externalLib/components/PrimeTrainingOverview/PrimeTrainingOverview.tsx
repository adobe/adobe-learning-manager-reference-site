import { PrimeTrainingOverviewHeader } from "../PrimeTrainingOverviewHeader";
import { useTrainingPage } from "../../hooks/catalog/useTrainingPage";
import { PrimeModuleList } from "../PrimeModuleList";

const PrimeTrainingOverview = (props: any) => {
  //const trainingInstance: PrimeLearningObjectInstance = props.training;
  const trainingId = "course:3079361"; //TO-DO get training id
  const instanceId = "course:3079361_5746412"; // TO-DO get instance id

  const {
    name,
    description,
    overview,
    richTextOverview,
    cardIconUrl,
    color,
    skills,
    training,
    trainingInstance,
    isLoading,
    instanceBadge,
  } = useTrainingPage(trainingId, instanceId);
  if (isLoading) {
    return <div>Lading details. Please wiat....</div>;
  }

  return (
    <>
      <PrimeTrainingOverviewHeader
        format={training.loFormat}
        color={color}
        title={name}
      />
      <div style={{ display: "flex" }}>
        {training.id} , {name}, {instanceBadge.badgeName},
      </div>
      <div>
        Enrollment :
        {training.enrollment ? training.enrollment.id : "NOT_enrolled"}
      </div>
      <div>Authors: {training.authorNames.join(",")}</div>
      <div>Skills : {skills.map((skill) => skill.name).join(",")}</div>
      {/* <div>Overview : {overview}</div> */}
      <PrimeModuleList
        loResources={trainingInstance.loResources}
      ></PrimeModuleList>
    </>
  );
};

export default PrimeTrainingOverview;

{
  /* <div>
        instances:
        {training.instances.map((item) => {
          console.log(item, item.loResources.length);
          return item.loResources.map((lo) => {
            return (
              <div key={lo.id}>
                {lo.resourceType},{lo.type},{lo.localizedMetadata[0].name},
                {lo.localizedMetadata[0].type}
              </div>
            );
          });
        })}
      </div> */
}
