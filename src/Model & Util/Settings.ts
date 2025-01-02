import i18n from "../i18n/config";
import Util from "./Util";

export interface SettingsObj {
    language: string; // language locale string
    postponeTimeStr: string; // the postpone time string, in the format of "[number] [time unit],..."
}

export const defaultPostponeTImeStr = '1 day,1 week,1 month';

class Settings {
    private language: string;
    private postponeTimeStr: string;

    constructor(language: string, postponeTimeStr: string) {
        if (language) {
            this.language = language;
        } else {
            this.language = navigator.language;
        }
        if (postponeTimeStr) {
            this.postponeTimeStr = postponeTimeStr;
        } else {
            this.postponeTimeStr = defaultPostponeTImeStr;
        }
    }

    public getLanguage(): string {
        const tmpResult = localStorage.getItem("Settings");
        if (tmpResult !== null) {
            console.log('found settings data');
            return JSON.parse(tmpResult).language;
        } else {
            console.log("no settings data found");
            return navigator.language;
        }
    }

    public async changeLanguage(lng: string) {
        await i18n.changeLanguage(lng);
        this.language = lng;
        await this.writeSettingsToJson();
    }

    public getTimePairs(): [number, string][] {
        try {
            return Util.parseCommaSeparatedTimeString(this.postponeTimeStr);
        } catch (e) {
            return [];
        }
    }

    public getPostponeTimeStr() {
        return this.postponeTimeStr;
    }

    public changePostponeStr(postponeStr: string) {
        // just call once to validate, if invalid will throw error
        Util.parseCommaSeparatedTimeString(postponeStr);
        this.postponeTimeStr = postponeStr;
        this.writeSettingsToJson();
    }

    public writeSettingsToJson() {
        try {
            localStorage.setItem("Settings", JSON.stringify({
                language: this.language,
                postponeTimeStr: this.postponeTimeStr
            }));
        } catch (e) {
            console.log(e);
            alert("Out of storage space or denied permission for storage!");
        }
    }
}

export default Settings;