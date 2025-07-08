import { IProduct } from "../../types";
import { IEvents } from "../base/events";

export interface IProductCardsModel {
  productCards: IProduct[];
  setProductCards(cards: IProduct[]): void;
}

export class ProductCardsModel implements IProductCardsModel {
  private _productCards: IProduct[] = [];

  constructor(protected events: IEvents) {}

  get productCards(): IProduct[] {
    return this._productCards;
  }

  setProductCards(cards: IProduct[]): void {
    this._productCards = cards;
    this.events.emit('productCards:receive');
  }
} 