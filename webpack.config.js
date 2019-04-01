var webpack = require("webpack")
var path = require('path')

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: './bundle.js' // 指定打包后的输出文件名，需要引入到index.html
    },

    resolve: {
        root: [ path.join(__dirname, "src") ],
        extensions: [ "", ".ts", ".js" ],
    },

    module: {
        loaders: [
            {test: /\.ts$/, loader: 'ts-loader'}
        ]
    }
}