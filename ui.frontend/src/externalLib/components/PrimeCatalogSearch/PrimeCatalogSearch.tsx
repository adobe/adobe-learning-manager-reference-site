const PrimeCatalogSearch: React.FC<{
  query: string;
  handleSearch: (text: string) => void;
}> = ({ query, handleSearch }) => {
  const searchChangedHandler = (event: any) => {
    const { value } = event.target;
    handleSearch(value);
  };
  return <input value={query} onChange={searchChangedHandler} />;
};

export default PrimeCatalogSearch;
