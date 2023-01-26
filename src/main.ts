import * as core from '@actions/core'
import {uploadAppToWolfia} from './wolfia'
import * as github from '@actions/github'

async function runWolfiaAction(): Promise<void> {
  try {
    const trackId = core.getInput('track-id')
    const binaryPath = core.getInput('app-path')
    const gitSha = github.context.sha
    const uploadResult = await uploadAppToWolfia(trackId, gitSha, binaryPath)

    core.info(`Wolfia upload result: ${uploadResult}`)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

runWolfiaAction()
