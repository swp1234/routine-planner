/**
 * I18n - Internationalization Manager
 * Supports 12 languages: ko, en, ja, zh, es, pt, id, tr, de, fr, hi, ru
 */

class I18n {
    constructor() {
        this.translations = {};
        this.supportedLanguages = ['ko', 'en', 'ja', 'zh', 'es', 'pt', 'id', 'tr', 'de', 'fr', 'hi', 'ru'];
        this.currentLang = this.detectLanguage();
        this.init();
    }

    init() {
        this.loadTranslations(this.currentLang).then(() => {
            this.updateUI();
        });
    }

    detectLanguage() {
        // 1. Check localStorage
        const saved = localStorage.getItem('selectedLanguage');
        if (saved && this.supportedLanguages.includes(saved)) {
            return saved;
        }

        // 2. Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages.includes(browserLang)) {
            return browserLang;
        }

        // 3. Default to English
        return 'en';
    }

    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return;
        }

        try {
            const response = await fetch(`js/locales/${lang}.json`);
            if (!response.ok) throw new Error(`Failed to load ${lang}`);
            this.translations[lang] = await response.json();
        } catch (error) {
            console.error(`Error loading language: ${lang}`, error);
            // Fallback to English
            if (lang !== 'en') {
                return this.loadTranslations('en');
            }
        }
    }

    t(key, defaultValue = key) {
        const keys = key.split('.');
        let value = this.translations[this.currentLang];

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }

        return value || defaultValue;
    }

    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language not supported: ${lang}`);
            return;
        }

        this.currentLang = lang;
        localStorage.setItem('selectedLanguage', lang);

        await this.loadTranslations(lang);
        this.updateUI();

        // Trigger custom event for app listening
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateUI() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const text = this.t(key);

            if (element.tagName === 'INPUT' || element.tagName === 'SELECT') {
                // For placeholders
                if (element.hasAttribute('data-i18n-placeholder')) {
                    element.placeholder = this.t(element.getAttribute('data-i18n-placeholder'));
                }
            } else {
                element.textContent = text;
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    getLanguageName(lang) {
        const names = {
            ko: '한국어',
            en: 'English',
            ja: '日本語',
            zh: '中文',
            es: 'Español',
            pt: 'Português',
            id: 'Bahasa Indonesia',
            tr: 'Türkçe',
            de: 'Deutsch',
            fr: 'Français',
            hi: 'हिन्दी',
            ru: 'Русский'
        };
        return names[lang] || lang;
    }
}

// Initialize on DOM ready
const i18n = new I18n();
