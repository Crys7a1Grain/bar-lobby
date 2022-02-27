import * as path from "path";
import * as fs from "fs";
import * as glob from "glob-promise";
import { AbstractContentAPI } from "@/api/content/abstract-content";
import { AI } from "@/model/ai";
import { EngineTagFormat } from "@/model/formats";
import { parseLuaTable } from "@/utils/parse-lua-table";

export class AiContentAPI extends AbstractContentAPI {
    protected engineAis: Record<EngineTagFormat, AI[]> = {};

    public async fetchAis(engine: EngineTagFormat) : Promise<AI[]> {
        if (this.engineAis[engine] !== undefined) {
            return this.engineAis[engine];
        }

        const ais: AI[] = [];
        const aisDir = path.join(this.dataDir, "engine", engine, "AI", "Skirmish");
        const aiDirs = await fs.promises.readdir(aisDir);

        for (const aiDir of aiDirs) {
            try {
                const ai = await this.fetchAi(path.join(aisDir, aiDir));
                ais.push(ai);
            } catch (err) {
                console.error(`Error parsing AI: ${aiDir}`, err);
            }
        }

        this.engineAis[engine] = ais;

        return ais;
    }

    protected async fetchAi(aiDirPath: string) : Promise<AI> {
        const filePaths = await glob.promise(`${aiDirPath}/**/{AIInfo.lua,AIOptions.lua,*.dll}`);

        const aiInfoPath = filePaths.find(filePath => filePath.endsWith("AIInfo.lua"));
        const aiOptionsPath = filePaths.find(filePath => filePath.endsWith("AIOptions.lua"));
        const dllPath = filePaths.find(filePath => filePath.endsWith(".dll"));

        if (aiInfoPath === undefined || dllPath === undefined) {
            throw new Error("AIInfo.lua or .dll not found");
        }

        const aiInfoFile = await fs.promises.readFile(aiInfoPath);
        const aiInfoFields = parseLuaTable(aiInfoFile);
        const aiInfo: Record<string, any> = {};
        for (const field of aiInfoFields) {
            aiInfo[field.key] = field.value;
        }

        const ai: AI = {
            id: aiInfo.shortName,
            name: aiInfo.name,
            description: aiInfo.description,
            version: aiInfo.version,
            url: aiInfo.url,
            loadSupported: aiInfo.loadSupported === "yes",
            interfaceShortName: aiInfo.interfaceShortName,
            interfaceVersion: aiInfo.interfaceVersion,
            ddlPath: dllPath,
        };

        if (aiOptionsPath) {
            const aiOptionsFile = await fs.promises.readFile(aiOptionsPath);
            ai.options = parseLuaTable(aiOptionsFile);
        }

        return ai;
    }
}