class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInpEl: HTMLInputElement;
  descInpEl: HTMLInputElement;
  peopleInpEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.querySelector(
      "#project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.querySelector("#app")! as HTMLDivElement;

    const importedHTMLcontent = document.importNode(
      this.templateEl.content,
      true
    );
    this.element = importedHTMLcontent.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    this.titleInpEl = this.element.querySelector("#title") as HTMLInputElement;
    this.descInpEl = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInpEl = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configureForm();
    this.attachToHost(this.element);
  }

  private submitForm(evnet: Event) {
    evnet.preventDefault();
  }

  private configureForm() {
    this.element.addEventListener("submit", this.submitForm.bind(this));
  }

  private attachToHost(el: HTMLElement) {
    this.hostEl.insertAdjacentElement("afterbegin", el);
  }
}

const projInput = new ProjectInput();
