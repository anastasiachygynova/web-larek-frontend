import { Product } from '../../types';

export class DataCatalog {
  protected items: Product[];
  constructor() {
    this.items = [];
  }
  setDataPreview(item: Product): void { }
}
