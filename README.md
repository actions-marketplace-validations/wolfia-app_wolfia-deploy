# Wolfia-Deploy v1

This action allows you to upload a binary to [Wolfia](https://wolfia.com) for automating the distribution of your app.

Refer [here](https://github.com/actions/wolfia-github-action/tree/releases/) for the previous version

## Usage

See [action.yml](action.yml). 

| Key                   | Value                                                                                                                                                                               | Suggested Type | Required | Default |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|----------|---------|
| github-token          | Use github's automatically created [github token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#example-1-passing-the-github_token-as-an-input) | secret env     | true     | N/A     |
| wolfia-api-key-id     | API Key ID for accessing the [Wolfia API](https://wolfia.com/docs/#generate-an-api-key)                                                                                             | vars           | true     | N/A     |
| wolfia-api-key-secret | API Key Secret for accessing the [Wolfia API](https://wolfia.com/docs/#generate-an-api-key)                                                                                         | secret env     | true     | N/A     |
| track-id              | Track ID for the app distribution that can be found on your Wolfia account                                                                                                          | vars           | true     | N/A     |
| app-path              | Path to signed android/iOS file to be uploaded to Wolfia. Valid file extensions include **apk**, **app** (ipa support coming soon))                                                 | inline         | true     | N/A     |

Here's an [example configuration](.github/workflows/build.yml).

### Upload a binary to Wolfia

```yaml
steps:
- uses: wolfia-app/wolfia-github-action@v0.0.1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    wolfia-api-key-id: ${{ vars.WOLFIA_API_KEY_ID }}
    wolfia-api-key-secret: ${{ secrets.WOLFIA_API_KEY_SECRET }}
    track-id: ${{ vars.TRACK_ID } }}
    app-path: app/build/outputs/signed-app.apk
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
