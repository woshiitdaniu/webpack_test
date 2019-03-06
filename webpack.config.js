var path                     = require("path"),
    webpack                  = require("webpack"),//这是1.15.1版本的
	extractTextWebpackPlugin = require("extract-text-webpack-plugin"),//用于从js中分离css;
	htmlWebpackPlugin		 = require("html-webpack-plugin"),//用于打包后自动生成对应的html文件
	WEBPACK_ENV				 = process.env.WEBPACK_ENV || 'dev';//打包环境变量的设置
	
	
	
/*  定义一个func  
 *	用于返回html-webpack-plugin所需要的参数配置 
 * 
 * */
function _fGetParams( option ){
	return {
			template : './src/view/'+option+'/index.html',
			filename : 'view/'+option+'.html',
			inject   : true,
			hash     : true,
			chunks   : ["common",option]
		}
}


var config = {
	//1.入口   1.1 如果是多入口文件  则为对象  1.2如果是多个文件合成一个文件  则为数组     1.3单入口文件则为字符串
	entry:{
		common : ["./src/page/common"],//定义公共部分  js/并且配置devServer的client 并最终打包后生成base.js文件
		index  : ["./src/page/index"],
		login  : ["./src/page/login"]
	},
	
	//2.出口
	output:{
		path     : path.resolve(__dirname,'dist'),// 获取绝对路径 并生成一个dist目录存放打包后的对应文件
		filename : "js/[name].js", //[name]这个意思是生成与入口同名的打包文件  并生成一个js目录
		publicPath:'/dist'//配置访问的路径
	},
	
	//3.配置第三方插件   jq 为 jquery  这样我们才能在js文件中通过require('jquery')导入   因为我们是直接使用的cdn 而不是install
	externals:{
		"jquery":'window.jQuery'
	},
	
	//4.提取所有js都要用的公共js代码块   使用到的插件为webpack下的optimize.CommonsChunkPlugin
	//4.1该CommonsChunkPlugin有个问题  就是凡是在两个及以上js文件中require后就会被认定为公共js而被所有html引用  这是一个很大的性能问题
	//4.2如果我们配置了公共js  则在html中必须要引用且必须放在其他script前面  否则会报    Uncaught ReferenceError: webpackJsonp is not defined
	plugins:[
		/*
		 * webpack.optimize.CommonsChunkPlugin
		 * 用于分离公共样式或者是js
		 * 
		 * */
		new webpack.optimize.CommonsChunkPlugin({
			name    : 'common',
			filename: 'js/base.js'
		}),
		
		/*	
		 *  extract-text-webpack-plugin
		 *  为了将css从打包后的js文件中分离出来并在html中以link的方式加载	
		 * 
		 * */
		new extractTextWebpackPlugin('css/[name].css'),
		
		/*	
		 *  html-webpack-plugin
		 *  为了打包后能自动生成带来css和js的html文件而使用的插件
		 * 
		 * */
		new htmlWebpackPlugin( _fGetParams("index") ),
		new htmlWebpackPlugin( _fGetParams("login") )
	],
	//配置需要的loader
	module:{
		loaders:[
			//css loader
			{
				test:/\.css$/,
			  //loader:'style-loader!css-loader'//这里的!表示连接  相当于and loader的执行顺序是从右到左
				loader:extractTextWebpackPlugin.extract("style-loader","css-loader") //使用了分离插件后的写法
			},
			//html loader
//			{ 由于我们需要在html中require引入组件html 这里写了会相互冲突 所以注释掉
//				test:/\.html$/,
//				loader:'html-loader'
//			},
			//处理图片的 url-loader
			{
				test:/\.(gif|png|jpg|woff|svg|eot|ttf)\??.*$/,
				//?limit=150&name=static/[name].[ext]  这里的limit表示打包图片的大小 name参数后面表示打包后的目录为static   ext为图片后缀
				loader:'file-loader?limit=150&name=static/[name].[ext]'
			}
		]
	}
}

/*
 * 判断 打包的环境 是dev 还是   online 
 * 1.如果是dev环境 则我们需要添加devServer
 * 2.生产环境就不需要 热更新了
 */
if( 'dev' === WEBPACK_ENV ){
	config.entry.common.push("webpack-dev-server/client?http://localhost:8085/")
}

module.exports = config;


/*
 * webpack配置下来 需要用到的loader和插件有
 */
//1.webpack
//2.webpack-dev-server
//3.file-loader
//4.html-loader
//5.css-loader
//6tyle-loader
//7.extract-text-webpack-plugin
//8.html-webpack-plugin