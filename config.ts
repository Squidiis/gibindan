import fs from "fs";
import yaml from "js-yaml";
import path from "path";

interface Config {
  color: number;
}

let config: Config;

export function loadConfig(): Config {
  if (config) return config;

  const filePath = path.join(__dirname, "config.yaml");
  const fileContents = fs.readFileSync(filePath, "utf8");
  config = yaml.load(fileContents) as Config;

  return config;
}
