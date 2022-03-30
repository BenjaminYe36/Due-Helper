import {message} from "antd";
import {TaskInfo} from "./ModelAPI";

// Urgent day boundary, less than or equal to will be classified as urgent
const urgentDay = 1;
// Max delay due to the 32bit storage of delay for timeout
const maxDelay = Math.pow(2, 31) - 1;

class Util {
    static getDateFormatString(locale: string) {
        const formatObj = new Intl.DateTimeFormat(locale).formatToParts(new Date());

        return formatObj
            .map(obj => {
                switch (obj.type) {
                    case "day":
                        return "DD";
                    case "month":
                        return "MM";
                    case "year":
                        return "YYYY";
                    default:
                        return obj.value;
                }
            })
            .join("") + " HH:mm";
    }

    // Return the date in local format without seconds field
    static getLocalDate(date: string): string {
        const options = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};
        // @ts-ignore
        return new Date(date).toLocaleString(navigator.language, options);
    }

    static getDateDifferenceInMinutes(date1: string, date2: string): number {
        let diff = new Date(date2).getTime() - new Date(date1).getTime();
        return Math.ceil(diff / (60 * 1000));
    }

    // Return a string in "[some] day(s), [some] hour(s), [some] minutes" format
    // Note that day or hour will be hidden if number is 0
    static getTimeStringFromMinutes(minute: number): string {
        let day = Math.floor(minute / (24 * 60));
        minute -= day * 24 * 60;
        let hour = Math.floor(minute / 60);
        minute -= hour * 60;
        let timeString = '';
        if (day > 0) {
            timeString += `${day} day`;
            if (day > 1) {
                timeString += 's';
            }
        }
        if (hour > 0) {
            if (timeString.length > 0) {
                timeString += ' ';
            }
            timeString += `${hour} hour`;
            if (hour > 0) {
                timeString += 's';
            }
        }
        if (timeString.length > 0 && minute === 0) {
            return timeString;
        }
        if (timeString.length > 0) {
            timeString += ' ';
        }
        timeString += `${minute} minute`;
        if (minute > 1) {
            timeString += 's';
        }
        return timeString;
    }

    // In milliseconds, to next update (it means not available to available or not urgent to urgent)
    static getTimeToNextUpdate(tasks: TaskInfo[]): number {
        // set minTime to max milliseconds
        let minTime = 8640000000000000;
        let curTime = new Date().getTime();
        for (let i = 0; i < tasks.length; i++) {
            let task = tasks[i];
            if (!this.isAvailable(task)) {
                // @ts-ignore
                minTime = Math.min(minTime, new Date(task.availableDate).getTime());
            }
            let urgentDate = new Date(task.dueDate);
            urgentDate.setDate(urgentDate.getDate() - urgentDay);
            if (urgentDate.getTime() > curTime) {
                minTime = Math.min(minTime, urgentDate.getTime());
            }
        }
        return Math.min(maxDelay, minTime- curTime + 1000);
    }

    static validateTaskInfo(category: string | null, description: string,
                            availableDate: string | null, dueDate: string | null, completed: boolean): boolean {
        if (category === null) {
            message.warning("Category must be chosen!");
            return false;
        }
        if (description.trim().length === 0) {
            message.warning("Empty description not allowed!");
            return false;
        }
        if (dueDate === null) {
            message.warning("Due date must be chosen!");
            return false;
        }
        if (availableDate !== null &&
            new Date(availableDate).getTime() > new Date(dueDate).getTime()) {
            message.warning("Invalid dates, available date can't be later than due date!");
            return false;
        }
        if (completed && availableDate !== null
            && new Date().getTime() < new Date(availableDate).getTime()) {
            message.warning("Invalid date and completeness, can't be completed before task is available!");
            return false;
        }
        return true;
    }

    static isAvailable(task: TaskInfo): boolean {
        if (task.availableDate === null) {
            return true;
        } else return new Date(task.availableDate).getTime() <= new Date().getTime();
    }

    static isUrgent(task: TaskInfo): boolean {
        return this.isAvailable(task) &&
            this.getDateDifferenceInMinutes(new Date().toISOString(), task.dueDate) <= urgentDay * 24 * 60;
    }

}

export default Util;