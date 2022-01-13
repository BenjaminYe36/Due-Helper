import {message} from "antd";
import {TaskInfo} from "./ModelAPI";


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
            .join("");
    }

    static getDateDifferenceInDays(date1: string, date2: string): number {
        let diff = new Date(date2).getTime() - new Date(date1).getTime();
        return Math.ceil(diff / (24 * 3600 * 1000));
    }

    // In milliseconds, to next day means to next 0:00 moment
    static getTimeToNextDay(): number {
        let d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(0);
        d.setMinutes(0);
        d.setSeconds(0);
        return d.getTime() - new Date().getTime();
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
        return this.isAvailable(task) && this.getDateDifferenceInDays(new Date().toISOString(), task.dueDate) <= 1;
    }

}

export default Util;