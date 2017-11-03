(function($, owner){
	var shares=null;
	
	$.plusReady(function(){
		updateSerivces();
	});

	function updateSerivces(){
		plus.share.getServices(function(s){
			shares={};
			for(var i in s){
				var t=s[i];
				shares[t.id]=t;
			}
		}, function(e){
			outSet('获取分享服务列表失败：'+e.message);
		});
	}
	
	owner.shareHref = function (){
		var shareBts=[];
		// 更新分享列表
		var ss=shares['weixin'];
		
		console.info(ss.nativeClient);
		
		ss&&ss.nativeClient&&(shareBts.push({title:'微信朋友圈',s:ss,x:'WXSceneTimeline'}),
		shareBts.push({title:'微信好友',s:ss,x:'WXSceneSession'}));
		ss=shares['qq'];
		ss&&ss.nativeClient&&shareBts.push({title:'QQ',s:ss});
		// 弹出分享列表
		shareBts.length>0?plus.nativeUI.actionSheet({title:'分享链接',cancel:'取消',buttons:shareBts},function(e){
			(e.index>0)&&shareAction(shareBts[e.index-1],true);
		}):plus.nativeUI.alert('当前环境无法支持分享链接操作!');
	}

	/**
	 * JosnObject msg content pictures[]
	 */
	owner.shareSystem = function(msg){
//		var msg={content:"t565765"};
//		if(pic&&pic.realUrl){
//			msg.pictures=[pic.realUrl];
//		}
		plus.share.sendWithSystem?plus.share.sendWithSystem(msg, function(){
			console.log('Success');
		}, function(e){
			console.log('Failed: '+JSON.stringify(e));
		}):plus.nativeUI.alert('当前环境无法支持分享链接操作!');
	}
	

	
}(mui, window.appShare = {}));
