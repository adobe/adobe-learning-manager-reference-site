import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { SEARCH_ICON_SVG } from "../../utils/inline_svg";
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
          id: "prime.catalog.search.placeholder",
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

{/* <input
  ref={inputRef}
  className={styles.input}
  value={state}
  onKeyPress={searchChangedHandler}
  onChange={(event) => setState(event.target.value)}
  placeholder={formatMessage({
    id: "prime.catalog.search.placeholder",
    defaultMessage: "Enter text and press enter",
  })}
/> */}