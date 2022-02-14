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
      <input defaultValue={query} onChange={searchChangedHandler} />{" "}
      <button onClick={resetSearch}>Clear</button>
    </>
  );
};

export default PrimeCatalogSearch;
