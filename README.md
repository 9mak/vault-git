# Vault Git

A fork of [Vinzent03/obsidian-git](https://github.com/Vinzent03/obsidian-git) focused on **stability on mobile (iOS / Android)**. Bring Git into your [Obsidian](https://obsidian.md) vault — commit, pull, push, and view diffs from inside Obsidian, with a sane default profile for phones.

> **Looking for the original?** This is a sibling community plugin, not a replacement. The upstream `obsidian-git` (id: `obsidian-git`) is still maintained — you can install both side by side.

## Why this fork?

The upstream plugin marks mobile as `⚠️ Experimental` and warns of crashes on clone/pull. The root causes are addressable without rewriting the plugin, so this fork keeps the codebase intact and applies targeted fixes:

- **No more startup crash on mobile.** Node-only built-ins (`child_process`, `fs`, `path`, `os`) were imported eagerly even though every call site was desktop-gated; the top-level `require` fired during plugin load on iOS/Android and tore the plugin down before the UI ever appeared. Vault Git routes them through a lazy `Proxy` so the require only fires when desktop code actually touches them.
- **Shallow by default on mobile.** `clone` and `fetch` default to `depth: 1` + `singleBranch` on `Platform.isMobile`, keeping the on-device pack file small enough that iOS/Android Obsidian doesn't run out of memory.
- **Bounded concurrency.** `stageAll` / `unstageAll` previously fanned out to an unbounded `Promise.all` over every changed file; on mobile this OOMed for vaults with hundreds of changes. Vault Git caps in-flight git operations at 16 on mobile.
- **Safer merge driver.** Files larger than 2 MB now bail to a conflict instead of being split line-by-line via regex (which allocated one array entry per line on every side and was a reliable mobile crash path).
- **Init isolation.** Auto-pull / auto-commit failures during startup no longer unwind the whole plugin — the user can still drive Git manually if a periodic task can't be wired up.

Beyond mobile, behavior on desktop is intentionally unchanged. The feature set, settings, command palette entries, and documentation linked below all carry over.

## Coexists with `obsidian-git`

Vault Git ships under a distinct plugin id (`vault-git`), distinct view types (`vault-git-view`, `vault-git-history-view`, …), a distinct workspace event namespace (`vault-git:*`), and a distinct CSS class prefix (`vault-git-*`). You can install it next to the upstream plugin in the same vault without collisions.

## Documentation

The setup guide, mobile notes, authentication, and advanced configuration from the upstream plugin still apply: see the 📖 [full documentation](https://publish.obsidian.md/git-doc).

## Key Features

- 🔁 **Automatic commit-and-sync** (commit, pull, and push) on a schedule.
- 📥 **Auto-pull on Obsidian startup**
- 📂 **Submodule support** for managing multiple repositories (desktop only and opt-in)
- 🔧 **Source Control View** to stage/unstage, commit and diff files — open it with the `Open source control view` command.
- 📜 **History View** for browsing commit logs and changed files — open it with the `Open history view` command.
- 🔍 **Diff View** for viewing changes in a file — open it with the `Open diff view` command.
- 📝 **Signs in the editor** to indicate added, modified, and deleted lines/hunks (desktop only).
- GitHub integration to open files and history in your browser.

## UI Previews

### Source Control View

![Source Control View](https://raw.githubusercontent.com/Vinzent03/obsidian-git/master/images/source-view.png)

### History View

![History View](https://raw.githubusercontent.com/Vinzent03/obsidian-git/master/images/history-view.png)

### Diff View

![Diff View](https://raw.githubusercontent.com/Vinzent03/obsidian-git/master/images/diff-view.png)

### Signs in the Editor

![Signs](https://raw.githubusercontent.com/Vinzent03/obsidian-git/master/images/signs.png)

## 📱 Mobile Support

Mobile is the focus of this fork, but it is still constrained by what isomorphic-git can do in a JavaScript runtime without native Git. The same API limits as upstream apply:

- No **SSH authentication** ([isomorphic-git issue](https://github.com/isomorphic-git/isomorphic-git/issues/231))
- No rebase merge strategy
- No submodules
- Memory still scales with repo size — a "large enough" repo will still OOM. Use shallow clones (default on mobile) and prefer staging individual files.

If you hit a clone/pull crash on mobile that *isn't* explained by raw repo size, please open an issue with the device, OS version, repo size, and reproduction steps.

## 💻 Desktop Notes

### Authentication

Some Git services may require further setup for HTTPS/SSH. Refer to the [Authentication Guide](https://publish.obsidian.md/git-doc/Authentication).

### Obsidian on Linux

- ⚠️ Snap is not supported due to sandboxing restrictions.
- ⚠️ Flatpak is not recommended; sandbox limitations cause issues with more advanced setups.
- ✅ Use AppImage or a full-access install via your distro's package manager ([installation guide](https://publish.obsidian.md/git-doc/Installation#Linux)).

## Credits

This plugin is a fork. All credit for the design and the bulk of the implementation goes upstream:

- **Original development:** [denolehov](https://github.com/denolehov) (2020 onward).
- **Primary maintainer of the upstream plugin:** [Vinzent03](https://github.com/Vinzent03), since March 2021. The repo moved to his account in July 2024.
- **Line Authoring feature:** [GollyTicker](https://github.com/GollyTicker).

If your question or feedback is about a feature that exists upstream too, the upstream issue tracker is usually a better venue. For Vault Git specific issues — particularly mobile crashes — please open an issue here.

## License

MIT — see [LICENSE](./LICENSE). Copyright is held by the upstream authors; Vault Git contributors are added on top under the same MIT terms.
