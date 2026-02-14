module.exports = {
    apps: [
        {
            name: "thisisnotfine",
            script: "src/index.ts",
            interpreter: "bun", // Utilise Bun comme interpréteur
            env: {
                NODE_ENV: "production",
                // Ajoutez d'autres variables si nécessaire ou utilisez un fichier .env
            },
            // Redémarrage automatique en cas de crash
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
        },
    ],
};
