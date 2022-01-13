import {message} from "antd";
import {nanoid} from "nanoid";
import Util from "./Util";

export interface categoryWithColor {
    catName: string; // the name of the category
    color: string; // hex value of color for the tag of this category
}

export interface TaskInfo {
    id: string; // unique id of this task
    category: categoryWithColor; // Category this task is under
    description: string; // Description of the task
    availableDate: string | null; // Date string in ISO format for available date of this task
    dueDate: string; // Date string in ISO format for due date of this task
    completed: boolean; // the completed or not situation of this task (corresponds to checkbox)
}

const {ipcRenderer} = window.require("electron");

class ModelAPI {
    private category: categoryWithColor[];
    private taskList: TaskInfo[];

    constructor(category: categoryWithColor[], taskList: TaskInfo[]) {
        this.category = category;
        this.taskList = taskList;
    }

    // Methods related to observers and mutators of category

    public getCat(): categoryWithColor[] {
        return this.category;
    }

    public hasCat(catName: string): boolean {
        return this.category.findIndex((cat) => cat.catName === catName) !== -1;
    }

    public addCat(catName: string, color: string): void {
        if (this.hasCat(catName)) {
            message.warning("No duplicated names allowed!");
            return;
        }
        this.category = this.category.concat({catName: catName, color: color});
        this.writeToJson();
        console.log(this.category);
    }

    public replaceCatName(oldCatName: string, newCatName: string) {
        let indexOfOld = this.category.findIndex((cat) => cat.catName === oldCatName);
        if (indexOfOld === -1) {
            console.log("old category name not found, nothing is done in renaming");
            return;
        } else {
            this.replaceCat(oldCatName, newCatName, this.category[indexOfOld].color);
        }
    }

    public replaceCat(oldCatName: string, newCatName: string, newColor: string): void {
        if (this.hasCat(newCatName) && oldCatName !== newCatName) {
            message.warning("No duplicated names allowed!");
            return;
        }
        let indexOfOld = this.category.findIndex((cat) => cat.catName === oldCatName);
        if (indexOfOld === -1) {
            console.log("old category name not found, nothing is done in renaming");
            return;
        } else {
            // replace name and color in category array
            this.category[indexOfOld] = {catName: newCatName, color: newColor};
            // replace name and color in existing tasks
            this.taskList.map((task) => {
                if (task.category.catName === oldCatName) {
                    task.category.catName = newCatName;
                    task.category.color = newColor;
                }
                return null;
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

    public deleteCat(catName: string): void {
        if (this.category.findIndex((cat) => cat.catName === catName) === -1) {
            console.log("category not found, nothing is done in deleting");
            return;
        } else {
            // Delete name in category array
            this.category = this.category.filter((tmpCat) => tmpCat.catName !== catName);
            // Delete tasks with this category name in task array
            this.taskList = this.taskList.filter((task) => task.category.catName !== catName);
            this.writeToJson();
            console.log(this.category);
            console.log(this.taskList);
        }
    }

    // Methods related to observers and mutators of taskList

    public getTaskList(): TaskInfo[] {
        return this.taskList;
    }

    public addTask(category: categoryWithColor, description: string,
                   availableDate: string | null, dueDate: string, completed: boolean): void {
        if (!this.hasCat(category.catName)) {
            message.warning("Does not has this category, please recheck category of this task!");
            console.log(this.category);
            return;
        }
        if (!Util.validateTaskInfo(category.catName, description, availableDate, dueDate, completed)) {
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

    public replaceTask(id: string, category: categoryWithColor, description: string,
                       availableDate: string | null, dueDate: string, completed: boolean): void {
        let targetIndex = this.taskList.findIndex((t) => t.id === id);
        if (targetIndex === -1) {
            message.warning("Id not found, can't replace");
            return;
        }
        if (!Util.validateTaskInfo(category.catName, description, availableDate, dueDate, completed)) {
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