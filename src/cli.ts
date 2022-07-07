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
let verbose = false;
let printARandomNumber = false;
let fetchHtml = false;
let url = new URL("https://example.org");
let printWorkingDirectory = false;
const files: string[] = [];

/* eslint-disable prettier/prettier */
// prettier-ignore
function printHelp() {
  console.log(`Usage: ${programName} [OPTION].. [FILE]..

What this program does. For example, this dummy program prints the current directory
or the contents of the given files.

Options:
  -f, --fetch          Fetch ${url.href} and print the response. The default
                       is to ${fetchHtml ? "fetch" : "not fetch"} ${url.href}.

  -u, --url            The URL to fetch. --fetch true is implied if --url is
                       set. The default URL is ${url.href}.

  -r, --random         Display a random number between 1 and 10. The default
                       is to ${printARandomNumber ? "print" : "not print"} a random number.

  -p, --pwd            Print the current working directory. The default is
                       to ${printWorkingDirectory ? "print" : "not print"} the current working directory.

  -V, --verbose        Show additional information during execution. The
                       default is ${String(verbose)}.

  -v, --version        Show the version number.

  -h, --help           Show this help menu.

Examples:
  1) ${programName} --pwd
  2) ${programName} -h

Made by your_name (your_contact_details).
For bugs and feature requests, please open an issue at
https://github.com/your_username/your_repo/issues.
`);
}
/* eslint-enable prettier/prettier */

const argsCopy = [...process.argv.slice(2)];

while (argsCopy.length > 0) {
  // Using if/elseif instead of switch because I want to
  // use regular expressions for unknown options, at the end.

  // eslint-disable-next-line unicorn/prefer-switch
  if (argsCopy[0] === "--help" || argsCopy[0] === "-h") {
    printHelp();
    process.exit(0);
  } else if (argsCopy[0] === "--version" || argsCopy[0] === "-v") {
    console.log(version);
    process.exit(0);
  } else if (argsCopy[0] === "--verbose" || argsCopy[0] === "-V") {
    verbose = true;
    // TODO show warning on conflicting options, e.g. -V --no-V.
  } else if (argsCopy[0] === "--no-verbose" || argsCopy[0] === "--no-V") {
    verbose = false;
  } else if (argsCopy[0] === "--random" || argsCopy[0] === "-r") {
    printARandomNumber = true;
  } else if (argsCopy[0] === "--no-random" || argsCopy[0] === "--no-r") {
    printARandomNumber = false;
  } else if (argsCopy[0] === "--fetch" || argsCopy[0] === "-f") {
    fetchHtml = true;
  } else if (argsCopy[0] === "--no-fetch" || argsCopy[0] === "--no-f") {
    fetchHtml = false;
  } else if (argsCopy[0] === "--pwd" || argsCopy[0] === "-p") {
    printWorkingDirectory = true;
  } else if (argsCopy[0] === "--no-pwd" || argsCopy[0] === "--no-p") {
    printARandomNumber = false;
  } else if (/^--?u(rl)?/.test(argsCopy[0])) {
    fetchHtml = true;
    try {
      if (argsCopy[0].includes("=")) {
        url = new URL(argsCopy[0].split("=")[1]);
      } else {
        url = new URL(argsCopy[1]);
        argsCopy.shift();
      }
    } catch {
      console.error(
        `${red}error${reset} ${programName}: A URL for -u, --url is required. For example, '${programName} -u https://example.com/'.`
      );
      process.exitCode = 1;
      process.exit(1);
    }
  } else if (/^--?.*/.test(argsCopy[0])) {
    printHelp();
    console.error(
      `${red}error${reset} ${programName}: Unknown option '${argsCopy[0]}'.`
    );
    process.exitCode = 1;
    process.exit(1);
  } else {
    files.push(argsCopy[0]);
  }

  argsCopy.shift();
}

if (verbose) {
  console.info({
    programOptions: {
      verbose,
      printARandomNumber,
      fetchHtml,
      printWorkingDirectory,
      files,
      url,
    },
  });
}

function handlePwdError(error: unknown) {
  console.warn(
    `${yellow}warning${reset} (${programName}): Encountered an error while trying to call pwd. Reverting to Node and process.cwd(). ${String(
      error
    )}`
  );

  console.log(process.cwd());
}
if (printWorkingDirectory) {
  try {
    const pwd = spawn("pwd");
    pwd.stdout.pipe(process.stdout);
    pwd.on("error", (error) => handlePwdError(error));
    pwd.on("exit", (code) => {
      if (code !== null) {
        process.exitCode = code;
      }
    });
  } catch (error) {
    handlePwdError(error);
  }
}

if (fetchHtml) {
  fetch(url.href)
    .then((response) => {
      if (response.ok) return response;
      process.exitCode = 1;
      throw new Error(`${response.status} ${response.statusText}`);
    })
    .then((response) => response.text())
    .then((text) => {
      console.log(`Here's your html text for ${String(url)}:\n${text}`);
      return text;
    })
    .catch((error) => console.error(error));
}

if (printARandomNumber) {
  console.log(
    `${green}success${reset} (${programName}): Here is a random number between 1-10: ${random(
      1,
      10
    )}.`
  );
}

if (
  files.length === 0 &&
  !printARandomNumber &&
  !fetchHtml &&
  !printWorkingDirectory
) {
  printHelp();
  console.error(
    `${red}error${reset} (${programName}): Pass at least one file or use the --pwd, --fetch, or --random flags.`
  );
  process.exitCode = 1;
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
