import { existsSync, mkdirSync } from 'fs';
import { exec } from '@actions/exec';
import path from 'path';

const Docker = {
  async run(image, parameters, silent = false) {
    let runCommand = '';
    switch (process.platform) {
      case 'linux':
        runCommand = this.getLinuxCommand(image, parameters);
        break;
      case 'win32':
        runCommand = this.getWindowsCommand(image, parameters);
    }
    await exec(runCommand, undefined, { silent });
  },
  getWindowsCommand(image, parameters): string {
    const {
      actionFolder,
      editorVersion,
      workspace,
      projectPath,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      useHostNetwork,
      sshAgent,
      gitPrivateToken,
      githubToken,
      runnerTemporaryPath,
    } = parameters;

    const githubHome = path.join(runnerTemporaryPath, '_github_home');
    if (!existsSync(githubHome)) mkdirSync(githubHome);
    const githubWorkflow = path.join(runnerTemporaryPath, '_github_workflow');
    if (!existsSync(githubWorkflow)) mkdirSync(githubWorkflow);
    const testPlatforms = (
      testMode === 'all' ? ['playmode', 'editmode', 'COMBINE_RESULTS'] : [testMode]
    ).join(';');

    return `docker run \
        --workdir /github/workspace \
        --rm \
        --env UNITY_LICENSE \
        --env UNITY_LICENSE_FILE \
        --env UNITY_EMAIL \
        --env UNITY_PASSWORD \
        --env UNITY_SERIAL \
        --env UNITY_VERSION="${editorVersion}" \
        --env PROJECT_PATH="${projectPath}" \
        --env CUSTOM_PARAMETERS="${customParameters}" \
        --env TEST_PLATFORMS="${testPlatforms}" \
        --env COVERAGE_OPTIONS="${coverageOptions}" \
        --env COVERAGE_RESULTS_PATH="CodeCoverage" \
        --env ARTIFACTS_PATH="${artifactsPath}" \
        --env GITHUB_WORKSPACE=c:/github/workspace \
        --env GITHUB_REF \
        --env GITHUB_SHA \
        --env GITHUB_REPOSITORY \
        --env GITHUB_ACTOR \
        --env GITHUB_WORKFLOW \
        --env GITHUB_HEAD_REF \
        --env GITHUB_BASE_REF \
        --env GITHUB_EVENT_NAME \
        --env GITHUB_WORKSPACE=/github/workspace \
        --env GITHUB_ACTION \
        --env GITHUB_EVENT_PATH \
        --env RUNNER_OS \
        --env RUNNER_TOOL_CACHE \
        --env RUNNER_TEMP \
        --env RUNNER_WORKSPACE \
        ${gitPrivateToken ? `--env GIT_PRIVATE_TOKEN="${gitPrivateToken}"` : ''} \
        ${sshAgent ? '--env SSH_AUTH_SOCK=/ssh-agent' : ''} \
        --volume "${workspace}":"c:/github/workspace" \
        --volume "c:/regkeys":"c:/regkeys" \
        --volume "C:/Program Files (x86)/Microsoft Visual Studio":"C:/Program Files (x86)/Microsoft Visual Studio" \
        --volume "C:/Program Files (x86)/Windows Kits":"C:/Program Files (x86)/Windows Kits" \
        --volume "C:/ProgramData/Microsoft/VisualStudio":"C:/ProgramData/Microsoft/VisualStudio" \
        --volume "${actionFolder}/platforms/windows":"c:/steps" \
        --volume "${actionFolder}/BlankProject":"c:/BlankProject" \
        ${useHostNetwork ? '--net=host' : ''} \
        ${githubToken ? '--env USE_EXIT_CODE=false' : '--env USE_EXIT_CODE=true'} \
        ${image} \
        powershell c:/steps/entrypoint.ps1`;
  },

  getLinuxCommand(image, parameters): string {
    const {
      actionFolder,
      editorVersion,
      workspace,
      projectPath,
      customParameters,
      testMode,
      coverageOptions,
      artifactsPath,
      useHostNetwork,
      sshAgent,
      gitPrivateToken,
      githubToken,
      runnerTemporaryPath,
    } = parameters;

    const githubHome = path.join(runnerTemporaryPath, '_github_home');
    if (!existsSync(githubHome)) mkdirSync(githubHome);
    const githubWorkflow = path.join(runnerTemporaryPath, '_github_workflow');
    if (!existsSync(githubWorkflow)) mkdirSync(githubWorkflow);
    const testPlatforms = (
      testMode === 'all' ? ['playmode', 'editmode', 'COMBINE_RESULTS'] : [testMode]
    ).join(';');

    return `docker run \
        --workdir /github/workspace \
        --rm \
        --env UNITY_LICENSE \
        --env UNITY_LICENSE_FILE \
        --env UNITY_EMAIL \
        --env UNITY_PASSWORD \
        --env UNITY_SERIAL \
        --env UNITY_VERSION="${editorVersion}" \
        --env PROJECT_PATH="${projectPath}" \
        --env CUSTOM_PARAMETERS="${customParameters}" \
        --env TEST_PLATFORMS="${testPlatforms}" \
        --env COVERAGE_OPTIONS="${coverageOptions}" \
        --env COVERAGE_RESULTS_PATH="CodeCoverage" \
        --env ARTIFACTS_PATH="${artifactsPath}" \
        --env GITHUB_WORKSPACE=/github/workspace \
        --env GITHUB_REF \
        --env GITHUB_SHA \
        --env GITHUB_REPOSITORY \
        --env GITHUB_ACTOR \
        --env GITHUB_WORKFLOW \
        --env GITHUB_HEAD_REF \
        --env GITHUB_BASE_REF \
        --env GITHUB_EVENT_NAME \
        --env GITHUB_WORKSPACE=/github/workspace \
        --env GITHUB_ACTION \
        --env GITHUB_EVENT_PATH \
        --env RUNNER_OS \
        --env RUNNER_TOOL_CACHE \
        --env RUNNER_TEMP \
        --env RUNNER_WORKSPACE \
        ${gitPrivateToken ? `--env GIT_PRIVATE_TOKEN="${gitPrivateToken}"` : ''} \
        ${sshAgent ? '--env SSH_AUTH_SOCK=/ssh-agent' : ''} \
        --volume "${githubHome}":"/root:z" \
        --volume "${githubWorkflow}":"/github/workflow:z" \
        --volume "${workspace}":"/github/workspace:z" \
        --volume "${actionFolder}/platforms/ubuntu/steps:/steps:z" \
        --volume "${actionFolder}/platforms/ubuntu/entrypoint.sh:/entrypoint.sh:z" \
        ${useHostNetwork ? '--net=host' : ''} \
        ${githubToken ? '--env USE_EXIT_CODE=false' : '--env USE_EXIT_CODE=true'} \
        ${image} \
        /bin/bash -c /entrypoint.sh`;
  },
};

export default Docker;
