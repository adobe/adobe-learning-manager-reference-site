import { CatalogFilterState } from "../store/reducers/catalog";

export default interface ICustomHooks {
  getTrainings(filterState: CatalogFilterState, sort: string): void;
  loadMore(url: string): void;
}
