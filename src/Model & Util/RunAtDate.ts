// A setTimeout Wrapper class to run a function at specific datetime function to bypass setTimeout limit
// It also keeps track of the latest timeoutID
class RunAtDate {
    private readonly date: Date;
    private readonly func: any;
    private timeoutID: any;

    constructor(date: Date, func: any) {
        this.date = date;
        this.func = func;
        this.runAtDate();
        console.log(`new RunAtDate created date:${date.toLocaleString()}`);
    }

    public runAtDate() {
        const now = (new Date()).getTime();
        const then = this.date.getTime();
        const diff = Math.max((then - now), 0);
        if (diff > 0x7FFFFFFF) {
            // setTimeout limit is MAX_INT32=(2^31-1)
            this.timeoutID = setTimeout(() => this.runAtDate(), 0x7FFFFFFF);
        } else {
            this.timeoutID = setTimeout(this.func, diff);
        }
    }

    public getTimeoutID(): any {
        return this.timeoutID;
    }
}

export default RunAtDate;