export default {
    stories: ["../../stories/**/*.stories.@(js|ts|mdx)"],
    addons: [],
    framework: {
        name: "@storybook/html-vite",
        options: {},
    },
    staticDirs: [{ from: "../../src/assets", to: "/assets" }],
    async viteFinal(config) {
        config.define = {
            ...config.define,
            __APP_VERSION__: JSON.stringify("0.0.0-storybook"),
            __GIT_HASH__: JSON.stringify("storybook"),
        };
        return config;
    },
};
