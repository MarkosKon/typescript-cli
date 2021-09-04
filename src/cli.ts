#! /usr/bin/env node

import chalk from "chalk";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const files = process.argv.slice(2);

if (files.includes("--pwd")) {
  const pwd = spawn("pwd");

  pwd.stdout.pipe(process.stdout);
  pwd.stderr.pipe(process.stderr);

  pwd.on("exit", (code) => {
    process.exit(code || 0);
  });
} else {
  files.forEach((file) => {
    try {
      const filePath = resolve(file);
      const readSteam = createReadStream(filePath, { encoding: "utf8" });

      readSteam.on("data", (data) => {
        console.log(chalk.green.underline(`File contents for '${file}''`));
        console.log(data);
      });

      readSteam.on("error", (error) => {
        console.error(`${chalk.red.bold("error (readStream)")} ${error}`);
      });
    } catch (error) {
      console.error(`${chalk.red.bold("error")} ${error}`);
    }
  });
}
