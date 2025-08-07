import js from "@eslint/js";

export default [
    js.configs.recommended,
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                console: "readonly",
                process: "readonly",
                Buffer: "readonly",
                __dirname: "readonly",
                __filename: "readonly",
                global: "readonly",
                module: "readonly",
                require: "readonly"
            }
        },
        rules: {
            "no-unused-vars": "warn",
            "no-console": "off", 
            "eqeqeq": ["error", "always"],
            "curly": "error",
            "semi": ["error", "always"],
            "quotes": ["error", "double"],
            "indent": ["error", 4],
            "linebreak-style": ["error", "unix"],
            "no-trailing-spaces": "error",
            "comma-dangle": ["error", "always-multiline"]
        }
    },
    {
        ignores: ["node_modules/", "dist/", "build/", "*.config.js"]
    }
];
