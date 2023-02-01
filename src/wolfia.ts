import * as core from '@actions/core'
import * as fs from 'fs'
import FormData from 'form-data'
import path from 'path'
import type {AxiosResponse} from 'axios'
import axios from 'axios'
import * as github from '@actions/github'
import {exec} from '@actions/exec'

const parseBuildId = (output: string): string | undefined =>
  output.match(/Delivery UUID: ([a-z0-9-]+)/)?.[1]

export async function uploadAppToWolfia(): Promise<AxiosResponse<string>> {
  const apiKeyId = core.getInput('wolfia-api-key-id', {required: true})
  const apiKeySecret = core.getInput('wolfia-api-key-secret', {required: true})
  const trackId = core.getInput('track-id', {required: true})
  const binaryPath = core.getInput('app-path', {required: true})
  const gitSha = github.context.sha

  if (!fs.existsSync(binaryPath)) {
    throw new Error(`App not found at ${binaryPath}`)
  }

  if (
    !binaryPath.endsWith('.apk') &&
    !binaryPath.endsWith('.aab') &&
    !binaryPath.endsWith('.ipa')
  ) {
    throw new Error(
      `App must be an Android (.apk or .aab) or iOS (.ipa) file. Path: ${binaryPath}`
    )
  }

  const formData = new FormData()
  formData.append(
    'binary',
    fs.readFileSync(binaryPath),
    path.parse(binaryPath).base
  )
  formData.append('trackId', trackId)
  formData.append('gitSha', gitSha)

  if (binaryPath.endsWith('.ipa')) {
    // TODO: Handle App Store Connect API secret
    const appConnectApiKey = core.getInput('app-connect-api-key-id', {
      required: true
    })
    const appConnectApiIssuer = core.getInput('app-connect-api-issuer', {
      required: true
    })

    let output = ''
    let errorOutput = ''
    const exitCode = await exec(
      `xcrun altool --upload-app --type ios --file "${binaryPath}" --apiKey "${appConnectApiKey}" --apiIssuer "${appConnectApiIssuer} --output-format json`,
      [],
      {
        listeners: {
          stdout: (data: Buffer) => {
            output += data.toString()
          },
          stderr: (data: Buffer) => {
            errorOutput += data.toString()
          }
        }
      }
    )

    if (exitCode !== 0) {
      throw new Error(
        `Failed to upload app to App Store Connect. Exit code: ${exitCode}. Output: ${output}. Error output: ${errorOutput}.`
      )
    }

    const buildId = parseBuildId(output)
    if (!buildId) {
      throw new Error(`Failed to parse build ID from output: ${output}.`)
    }
    formData.append('buildId', buildId)

    // TODO: Upload build ID to Wolfia
    return axios.post('https://api.wolfia.com/upload/ios', formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        'X-Api-Key-Id': apiKeyId,
        'X-Api-Key-Secret': apiKeySecret
      }
    })
  } else {
    return axios.post('https://api.wolfia.com/upload/android', formData, {
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData.getBoundary()}`,
        'X-Api-Key-Id': apiKeyId,
        'X-Api-Key-Secret': apiKeySecret
      }
    })
  }
}
