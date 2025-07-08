import { ApiListResponse, Api } from '../base/api';
import { IProduct, IOrderRequest, IOrderResult } from '../../types';

export interface ApiModelInterface {
	cdn: string;
	items: IProduct[];
	getProductList: () => Promise<IProduct[]>;
	placeOrder: (order: IOrderRequest) => Promise<IOrderResult>;
}

export class ApiModel extends Api {
	cdn: string;
	items: IProduct[] = [];

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: `${this.cdn.replace(/\/$/, '')}/${item.image.replace(
					/^\//,
					''
				)}`,
			}))
		);
	}

	placeOrder(order: IOrderRequest): Promise<IOrderResult> {
		return this.post(`/order`, order).then((data: IOrderResult) => data);
	}
}
