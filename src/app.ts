// Auto bind the "this" keyword
const autoBind = function (
  _1: any,
  _2: string,
  descriptor: PropertyDescriptor
) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
};

// ProjectInput
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

  @autoBind
  private submitForm(evnet: Event) {
    evnet.preventDefault();
  }

  private configureForm() {
    this.element.addEventListener("submit", this.submitForm);
  }

  private attachToHost(el: HTMLElement) {
    this.hostEl.insertAdjacentElement("afterbegin", el);
  }
}

const projInput = new ProjectInput();
