import {message} from "antd";
import {SubtaskInfo, TaskInfo} from "./ModelAPI";
import {BaseDirectory, readTextFile} from "@tauri-apps/api/fs";
import i18n from '../i18n/config';

// Urgent day boundary, less than or equal to will be classified as urgent
const urgentDay = 1;
// Max delay due to the 32bit storage of delay for timeout
const maxDelay = Math.pow(2, 31) - 1;

const t = i18n.t;

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
            timeString += `${day} ${t('time.day')}`;
            if (day > 1) {
                timeString += t('time.s');
            }
        }
        if (hour > 0) {
            if (timeString.length > 0) {
                timeString += ' ';
            }
            timeString += `${hour} ${t('time.hour')}`;
            if (hour > 0) {
                timeString += t('time.s');
            }
        }
        if (timeString.length > 0 && minute === 0) {
            return timeString;
        }
        if (timeString.length > 0) {
            timeString += ' ';
        }
        timeString += `${minute} ${t('time.minute')}`;
        if (minute > 1) {
            timeString += t('time.s');
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
        return Math.min(maxDelay, minTime - curTime + 1000);
    }

    static validateTaskInfo(category: string | null, description: string,
                            availableDate: string | null, dueDate: string | null, completed: boolean,
                            subtaskList: SubtaskInfo[]): boolean {
        if (category === null) {
            // @ts-ignore
            message.warning(t('warn.must-choose-cat'));
            return false;
        }
        if (description.trim().length === 0) {
            // @ts-ignore
            message.warning(t('warn.no-empty-desc'));
            return false;
        }
        if (dueDate === null) {
            // @ts-ignore
            message.warning(t('warn.no-due'));
            return false;
        }
        if (availableDate !== null &&
            new Date(availableDate).getTime() > new Date(dueDate).getTime()) {
            // @ts-ignore
            message.warning(t('warn.available-after-due'));
            return false;
        }
        if ((completed || subtaskList.some((subtask) => subtask.completed)) && availableDate !== null
            && new Date().getTime() < new Date(availableDate).getTime()) {
            // @ts-ignore
            message.warning(t('warn.not-available-but-complete'));
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

    static async existsFile(path: string): Promise<boolean> {
        return readTextFile(path, {dir: BaseDirectory.App})
            .then((contents) => {
                return true;
            })
            .catch((e) => {
                return false;
            });
    }
}

export default Util;