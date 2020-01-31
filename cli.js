#!/usr/bin/env node

const { Select } = require("enquirer");
const yaml = require("yaml");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function getFunctionNames() {
  return Object.keys(parseServerlessFile().functions);
}

function parseServerlessFile() {
  const p = path.join(process.cwd(), "serverless.yml");
  try {
    const file = fs.readFileSync(p, "utf8");
    return yaml.parse(file);
  } catch (e) {
    if (e.code === "ENOENT") {
      console.error(`cannot find file: ${p}`);
      process.exit(1);
    }

    console.error(e);
  }
}

async function run() {
  const prompt = new Select({
    name: "fnName",
    message: "Select function to run",
    choices: getFunctionNames()
  });

  try {
    const fnName = await prompt.run();

    /* forward all arguments to sls */
    const args = process.argv
      .slice(2)
      .map(function(arg) {
        return "'" + arg.replace(/'/g, "'\\''") + "'";
      })
      .join(" ");
    const cmd = `sls invoke local -f ${fnName} ${args}`;

    console.log(`\nrunning: ${cmd}`);

    const result = execSync(cmd, {
      encoding: "utf8"
    });

    console.log(`\nresult: \n \n${result}`);
  } catch (e) {
    console.error(e);
  }
}

run();
