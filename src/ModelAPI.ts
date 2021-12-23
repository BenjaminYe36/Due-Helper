class ModelAPI {
    private category: string[];

    constructor(category: string[]) {
        this.category = category;
    }

    public getCat(): string[] {
        return this.category;
    }

    public addCat(cat: string): void {
        this.category = this.category.concat(cat);
    }

    public replaceCat(oldCat: string, newCat: string): void {
        let indexOfOld = this.category.indexOf(oldCat);
        if (indexOfOld === -1) {
            console.log("old category name not found, nothing is done in renaming");
            return;
        } else {
            this.category[indexOfOld] = newCat;
            console.log(this.category);
        }
    }

    public deleteCat(cat: string): void {
        let index = this.category.indexOf(cat);
        if (index === -1) {
            console.log("category not found, nothing is done in deleting");
            return;
        } else {
            this.category = this.category.filter((tmpCat) => tmpCat !== cat);
            console.log(this.category);
        }
    }
}

export default ModelAPI;