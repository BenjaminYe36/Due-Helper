import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en/translations.json';
import zh from './locales/zh/translations.json';

i18n.use(initReactI18next).init({
    fallbackLng: 'en',
    lng: navigator.language,
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