"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigLoader = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class ConfigLoader {
    constructor() {
        this.configFileName = '.auditguardrc.json';
    }
    loadConfig(cwd = process.cwd()) {
        const configPath = path.join(cwd, this.configFileName);
        if (!fs.existsSync(configPath)) {
            return null;
        }
        try {
            const configContent = fs.readFileSync(configPath, 'utf-8');
            return JSON.parse(configContent);
        }
        catch (error) {
            throw new Error(`Error loading config file: ${error.message}`);
        }
    }
    mergeConfig(cliBlacklist, cliIncludeDev, configFile) {
        let blacklist = [];
        let includeDev = false;
        if (configFile) {
            if (configFile.blacklist) {
                blacklist = [...configFile.blacklist];
            }
            if (configFile.includeDev !== undefined) {
                includeDev = configFile.includeDev;
            }
        }
        if (cliBlacklist) {
            blacklist = cliBlacklist.split(',').map((pkg) => pkg.trim());
        }
        if (cliIncludeDev !== undefined) {
            includeDev = cliIncludeDev;
        }
        return { blacklist, includeDev };
    }
}
exports.ConfigLoader = ConfigLoader;
//# sourceMappingURL=config.js.map