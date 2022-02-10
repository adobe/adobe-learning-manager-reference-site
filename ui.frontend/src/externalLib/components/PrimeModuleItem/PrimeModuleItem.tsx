import React, { useContext } from "react";
import { PrimeLearningObjectResource } from "../../models/PrimeModels";
import { useConfigContext } from "../../contextProviders";

function getFilteredLocalizedData_lxpv<T>(
  localizedMetadata: T[],
  locale: string
): T[] {
  return localizedMetadata.filter((resource: any) => {
    return resource.locale === locale;
  });
}

const PrimeModuleItem = (props: any) => {
  const loResource: PrimeLearningObjectResource = props.loResource;
  const config = useConfigContext();
  const locale = config.locale;
  let localizedMetadata = loResource.localizedMetadata;
  let preferredLocalizedData = getFilteredLocalizedData_lxpv(
    localizedMetadata,
    locale
  );
  if (!preferredLocalizedData) {
    preferredLocalizedData = getFilteredLocalizedData_lxpv(
      localizedMetadata,
      "en-US"
    );
  }
  if (!preferredLocalizedData) {
    preferredLocalizedData = localizedMetadata;
  }
  const localizedData = preferredLocalizedData[0];

  return (
    <>
      <div style={{ display: "flex", margin: "10px" }}>
        {localizedData.name} ,{" "}
        {loResource.resources.map((item) => {
          // debugger;
          return (
            <span key={item.id}>
              {item.authorDesiredDuration} {item.contentType}, {loResource.loResourceType}
              {/* {item.dateCreated},  */}
              {/* {loResource.learningObject.loFormat} */}
            </span>
          );
        })}
      </div>
      {/* <div style={{ display: "flex" }}>{loResource.resourceType}</div>
      <div style={{ display: "flex" }}>{loResource.resources}</div> */}
    </>
  );
};

export default PrimeModuleItem;
