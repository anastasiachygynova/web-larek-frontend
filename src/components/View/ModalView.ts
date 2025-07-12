import { IEvents } from '../base/events';

export interface IModal {
	open(): void;
	close(): void;
	render(): HTMLElement;
	locked: boolean;
	content: HTMLElement | null;
}

export class ModalView implements IModal {
	protected modalContainer: HTMLElement;
	protected closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected _pageWrapper: HTMLElement;
	private _isSuccess = false;

	constructor(
		modalContainer: HTMLElement,
		pageWrapper: HTMLElement,
		protected events: IEvents
	) {
		this.modalContainer = modalContainer;
		this.closeButton = modalContainer.querySelector(
			'.modal__close'
		) as HTMLButtonElement;
		this._content = modalContainer.querySelector(
			'.modal__content'
		) as HTMLElement;
		this._pageWrapper = pageWrapper;

		this.closeButton.addEventListener('click', this.close.bind(this));
		this.modalContainer.addEventListener('click', this.close.bind(this));
		this.modalContainer
			.querySelector('.modal__container')
			.addEventListener('click', (event) => event.stopPropagation());

		document.addEventListener('keydown', (event) => {
			if (
				event.key === 'Escape' &&
				this.modalContainer.classList.contains('modal_active')
			) {
				this.close();
			}
		});
	}

	set content(value: HTMLElement | null) {
		if (value) {
			this._isSuccess = value.classList.contains('order-success');
			this._content.replaceChildren(value);
		} else {
			this._isSuccess = false;
			this._content.replaceChildren();
		}
	}

	open(): void {
		this.modalContainer.classList.add('modal_active');
		this.locked = true;
		this.events.emit('modal:open');
	}

	close(): void {
		this.modalContainer.classList.remove('modal_active');
		const wasSuccess = this._isSuccess;
		this.content = null;
		this.locked = false;
		if (wasSuccess) {
			this.events.emit('success:close');
		} else {
			this.events.emit('modal:close');
		}
	}

	set locked(value: boolean) {
		if (value) {
			this._pageWrapper.classList.add('page__wrapper_locked');
		} else {
			this._pageWrapper.classList.remove('page__wrapper_locked');
		}
	}

	get locked(): boolean {
		return this._pageWrapper.classList.contains('page__wrapper_locked');
	}

	render(): HTMLElement {
		this.open();
		return this.modalContainer;
	}
}
