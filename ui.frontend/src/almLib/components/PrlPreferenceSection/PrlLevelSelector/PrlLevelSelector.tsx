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
import { INTERMEDIATE, ADVANCED } from "../../../utils/constants";
import styles from "./PrlLevelSelector.module.css";
import { useIntl } from "react-intl";

const PrlLevelSelector = (props: any) => {
  const { formatMessage } = useIntl();

  const onChangeHandler = (item: PrimeUserRecommendationCriteria, event: Event) => {
    const updatedItem = {
      ...item,
      levels: [(event.target as HTMLInputElement)?.value],
    };
    if (typeof props.onChangeHandler === "function") {
      props.onChangeHandler({
        detail: {
          item: updatedItem,
        },
      });
    }
  };

  const headerTemplate = () => {
    return (
      <>
        {props.headerText && (
          <h2 className={styles.prlLevelHeader} tabIndex={-1}>
            {props.headerText}
          </h2>
        )}
      </>
    );
  };

  const getLevelString = (level: String) => {
    let id = "alm.catalog.filter.beginner";
    let defaultMessage = "Beginner";
    switch (level) {
      case INTERMEDIATE:
        id = "alm.catalog.filter.intermediate";
        defaultMessage = "Intermediate";
        break;
      case ADVANCED:
        id = "alm.catalog.filter.advanced";
        defaultMessage = "Advanced";
    }
    return formatMessage({
      id: id,
      defaultMessage: defaultMessage,
    });
  };

  const levelHtml = () => {
    return props.options?.map((item: PrimeUserRecommendationCriteria) => {
      const selectedLevel = item.levels?.length ? item.levels[0] : ADVANCED;
      return (
        <li>
          <div
            className={`${styles.prlLevelContainer} ${styles.prlDarkBackground}`}
            role="radiogroup"
            aria-labelledby={item.id}
          >
            <h3 id={item.id}>{item.name}</h3>
            <div className={styles.prlRadioGroup}>
              {props.levels.names?.map((level: string) => {
                return (
                  <label className={styles.prlRadioLabel}>
                    <input
                      className={styles.prlInputRadio}
                      id={`${item.id}${level}`}
                      type="radio"
                      onChange={(event: any) => onChangeHandler(item, event)}
                      name={item.name}
                      value={level}
                      checked={selectedLevel === level}
                    />
                    <label className={styles.prlRadio} htmlFor={`${item.id}${level}`}></label>
                    {getLevelString(level)}
                  </label>
                );
              })}
            </div>
          </div>
        </li>
      );
    });
  };

  return (
    <>
      <div className={styles.prlLevelSelectContainer}>
        <ul>
          {headerTemplate()}
          {levelHtml()}
        </ul>
      </div>
    </>
  );
};
export default PrlLevelSelector;
