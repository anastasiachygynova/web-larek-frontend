import { IProduct } from '../../types';

export interface IBasketModelContract {
	items: IProduct[];
	addProduct(product: IProduct): void;
	getCount: () => number;
	getTotal: () => number;
	removeProduct(product: IProduct): void;
	clear(): void;
	cleanInvalidItems(): void;
}

export class BasketModel implements IBasketModelContract {
	protected _items: IProduct[] = [];

	set items(data: IProduct[]) {
		this._items = data;
	}

	get items() {
		return this._items;
	}

	getCount(): number {
		return this.items.filter((item) => item && item.id != null).length;
	}

	getTotal(): number {
		return this.items
			.filter((item) => item && item.id != null)
			.reduce((sum, item) => sum + (item.price ?? 0), 0);
	}

	addProduct(product: IProduct): void {
		if (!product || !product.id) {
			return;
		}

		if (!this._items.some((item) => item && item.id === product.id)) {
			this._items.push(product);
		}
	}

	removeProduct(product: IProduct): void {
		if (!product || !product.id) {
			return;
		}

		this._items = this._items.filter((item) => item && item.id !== product.id);
	}

	clear(): void {
		this.items = [];
	}

	cleanInvalidItems(): void {
		this._items = this._items.filter((item) => item && item.id != null);
	}
}
