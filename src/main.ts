import * as core from '@actions/core'
import {uploadAppToWolfia} from './wolfia'

async function runWolfiaAction(): Promise<void> {
  try {
    const uploadResult = await uploadAppToWolfia()
    if (uploadResult.status !== 200) {
      core.setFailed(
        `Wolfia upload failed with status code ${uploadResult.status} and message ${uploadResult.data}`
      )
    } else {
      core.info(`Wolfia upload result: ${uploadResult.data}`)
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

runWolfiaAction()
