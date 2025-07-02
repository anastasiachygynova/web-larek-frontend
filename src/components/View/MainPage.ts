// src/components/View/MainPageView.ts

import type { Product } from '../../types';

export class MainPageView {
	private root: HTMLElement;
	private openCartButton: HTMLButtonElement;
	private cartCountElement: HTMLElement;
	private catalogContainer: HTMLElement;

	constructor(root: HTMLElement) {}

	onOpenCart(callback: () => void): void {}

	updateCartCount(count: number): void {}

	renderCatalog(products: Product[]): void {}
}
