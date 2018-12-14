$(document).keydown(function(event) {
	if(event.keyCode==8) {
        return false;
    }
});

$(document).ready(function() {
	if (!window.console) {
		window.console = window.console || (function() {
			var c = {};
			c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
			return c;
		})();
	}
	var kmtype = OBT.storage.getSession("kmtype");
	
	
	//显示"自动化测试..."
	var isAutoTest = OBT.storage.getSession("isAutoTest");
	if(isAutoTest!=undefined){
		$("#zdhcs").css("display","block");
	}
	$("#czsm").click(function(){

		$("#mainText").attr("src","xuzhi/"+ kmtype +"/handleHelp2.html?time="+Date.parse(new Date()));
	});
	$("#ysgz").click(function(){

		$("#mainText").attr("src","xuzhi/"+ kmtype +"/Rule2.html?time="+Date.parse(new Date()));
	});
	$("#kwyq").click(function(){
		
		$("#mainText").attr("src","xuzhi/"+ kmtype +"/examRequired2.html?time="+Date.parse(new Date()));
	});
	
	$("#mainText").attr("src","xuzhi/"+ kmtype +"/examRequired2.html?time="+Date.parse(new Date()));
	getKsInfo();
	//获取项目基本信息
	//var baseinfo = OBT.storage.getSession('BASE-INFO');
	//baseinfo = JSON.parse(baseinfo);
	//document.title=baseinfo.examname;
	document.title="国家统一法律职业资格考试计算机化考试模拟答题演示";
	//缓存试卷
	cachesj();
	
  //计时器
  $("#clock").timeTo("ksToStart",function(){
//	  if(!startdialog) {
//		  startdialog = dialog({title:'获取考试信息中...',cancel:false});
//	  }
//	  startdialog.title('获取考试信息中...').showModal();
//	  var delayTime = Math.floor((Math.random()*5+1)*1000);
//	  console.log("delayTime:"+delayTime);
//	  setTimeout(function(){
//		  startExam();
//	  },delayTime);
	  OBT.storage.removeSession("ss");
      var url = 'obttest.html?time='+Date.parse(new Date());
      window.location.replace(url);
  });
  
//开始考试
  var startdialog;
  function startExam(){
    $.ajax({
      url: OBT.storage.getSession("basepath")+"/exam/API/candidate/startexam.do",
      type: 'post',
      dataType: 'json',
      beforeSend:function(){
    	  startdialog.title('获取考试信息中...').showModal();
      },
      success: function(data) {
        if (data.status == 1) {
          //TODO科目信息缓存
          //OBT.storage.setSession('SUBJECT-INFO',JSON.stringify(data.message));
          //跳转到考试页面
          var url = OBT.storage.getSession("basepath")+'/exam/obttest.html?time='+Date.parse(new Date());
          window.location.replace(url);
        } else if(data.status==-14) {
        	startdialog.title(data.message).showModal();
            setTimeout(startExam,3000);
        } else if(data.status==-41) {
			var url=OBT.storage.getSession("basepath")+'/exam';
			window.location.replace(url);
		} else {
        	startdialog.title('装载数据中，请等待...').showModal();
            setTimeout(startExam,3000);
        }
      },
      error: function(req, data, error) {
    	if(req.status==401) {
  			var url=OBT.storage.getSession("basepath")+'/exam';
  			window.location.replace(url);
  		}
    	startdialog.title('与服务器连接中断，请稍后重试...').showModal();
    	setTimeout(startExam,3000);
      }
    });
  }
  clickImg();
});
//绑定照片点击事件
function clickImg(){
	$("#kspic").click(function(){
		getKsInfo();
	});
}

function getKsInfo(){
	  var ksinfo = OBT.storage.getSession('CANDIDATE-INFO');
	  if (!ksinfo) {
	    console.log('重新登录');
	    var url = '../exam?id=1';
	    window.location.replace(url);
	  }
	  ksinfo = JSON.parse(ksinfo);
//	  var url = OBT.storage.getSession("basepath")+'/signin/upload/photos/'+ksinfo.batchNo+'/'+ksinfo.roomNo+'/picture/'+ ksinfo.ticketNo+'.jpg?time='+Date.parse(new Date());
	  var url = _obt + "/sign/signin/hqzp.do?url=signin/upload/photos/"+ ksinfo.batchNo +"/"+ ksinfo.roomNo +"/picture/"+ ksinfo.ticketNo +".jpg&time=" + new Date();
	  $('#kspic').attr('src', url);
	  $('#ksxm').text(ksinfo.userName);
	  $('#ksxb').text(ksinfo.sex == 1 ? "男" : "女");
	  $('#zkzh').text(ksinfo.ticketNo);
	  $('#sfzh').text(ksinfo.idno);
}

/**
 * 缓存试卷
 */
function cachesj(){
	var kmtype = OBT.storage.getSession("kmtype");
	var url = '../gzsfks/'+ kmtype +'.json';
	$.ajax({
      url: url,
      type: 'POST',
      dataType: 'json',
      contentType:'application/json',
      cache: false, //禁用缓存 
      success: function(data) {
    	  if(data.status==1){
    		OBT.storage.setSession(OBT.KEY_PAPER_CACHE,JSON.stringify(data.message));
    	  }
      },
      error: function(req, data, error) {
      	if(req.status==401) {
    			var url=OBT.storage.getSession("basepath")+'/exam';
    			window.location.replace(url);
    	}
       }
    });
}
function cachesj(){
	var kmtype = OBT.storage.getSession("kmtype");
	console.log(kmtype);
	  var url = '../gzsfks/'+ kmtype +'.json';

	  $.ajax({
	      url: url,
	      type: 'POST',
	      dataType: 'json',
	      async:false,//禁用异步
	      
	      success: function(data) {
	    	  OBT.storage.setSession(OBT.KEY_PAPER_CACHE,JSON.stringify(data));
	      }
	  });
}



