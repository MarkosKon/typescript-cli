#! /usr/bin/env node

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

import fetch from "node-fetch";
import { random } from "lodash-es";
// import lodash from "lodash"; // import a commonjs module

import { darkGray, green, red, reset, yellow } from "./colors.js";
import { version, bin } from "../package.json";

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const programName = Object.keys(bin)[0];
const verbose =
  process.argv.includes("-V") || process.argv.includes("--verbose");

const args = process.argv.slice(2);

function printHelp() {
  console.log(`Usage: ${programName} [OPTION].. [FILE]..

What this program does. For example, this dummy program prints the current directory
or the contents of the given files.

Options:
  -f, --fetch                : Fetch example.org and print the response.
  -r, --random               : Display a random number between 1 and 10.
  -p, --pwd                  : Print the current working directory.
  -V, --verbose              : Show additional information during execution.
  -v, --version              : Show the version number.
  -h, --help                 : Show this help menu.

Examples:
  1) ${programName} --pwd
  2) ${programName} -h

Made by your_name (your_contact_details).
For bugs and feature requests, please open an issue at
https://github.com/your_username/your_repo/issues.
`);
}

function handlePwdError(error: unknown) {
  console.warn(
    `${yellow}warning${reset} (${programName}): Encountered an error while trying to call pwd. Reverting to Node and process.cwd(). ${String(
      error
    )}`
  );

  console.log(process.cwd());
  process.exit(0);
}

if (args.includes("--help") || args.includes("-h")) {
  printHelp();
  process.exit(0);
} else if (args.includes("--version") || args.includes("-v")) {
  console.log(version);
  process.exit(0);
} else if (args.includes("--random") || args.includes("-r")) {
  console.log(
    `${green}success${reset} (${programName}): Here is a random number between 1-10: ${random(
      1,
      10
    )}.`
  );
} else if (args.includes("--fetch") || args.includes("-f")) {
  fetch("https://example.org")
    .then((response) => {
      if (response.ok) return response;
      throw new Error(`${response.status} ${response.statusText}`);
    })
    .then((response) => response.text())
    .then((text) => {
      console.log(`Here's your html text for https://example.org:\n${text}`);
      return text;
    })
    .catch((error) => console.error(error));
} else if (args.includes("--pwd") || args.includes("-p")) {
  try {
    const pwd = spawn("pwd");

    pwd.stdout.pipe(process.stdout);

    pwd.on("error", (error) => handlePwdError(error));

    pwd.on("exit", (code) => {
      process.exit(code !== null ? code : 0);
    });
  } catch (error) {
    handlePwdError(error);
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

  files.forEach((file) => {
    try {
      const filePath = path.resolve(file);
      const readSteam = fs.createReadStream(filePath, { encoding: "utf8" });

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
