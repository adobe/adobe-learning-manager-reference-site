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
import { PrimeUserRecommendationCriteria } from "../../../models";
import CheckmarkCircle from "@spectrum-icons/workflow/CheckmarkCircle";
import styles from "./PrlChips.module.css";
import { isEmptyJson } from "../../../utils/global";

const PrlChips = (props: any) => {
  const toggleSelection = (item: PrimeUserRecommendationCriteria) => {
    isItemSelected(item.id) ? props.onRemove(item) : props.onAdd(item);
  };

  const isItemSelected = (itemId: string) => {
    return props.selectedOptions?.has(itemId);
  };

  const getCriteriaButton = (item: PrimeUserRecommendationCriteria, isSelected: boolean) => {
    return (
      <button
        className={`${styles.prlChip} ${isSelected ? styles.prlChipSelected : ""}`}
        role="checkbox"
        onClick={() => toggleSelection(item)}
        aria-checked={isSelected}
        aria-label={item.name}
      >
        <label>{item.name}</label>
        {isSelected && <CheckmarkCircle />}
      </button>
    );
  };

  return (
    <>
      <div
        className={styles.prlChipsContainer}
        role="radiogroup"
        aria-label={props.radioGroupAriaLabel || ""}
      >
        {!isEmptyJson(props.options) &&
          props.options?.map((item: PrimeUserRecommendationCriteria) => {
            return getCriteriaButton(item, isItemSelected(item.id));
          })}
      </div>
    </>
  );
};
export default PrlChips;
