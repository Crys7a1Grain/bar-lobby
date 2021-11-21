import { settingsSchema, SettingsType } from "@/model/settings";
import Ajv from "ajv";
import { reactive, ToRefs, toRefs, watch } from "vue";
import * as fs from "fs";

export interface SettingsAPIConfig {
    settingsPath: string;
}
export class SettingsAPI {
    public settings: ToRefs<SettingsType>;

    protected config: SettingsAPIConfig;
    protected ajv = new Ajv({ coerceTypes: true, useDefaults: true });
    protected validator = this.ajv.compile(settingsSchema);

    constructor(config: SettingsAPIConfig) {
        this.config = config;

        this.settings = this.readSettingsSync(this.config.settingsPath);

        for (const setting of Object.values(this.settings)) {
            watch(setting, () => {
                this.writeSettings(this.config.settingsPath, this.settings);
            });
        }
    }

    protected validateSettings(settings: any) : settings is SettingsType {
        const isValid = this.validator(settings);
        return isValid;
    }

    protected readSettingsSync(path: string) : ToRefs<SettingsType> {
        let settings = {} as SettingsType;

        if (!fs.existsSync(path)) {
            this.validateSettings(settings);
            fs.writeFileSync(path, JSON.stringify(settings, null, 4));
        } else {
            settings = JSON.parse(fs.readFileSync(path, "utf8"));
            this.validateSettings(settings);
        }

        return toRefs(reactive(settings));
    }

    protected async writeSettings(path: string, settings: ToRefs<SettingsType>) {
        const obj: any = {};
        for (const key in settings) {
            obj[key] = settings[key as keyof SettingsType].value;
        }

        console.log(`writing settings to ${path}`);
        return fs.promises.writeFile(path, JSON.stringify(obj, null, 4));
    }

    protected hasSetting(key: string): key is keyof SettingsType {
        return key in settingsSchema;
    }
}