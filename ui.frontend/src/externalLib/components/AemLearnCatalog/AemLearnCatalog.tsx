import React from "react";
import { AEMLearnCatalogFilters } from "../AEMLearnCatalogFilters";
import { useCatalog } from "../../hooks/catalog";
import { useLoadMore } from "../../hooks/loadMore";

const AemLearnCatalog = () => {
  const { items, loadMoreTraining } = useCatalog();

  //   const handleObserver = () => {
  //     if (!allItemsLoaded) loadMoreAction();
  //   };
  const [elementRef] = useLoadMore({
    items,
    callback: loadMoreTraining,
  });
  return (
    <>
      <AEMLearnCatalogFilters></AEMLearnCatalogFilters>
      {items?.map((item) => (
        <div style={{ margin: "10px", padding: "10px" }} key={item.id}>
          {item.id}
        </div>
      ))}

      <div ref={elementRef}></div>
    </>
  );
};

export default AemLearnCatalog;
