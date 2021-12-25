import {message} from "antd";

const {ipcRenderer} = window.require("electron");

class ModelAPI {
    private category: string[];

    constructor(category: string[]) {
        this.category = category;
    }

    public getCat(): string[] {
        return this.category;
    }

    public hasCat(cat: string): boolean {
        return this.category.indexOf(cat) !== -1;
    }

    public addCat(cat: string): void {
        if (this.category.indexOf(cat) === -1) {
            this.category = this.category.concat(cat);
            this.writeToJson();
        } else {
            message.warning("No duplicated names allowed!");
        }
        console.log(this.category);
    }

    public replaceCat(oldCat: string, newCat: string): void {
        if (this.category.indexOf(newCat) === -1) {
            let indexOfOld = this.category.indexOf(oldCat);
            if (indexOfOld === -1) {
                console.log("old category name not found, nothing is done in renaming");
                return;
            } else {
                this.category[indexOfOld] = newCat;
                this.writeToJson();
                console.log(this.category);
            }
        } else {
            message.warning("No duplicated names allowed!");
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
        let index = this.category.indexOf(cat);
        if (index === -1) {
            console.log("category not found, nothing is done in deleting");
            return;
        } else {
            this.category = this.category.filter((tmpCat) => tmpCat !== cat);
            this.writeToJson();
            console.log(this.category);
        }
    }

    private writeToJson() {
        let response =
            ipcRenderer.sendSync('writing-json-synchronous', JSON.stringify({"category": this.category}));
        console.log(response);
        console.log(JSON.stringify({"category": this.category}));
    }
}

export default ModelAPI;