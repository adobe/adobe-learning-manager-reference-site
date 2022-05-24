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
import { RangeSlider, NumberField } from "@adobe/react-spectrum";
import { useEffect, useState } from "react";
import { UpdateFiltersEvent } from "../../../utils/filters";
import { getALMObject } from "../../../utils/global";
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
  const { updateFilters, catalogAttributes, updatePriceFilter } = props;
  const isLoggedIn = getALMObject().isPrimeUserLoggedIn();
  const onChangeHandler = (data: UpdateFiltersEvent) => {
    updateFilters(data);
  };

  const priceChangeHandler = (data: any) => {
    updatePriceFilter({
      filterType: "price",
      data,
    });
  };
  let [trainingPrice, setTrainingPrice] = useState({ start: 0, end: 100 });
  useEffect(() => {
    if (price) {
      setTrainingPrice({
        start: price.list[0].value,
        end: price.list[1].value || price.maxPrice,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [price?.maxPrice]);

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

  const inputEnterKeyHandler = (event: any, type: string) => {
    if (event.key === "Enter") {
      let value = (event.target as HTMLInputElement)?.value;
      value = value.replaceAll(",", "");
      changeTrainingPriceHandle(type, value);
    }
  };

  const changeTrainingPriceHandle = (type: string, value: any) => {
    value = parseInt(value || 0);

    if (type === "start") {
      if (value < 0) {
        value = 0;
      } else if (value > trainingPrice.end) {
        value = trainingPrice.end;
      }
    } else {
      if (value > price.maxPrice) {
        value = price.maxPrice;
      } else if (value < trainingPrice.start) {
        value = trainingPrice.start;
      }
    }

    setTrainingPrice((price) => {
      let data = { ...price, [type]: value };
      updatePriceFilter({
        filterType: "price",
        data,
      });
      return data;
    });
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
        {catalogAttributes["price"] === "true" && price && price.maxPrice ? (
          <div key={"price"} className={styles.container}>
            <h3 className={styles.typeLabel}>
              {GetTranslation("alm.catalog.filter.price.label", true)}
            </h3>
            <div className={styles.listContainer}>
              <RangeSlider
                label="Range"
                value={trainingPrice}
                onChange={setTrainingPrice}
                onChangeEnd={priceChangeHandler}
                maxValue={price && price.maxPrice}
                showValueLabel={false}
                width={"100%"}
                UNSAFE_className={styles.customSlider}
              />
              <div className={styles.priceFilterContainer}>
                <div>
                  <NumberField
                    value={trainingPrice.start}
                    onChange={(value) =>
                      changeTrainingPriceHandle("start", value)
                    }
                    minValue={0}
                    maxValue={price && price.maxPrice}
                    width={"100%"}
                    onKeyUp={(event) => inputEnterKeyHandler(event, "start")}
                  ></NumberField>
                </div>
                <div className={styles.priceToLabel}>To</div>
                <div>
                  <NumberField
                    value={trainingPrice.end}
                    onChange={(value) =>
                      changeTrainingPriceHandle("end", value)
                    }
                    minValue={0}
                    maxValue={price && price.maxPrice}
                    onKeyUp={(event) => inputEnterKeyHandler(event, "end")}
                    width={"100%"}
                  ></NumberField>
                </div>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
};

export default PrimeCatalogFilters;
