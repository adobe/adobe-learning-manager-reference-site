import styles from "./PrimeCatalogSearch.module.scss";

const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
  resetSearch: () => void;
}> = ({ query, handleSearch, resetSearch }) => {
  const searchChangedHandler = (event: any) => {
    const { value } = event.target;
    handleSearch(value);
  };
  return (
    <>
      <input
        className={styles.primeSearchInput}
        defaultValue={query}
        onInput={searchChangedHandler}
      />{" "}
    </>
  );
};

export default PrimeCatalogSearch;
