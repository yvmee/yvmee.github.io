import type { Plugin } from "vite"

import { contentDir, loadContent } from "./load-content.ts"

const virtualId = "virtual:content"
const resolvedId = `\0${virtualId}`

/** Exposes the validated YAML content as `import content from "virtual:content"`. */
export function contentPlugin(): Plugin {
  return {
    name: "content",
    resolveId(id) {
      if (id === virtualId) return resolvedId
    },
    load(id) {
      if (id !== resolvedId) return
      // No addWatchFile here: in dev Vite would try to resolve the directory as an
      // import. Reloads on YAML changes are handled in configureServer below.
      return `export default ${JSON.stringify(loadContent())}`
    },
    configureServer(server) {
      server.watcher.add(contentDir)
      server.watcher.on("change", (file) => {
        if (!file.replaceAll("\\", "/").includes("/content/")) return
        if (!file.endsWith(".yaml")) return
        for (const environment of Object.values(server.environments)) {
          const module = environment.moduleGraph.getModuleById(resolvedId)
          if (module) environment.moduleGraph.invalidateModule(module)
        }
        server.ws.send({ type: "full-reload" })
      })
    },
  }
}
