import * as core from '@actions/core'
import * as fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import type {AxiosResponse} from 'axios'
import axios from 'axios'
import * as github from '@actions/github'

export async function uploadAppToWolfia(): Promise<AxiosResponse<string>> {
  const apiKeyId = core.getInput('wolfia-api-key-id')
  const apiKeySecret = core.getInput('wolfia-api-key-secret')
  const trackId = core.getInput('track-id')
  const binaryPath = core.getInput('app-path')
  const gitSha = github.context.sha

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`App not found at ${binaryPath}`)
  }
  const formData = new FormData()
  formData.append(
    'binary',
    fs.readFileSync(binaryPath),
    path.parse(binaryPath).base
  )
  formData.append('trackId', trackId)
  formData.append('gitSha', gitSha)

  return axios.post('https://api.wolfia.com/upload/android', formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      'X-Api-Key-Id': apiKeyId,
      'X-Api-Key-Secret': apiKeySecret
    }
  })
}
