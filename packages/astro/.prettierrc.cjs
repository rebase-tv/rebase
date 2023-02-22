module.exports = {
  plugins: [require.resolve("prettier-plugin-astro")],
  astroAllowShorthand: true,
  htmlWhitespaceSensitivity: "ignore",
  overrides: [
    {
      files: "*.astro",
      options: {
        parser: "astro",
      },
    },
  ],
};
