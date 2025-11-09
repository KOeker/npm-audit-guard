#!/usr/bin/env node

import { AuditGuardCLI } from './cli';

const cli = new AuditGuardCLI();
cli.setupCommands();
cli.parse(process.argv);