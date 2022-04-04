import { UpdateFiltersEvent } from "../../../utils/filters";
import { GetTranslation } from "../../../utils/translationService";
import { ALMLoader } from "../../Common/ALMLoader";
import styles from "./PrimeCatalogFilters.module.css";
import PrimeCheckbox from "./PrimeCheckBox";

const PrimeCatalogFilters = (props: any) => {
  //const { formatMessage } = useIntl();
  const {
    loTypes,
    learnerState,
    skillName,
    loFormat,
    isLoading,
    tagName,
    skillLevel,
    duration,
    catalogs,
  } = props.filterState;
  const { updateFilters, catalogAttributes } = props;

  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  if (isLoading) {
    return <ALMLoader />;
  }

  const filterList = [
    catalogs,
    loTypes,
    loFormat,
    duration,
    skillName,
    skillLevel,
    tagName,
    learnerState,
  ].map((filter) => {
    if (!filter.list || filter.list?.length <= 1) {
      return "";
    }
    return catalogAttributes[filter.type] === "true" ? (
      <div key={filter.type} className={styles.container}>
        <h3 className={styles.typeLabel}>
          {GetTranslation(filter?.label, true)}
        </h3>
        <ul className={styles.listContainer}>
          {filter.list?.map((item: any) => (
            <li key={item.value}>
              <PrimeCheckbox
                filterType={filter.type!}
                label={item.label}
                checked={item.checked}
                changeHandler={onChangeHandler}
                isListDynamic={filter.isListDynamic}
              />
            </li>
          ))}
        </ul>
      </div>
    ) : (
      ""
    );
  });

  return (
    <>
      <div className={styles.primeFilterContainer}>
        <h3 className={styles.filtersLabel}>Filters</h3>
        {filterList}
      </div>
    </>
  );
};

export default PrimeCatalogFilters;
