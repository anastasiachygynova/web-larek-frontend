import { Product } from '../../types';
import { ProductView } from './ProductView';

export class ProductPreview extends ProductView {
	protected descriptionElement: HTMLElement;
	protected addToCartButton: HTMLButtonElement;

	constructor(element: HTMLElement) {
		super(element);
	}

	setDescription(description: string): void {}

	onAddToCart(callback: (product: Product) => void, product: Product): void {}

	render(product: Product): void {}
}
