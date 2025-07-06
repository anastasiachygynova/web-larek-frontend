import { IEvents } from "../base/events";

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

  constructor(modalContainer: HTMLElement, protected events: IEvents) {
    this.modalContainer = modalContainer;
    this.closeButton = modalContainer.querySelector('.modal__close') as HTMLButtonElement;
    this._content = modalContainer.querySelector('.modal__content') as HTMLElement;
    this._pageWrapper = document.querySelector('.page__wrapper') as HTMLElement;

    this.closeButton.addEventListener('click', this.close.bind(this));
    this.modalContainer.addEventListener('click', this.close.bind(this));
    
    const modalContainerElement = this.modalContainer.querySelector('.modal__container');
    if (modalContainerElement) {
      modalContainerElement.addEventListener('click', event => event.stopPropagation());
    }
  }


  set content(value: HTMLElement | null) {
    if (value) {
      this._content.replaceChildren(value);
    } else {
      this._content.innerHTML = '';
    }
  }

  get content(): HTMLElement | null {
    return this._content.firstElementChild as HTMLElement | null;
  }


  open(): void {
    this.modalContainer.classList.add('modal_active');
    this.events.emit('modal:open');
  }


  close(): void {
    this.modalContainer.classList.remove('modal_active');
    this.content = null; // очистка контента в модальном окне
    this.events.emit('modal:close');
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
