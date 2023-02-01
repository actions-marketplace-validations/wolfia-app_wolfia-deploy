import * as core from '@actions/core'
import * as fs from 'fs'
import * as os from 'os'
import FormData from 'form-data'
import path from 'path'
import type {AxiosResponse} from 'axios'
import axios from 'axios'
import * as github from '@actions/github'
import {getExecOutput} from '@actions/exec'

const parseBuildId = (output: string): string | undefined =>
  output.match(/Delivery UUID: ([a-z0-9-]+)/)?.[1]

const isMacOS = (): boolean => os.platform() === 'darwin'

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
    if (!isMacOS())
      throw new Error(
        'Uploading iOS apps is only supported on macOS runners. See: https://docs.github.com/en/actions/using-github-hosted-runners/about-github-hosted-runners#supported-runners-and-hardware-resources'
      )

    const appConnectApiKey = core.getInput('app-connect-api-key-id', {
      required: true
    })
    const appConnectApiIssuer = core.getInput('app-connect-api-issuer', {
      required: true
    })
    const appConnectSecret = core.getInput('app-connect-secret-base64', {
      required: true
    })
    const appConnectSecretPath = path.join(
      os.homedir(),
      'private_keys',
      `AuthKey_${appConnectApiKey}.p8`
    )
    fs.mkdirSync(path.dirname(appConnectSecretPath), {recursive: true})
    fs.writeFileSync(
      appConnectSecretPath,
      Buffer.from(appConnectSecret, 'base64').toString('ascii')
    )

    const {
      exitCode,
      stderr: output,
      stdout: errorOutput
    } = await getExecOutput(
      `xcrun altool --upload-app --type ios --file "${binaryPath}" --apiKey "${appConnectApiKey}" --apiIssuer "${appConnectApiIssuer}" --output-format json`
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
