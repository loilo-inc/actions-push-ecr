const core = require("@actions/core");
const { exec } = require("@actions/exec");
const cp = require("child_process");

async function main() {
  try {
    const region = process.env["AWS_DEFAULT_REGION"] || core.getInput("region");
    cp.execSync("$(aws ecr get-login --no-include-email --region "+region+" )");
    const pullImage = core.getInput("pull-image");
    if (pullImage) {
      await exec(`docker pull ${pullImage}`);
    }
    const pushImage = core.getInput("push-image");
    const localImage = core.getInput("local-image");
    await exec(`docker tag ${localImage||pullImage} ${pushImage}`);
    await exec(`docker push ${pushImage}`)
  } catch (e) {
    core.setFailed(e.message);
  }
}

if (require.main === module) {
  main();
}