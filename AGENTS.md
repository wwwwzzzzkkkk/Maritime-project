# Maritime-project collaboration

- Default scope is the light `index.html`. Leave Pro Max and `js/data-and-i18n.js` unchanged unless explicitly requested.
- Preserve the existing glass styling and motion design. The overview quick adjuster must remain flat; retain the mobile live budget window. Layout/content changes are allowed; ask before changing established effects.
- Keep Chinese and English UI/docs in sync. Retain complete README editions, the live URL, calculation assumptions, sources and material limitations. Public repository documents are not private storage.
- Trust internal DOM/data contracts. Validate user input and external boundaries, without speculative fallbacks.
- Use verification proportional to the change; one focused desktop/mobile check is usually enough for UI work. Do not repeatedly run broad suites after checks pass.
- Each published update needs a semantic version: update package/lock metadata, footer/cache versions and snapshot UI version together. Add bilingual CHANGELOG/release notes, preserve a pre-change checkpoint, commit changes and create a matching Git tag and GitHub Release. Never overwrite historical tags or rewrite public main history. Follow the user's existing authorization for publishing; this convention alone is not publishing permission.
