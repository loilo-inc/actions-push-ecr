const core = require("@actions/core");
const { exec } = require("@actions/exec");
import { URL } from "url";

async function main() {
  try {
    const region = core.getInput("region") ??
      process.env["AWS_DEFAULT_REGION"];
    const localImage = core.getInput("local-image");
    const pushImage = core.getInput("push-image");
    const url = new URL(`https://${pushImage}`);
    await loginToEcr(region, url.hostname);
    const pullImage = core.getInput("pull-image");
    if (pullImage) {
      await exec(`docker pull ${pullImage}`);
    }
    await exec(`docker tag ${localImage || pullImage} ${pushImage}`);
    await exec(`docker push ${pushImage}`);
  } catch (e) {
    core.setFailed(e.message);
  }
}

export async function loginToEcr(region: string, repoUrl: string) {
  console.log("logging in to ECR");
  let result = await exec("aws", [
    "ecr",
    "get-login-password",
    "--region",
    region,
  ]).promise();
  if (result.code !== 0) {
    throw new Error(result.stderr);
  }
  const login = await exec("docker", [
    "login",
    "--username",
    "AWS",
    "--password-stdin",
    repoUrl,
  ]);
  login.p.stdin.write(result.stdout);
  login.p.stdin.end();
  result = await login.promise();
  if (result.code !== 0) {
    throw new Error(result.stderr);
  }
  console.log("logged in");
}

if (require.main === module) {
  main();
}
