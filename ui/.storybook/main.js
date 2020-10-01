const merge = require('deepmerge');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const builtins = require('rollup-plugin-node-builtins');
const replace = require('@rollup/plugin-replace');

module.exports = {
  stories: ['../stories/**/*.stories.{js,md,mdx}'],
  addons: [
    /*     'storybook-prebuilt/addon-knobs/register.js', */
    'storybook-prebuilt/addon-docs/register.js',
    'storybook-prebuilt/addon-viewport/register.js',
  ],
  esDevServer: {
    // custom es-dev-server options
    nodeResolve: {
      browser: true,
      preferBuiltins: false,
    },
    watch: true,
    open: true,
    plugins: require('../es-dev-plugins'),
  },
  // Rollup build output directory (build-storybook only)
  outputDir: '../storybook-static',
  // Configuration for rollup (build-storybook only)
  rollup: config => {
    const plugins = config.plugins.filter(p => p.name !== 'node-resolve');

    return {
      ...config,
      plugins: [
        replace({
          global: 'window',
          'process.env.NODE_ENV': '"development"',
        }),
        commonjs({
          include: [
            'node_modules/buffer/**/*',
            'node_modules/fast-json-stable-stringify/**/*',
            'node_modules/zen-observable/**/*',
            'node_modules/graphql-tag/**/*',
            'node_modules/isomorphic-ws/**/*',
            'node_modules/@msgpack/**/*',
          ],
        }),

        ...plugins,
        resolve.default({
          customResolveOptions: {
            moduleDirectory: ['node_modules', 'web_modules'],
          },
          preferBuiltins: false,
        }),
        builtins(),
      ],
    };
  },
};
