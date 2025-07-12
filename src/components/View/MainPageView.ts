export class MainPageView {
	private galleryContainer: HTMLElement;
	private basketCounter: HTMLElement;

	constructor(root: HTMLElement, basketCounter: HTMLElement) {
		this.galleryContainer = root;
		this.basketCounter = basketCounter;
	}

	setProducts(cards: HTMLElement[]) {
		this.renderProducts(cards);
	}

	private renderProducts(cards: HTMLElement[]) {
		this.galleryContainer.innerHTML = '';
		cards.forEach((card) => {
			this.galleryContainer.appendChild(card);
		});
	}

	updateBasketCounter(count: number) {
		if (this.basketCounter) {
			this.basketCounter.textContent = count.toString();
		}
	}
}
