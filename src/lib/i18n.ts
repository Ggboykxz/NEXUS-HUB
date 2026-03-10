
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend) // Charge les traductions depuis une source externe (ex: /public/locales)
  .use(LanguageDetector) // Détecte la langue de l'utilisateur
  .use(initReactI18next) // Lie i18next avec React
  .init({
    fallbackLng: 'fr', // Langue par défaut si la détection échoue
    debug: process.env.NODE_ENV === 'development', // Active les logs en mode développement
    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs, donc pas besoin pour i18next
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // Chemin vers les fichiers de traduction
    },
  });

export default i18n;
