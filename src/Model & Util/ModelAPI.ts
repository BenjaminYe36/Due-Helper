import {message} from "antd";
import {TaskInfo} from "../Components/Todo";
import {nanoid} from "nanoid";

const {ipcRenderer} = window.require("electron");

class ModelAPI {
    private category: string[];
    private taskList: TaskInfo[];

    constructor(category: string[], taskList: TaskInfo[]) {
        this.category = category;
        this.taskList = taskList;
    }

    // Methods related to observers and mutators of category

    public getCat(): string[] {
        return this.category;
    }

    public hasCat(cat: string): boolean {
        return this.category.indexOf(cat) !== -1;
    }

    public addCat(cat: string): void {
        if (this.category.indexOf(cat) !== -1) {
            message.warning("No duplicated names allowed!");
            return;
        }
        this.category = this.category.concat(cat);
        this.writeToJson();
        console.log(this.category);
    }

    public replaceCat(oldCat: string, newCat: string): void {
        if (this.category.indexOf(newCat) !== -1) {
            message.warning("No duplicated names allowed!");
            return;
        }
        let indexOfOld = this.category.indexOf(oldCat);
        if (indexOfOld === -1) {
            console.log("old category name not found, nothing is done in renaming");
            return;
        } else {
            // replace name in category array
            this.category[indexOfOld] = newCat;
            // replace name in existing tasks
            this.taskList.map((task) => {
                if (task.category === oldCat) {
                    task.category = newCat;
                }
            });
            this.writeToJson();
            console.log(this.category);
            console.log(this.taskList);
        }
    }

    public moveCat(oldIndex: number, newIndex: number) {
        let tmp = this.category[oldIndex];
        if (oldIndex < newIndex) {
            for (let i = oldIndex; i < newIndex; i++) {
                this.category[i] = this.category[i + 1];
            }
        } else if (oldIndex > newIndex) {
            for (let i = oldIndex; i > newIndex; i--) {
                this.category[i] = this.category[i - 1];
            }
        }
        this.category[newIndex] = tmp;
        this.writeToJson();
        console.log(this.category);
    }

    public deleteCat(cat: string): void {
        if (this.category.indexOf(cat) === -1) {
            console.log("category not found, nothing is done in deleting");
            return;
        } else {
            // Delete name in category array
            this.category = this.category.filter((tmpCat) => tmpCat !== cat);
            // Delete tasks with this category name in task array
            this.taskList = this.taskList.filter((task) => task.category !== cat);
            this.writeToJson();
            console.log(this.category);
            console.log(this.taskList);
        }
    }

    // Methods related to observers and mutators of taskList

    public getTaskList(): TaskInfo[] {
        return this.taskList;
    }

    public addTask(category: string, description: string,
                   availableDate: string | null, dueDate: string, completed: boolean): void {
        if (!this.hasCat(category)) {
            message.warning("Does not has this category, please recheck category of this task!");
            return;
        }
        if (availableDate !== null && new Date(availableDate).getTime() > new Date(dueDate).getTime()) {
            message.warning("Invalid dates, available date can't be later than due date!");
            return;
        }
        let task: TaskInfo = {
            id: nanoid(),
            category: category,
            description: description,
            availableDate: availableDate,
            dueDate: dueDate,
            completed: completed
        };
        this.taskList = this.taskList.concat(task);
        this.writeToJson();
        console.log(this.taskList);
    }

    public replaceTask(id: string, category: string, description: string,
                       availableDate: string | null, dueDate: string, completed: boolean): void {
        let targetIndex = this.taskList.findIndex((t) => t.id === id);
        if (targetIndex === -1) {
            message.warning("Id not found, can't replace");
            return;
        }
        this.taskList[targetIndex] = {
            id: id,
            category: category,
            description: description,
            availableDate: availableDate,
            dueDate: dueDate,
            completed: completed
        };
        this.writeToJson();
        console.log(this.taskList);
    }

    public deleteTask(id: string): void {
        if (this.taskList.findIndex((t) => t.id === id) === -1) {
            message.warning("Id not found, can't delete");
            return;
        } else {
            this.taskList = this.taskList.filter((t) => t.id !== id);
            this.writeToJson();
            console.log(this.taskList);
        }
    }

    private writeToJson() {
        let response =
            ipcRenderer.sendSync('writing-json-synchronous', JSON.stringify({
                category: this.category,
                taskList: this.taskList
            }));
        console.log(response);
        console.log(JSON.stringify({category: this.category, taskList: this.taskList}));
    }
}

export default ModelAPI;