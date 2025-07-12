import { IEvents } from '../base/events';
import { createElement } from '../../utils/utils';
import { IProduct } from '../../types';

export interface IBasket {
	element: HTMLElement;
	titleElement: HTMLElement;
	listElement: HTMLElement;
	orderButton: HTMLButtonElement;
	priceElement: HTMLElement;
	updateTotalPrice(sum: number): void;
	render(): HTMLElement;
}

export class BasketView implements IBasket {
	element: HTMLElement;
	titleElement: HTMLElement;
	listElement: HTMLElement;
	orderButton: HTMLButtonElement;
	priceElement: HTMLElement;

	constructor(template: HTMLTemplateElement, protected events: IEvents) {
		this.element = template.content
			.querySelector('.basket')
			.cloneNode(true) as HTMLElement;
		this.titleElement = this.element.querySelector('.modal__title');
		this.listElement = this.element.querySelector('.basket__list');
		this.orderButton = this.element.querySelector('.basket__button');
		this.priceElement = this.element.querySelector('.basket__price');
		this.orderButton.addEventListener('click', () => {
			this.events.emit('order:open');
		});
		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.listElement.replaceChildren(...items);
			this.orderButton.removeAttribute('disabled');
		} else {
			this.orderButton.setAttribute('disabled', 'disabled');
			this.listElement.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent:
						'\u041a\u043e\u0440\u0437\u0438\u043d\u0430 \u043f\u0443\u0441\u0442\u0430',
				})
			);
		}
	}

	setItems(
		items: IProduct[],
		onRemove: (item: IProduct) => void,
		tplCardBasket: HTMLTemplateElement
	) {
		if (items.length) {
			const elements = items.map((item, index) => {
				const cardElement = tplCardBasket.content
					.querySelector('.basket__item')
					.cloneNode(true) as HTMLElement;
				cardElement.querySelector('.basket__item-index').textContent = String(
					index + 1
				);
				cardElement.querySelector('.card__title').textContent = item.title;
				cardElement.querySelector('.card__price').textContent = `${
					item.price ?? 0
				} синапсов`;
				cardElement
					.querySelector('.basket__item-delete')
					.addEventListener('click', () => onRemove(item));
				return cardElement;
			});
			this.listElement.replaceChildren(...elements);
			this.orderButton.removeAttribute('disabled');
		} else {
			this.orderButton.setAttribute('disabled', 'disabled');
			this.listElement.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	updateTotalPrice(sum: number) {
		this.priceElement.textContent = `${sum} \u0441\u0438\u043d\u0430\u043f\u0441\u043e\u0432`;
	}

	render() {
		this.titleElement.textContent =
			'\u041a\u043e\u0440\u0437\u0438\u043d\u0430';
		return this.element;
	}
}
