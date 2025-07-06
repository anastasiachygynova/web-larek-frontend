import { IEvents } from "../base/events";
import { IActions, IProduct } from "../../types";

export interface IPage {
  render(data: IProduct): HTMLElement;
}

export class ProductView implements IPage {
  protected _cardElement: HTMLElement;
  protected _cardCategory: HTMLElement;
  protected _cardTitle: HTMLElement;
  protected _cardImage: HTMLImageElement;
  protected _cardPrice: HTMLElement;
  protected _colors: Record<string, string> = {
    "дополнительное": "additional",
    "софт-скил": "soft",
    "кнопка": "button",
    "хард-скил": "hard",
    "другое": "other",
  };
  
  constructor(template: HTMLTemplateElement, protected events: IEvents, actions?: IActions) {
    this._cardElement = template.content.querySelector('.card').cloneNode(true) as HTMLElement;
    this._cardCategory = this._cardElement.querySelector('.card__category');
    this._cardTitle = this._cardElement.querySelector('.card__title');
    this._cardImage = this._cardElement.querySelector('.card__image');
    this._cardPrice = this._cardElement.querySelector('.card__price');
    
    if (actions?.onClick) {
      this._cardElement.addEventListener('click', actions.onClick);
    }
  }

  protected setTextContent(element: HTMLElement, value: unknown): string | undefined {
    if (element) {
      return (element.textContent = String(value));
    }
    return undefined;
  }

  set cardCategory(value: string) {
    this.setTextContent(this._cardCategory, value);
    const colorClass = this._colors[value] || 'other';
    this._cardCategory.className = `card__category card__category_${colorClass}`;
  }

  protected formatPrice(value: number | null): string {
    if (value === null) {
      return 'Бесценно';
    }
    return `${value} синапсов`;
  }

  render(data: IProduct): HTMLElement {
    this.cardCategory = data.category;
    this._cardTitle.textContent = data.title;
    this._cardImage.src = data.image;
    this._cardImage.alt = data.title;
    this._cardPrice.textContent = this.formatPrice(data.price);
    return this._cardElement;
  }
}