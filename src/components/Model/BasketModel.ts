import { Product } from '../../types';

export class BasketModel {
	protected items: Product[] = [];
	constructor() {
		this.items = [];
	}
	getItemsCount(): number {
		//кол-во товара в корзине
	}
	getTotalPrice(): number {
		//общая сумма товаров в корзине
	}
	addItemToCart(item: Product): void {
		//+товар в корзине
	}
	removeFromBasket(id: string): void {
		//-товар из корзины
	}
	clearBasketProducts(): void {
		//очищает корзину
	}
}
