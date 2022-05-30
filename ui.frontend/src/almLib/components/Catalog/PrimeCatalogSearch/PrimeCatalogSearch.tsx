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
import { SEARCH_ICON_SVG } from "../../../utils/inline_svg";
import styles from "./PrimeCatalogSearch.module.css";
import { TextField } from "@adobe/react-spectrum";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
}> = ({ query, handleSearch }) => {
  const [state, setState] = useState(query);
  const searchChangedHandler = (event: any) => {
    if (event.key === "Enter") {
      handleSearch(state);
    }
  };

  const beginSearchHandler = () => {
    if (state) {
      handleSearch(state);
    }
  };

  useEffect(() => {
    setState(query);
  }, [query]);

  const { formatMessage } = useIntl();
  return (
    <div className={styles.container}>
      <TextField
        placeholder={formatMessage({
          id: "alm.catalog.search.placeholder",
          defaultMessage: "Enter text and press enter",
        })}
        onKeyDown={searchChangedHandler}
        onChange={(value) => setState(value)}
        value={state}
        width={"100%"}
        height={"38px"}
        UNSAFE_className={styles.customInput}
      />
      <span className={styles.searchIcon} onClick={beginSearchHandler}>
        {SEARCH_ICON_SVG()}
      </span>
    </div>
  );
};

export default PrimeCatalogSearch;
