import {message} from "antd";
import {nanoid} from "nanoid";
import {BaseDirectory, createDir, writeTextFile} from "@tauri-apps/api/fs";
import Util from "./Util";
import i18n from '../i18n/config';

export interface CategoryWithColor {
    catName: string; // the name of the category
    color: string; // hex value of color for the tag of this category
}

export interface SubtaskInfo {
    id: string; // unique id of this subtask
    description: string; // Description of this subtask
    completed: boolean; // the completed or not situation of this subtask (corresponds to checkbox)
}

export interface TaskInfo {
    id: string; // unique id of this task
    category: CategoryWithColor; // Category this task is under
    description: string; // Description of the task
    availableDate: string | null; // Date string in ISO format for available date of this task
    dueDate: string; // Date string in ISO format for due date of this task
    completed: boolean; // the completed or not situation of this task (corresponds to checkbox)
    subtaskList?: SubtaskInfo[]; // optional field for list of subtasks
}

const t = i18n.t;

class ModelAPI {
    private category: CategoryWithColor[];
    private taskList: TaskInfo[];

    constructor(category: CategoryWithColor[], taskList: TaskInfo[]) {
        this.category = category;
        this.taskList = taskList;
    }

    // Methods related to observers and mutators of category

    public getCat(): CategoryWithColor[] {
        return this.category;
    }

    public hasCat(catName: string): boolean {
        return this.category.findIndex((cat) => cat.catName === catName) !== -1;
    }

    public addCat(catName: string, color: string): void {
        if (this.hasCat(catName)) {
            // @ts-ignore
            message.warning(t('warn.no-duplicate-cat'));
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
            // @ts-ignore
            message.warning(t('warn.no-duplicate-cat'));
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

    public addTask(category: CategoryWithColor, description: string,
                   availableDate: string | null, dueDate: string,
                   completed: boolean, subtaskList: SubtaskInfo[]): void {
        if (!this.hasCat(category.catName)) {
            // @ts-ignore
            message.warning(t('warn.no-this-cat'));
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
            completed: completed,
            subtaskList: subtaskList
        };
        this.taskList = this.taskList.concat(task);
        this.writeToJson();
        console.log(this.taskList);
    }

    public replaceTask(id: string, category: CategoryWithColor, description: string,
                       availableDate: string | null, dueDate: string,
                       completed: boolean, subTaskList: SubtaskInfo[]): void {
        let targetIndex = this.taskList.findIndex((t) => t.id === id);
        if (targetIndex === -1) {
            // @ts-ignore
            message.warning(t('warn.no-id'));
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
            completed: completed,
            subtaskList: subTaskList
        };
        this.writeToJson();
        console.log(this.taskList);
    }

    // Flip the completed status of the task with the given id
    public checkTask(id: string): void {
        let targetIndex = this.taskList.findIndex((t) => t.id === id);
        if (targetIndex === -1) {
            // @ts-ignore
            message.warning(t('warn.no-id'));
            return;
        }
        this.taskList[targetIndex].completed = !this.taskList[targetIndex].completed;

        // if switch to completed, all subtask under should also be completed
        if (this.taskList[targetIndex].completed && this.taskList[targetIndex].subtaskList) {
            this.taskList[targetIndex].subtaskList?.map((t) => {
                t.completed = true;
                return t;
            });
        } else if (this.taskList[targetIndex].subtaskList) { // similar in switch to incomplete case
            this.taskList[targetIndex].subtaskList?.map((t) => {
                t.completed = false;
                return t;
            });
        }
        this.writeToJson();
        console.log(this.taskList);
    }

    // Flip the completed status of the subtask specified by task and subtask id
    public checkSubtask(taskId: string, subtaskId: string) {
        let targetIndex = this.taskList.findIndex((t) => t.id === taskId);
        if (targetIndex === -1) {
            // @ts-ignore
            message.warning(t('warn.no-id'));
            return;
        }
        let subtaskIndex = this.taskList[targetIndex].subtaskList?.findIndex((t) => t.id === subtaskId);
        if (subtaskIndex === undefined || subtaskIndex === -1) {
            // @ts-ignore
            message.warning(t('warn.no-sub-id'));
            return;
        }
        let subtask = this.taskList[targetIndex].subtaskList?.[subtaskIndex];
        subtask!.completed = !subtask!.completed;

        // if all subtasks are completed, the main task should switch to completed as well
        if (this.taskList[targetIndex].subtaskList?.filter((t) => !t.completed).length === 0) {
            this.taskList[targetIndex].completed = true;
        } else { // if one or more subtask is not completed, the main task should not be completed
            this.taskList[targetIndex].completed = false;
        }
        this.writeToJson();
        console.log(this.taskList);
    }

    public deleteTask(id: string): void {
        if (this.taskList.findIndex((t) => t.id === id) === -1) {
            // @ts-ignore
            message.warning(t('warn.no-id'));
            return;
        } else {
            this.taskList = this.taskList.filter((t) => t.id !== id);
            this.writeToJson();
            console.log(this.taskList);
        }
    }

    public writeToJson() {
        createDir('Database', {dir: BaseDirectory.App, recursive: true})
            .then(() => {
                console.log("create dir success");
                writeTextFile('Database/taskData.json', JSON.stringify({
                    category: this.category,
                    taskList: this.taskList
                }), {dir: BaseDirectory.App})
                    .then(() => {
                        console.log('write to json success');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
        console.log(JSON.stringify({category: this.category, taskList: this.taskList}));
    }
}

export default ModelAPI;