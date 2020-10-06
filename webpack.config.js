const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin'); // для оптимизации css
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'); // для оптимизации css
const TerserWebpackPlugin = require('terser-webpack-plugin'); // для оптимизации css
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimization = () => {
	const config = {
		splitChunks: {
			chunks: 'all',
		},
	};
	if (isProd) {
		config.minimizer = [
			new OptimizeCssAssetsPlugin(),
			new TerserWebpackPlugin(),
		];
	}
	return config;
};

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);
const plugins = () => {
	const base = [
		new HTMLWebpackPlugin({
			template: './index.html', // подключаем главный html
			minify: {
				collapseWhitespace: isProd,
			},
		}),
		new CleanWebpackPlugin(),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'src/favicon.ico'),
					to: path.resolve(__dirname, 'dist'),
				},
			],
		}),
		new MiniCssExtractPlugin({
			filename: filename('css'),
		}),
	];
	if (isProd) {
		base.push(new BundleAnalyzerPlugin());
	}
	return base;
};
const cssLoaders = (addLoader) => {
	const loaders = [
		{
			loader: MiniCssExtractPlugin.loader,
			options: {
				hmr: isDev,
				reloadAll: true,
			},
		},
		'css-loader',
	];
	if (addLoader) {
		loaders.push(addLoader);
	}
	return loaders;
};
const babelOptions = (preset) => {
	const opts = {
		presets: ['@babel/preset-env'],
		plugins: ['@babel/plugin-proposal-class-properties'],
	};

	if (preset) {
		opts.presets.push(preset);
	}
	return opts;
};
const jsLoaders = () => {
	const loaders = [
		{
			loader: 'babel-loader',
			options: babelOptions(),
		},
	];

	if (isDev) {
		loaders.push('eslint-loader');
	}
	return loaders;
};
module.exports = {
	context: path.resolve(__dirname, 'src'),
	mode: 'development',
	entry: {
		main: ['@babel/polyfill', './index.js'],
		analytics: './analytics.js',
	},
	output: {
		filename: filename('js'), // динамическое имя файла name из entry
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['.js', '.json', '.png'], // пишем, чтобы не указывать формы при импорте
		alias: {
			// создаем алиас для быстрого доступа
			'@models': path.resolve(__dirname, 'src/models'),
			'@': path.resolve(__dirname, 'src'),
		},
	},
	devServer: {
		port: 4200,
		hot: isDev,
	},
	devtool: isDev ? 'source-map' : '',
	optimization: optimization(), // чтобы не грузить одну библиотеку для нескольких скпритов

	plugins: plugins(),
	module: {
		// модули скачиваем через npm install css-loader
		// нужны для обработки разных расширений
		rules: [
			{
				test: /\.css$/,
				use: cssLoaders(),
			},
			{
				test: /\.less$/,
				use: cssLoaders('less-loader'),
			},
			{
				test: /\.s[ac]ss$/,
				use: cssLoaders('sass-loader'),
			},
			{
				test: /\.(png|jpeg|svg|gif|jpg)$/,
				use: ['file-loader'],
			},
			{
				test: /\.(ttf|woff|woff2)$/,
				use: ['file-loader'],
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: jsLoaders(),
			},
		],
	},
};
