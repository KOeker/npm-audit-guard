#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cli_1 = require("./cli");
const cli = new cli_1.AuditGuardCLI();
cli.setupCommands();
cli.parse(process.argv);
//# sourceMappingURL=index.js.map