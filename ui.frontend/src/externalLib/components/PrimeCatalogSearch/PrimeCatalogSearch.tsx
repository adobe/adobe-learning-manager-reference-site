import styles from "./PrimeCatalogSearch.module.css";
import { useIntl } from "react-intl";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
}> = ({ query, handleSearch }) => {
  const searchChangedHandler = (event: any) => {
    if (event.key === "Enter") {
      const { value } = event.target;
      handleSearch(value);
      event.target.value = "";
    }
  };
  const { formatMessage } = useIntl();
  return (
    <>
      <input
        className={styles.primeSearchInput}
        onKeyPress={searchChangedHandler}
        placeholder={formatMessage({
          id: "prime.catalog.search.placeholder",
          defaultMessage: "Search",
        })}
      />{" "}
    </>
  );
};

export default PrimeCatalogSearch;
