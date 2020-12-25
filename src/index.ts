const core = require("@actions/core");
const { exec } = require("@actions/exec");
import { URL } from "url";

async function main() {
  try {
    const region =
      core.getInput("region") ??
      process.env["AWS_DEFAULT_REGION"]
    const localImage = core.getInput("local-image");
    const pushImage = core.getInput("push-image");
    const url = new URL(`https://${pushImage}`);
    await exec(
      `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${url.hostname}`
    );
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

if (require.main === module) {
  main();
}
