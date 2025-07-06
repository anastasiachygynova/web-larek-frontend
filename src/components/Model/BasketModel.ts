import { IProduct } from "../../types";

export interface IBasketModelContract {
  items: IProduct[]; //  — массив товаров в корзине.
  addProduct(product: IProduct): void; // - добавляет товар в корзину.
  getCount: () => number; // -возвращает количество товаров в корзине.
  getTotal: () => number; // — возвращает сумму всех товаров в корзине.
  removeProduct(product: IProduct): void;
  clear(): void;
}

export class BasketModel implements IBasketModelContract {
  protected _items: IProduct[] = [];

  set items(data: IProduct[]) {
    this._items = data;
  }

  get items() {
    return this._items;
  }

  // Количество товаров в корзине
  getCount(): number {
    return this.items.length;
  }

  // Сумма всех товаров в корзине
  getTotal(): number {
    return this.items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  }

  // Добавить товар в корзину
  addProduct(product: IProduct): void {
    if (!this._items.some(item => item.id === product.id)) {
      this._items.push(product);
    }
  }

  // Удалить товар из корзины
  removeProduct(product: IProduct): void {
    this._items = this._items.filter(item => item.id !== product.id);
  }

  // Очистить корзину
  clear(): void {
    this.items = [];
  }
}
