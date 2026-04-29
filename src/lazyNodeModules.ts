/*
 * Lazy proxies for Node-only built-in modules.
 *
 * Static `import * as fs from "fs"` etc. emit a `require("fs")` at the very
 * top of the bundled module, which throws on Obsidian Mobile (iOS/Android)
 * because those built-ins do not exist there. Even when every call site is
 * gated by `Platform.isDesktopApp`, the top-level require still fires at
 * module load and crashes the plugin during startup.
 *
 * These Proxy wrappers defer the underlying `require()` until a property is
 * actually accessed at runtime — which, by construction, only happens inside
 * desktop-gated branches.
 */

function lazy<T extends object>(name: string): T {
    let cached: T | undefined;
    return new Proxy({} as T, {
        get(_target, prop) {
            if (cached === undefined) {
                // eslint-disable-next-line @typescript-eslint/no-require-imports
                cached = require(name) as T;
            }
            /* eslint-disable-next-line
                @typescript-eslint/no-explicit-any,
                @typescript-eslint/no-unsafe-return,
                @typescript-eslint/no-unsafe-member-access */
            return (cached as any)[prop];
        },
    });
}

export const path = lazy<typeof import("path")>("path");
export const fsPromises = lazy<typeof import("fs/promises")>("fs/promises");
export const os = lazy<typeof import("os")>("os");
export const childProcess =
    lazy<typeof import("child_process")>("child_process");
