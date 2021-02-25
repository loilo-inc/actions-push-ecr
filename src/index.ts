import { ChildProcessWithoutNullStreams } from "child_process";
const core = require("@actions/core");
import { URL } from "url";
const cp = require("child_process");

async function main() {
  try {
    const region = core.getInput("region") ??
      process.env["AWS_DEFAULT_REGION"];
    const localImage = core.getInput("local-image");
    const pushImage = core.getInput("push-image");
    const pullImage = core.getInput("pull-image");
    const url = new URL(`https://${pushImage ?? pullImage}`);
    await loginToEcr(region, url.host);
    if (pullImage) {
      await execCmd("docker", ["pull", pullImage]);
    }
    await execCmd("docker", ["tag", localImage || pullImage, pushImage]);
    await execCmd("docker", ["push", pushImage]);
  } catch (e) {
    console.error(e)
    core.setFailed(e.message);
  }
}

export interface PromisedProcess<T> extends Promise<T> {
  p: ChildProcessWithoutNullStreams;
}
export interface SpawnResult {
  code: number;
  stdout: string;
  stderr: string;
}
export function execCmd(
  cmd: string,
  args: string[],
): PromisedProcess<SpawnResult> {
  const p = cp.spawn(cmd, args);
  const ret = new Promise<SpawnResult>((resolve, reject) => {
    const stdouts: string[] = [];
    const stderrs: string[] = [];
    p.stdout.on("data", (chunk: string) => {
      stdouts.push(chunk);
    });
    p.stderr.on("data", (chunk: string) => {
      stderrs.push(chunk);
    });
    p.on("error", reject).on("close", (code: number) => {
      resolve({
        code,
        stdout: stdouts.join(""),
        stderr: stderrs.join(""),
      });
    });
  });
  return Object.assign(ret, { p });
}

export async function loginToEcr(region: string, repoUrl: string) {
  console.log(`logging in to ECR: region=${region} repo=${repoUrl}`);
  let result = await execCmd("aws", [
    "ecr",
    "get-login-password",
    "--region",
    region,
  ]);
  if (result.code !== 0) {
    throw new Error(result.stderr);
  }
  const login = execCmd("docker", [
    "login",
    "--username",
    "AWS",
    "--password-stdin",
    repoUrl,
  ]);
  login.p.stdin.write(result.stdout);
  login.p.stdin.end();
  result = await login;
  if (result.code !== 0) {
    throw new Error(result.stderr);
  }
  console.log("logged in");
}

if (require.main === module) {
  main();
}
