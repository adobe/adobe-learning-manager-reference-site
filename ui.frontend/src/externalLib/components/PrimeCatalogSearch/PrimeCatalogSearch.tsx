import { useSearch } from "../../hooks/catalog/useSearch";
function PrimeCatalogSearch() {
  const { query, handleSearch } = useSearch();
  const searchChangedHandler = (event: any) => {
    const { value } = event.target;
    handleSearch(value);
  };
  return <input value={query} onChange={searchChangedHandler} />;
}

export default PrimeCatalogSearch;
