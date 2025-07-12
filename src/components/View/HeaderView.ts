import { IEvents } from '../base/events';

export class HeaderView {
	private headerElement: HTMLElement;
	private basketButton: HTMLButtonElement;
	private basketCounter: HTMLElement;
	private events: IEvents;

	constructor(headerElement: HTMLElement, events: IEvents) {
		this.headerElement = headerElement;
		this.events = events;
		this.basketButton = this.headerElement.querySelector(
			'.header__basket'
		) as HTMLButtonElement;
		this.basketCounter = this.headerElement.querySelector(
			'.header__basket-counter'
		) as HTMLElement;
		this.basketButton.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	updateBasketCounter(count: number) {
		this.basketCounter.textContent = String(count);
	}
}
