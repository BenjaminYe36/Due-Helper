import i18n from "../i18n/config";

interface SettingsObj {
    language: string; // language locale string
}

class Settings {
    static getLanguage(): string {
        const tmpResult = localStorage.getItem("Settings");
        if (tmpResult !== null) {
            console.log('found settings data');
            return JSON.parse(tmpResult).language;
        } else {
            console.log("no settings data found");
            return navigator.language;
        }
    }

    static async changeLanguage(lng: string) {
        await i18n.changeLanguage(lng);
        this.writeSettingsToJson({language: lng});
    }

    static writeSettingsToJson(settings: SettingsObj) {
        try {
            localStorage.setItem("Settings", JSON.stringify(settings));
        } catch (e) {
            console.log(e);
            alert("Out of storage space or denied permission for storage!");
        }
    }
}

export default Settings;