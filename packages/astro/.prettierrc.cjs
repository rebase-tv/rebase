module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],
  astroAllowShorthand: true,
  htmlWhitespaceSensitivity: "ignore",
  semi: false,
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
