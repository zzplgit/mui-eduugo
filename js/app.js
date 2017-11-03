/**
 **/
(function($, owner) {
	$.init();
	var isDevelop = true;
	owner.apiHost = "http://api.eduugo.com/v2";
	owner.webHost = "http://appview.eduugo.com/index.php?r=";
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		var url = owner.apiHost+"/user/login";
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.username = loginInfo.username || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.username.length < 1) {
			return callback('手机号或邮箱不能为空');
		}
		if (loginInfo.password.length < 6) {
			return callback('密码最短为 6 个字符');
		}
		mui.post(url, loginInfo, function(res){
				if(res.code == 1){
					owner.createState(res.data);
				}else{
					var message = res.message || "登陆失败";
					return callback(message);
				}
				return callback();
			}, 'json'
		);
	};

	owner.logout = function(callback){
		callback = callback || $.noop;
		owner.setState();
		return callback();
	}

	owner.createState = function(userData) {
		var state = owner.getState();
		state.user = userData.user;
		state.token = userData.token;
		owner.setState(state);
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		var url = owner.apiHost+"/user/signup";
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.phone = regInfo.phone || '';
		regInfo.yzm = regInfo.yzm || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.phone.length < 1) {
			return callback('请输入手机号');
		}
		if(!checkPhone(regInfo.phone)){
			return callback('请输入正确的手机号');
		}
		if (regInfo.yzm.length < 1) {
			return callback('请输入验证码');
		}
		if (regInfo.password.length < 6) {
			return callback('密码不能少于6位哦~');
		}
		if (regInfo.password.length > 18) {
			return callback('密码不能多于18位哦~');
		}
		$.post(url, regInfo, function(res){
				if(res.code == 1){
					owner.createState(res.data);
				}else{
					var message = res.message || "注册失败";
					return callback(message);
				}
				return callback();
			}, 'json'
		);
	};

	owner.resetPassword = function(regInfo, callback) {
		var url = owner.apiHost+"/user/update-password-by-sms";
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.phone = regInfo.phone || '';
		regInfo.yzm = regInfo.yzm || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.phone.length < 1) {
			return callback('请输入手机号');
		}
		if(!checkPhone(regInfo.phone)){
			return callback('请输入正确的手机号');
		}
		if (regInfo.yzm.length < 1) {
			return callback('请输入验证码');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (regInfo.password.length > 18) {
			return callback('密码最大只支持 18 个字符');
		}
		$.post(url, regInfo, function(res){
				if(res.code == 1){
					owner.createState(res.data);
				}else{
					var message = res.message || "重置失败";
					return callback(message);
				}
				return callback();
			}, 'json'
		);
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		return JSON.parse(stateText);
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
		//var settings = owner.getSettings();
		//settings.gestures = '';
		//owner.setSettings(settings);
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	var checkPhone = function(phone) {
	    if(!(/^1[34578]\d{9}$/.test(phone))){ 
	        return false;
	    }
	    return true;
	}

	owner.checkPhone = function(phone){
		return checkPhone(phone);
	}

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		return JSON.parse(settingsText);
	}
	
	/**
	 * 设置记录来源页面
	 * @param Json sourcePage 来源页面
	 */
	owner.setSourcePage = function(sourcePage){
		sourcePage = sourcePage || {};
		//特殊页面不记录
		if(sourcePage && sourcePage.url && sourcePage.url == "error_network.html"){
			return;
		}
		localStorage.setItem('$sourcePage', JSON.stringify(sourcePage));
	}
	
	/**
	 * 获取来源页面
	 */
	owner.getSourcePage = function() {
		var sourcePage = localStorage.getItem('$sourcePage') || "{}";
		return JSON.parse(sourcePage);
	}
	
	/**
	 * 获取本地是否安装客户端
	 **/
	owner.isInstalled = function(id) {
		if (id === 'qihoo' && mui.os.plus) {
			return true;
		}
		if (mui.os.android) {
			var main = plus.android.runtimeMainActivity();
			var packageManager = main.getPackageManager();
			var PackageManager = plus.android.importClass(packageManager)
			var packageName = {
				"qq": "com.tencent.mobileqq",
				"weixin": "com.tencent.mm",
				"sinaweibo": "com.sina.weibo"
			}
			try {
				return packageManager.getPackageInfo(packageName[id], PackageManager.GET_ACTIVITIES);
			} catch (e) {}
		} else {
			switch (id) {
				case "qq":
					var TencentOAuth = plus.ios.import("TencentOAuth");
					return TencentOAuth.iphoneQQInstalled();
				case "weixin":
					var WXApi = plus.ios.import("WXApi");
					return WXApi.isWXAppInstalled()
				case "sinaweibo":
					var SinaAPI = plus.ios.import("WeiboSDK");
					return SinaAPI.isWeiboAppInstalled()
				default:
					break;
			}
		}
	}
	
	owner.isLogin = function(){
		var state = app.getState();
		if(state.token){
			return true;
		}
		return false;
	}
	
	/**
	 * 
	 * @param String wsId 要打开的窗口id
	 */
	owner.checkNetwork = function(wsId){
		if (plus.networkinfo.getCurrentType() == plus.networkinfo.CONNECTION_NONE && wsId != "error_network.html") {
			owner.hrefUrl("error_network.html");
			return false;
    	}
		return true;
	}
	
	/**
	 * 跳转
	 * @param String url
	 */
	owner.hrefUrl = function(href, extras, wbId) {
		wbId = wbId || href;
		var aniShow = extras.aniShow || 'pop-in';
		var webview;
		//非plus环境，直接走href跳转
		if(!$.os.plus){
			location.href = href;
			return;
		}
		
		webview = plus.webview.getWebviewById(wbId);
		if(!webview){
			extras = extras || {};
			var webview_style = {
				popGesture: "close"
			}
			if(extras.bottom){
				webview_style.bottom = extras.bottom;
			}
			//需要启动硬件加速
			if(href == 'video_live.html' || href == "video_enroll.html" || href == "video_review.html") {
				webview_style.hardwareAccelerated = true;
			}
			webview = plus.webview.create(href, wbId, webview_style, extras);
		}else{
			webview.reload(true);
		}
		owner.setSourcePage({'url':wbId, 'method':'hrefUrl'});
		if(!owner.checkNetwork(wbId)){
			return;
		}
		plus.webview.show(webview, aniShow);
	}
	
	/**
	 * 创建带头部的webview
	 * @param Josn extras subUrl title
	 * @param String webId
	 */
	owner.createHeader = function(extras, webId){
		
		extras = extras || {};
		webId = webId || extras.subUrl;
		
		var webview;
		//非plus环境，直接走href跳转
		if(!$.os.plus){
			location.href = extras.subUrl;
			return;
		}
		webview = plus.webview.getWebviewById(webId);
		if(!webview){
			var webview_style = {
				popGesture: "close"
			}
			webview = plus.webview.create("template_back.html", webId, webview_style, extras);
		}else{
			webview.reload(true);
		}
		
		owner.setSourcePage({'url':webId, 'method':'createHeader'});
		if(!owner.checkNetwork(webId)){
			return;
		}
		plus.webview.show(webview, "pop-in");
	}

	/**
	 * 更新token
	 */
	owner.updateToken = function(callback){
		callback = callback || $.noop;
		var url = owner.apiHost+"/user/update-token";
		var state = owner.getState();
		if(!state || !state.token){
			return;
		}
		var token = state.token;
		
		$.post(url, {token: token}, function(res){
			
			var code = true;
			if(res && res.code == 1){
				state.token = res.data.token;
				owner.setState(state);
			}else{
				code = false;
				owner.logout();
			}
			return callback({code: code, state: state});
		}, "json");
		
//		$.ajax(url, {
//			dataType:'json',
//			type:'GET',
//			data: {"token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJpZCI6MTIzNCwiY29kZSI6NjU5MzM2NzN9.tjugQikE_F89Khko-UMD8qPqnl7jT43RIMMyVz4wOo6mpvwFZwRN8xDLQwYgCc5J-HvKGmA9roCZvNIsY4LwTw"},
//			timeout:10000,//超时时间设置为10秒；
//			headers:{'Authorization':token},
//			success:function(res){
//				console.info("token:"+token);
//				console.info("code:"+res.code+" msg:"+res.message);
//				if(res.code == 1){
//				}else{
//					//owner.logout();
//				}
//				return callback();
//			},
//			error:function(xhr,type,errorThrown){}
//		});
	}
	
	owner.injection = function(webObj, plusId, jsName, param, res){
		var evalJS = '';
		webObj = webObj || null;
		plusId = plusId || '';
		jsName = jsName || '';
		param = param || [];
		res = res || '{}';
		if(jsName == '' || webObj == null || plusId == ''){
			return;
		}
		evalJS = "function "+jsName+"(";
		if(param.length > 0){
			evalJS += param.join(",");
		}
		evalJS += "){";
		evalJS += "var cwv = plus.webview.getWebviewById('"+plusId+"');";
		evalJS += "mui.fire(cwv, '"+jsName+"', "+res+");";
		evalJS += "}";
		webObj.appendJsFile('../js/mui.min.js');
		webObj.evalJS(evalJS);
	}
	
	owner.share = function(msg){
		//遮罩
		var ws=plus.webview.currentWebview();
		
		//屏幕高度
		var top = (plus.screen.resolutionHeight) - 240;
		var webview_style = {
			popGesture: "close",
			top: top
		}
		
		webview = plus.webview.create("share.html", "share.html", webview_style, {maskId: ws.id, msg:msg});
		webview.show("slide-in-bottom",300);
	}

	owner.mask = function(){
		this.mask = null;
	}

	owner.mask.prototype.show = function(){
	    this.mask = plus.nativeUI.showWaiting();
	};
	
	owner.mask.prototype.close = function(){
	    this.mask.close();
		this.mask=null;
	};

	owner.formatDate = function(dateTime) {
		var time = new Date(parseInt(dateTime*1000));
		var y = time.getFullYear();
		var m = time.getMonth()+1;
		var d = time.getDate();
		var h = time.getHours();
		var mm = time.getMinutes();
		var s = time.getSeconds();
		return y+'-'+add0(m)+'-'+add0(d)+' '+add0(h)+':'+add0(mm)+':'+add0(s);
	}

	function add0(m){return m<10?'0'+m:m }
	
	owner.getVer = function(callback){
		callback = callback || $.noop;
		//var url = "http://10.10.22.8/ameson/www/web/index.php?r=app/check-vs";
		var url = owner.apiHost+"/site/get-version";
	    $.getJSON(url, {}, function(res){
			callback(res);
	    });
	}
	
	owner.checkUpdate = function(){
		if(isDevelop){
			return;
		}
	    var wgtVer = null;
	    plus.runtime.getProperty(plus.runtime.appid,function(inf){
	        wgtVer=inf.version;
    	    owner.getVer(function(res){
				if(res.code == 1){
					console.log("当前应用版本："+wgtVer+" 最新版本:"+res.data.vs);
			    	if(wgtVer && res.data.vs && wgtVer != res.data.vs){
						plus.nativeUI.confirm( "目前版本 "+wgtVer+" 检查到有新版本 "+res.data.vs+" 是否更新？", function(e){
							if(e.index == 0){
								downWgt(res.data.url);
							}
						}, "驿渡", ["确定", "取消"] );
			    	}else{
			    		console.log("已经是最新版本！");
			    	}
				}
		    });
	    });
//	    var wgtVer = owner.vs;
//	    owner.getVer(function(res){
//			if(res.code == 1){
//				console.log("当前应用版本："+wgtVer+" 最新版本:"+res.data.vs);
//		    	if(wgtVer && res.data.vs && wgtVer != res.data.vs){
//					plus.nativeUI.confirm( "目前版本 "+wgtVer+" 检查到有新版本 "+res.data.vs+" 是否更新？", function(e){
//						if(e.index == 0){
//							//TODO
//							res.data.url = "http://10.10.23.56/ameson/static/app/io.hybrid.ed.v02.wgt";
//							downWgt(res.data.url);
//						}
//					}, "驿渡", ["确定", "取消"] );
//		    	}else{
//		    		console.log("已经是最新版本！");
//		    	}
//			}
//	    });
	}
	
	function downWgt(wgtUrl){
	    var wgtWaiting = plus.nativeUI.showWaiting("下载更新文件...");
	    var task = plus.downloader.createDownload( wgtUrl, {filename:"_doc/update/"}, function(d,status){
	        if ( status == 200 ) { 
	            console.log("下载成功："+d.filename);
	            installWgt(d.filename); // 安装wgt包
	        } else {
	            console.log("下载失败！");
	            plus.nativeUI.alert("下载失败！");
	        }
	        plus.nativeUI.closeWaiting();
	    });
	    
	    task.addEventListener("statechanged", function (download, status) {
	        switch (download.state) {
	            case 2:
	                wgtWaiting.setTitle("已连接到服务器");
	                break;
	            case 3:
//	                var percent = download.downloadedSize / download.totalSize * 100;
//	                wgtWaiting.setTitle("已下载 " + parseInt(percent) + "%");
	                var s = parseInt(download.downloadedSize/1024);
	                var x = parseInt(download.totalSize/1024);
	                wgtWaiting.setTitle(s +"/"+ x+ "kb");
	                break;
	            case 4:
	                wgtWaiting.setTitle("下载完成");
	                break;
	        }
	    });
	    
	    task.start();
	}
	
	// 更新应用资源
	function installWgt(path){
	    plus.nativeUI.showWaiting("安装wgt文件...");
	    plus.runtime.install(path,{},function(){
	        plus.nativeUI.closeWaiting();
	        console.log("安装wgt文件成功！");
	        plus.nativeUI.alert("更新完成！",function(){
	            plus.runtime.restart();
	        });
	    },function(e){
	        plus.nativeUI.closeWaiting();
	        console.log("安装wgt文件失败["+e.code+"]："+e.message);
	        plus.nativeUI.alert("安装wgt文件失败["+e.code+"]："+e.message);
	    });
	}
	
	//分页获取数据
	owner.listPage = function (pagingFunc){

		var pageNo = this.pageNo;

		this.pullupRefresh = function(){
			var parame = {
				type: 'up'
			}
			pagingFunc(parame);
		}
		
		this.pulldownRefresh = function(){
			var parame = {
				type: 'down'
			}
			pagingFunc(parame);
		}
		

		
	}
	owner.listPage.prototype = {
		pageNo: 1,
		pageSize: 10,
		pagingFunc: function(){},
		pullupRefresh: function(){},
		pulldownRefresh: function(){}
	}
	
	
}(mui, window.app = {}));