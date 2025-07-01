import { Product } from '../../types';

export class BasketView {
	protected container: HTMLElement;
	protected list: HTMLElement;
	protected total: HTMLElement;
	protected count: HTMLElement;
	protected submitButton: HTMLButtonElement;

	constructor(container: HTMLElement) {}
	
	renderItems(items: Product[]): void {}
	updateCartItemCount(count: number): void {
		this.count.textContent = count.toString();
	}
	updateCartTotal(total: number): void {
		this.total.textContent = `${total.toLocaleString()} синапсов`;
	}
}
