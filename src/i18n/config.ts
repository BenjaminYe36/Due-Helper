import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en/translations.json';
import zh from './locales/zh/translations.json';
import Settings from "../Model & Util/Settings";

i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    lng: await Settings.getLanguage(),
    resources: {
        en: {
            translation: en
        },
        zh: {
            translation: zh
        }
    }
});

i18n.languages = ['en', 'zh'];

export default i18n;