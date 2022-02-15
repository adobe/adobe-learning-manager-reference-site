import styles from "./PrimeCatalogSearch.module.css";
import { useIntl } from "react-intl";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
  resetSearch: () => void;
}> = ({ query, handleSearch, resetSearch }) => {
  const searchChangedHandler = (event: any) => {
    const { value } = event.target;
    handleSearch(value);
  };
  const { formatMessage } = useIntl();
  return (
    <>
      <input
        className={styles.primeSearchInput}
        defaultValue={query}
        onInput={searchChangedHandler}
        placeholder={formatMessage({
          id: "prime.catalog.search.placeholder",
          defaultMessage: "Search",
        })}
      />{" "}
    </>
  );
};

export default PrimeCatalogSearch;
