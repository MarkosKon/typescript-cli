/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { strict as assert, deepEqual } from "node:assert";

import { green, reset } from "../src/colors.js";

{
  const test = "Number(1) equals 1.";

  const actual = Number(1);
  const expected = 1;
  assert(actual === expected);

  console.log(`${green}✓${reset} ${test} passed`);
}

{
  const test = "Object.create returns a new object.";

  const actual = Object.create({});
  const expected = {};
  deepEqual(actual, expected);

  console.log(`${green}✓${reset} ${test} passed`);
}

console.log(`${green}success:${reset} All tests have passed!`);
