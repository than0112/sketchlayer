# Publishing checklist

The package repository is `https://github.com/than0112/sketchlayer`. The `Publish package` workflow only publishes a GitHub Release whose tag exactly matches `v${package.json.version}`.

## One-time npm account setup

Run these commands yourself in a trusted terminal; do not paste passwords, one-time codes, or access tokens into source control or chat.

1. Sign in through the browser flow: `npm login --auth-type=web`.
2. Confirm the authenticated owner: `npm whoami`.
3. Enable npm 2FA for authorization and writes. Use a security key or authenticator and store recovery codes offline.
4. **Bootstrap exception for a brand-new package:** npm only permits Trusted Publisher configuration after a package exists on the registry. If `sketchlayer` does not exist yet, perform the first publish interactively from this clean checkout after every check passes:

   ```powershell
   npm publish --access public --provenance=false
   ```

   Complete the 2FA prompt. This one bootstrap release cannot have OIDC provenance. If provenance is required for the first stable release, publish a clearly labelled prerelease first, then configure Trusted Publishing before publishing the stable version.

5. Once the package exists, in npmjs.com configure **Trusted Publisher** for:
   - GitHub user or organization: `than0112`
   - Repository: `sketchlayer`
   - Workflow filename: `publish.yml`
   - Environment: `npm`
   - Allowed action: `npm publish`
6. In GitHub, protect the `npm` environment with the release approvers you want. Never add an npm write token as a repository secret for this workflow; it uses GitHub Actions OIDC.

The first successful publish establishes the npm owner. If the name is already owned by another account, stop and either choose a scoped name (for example `@than0112/sketchlayer`) or request an owner transfer. After the bootstrap release, do not publish from a developer machine; use the protected OIDC workflow only.

## Release procedure

1. Update `version` and release notes, then commit and push.
2. Run `npm ci`, `npm test`, `npm run typecheck`, `npm run package:check`, and `npm audit` from a clean checkout.
3. Create and push an annotated tag matching the package version, for example `v0.2.0`.
4. Create a GitHub Release from that tag and publish the release.
5. Approve the protected `npm` environment when GitHub Actions requests it.
6. Verify the published package page, provenance attestation, tarball contents, and install it in a clean consumer project.

The workflow runs `npm ci`, typecheck, tests, and package inspection before `npm publish --access public`. npm Trusted Publishing uses OIDC and automatically generates provenance for a public package from a public repository.

The package build enforces a 35,000-byte uncompressed ESM budget. React, React DOM, and Phosphor icons remain external to the library bundle.
