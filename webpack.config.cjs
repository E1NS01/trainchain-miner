const path = require("path");

module.exports = {
  mode: "production", // or 'development' depending on your needs
  target: "node", // Optimizes for Node.js
  entry: "./main.js", // Entry point of your application
  output: {
    path: path.resolve(__dirname, "dist"), // Output directory
    filename: "bundle.js", // Output file name
  },
  resolve: {
    extensions: [".js"], // File extensions to process
  },
  module: {
    rules: [
      {
        test: /\.js$/, // Process .js files
        exclude: /node_modules/, // Exclude the node_modules directory
        use: {
          loader: "babel-loader", // Use babel-loader for transpiling
          options: {
            presets: ["@babel/preset-env"], // Preset for compiling ES2015+ syntax
          },
        },
      },
    ],
  },
};
