export default {
  "(src|tests)/**/*.{ts}": (filenames) => {
    const quotedFiles = filenames.map((file) => `"${file}"`).join(" ");
    return [
      `npm run prettier ${quotedFiles} --write`,
      "npm run typecheck",
      quotedFiles
        ? `npm run test -- --run --silent --passWithNoTests related ${quotedFiles}`
        : "npm run test -- --run --silent --passWithNoTests",
    ];
  },
};