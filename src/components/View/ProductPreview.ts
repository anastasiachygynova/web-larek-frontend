import { ProductView } from './ProductView';
import { IActions, IProduct } from '../../types';
import { IEvents } from '../base/events';

export interface ICard {
	text: HTMLElement;
	button: HTMLElement;
	render(data: IProduct, basketItems?: IProduct[]): HTMLElement;
}

export class ProductPreview extends ProductView implements ICard {
	text: HTMLElement;
	button: HTMLElement;
	private currentProduct: IProduct | null = null;

	constructor(
		template: HTMLTemplateElement,
		protected events: IEvents,
		actions?: IActions
	) {
		super(template, events, actions);
		this.text = this._cardElement.querySelector('.card__text');
		this.button = this._cardElement.querySelector('.card__button');
		this.button.addEventListener('click', () => {
			if (this.currentProduct) {
				if (this.button.dataset.inBasket === 'true') {
					this.events.emit('card:removeBasket', this.currentProduct);
				} else {
					this.events.emit('card:addBasket', this.currentProduct);
				}
			}
		});
	}

	render(data: IProduct, basketItems: IProduct[] = []): HTMLElement {
		this.currentProduct = data;
		this.cardCategory = data.category;
		this._cardTitle.textContent = data.title;
		this._cardImage.src = data.image;
		this._cardImage.alt = data.title;
		this._cardPrice.textContent = this.formatPrice(data.price);
		this.text.textContent = data.description;

		const inBasket = basketItems.some((item) => item && item.id === data.id);

		if (!data.price) {
			this.button.textContent = 'Недоступно';
			this.button.setAttribute('disabled', 'true');
			this.button.removeAttribute('data-in-basket');
		} else if (inBasket) {
			this.button.textContent = 'Удалить из корзины';
			this.button.removeAttribute('disabled');
			this.button.dataset.inBasket = 'true';
		} else {
			this.button.textContent = 'Купить';
			this.button.removeAttribute('disabled');
			this.button.dataset.inBasket = 'false';
		}

		return this._cardElement;
	}
}
