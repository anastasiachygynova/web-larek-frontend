import { IProduct } from '../../types';
import { IEvents } from '../base/events';

export interface IDataCatalogContract {
	products: IProduct[];
	selectedProduct: IProduct | null;
	setPreview(product: IProduct): void;
}

export class DataCatalog implements IDataCatalogContract {
	protected _products: IProduct[] = [];
	selectedProduct: IProduct | null = null;

	constructor(protected events: IEvents) {}

	set products(data: IProduct[]) {
		this._products = data;
		this.events.emit('products:receive');
	}

	get products() {
		return this._products;
	}

	setPreview(product: IProduct) {
		this.selectedProduct = product;
		this.events.emit('modalProduct:open', product);
	}
}
