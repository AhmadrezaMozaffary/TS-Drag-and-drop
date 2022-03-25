// Validation logic
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const validate = function (validatableObj: Validatable): boolean {
  let isValid = true;
  // Required or NOT
  if (validatableObj.required) {
    isValid = isValid && validatableObj.value.toString().trim().length !== 0;
  }
  // Satisfies minLength ?
  if (
    validatableObj.minLength != null &&
    typeof validatableObj.value === "string"
  ) {
    isValid =
      isValid && validatableObj.value.length >= validatableObj.minLength;
  }
  // Satisfies maxLength ?
  if (
    validatableObj.maxLength != null &&
    typeof validatableObj.value === "string"
  ) {
    isValid =
      isValid && validatableObj.value.length <= validatableObj.maxLength;
  }
  // Minimum
  if (validatableObj.min != null && typeof validatableObj.value === "number") {
    isValid = isValid && validatableObj.value >= validatableObj.min;
  }
  // Maximum
  if (validatableObj.max != null && typeof validatableObj.value === "number") {
    isValid = isValid && validatableObj.value <= validatableObj.max;
  }
  return isValid;
};

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

// ProjectList
class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: "active" | "finished") {
    this.templateEl = document.querySelector(
      "#project-list"
    )! as HTMLTemplateElement;
    this.hostEl = document.querySelector("#app")! as HTMLDivElement;

    const importedHTMLcontent = document.importNode(
      this.templateEl.content,
      true
    );

    this.element = importedHTMLcontent.firstElementChild as HTMLElement; // section#projects
    this.element.id = `${this.type}-projects`;

    this.attachToHost(this.element);
    this.renderContect();
  }

  private renderContect() {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attachToHost(el: HTMLElement) {
    this.hostEl.insertAdjacentElement("beforeend", el);
  }
}

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
    const titleValid: Validatable = { value: enteredTitle, required: true };
    const descValid: Validatable = {
      value: enteredDesc,
      required: true,
      minLength: 5,
    };
    const peopleValid: Validatable = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 10,
    };

    if (
      !validate(titleValid) ||
      !validate(descValid) ||
      !validate(peopleValid)
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
const activeProjList = new ProjectList("active");
const finishedProjList = new ProjectList("finished");
