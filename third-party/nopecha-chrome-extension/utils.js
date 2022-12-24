'use strict';


/**
 * Set to true for the following behavior:
 * - Request server to recognize using bleeding-edge models
 * - Reload FunCAPTCHA on verification
 */
const IS_DEVELOPMENT = false;
// export const BASE_API = 'https://dev-api.nopecha.com';
const BASE_API = 'https://api.nopecha.com';


/**
 * Trying to be an Enum but javascript doesn't have enums
 */
class RunningAs {
    // Background script running on-demand
    static BACKGROUND = 'BACKGROUND';
    // Popup specified in manifest as "action"
    static POPUP = 'POPUP';
    // Content script running in page
    static CONTENT = 'CONTENT';
    // (somehow) Standalone run of script running in webpage
    static WEB = 'WEB';
}
Object.freeze(RunningAs);


const runningAt = (() => {
    let getBackgroundPage = globalThis?.chrome?.extension?.getBackgroundPage;
    if (getBackgroundPage){
        return getBackgroundPage() === window ? RunningAs.BACKGROUND : RunningAs.POPUP;
    }
    return globalThis?.chrome?.runtime?.onMessage ? RunningAs.CONTENT : RunningAs.WEB;
})();


function deep_copy(obj) {
    return JSON.parse(JSON.stringify(obj));
}


class Util {
    static CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    static pad_left(s, char, n) {
        while (`${s}`.length < n) {
            s = `${char}${s}`;
        }
        return s;
    }

    static capitalize(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }

    static parse_int(s, fallback) {
        if (!s) {
            s = fallback;
        }
        return parseInt(s);
    }

    static parse_bool(s, fallback) {
        if (s === 'true') {
            s = true;
        }
        else if (s === 'false') {
            s = false;
        }
        else {
            s = fallback;
        }
        return s;
    }

    static parse_string(s, fallback) {
        if (!s) {
            s = fallback;
        }
        return s;
    }

    static parse_json(s, fallback) {
        if (!s) {
            s = fallback;
        }
        else {
            s = JSON.parse(s);
        }
        return s;
    }

    static generate_id(n) {
        let result = '';
        for (let i = 0; i < n; i++) {
            result += Util.CHARS.charAt(Math.floor(Math.random() * Util.CHARS.length));
        }
        return result;
    }
}


class Time {
    static time() {
        if (!Date.now) {
            Date.now = () => new Date().getTime();
        }
        return Date.now();
    }

    static date() {
        return new Date();
    }

    static sleep(i=1000) {
        return new Promise(resolve => setTimeout(resolve, i));
    }

    static async random_sleep(min, max) {
        const duration = Math.floor(Math.random() * (max - min) + min);
        return await Time.sleep(duration);
    }

    static seconds_as_hms(t) {
        t = Math.max(0, t);
        const hours = Util.pad_left(Math.floor(t / 3600), '0', 2);
        t %= 3600;
        const minutes = Util.pad_left(Math.floor(t / 60), '0', 2);
        const seconds = Util.pad_left(Math.floor(t % 60), '0', 2);
        return `${hours}:${minutes}:${seconds}`;
    }

    static string(d=null) {
        if (!d) {
            d = Time.date();
        }
        const month = Util.pad_left(d.getMonth() + 1, '0', 2);
        const date = Util.pad_left(d.getDate(), '0', 2);
        const year = d.getFullYear();
        const hours = Util.pad_left(d.getHours() % 12, '0', 2);
        const minutes = Util.pad_left(d.getMinutes(), '0', 2);
        const seconds = Util.pad_left(d.getSeconds(), '0', 2);
        const period = d.getHours() >= 12 ? 'PM' : 'AM';
        return `${month}/${date}/${year} ${hours}:${minutes}:${seconds} ${period}`;
    }
}


class SettingsManager {
    static DEFAULT = {
        version: 15,
        key: '',

        enabled: true,
        disabled_hosts: [],

        hcaptcha_auto_open: true,
        hcaptcha_auto_solve: true,
        hcaptcha_solve_delay: true,
        hcaptcha_solve_delay_time: 3000,

        recaptcha_auto_open: true,
        recaptcha_auto_solve: true,
        recaptcha_solve_delay: true,
        recaptcha_solve_delay_time: 1000,
        recaptcha_solve_method: 'Image',

        funcaptcha_auto_open: true,
        funcaptcha_auto_solve: true,
        funcaptcha_solve_delay: true,
        funcaptcha_solve_delay_time: 1000,

        awscaptcha_auto_open: true,
        awscaptcha_auto_solve: true,
        awscaptcha_solve_delay: true,
        awscaptcha_solve_delay_time: 1000,

        textcaptcha_auto_solve: true,
        textcaptcha_solve_delay: true,
        textcaptcha_solve_delay_time: 100,
        textcaptcha_image_selector: '',
        textcaptcha_input_selector: '',
    };

    static ENCODE_FIELDS = {
        enabled: {parse: Util.parse_bool, encode: encodeURIComponent},
        disabled_hosts: {parse: Util.parse_json, encode: e => encodeURIComponent(JSON.stringify(e))},

        hcaptcha_auto_open: {parse: Util.parse_bool, encode: encodeURIComponent},
        hcaptcha_auto_solve: {parse: Util.parse_bool, encode: encodeURIComponent},
        hcaptcha_solve_delay: {parse: Util.parse_bool, encode: encodeURIComponent},
        hcaptcha_solve_delay_time: {parse: Util.parse_int, encode: encodeURIComponent},

        recaptcha_auto_open: {parse: Util.parse_bool, encode: encodeURIComponent},
        recaptcha_auto_solve: {parse: Util.parse_bool, encode: encodeURIComponent},
        recaptcha_solve_delay: {parse: Util.parse_bool, encode: encodeURIComponent},
        recaptcha_solve_delay_time: {parse: Util.parse_int, encode: encodeURIComponent},
        recaptcha_solve_method: {parse: Util.parse_string, encode: encodeURIComponent},

        funcaptcha_auto_open: {parse: Util.parse_bool, encode: encodeURIComponent},
        funcaptcha_auto_solve: {parse: Util.parse_bool, encode: encodeURIComponent},
        funcaptcha_solve_delay: {parse: Util.parse_bool, encode: encodeURIComponent},
        funcaptcha_solve_delay_time: {parse: Util.parse_int, encode: encodeURIComponent},

        awscaptcha_auto_open: {parse: Util.parse_bool, encode: encodeURIComponent},
        awscaptcha_auto_solve: {parse: Util.parse_bool, encode: encodeURIComponent},
        awscaptcha_solve_delay: {parse: Util.parse_bool, encode: encodeURIComponent},
        awscaptcha_solve_delay_time: {parse: Util.parse_int, encode: encodeURIComponent},

        textcaptcha_auto_solve: {parse: Util.parse_bool, encode: encodeURIComponent},
        textcaptcha_solve_delay: {parse: Util.parse_bool, encode: encodeURIComponent},
        textcaptcha_solve_delay_time: {parse: Util.parse_int, encode: encodeURIComponent},
        textcaptcha_image_selector: {parse: Util.parse_string, encode: encodeURIComponent},
        textcaptcha_input_selector: {parse: Util.parse_string, encode: encodeURIComponent},
    };

    static IMPORT_URL = 'https://nopecha.com/setup';
    static DELIMITER = '|';

    static export(settings) {
        if (!settings.key) {
            return false;
        }

        const fields = [settings.key];
        for (const k in SettingsManager.ENCODE_FIELDS) {
            fields.push(`${k}=${SettingsManager.ENCODE_FIELDS[k].encode(settings[k])}`);
        }

        const encoded_hash = `#${fields.join(SettingsManager.DELIMITER)}`;

        return `${SettingsManager.IMPORT_URL}${encoded_hash}`;
    }

    static import(encoded_hash) {
        const settings = {};

        // Split by delimiter
        const fields = encoded_hash.split(SettingsManager.DELIMITER);
        if (fields.length === 0) {
            return settings;
        }

        // Parse key
        const key = fields.shift();
        if (key.length <= 1) {
            console.error('invalid key for settings', key);
            return settings;
        }
        settings.key = key.substring(1);

        // Parse additional fields
        for (const field of fields) {
            const kv = field.split('=');
            const k = kv.shift();
            const v_raw = kv.join('=');

            if (!(k in SettingsManager.ENCODE_FIELDS)) {
                console.error('invalid field for settings', field);
                continue;
            }

            const v = decodeURIComponent(v_raw);
            console.log('v', v);
            settings[k] = SettingsManager.ENCODE_FIELDS[k].parse(v, SettingsManager.DEFAULT[k]);
        }

        return settings;
    }
}
