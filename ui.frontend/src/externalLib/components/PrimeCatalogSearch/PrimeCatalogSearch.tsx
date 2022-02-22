import { useEffect, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { SEARCH_ICON_SVG } from "../../utils/inline_svg";
import styles from "./PrimeCatalogSearch.module.css";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
}> = ({ query, handleSearch }) => {
  const [state, setState] = useState(query);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const searchChangedHandler = (event: any) => {
    if (event.key === "Enter") {
      handleSearch(inputRef?.current?.value!);
    }
  };

  const beginSearchHandler = () => {
    if (inputRef?.current?.value) {
      handleSearch(inputRef?.current?.value);
    }
  };

  useEffect(() => {
    setState(query);
  }, [query]);

  const { formatMessage } = useIntl();
  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        className={styles.input}
        value={state}
        onKeyPress={searchChangedHandler}
        onChange={(event) => setState(event.target.value)}
        placeholder={formatMessage({
          id: "prime.catalog.search.placeholder",
          defaultMessage: "Enter text and press enter",
        })}
      />
      <span className={styles.searchIcon} onClick={beginSearchHandler}>
        {SEARCH_ICON_SVG()}
      </span>
    </div>
  );
};

export default PrimeCatalogSearch;
