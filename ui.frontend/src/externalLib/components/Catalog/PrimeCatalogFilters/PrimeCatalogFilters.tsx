/**
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { RangeSlider } from "@adobe/react-spectrum";
import { useState } from "react";
import { UpdateFiltersEvent } from "../../../utils/filters";
import { getALMObject } from "../../../utils/global";
import { isCommerceEnabled } from "../../../utils/price";
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
    price,
  } = props.filterState;
  const { updateFilters, catalogAttributes } = props;
  const isLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  let [value, setValue] = useState({ start: 25, end: 75 });
  if (isLoading) {
    return <ALMLoader />;
  }

  const renderFilterList = (filter: any) => {
    if (!filter || !filter.list || filter.list?.length <= 1) {
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
  };

  return (
    <>
      <div className={styles.primeFilterContainer}>
        <h3 className={styles.filtersLabel}>Filters</h3>
        {/* catalog Filter start */}
        {renderFilterList(catalogs)}
        {/* catalog Filter ends */}

        {/* loTypes Filter start */}
        {renderFilterList(loTypes)}
        {/* loTypes Filter ends */}

        {/* loFormat Filter start */}
        {renderFilterList(loFormat)}
        {/* loFormat Filter ends */}

        {/* duration Filter start */}
        {renderFilterList(duration)}
        {/* duration Filter ends */}

        {/* skillName Filter start */}
        {renderFilterList(skillName)}
        {/* skillName Filter ends */}

        {/* skillLevel Filter start */}
        {renderFilterList(skillLevel)}
        {/* skillLevel Filter ends */}

        {/* tagName Filter start */}
        {renderFilterList(tagName)}
        {/* tagName Filter ends */}

        {/* learnerState Filter start */}
        {isLoggedIn && renderFilterList(learnerState)}
        {/* learnerState Filter ends */}

        {/* Price Filter start */}
        {isCommerceEnabled() && (
          <div>
            <RangeSlider
              label="Range (controlled)"
              value={value}
              onChange={setValue}
            />
          </div>
        )}
        {/* Price Filter ends */}
      </div>
    </>
  );
};

export default PrimeCatalogFilters;
