import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
    en: {
        translation: {
            "app.title": "DrawTogaf Architect",
            "nav.generate": "Generate",
            "nav.visualize": "Visualize",
            "nav.compliance": "Compliance",
            "action.toggleTheme": "Toggle Theme",
            "welcome.title": "Welcome to DrawTogaf",
            "welcome.subtitle": "AI-Powered Enterprise Architecture Generation"
        }
    },
    fr: {
        translation: {
            "app.title": "DrawTogaf Architecte",
            "nav.generate": "Générer",
            "nav.visualize": "Visualiser",
            "nav.compliance": "Conformité",
            "action.toggleTheme": "Changer de thème",
            "welcome.title": "Bienvenue sur DrawTogaf",
            "welcome.subtitle": "Génération d'Architecture d'Entreprise par IA"
        }
    },
    es: {
        translation: {
            "app.title": "DrawTogaf Arquitecto",
            "nav.generate": "Generar",
            "nav.visualize": "Visualizar",
            "nav.compliance": "Cumplimiento",
            "action.toggleTheme": "Cambiar tema",
            "welcome.title": "Bienvenido a DrawTogaf",
            "welcome.subtitle": "Generación de Arquitectura Empresarial con IA"
        }
    },
    de: {
        translation: {
            "app.title": "DrawTogaf Architekt",
            "nav.generate": "Generieren",
            "nav.visualize": "Visualisieren",
            "nav.compliance": "Compliance",
            "action.toggleTheme": "Thema wechseln",
            "welcome.title": "Willkommen bei DrawTogaf",
            "welcome.subtitle": "KI-gestützte Generierung von Unternehmensarchitektur"
        }
    }
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: "fr", // Default to French as per request context implication
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
