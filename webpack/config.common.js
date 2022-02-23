const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'light-cluster-card.js',
        path: path.resolve(__dirname, '../dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                include: [
                    /node_modules(?:\/|\\)lit-element|lit-html/
                ],
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
};
