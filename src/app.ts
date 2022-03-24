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

  private gatherUserInp(): [string, string, number] | void {
    const enteredTitle = this.titleInpEl.value;
    const enteredDesc = this.descInpEl.value;
    const enteredPeople = this.peopleInpEl.value;

    // Validation
    if (
      enteredTitle.trim().length === 0 ||
      enteredDesc.trim().length === 0 ||
      enteredPeople.trim().length === 0
    ) {
      alert("Please fill out the form, completely !");
      return;
    } else {
      return [enteredTitle, enteredDesc, +enteredPeople];
    }
  }

  private clearInputFields() {
    this.titleInpEl.value = "";
    this.descInpEl.value = "";
    this.peopleInpEl.value = "";
  }

  @autoBind
  private submitForm(evnet: Event) {
    evnet.preventDefault();
    const userInp = this.gatherUserInp();

    if (!Array.isArray(userInp)) return;

    const [title, desc, people] = userInp;
    console.log(title, desc, people);

    this.clearInputFields();
  }

  private configureForm() {
    this.element.addEventListener("submit", this.submitForm);
  }

  private attachToHost(el: HTMLElement) {
    this.hostEl.insertAdjacentElement("afterbegin", el);
  }
}

const projInput = new ProjectInput();
