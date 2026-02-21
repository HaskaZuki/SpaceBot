const fs = require('fs');
const path = require('path');
const GuildConfig = require('../models/GuildConfig');

class I18n {
    constructor() {
        this.locales = {};
        this.defaultLocale = 'en';
        this.loadLocales();
    }

    loadLocales() {
        const localesDir = path.join(__dirname, '../locales');
        if (!fs.existsSync(localesDir)) return;

        const items = fs.readdirSync(localesDir, { withFileTypes: true });

        for (const item of items) {
            if (item.isDirectory()) {
                const langCode = item.name;
                this.locales[langCode] = {};
                const langDir = path.join(localesDir, langCode);
                const files = fs.readdirSync(langDir).filter(file => file.endsWith('.json'));

                for (const file of files) {
                    const namespace = file.split('.')[0];
                    try {
                        const content = fs.readFileSync(path.join(langDir, file), 'utf8');
                        this.locales[langCode][namespace] = JSON.parse(content);
                    } catch (err) {
                        console.error(`[i18n] Failed to load ${langCode}/${file}:`, err);
                    }
                }
                console.log(`[i18n] Loaded locale: ${langCode} (${files.length} files)`);
            }
        }
    }

    get(lang, key, args = {}) {
        const locale = this.locales[lang] || this.locales[this.defaultLocale];
        if (!locale) return key;

        const keys = key.split('.');
        let value = locale;

        for (const k of keys) {
            value = value?.[k];
            if (!value) break;
        }

        if (!value && lang !== this.defaultLocale) {
            return this.get(this.defaultLocale, key, args);
        }

        if (!value) return key;

        return String(value).replace(/\{(\w+)\}/g, (match, p1) => {
            return args[p1] !== undefined ? args[p1] : match;
        });
    }

    async getGuildLang(guildId) {
        try {
            const config = await GuildConfig.findOne({ guildId });
            return config?.language || this.defaultLocale;
        } catch (e) {
            return this.defaultLocale;
        }
    }
}

module.exports = new I18n();
