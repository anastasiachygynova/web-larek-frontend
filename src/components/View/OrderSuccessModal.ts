export class OrderSuccessModal {
  private modalElement: HTMLElement;
  private amountElement: HTMLElement;
  private closeButton: HTMLElement;
  private continueButton: HTMLElement;

  constructor(modalElement: HTMLElement) {
    this.modalElement = modalElement;
    this.amountElement = modalElement.querySelector(
      '.order-success__amount'
    ) as HTMLElement;
    this.closeButton = modalElement.querySelector(
      '.modal__close'
    ) as HTMLElement;
    this.continueButton = modalElement.querySelector(
      '.order-success__continue'
    ) as HTMLElement;
  }
}

render(total: number) {
  this.description.textContent = String(`Списано ${total} синапсов`);
  return this.success
}
