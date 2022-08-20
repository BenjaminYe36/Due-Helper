import {BaseDirectory, createDir, readTextFile, writeTextFile} from "@tauri-apps/api/fs";
import i18n from "../i18n/config";

interface SettingsObj {
    language: string; // language locale string
}

class Settings {
    static async getLanguage(): Promise<string> {
        return readTextFile('Database/Settings.json', {dir: BaseDirectory.App})
            .then((contents) => {
                console.log('found settings file');
                let obj = JSON.parse(contents);
                return obj.language;
            })
            .catch((e) => {
                // most likely file doesn't exist
                // use default language from navigator
                console.log("no settings file found");
                this.writeSettingsToJson({language: navigator.language});
                return navigator.language;
            });
    }

    static async changeLanguage(lng: string) {
        await i18n.changeLanguage(lng);
        await this.writeSettingsToJson({language: lng});
    }

    static async writeSettingsToJson(settings: SettingsObj) {
        await createDir('Database', {dir: BaseDirectory.App, recursive: true})
            .then(() => {
                console.log("create dir success");
                writeTextFile('Database/Settings.json', JSON.stringify(settings),
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