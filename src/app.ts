// Drag and Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}
interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project type
enum ProjectStatus {
  Active,
  Finished,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management > Singleton
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    // Publisher-Subscriber pattern
    this.listeners.push(listenerFn);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, desc: string, numOfPeople: number) {
    const newProject = new Project(
      crypto.randomUUID().slice(-6),
      title,
      desc,
      numOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projID: string, newStatus: ProjectStatus) {
    const project = this.projects.find((proj) => proj.id === projID);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    this.listeners.forEach((listenerFn) => listenerFn(this.projects.slice()));
  }
}

const projectState = ProjectState.getInstance(); // Singleton

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

// Component Base Class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(
    templateID: string,
    hostElID: string,
    insertAtStart: boolean,
    newElID?: string
  ) {
    this.templateEl = document.querySelector(
      `#${templateID}`
    )! as HTMLTemplateElement;
    this.hostEl = document.querySelector(`#${hostElID}`)! as T;

    const importedHTMLcontent = document.importNode(
      this.templateEl.content,
      true
    );

    this.element = importedHTMLcontent.firstElementChild as U; // section#projects
    if (newElID) this.element.id = `${newElID}`;

    this.attachToHost(this.element, insertAtStart);
  }

  private attachToHost(el: HTMLElement, insertAtStart: boolean): void {
    this.hostEl.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      el
    );
  }

  abstract configure(): void;
  abstract renderContect(): void;
}

// ProjectItem
class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons(): string {
    return this.project.people === 1
      ? " 1 person"
      : ` ${this.project.people} persons`;
  }

  constructor(hostID: string, project: Project) {
    super("single-project", hostID, false, project.id);
    this.project = project;

    this.configure();
    this.renderContect();
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandler(_: DragEvent): void {}

  configure(): void {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHandler);
  }
  renderContect(): void {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned!";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// ProjectList
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProj: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProj = [];

    this.configure();
    this.renderContect();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const projID = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      projID,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autoBind
  dragLeaveHandler(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure(): void {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHandler);
    this.element.addEventListener("drop", this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const releventProjs = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProj = releventProjs;
      this.renderProjects();
    });
  }

  renderContect(): void {
    const listID = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listID;
    this.element.querySelector(
      "h2"
    )!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects(): void {
    const listEl = document.querySelector(
      `#${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = ""; //Remove duplicate Els
    this.assignedProj.forEach((proj) => {
      new ProjectItem(this.element.querySelector("ul")!.id, proj);
    });
  }
}

// ProjectInput
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInpEl: HTMLInputElement;
  descInpEl: HTMLInputElement;
  peopleInpEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-projects");

    this.titleInpEl = this.element.querySelector("#title") as HTMLInputElement;
    this.descInpEl = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInpEl = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitForm);
  }

  renderContect(): void {}

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
    projectState.addProject(title, desc, people);

    this.clearInputFields();
  }
}

const projInput = new ProjectInput();
const activeProjList = new ProjectList("active");
const finishedProjList = new ProjectList("finished");
