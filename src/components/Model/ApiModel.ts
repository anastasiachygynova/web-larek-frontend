import { Api } from '../base/api';
import { Product, Order } from '../../types';

export class ApiModel extends Api {
	protected items: Product[] = [];

	constructor(baseUrl: string, options: RequestInit = {}) {
		//
	}
	getProductList(): Promise<Product[]> {}

	placeOrder(): Promise<any> {}
}
