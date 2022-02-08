import { CatalogFilterState } from "../store/reducers/catalog";
import { QueryParams } from "../utils/restAdapter";

export default interface ICustomHooks {
  getTrainings(filterState: CatalogFilterState, sort: string): void;
  loadMore(url: string): void;
  getTraining(id: string, params: QueryParams): void;
}
