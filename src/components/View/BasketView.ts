import { IEvents } from "../base/events";
import { createElement } from "../../utils/utils";

export interface IBasket {
  element: HTMLElement;
  titleElement: HTMLElement;
  listElement: HTMLElement;
  orderButton: HTMLButtonElement;
  priceElement: HTMLElement;
  headerButton: HTMLButtonElement;
  headerCounter: HTMLElement;
  updateHeaderCounter(value: number): void;
  updateTotalPrice(sum: number): void;
  render(): HTMLElement;
}

export class BasketView implements IBasket {
  element: HTMLElement;
  titleElement: HTMLElement;
  listElement: HTMLElement;
  orderButton: HTMLButtonElement;
  priceElement: HTMLElement;
  headerButton: HTMLButtonElement;
  headerCounter: HTMLElement;
  
  constructor(template: HTMLTemplateElement, protected events: IEvents) {
    this.element = template.content.querySelector('.basket').cloneNode(true) as HTMLElement;
    this.titleElement = this.element.querySelector('.modal__title');
    this.listElement = this.element.querySelector('.basket__list');
    this.orderButton = this.element.querySelector('.basket__button');
    this.priceElement = this.element.querySelector('.basket__price');
    this.headerButton = document.querySelector('.header__basket');
    this.headerCounter = document.querySelector('.header__basket-counter');
    
    this.orderButton.addEventListener('click', () => { this.events.emit('order:open') });
    this.headerButton.addEventListener('click', () => { this.events.emit('basket:open') });

    this.items = [];
  }

  set items(items: HTMLElement[]) {
    if (items.length) {
      this.listElement.replaceChildren(...items);
      this.orderButton.removeAttribute('disabled');
    } else {
      this.orderButton.setAttribute('disabled', 'disabled');
      this.listElement.replaceChildren(createElement<HTMLParagraphElement>('p', { textContent: 'Корзина пуста' }));
    }
  }

  updateHeaderCounter(value: number) {
    this.headerCounter.textContent = String(value);
  }
  
  updateTotalPrice(sum: number) {
    this.priceElement.textContent = String(sum + ' синапсов');
  }

  render() {
    this.titleElement.textContent = 'Корзина';
    return this.element;
  }
}