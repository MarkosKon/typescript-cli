#! /usr/bin/env node

import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

import { darkGray, green, red, reset, yellow } from "./colors.js";

const version = "0.1.0";
// const programName = process.argv[1];
const programName = "typescript-cli";
const verbose =
  process.argv.includes("-V") || process.argv.includes("--verbose");

const args = process.argv.slice(2);

function printHelp() {
  console.log(`Usage: ${programName} [OPTION].. [FILE]..

What this program does. For example, this dummy program prints the current directory or the contents of the given files.

Options:
  --pwd                      : Print the current working directory.
  -V, --verbose              : Show additional information during execution.
  -v, --version              : Show the version number.
  -h, --help                 : Show this help menu.

Examples:
  1) ${programName} --pwd
  2) ${programName} -h

Made by your_name (your_contact_details).
For bugs and feature requests, please open an issue at https://github.com/your_username/your_repo/issues.
`);
}

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
} else if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
} else if (args.includes("--pwd")) {
  try {
    const pwd = spawn("pwd");

    pwd.stdout.pipe(process.stdout);
    pwd.stderr.pipe(process.stderr);

    pwd.on("exit", (code) => {
      process.exit(code !== null ? code : 0);
    });
  } catch (error) {
    console.error(
      `${red}error${reset} unknown (${programName}): ${String(error)}`
    );
    process.exit(1);
  }
} else {
  const files = args.filter(
    (argument) => !["-V", "--verbose"].includes(argument)
  );

  if (files.length === 0) {
    printHelp();
    console.error(
      `${red}error${reset} (${programName}): Pass at least one file or use the --pwd flag.`
    );
    process.exit(1);
  }

  args
    .filter((argument) => !["-V", "--verbose"].includes(argument))
    .forEach((file) => {
      try {
        const filePath = resolve(file);
        const readSteam = createReadStream(filePath, { encoding: "utf8" });

        readSteam.on("data", (data) => {
          console.log(
            `${green}success${reset} (${programName}): File contents for '${file}':`
          );
          console.log(data);
        });

        readSteam.on("error", (error) => {
          console.error(
            `${red}error${reset} readStream (${programName}):  ${String(error)}`
          );
          process.exitCode = 1;
        });
      } catch (error) {
        console.error(
          `${red}error${reset} unknown (${programName}): ${String(error)}`
        );
        process.exit(1);
      }
    });
}

process.on("exit", function onExit() {
  if (process.exitCode !== undefined && process.exitCode !== 0) {
    console.warn(
      `${yellow}warning${reset} (${programName}): Program exited with errors.`
    );
  } else if (process.exitCode === 0 && verbose) {
    console.info(
      `${darkGray}info (${programName}): Program exited successfully.${reset}`
    );
  }
});
