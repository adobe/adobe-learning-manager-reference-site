import styles from "./PrimeCatalogSearch.module.css";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
}> = ({ query, handleSearch }) => {
  const [state, setState] = useState(query);
  const searchChangedHandler = (event: any) => {
    if (event.key === "Enter") {
      const { value } = event.target;
      handleSearch(value);
    }
  };

  useEffect(() => {
    setState(query);
  }, [query]);

  const { formatMessage } = useIntl();
  return (
    <>
      <input
        className={styles.input}
        value={state}
        onKeyPress={searchChangedHandler}
        onChange={(event) => setState(event.target.value)}
        placeholder={formatMessage({
          id: "prime.catalog.search.placeholder",
          defaultMessage: "Search",
        })}
      />{" "}
    </>
  );
};

export default PrimeCatalogSearch;
