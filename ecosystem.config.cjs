module.exports = {
    apps: [{
        name: "thisisnotfine",
        script: "src/index.ts",
        interpreter: "bun",
        env: {
            PORT: 3000,
            NODE_ENV: "production"
        }
    }]
};
