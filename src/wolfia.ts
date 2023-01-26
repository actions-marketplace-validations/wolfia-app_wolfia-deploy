import * as core from '@actions/core'
import * as fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import type {AxiosResponse} from 'axios'
import axios from 'axios'

export async function uploadAppToWolfia(
  linkDescription: string,
  binaryPath: string,
  additionalInfo: string
): Promise<AxiosResponse<string>> {
  const apiKeyId = core.getInput('wolfia-api-key-id')
  const apiKeySecret = core.getInput('wolfia-api-key-secret')

  const formData = new FormData()
  formData.append(
    'binary',
    fs.readFileSync(binaryPath),
    path.parse(binaryPath).base
  )
  formData.append('trackId', linkDescription)
  formData.append('gitSha', additionalInfo)

  return axios.post('https://api.wolfia.com/upload/android', formData, {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
      'X-Api-Key-Id': apiKeyId,
      'X-Api-Key-Secret': apiKeySecret
    }
  })
}
