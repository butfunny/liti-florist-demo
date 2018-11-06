var path = require("path");


module.exports = {
    entry: {
        "client-loader": "./src/app-loader.jsx"
    },
    mode: "development",
    output: {
        path: path.join(__dirname, "dev/assets/js"),
        filename: "[name].js"
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                use: [
                    {
                        loader: 'babel-loader', options: {
                            presets: ["env", "stage-0", "react"]
                        }
                    }
                ],
                exclude: /node_modules/,
            },
            {
                test: /\.json$/,
                use: 'json'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
};
