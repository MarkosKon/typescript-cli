import chalk from "chalk";
import { strict as assert, deepEqual } from "node:assert";

{
  const test = "Number(1) equals 1.";

  const actual = Number(1);
  const expected = 1;
  assert(actual === expected);

  console.log(`${chalk.green("✓")} ${test} passed`);
}

{
  const test = "Object.create returns a new object.";

  const actual = Object.create({});
  const expected = {};
  deepEqual(actual, expected);

  console.log(`${chalk.green("✓")} ${test} passed`);
}

console.log(`${chalk.green("success:")} All tests have passed!`);
