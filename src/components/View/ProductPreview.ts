import { ProductView } from './ProductView';
import { IActions, IProduct } from "../../types";
import { IEvents } from "../base/events";

export interface ICard {
  text: HTMLElement;
  button: HTMLElement;
  render(data: IProduct): HTMLElement;
}

export class ProductPreview extends ProductView implements ICard {
  text: HTMLElement;
  button: HTMLElement;

  constructor(template: HTMLTemplateElement, protected events: IEvents, actions?: IActions) {
    super(template, events, actions);
    this.text = this._cardElement.querySelector('.card__text');
    this.button = this._cardElement.querySelector('.card__button');
    this.button.addEventListener('click', () => { this.events.emit('card:addBasket') });
  }

  notSale(data:IProduct) {
    if(data.price) {
      return 'Купить'
    } else {
      this.button.setAttribute('disabled', 'true')
      return 'Не продается'
    }
  }

  render(data: IProduct, basketItems: IProduct[] = []): HTMLElement {
    this.cardCategory = data.category;
    this._cardTitle.textContent = data.title;
    this._cardImage.src = data.image;
    this._cardImage.alt = data.title;
    this._cardPrice.textContent = this.formatPrice(data.price);
    this.text.textContent = data.description;

    const inBasket = basketItems.some(item => item.id === data.id);

    if (!data.price) {
      this.button.textContent = 'Не продается';
      this.button.setAttribute('disabled', 'true');
    } else if (inBasket) {
      this.button.textContent = 'Уже в корзине';
      this.button.setAttribute('disabled', 'true');
    } else {
      this.button.textContent = 'Купить';
      this.button.removeAttribute('disabled');
    }

    return this._cardElement;
  }
}