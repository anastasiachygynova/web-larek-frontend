import { Product } from '../../types';

export class ProductView {
  protected element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  setElementText(element: HTMLElement, text: string): void {
    element.textContent = text;
  }

  
  setCategoryClass(element: HTMLElement, category: string): void {
    element.className = category;
  }

  getPriceString(price: number): string {
    return `${price.toLocaleString()} синапсов`;
  }
}

render(product: Product): void {}