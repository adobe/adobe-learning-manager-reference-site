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
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { DATE_CREATED } from "../../../utils/constants";
import { PrimeDropdown } from "../PrimeDropdown";

const PrimeCommunityPostFilters = (props: any) => {
  let defaultSortFilter = DATE_CREATED;
  const { formatMessage } = useIntl();
  const [selectedSortFilter, setSelectedSortFilter] = useState(defaultSortFilter);
  const sortFilters: { [key: string]: string } = {
    "Date Created": "-dateCreated",
    "Date Updated": "-dateUpdated",
  };

  const sortClickHandler = (option: any) => {
    setSelectedSortFilter(option);
    if (typeof props.sortFilterChangeHandler === "function") {
      props.sortFilterChangeHandler(sortFilters[option]);
    }
  };

  useEffect(() => {
    if (props.clearSortFilter) {
      setSelectedSortFilter(defaultSortFilter);
    }
  }, [props.clearSortFilter]);

  return (
    <>
      <PrimeDropdown
        label={formatMessage({
          id: "alm.community.board.sortBy",
          defaultMessage: "Sort by",
        })}
        optionList={Object.keys(sortFilters)}
        selectedOption={selectedSortFilter}
        optionClickHandler={sortClickHandler}
      ></PrimeDropdown>
    </>
  );
};

export default PrimeCommunityPostFilters;
