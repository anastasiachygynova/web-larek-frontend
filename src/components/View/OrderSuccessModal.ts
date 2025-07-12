import { IEvents } from "../base/events";

export interface ISuccess {
  success: HTMLElement;
  description: HTMLElement;
  button: HTMLButtonElement;
  render(total: number): HTMLElement;
}

export class OrderSuccessModal implements ISuccess {
  success: HTMLElement;
  description: HTMLElement;
  button: HTMLButtonElement;

  constructor(template: HTMLTemplateElement, protected events: IEvents) {
    this.success = template.content.querySelector('.order-success')?.cloneNode(true) as HTMLElement;
    if (!this.success) throw new Error('.order-success not found in template');

    this.description = this.success.querySelector('.order-success__description') as HTMLElement;
    if (!this.description) throw new Error('.order-success__description not found in template');

    this.button = this.success.querySelector('.order-success__close') as HTMLButtonElement;
    if (!this.button) throw new Error('.order-success__close not found in template');

    this.button.addEventListener('click', () => { this.events.emit('success:close'); });
  }

  render(total: number): HTMLElement {
    this.description.textContent = `Списано ${total} синапсов`;
    return this.success;
  }
}