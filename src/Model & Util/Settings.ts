import {BaseDirectory, createDir, writeTextFile} from "@tauri-apps/api/fs";
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

    public async changeLanguage(lng: string) {
        await i18n.changeLanguage(lng);
        this.language = lng;
        await this.writeSettingsToJson();
    }

    public getTimePairs(): [number, string][] {
        try {
            return Util.parseCommaSeparatedTimeString(this.postponeTimeStr);
        }
        catch (e) {
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
        createDir('Database', {dir: BaseDirectory.App, recursive: true})
            .then(() => {
                console.log("create dir success");
                writeTextFile('Database/Settings.json', JSON.stringify({
                        language: this.language,
                        postponeTimeStr: this.postponeTimeStr
                    }),
                    {dir: BaseDirectory.App})
                    .then(() => {
                        console.log('write to settings json success');
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            })
            .catch((e) => {
                console.log(e);
            });
    }
}

export default Settings;