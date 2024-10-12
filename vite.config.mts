import { readFileSync, readdirSync, watch } from "node:fs";
import { join } from "node:path";
import { type Plugin, defineConfig } from "vite";

const templatesPath = "./src/templates/";

function updateTemplates() {
    const files = readdirSync(templatesPath);

    for (const file of files) {
        if (!file.endsWith(".html")) continue;

        const name = `VITE_${file.replace(".html", "").toUpperCase()}`;
        process.env[name] = readFileSync(join(templatesPath, file)).toString();
    }
}

export default defineConfig(() => {
    updateTemplates();

    return {
        build: {
            assetsInlineLimit: 0
        },
        plugins: [templatePlugin()]
    };
});

function templatePlugin(): Plugin {
    return {
        name: "templatePlugin",
        apply: "serve",
        configureServer(server) {
            watch(templatesPath, () => {
                const files = readdirSync(templatesPath);

                for (const file of files) {
                    if (!file.endsWith(".html")) continue;

                    watch(join(templatesPath, file), () => {
                        updateTemplates();
                        server.ws.send({ type: "full-reload" });
                    });
                }
            });
        }
    };
}
