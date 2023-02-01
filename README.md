# Wolfia-Deploy v0.0.2

This action allows you to upload a binary to [Wolfia](https://wolfia.com) for automating the distribution of your app.

Refer [here](https://github.com/actions/wolfia-deploy/tree/releases/) for the previous version

## Usage

See [action.yml](action.yml).

| Key                       | Value                                                                                                                                                                               | Suggested Type | Required | Default |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------|----------|---------|
| github-token              | Use GitHub's automatically created [github token](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#example-1-passing-the-github_token-as-an-input) | secret env     | true     | N/A     |
| wolfia-api-key-id         | API Key ID for accessing the [Wolfia API](https://wolfia.com/docs/#generate-an-api-key)                                                                                             | vars           | true     | N/A     |
| wolfia-api-key-secret     | API Key Secret for accessing the [Wolfia API](https://wolfia.com/docs/#generate-an-api-key)                                                                                         | secret env     | true     | N/A     |
| track-id                  | Track ID for the app distribution that can be found on your Wolfia account                                                                                                          | vars           | true     | N/A     |
| app-path                  | Path to signed Android (**apk** or **aab**) or iOS (**ipa**) file to be uploaded to Wolfia.                                                                                         | inline         | true     | N/A     |
| app-connect-api-key-id    | [App Connect API](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api) Key ID                                                  | vars           | iOS-only | N/A     |
| app-connect-api-issuer    | [App Connect API](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api) Issuer                                                  | vars           | iOS-only | N/A     |
| app-connect-secret-base64 | [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi/creating_api_keys_for_app_store_connect_api) private key file contents (base64 encoded)        | secret env     | iOS-only | N/A     |

Here's an [example configuration](.github/workflows/test.yml).

### Upload an Android app binary to Wolfia

```yaml
steps:
  - uses: wolfia-app/wolfia-deploy@v0.0.2
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      wolfia-api-key-id: ${{ vars.WOLFIA_API_KEY_ID }}
      wolfia-api-key-secret: ${{ secrets.WOLFIA_API_KEY_SECRET }}
      track-id: ${{ vars.TRACK_ID } }}
      app-path: app/build/outputs/signed-app.apk
```

### Upload an iOS app binary to Wolfia

```yaml
steps:
  - uses: wolfia-app/wolfia-deploy@v0.0.2
    with:
      github-token: ${{ secrets.GITHUB_TOKEN }}
      wolfia-api-key-id: ${{ vars.WOLFIA_API_KEY_ID }}
      wolfia-api-key-secret: ${{ secrets.WOLFIA_API_KEY_SECRET }}
      track-id: ${{ vars.TRACK_ID }}
      app-path: app/build/outputs/signed-app.ipa
      app-connect-api-key-id: ${{ vars.APP_CONNECT_API_KEY_ID }}
      app-connect-api-issuer: ${{ vars.APP_CONNECT_API_ISSUER }}
      app-connect-secret-base64: ${{ secrets.APP_CONNECT_SECRET_BASE64 }}
```

**Note**: to base64 encode the private key file and copy to your clipboard, run the following command:

```bash
base64 -i ./AuthKey_XXXXXXXXXX.p8 | pbcopy
```

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE).
