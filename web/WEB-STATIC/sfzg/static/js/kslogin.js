String.prototype.trim=function(){
	return this.replace(/\s/g,'');
};

var kmtype = 1;
$(document).ready(function(){
	if(window.sessionStorage) {
		console.log("storage:true");
	} else {
		console.log("storage:false");
	}
	//	disenablekey();
	//赋值
	kmtype = OBT.storage.getSession("kmtype");
	if(!kmtype){
		kmtype = OBT.storage.getLocal("kmtype"); 
	}
	showDLXX(kmtype);
	console.log("login1,kmtype["+ kmtype +"]");
	//清除浏览器缓存
	OBT.storage.clearSession();
	console.log("login2,kmtype["+ kmtype +"]");
	OBT.storage.setSession("kmtype",kmtype);
	console.log("login2,kmtype["+ OBT.storage.getSession("kmtype") +"]");

	//加载答案页面
	loadHTML(kmtype);

	//显示考生座位号
	//showZwh();
	//显示"自动化测试..."
	if(at=="1"||at==1){
		$("#zdhcs").css("display","block");
	}
	//绑定重置按钮事件
	$('#resetbtn').click(function() {
		$("#zkzh").val('');
		$("#zjbm").val('');
	});
	//mmdialog();
	console.log(kmtype);
	$('#loginbtn').click(function(){
		denglu2();
	});
	 
});

function showZwh(){
	var jwdm = OBT.storage.getLocal("exam_ks_jwdm");
	$.ajax({
		type:"POST",
		dataType:"json",
		data:{
			jwdm:jwdm
		},
		url:_base+"/manage/jw/searchJwByJwdm.do?rand="+Math.random(),
		success:function(data){
			if(data.data){
				if(data.data.zwh){
					$("#zwh").text(data.data.zwh);
					$("#zwh").show();
					OBT.storage.setSession("exam_ks_zwh",data.data.zwh);
				}
			}
		}
	});
}

function mmdialog(msg){
	dialog({
	  	id:'mmdialogid',
		title:'迟到密码',
		content:msg+'<br><br><input type="password" autofocus id="cdmm"/>',
		okValue:'确认',
		ok:function(){
			denglu("zp");
			return true;
		}
	}).showModal();

}
function zptxdialog(msg){
	dialog({
	  	id:'zptxdialogid',
		title:'登录提示',
		content:msg,
		okValue:'确认',
		ok:function(){
			denglu("zp");
			return true;
		}
	}).showModal();

}

function tokendialog(msg){
	dialog({
	  	id:'zptxdialogid',
		title:'登录提示',
		content:msg,
		okValue:'确认',
		ok:function(){
			window.location.replace("exam");
			return true;
		}
	}).showModal();

}
function denglu(zp){
	var zkzh = $("#zkzh").val().trim();
	var zjbm = $("#zjbm").val().trim();
	var cdmm = $("#cdmm").val();
	if(null==zkzh||""==zkzh) {
		dialog({title:'登录信息',content:'请输入准考证号',quickClose: true}).show();
		$("#zkzh").focus();
		return;
	} else if(null==zjbm||""==zjbm) {
		dialog({title:'登录信息',content:'请输入证件号码',quickClose: true}).show();
		$("#zjbm").focus();
		return;
	} else {
		var zwh = OBT.storage.getSession("exam_ks_zwh");
		var data = '{"zkzh":"'+ zkzh +'","zjbm":"'+ zjbm +'","cdmm":"'+ cdmm +'","zp":"'+ zp +'","zwh":"'+zwh+'"}';
		var loginbox = dialog({title:'系统登录中...',cancel:false,width:180});
		$.ajax({
			url:_base+"/exam/API/candidate/login.do",
			type:'post',
			dataType:'text',
			data:{
				"json":data,
				"token":token
			},
			beforeSend:function(){
				loginbox.showModal();
			},
			success:function(data){
				if(data==""){
					return ;
				}
				data = JSON.parse(data);
				if(data.status==1){
					OBT.storage.setSession("jmsz",data.message.jmsz);
					var isAutoTest = OBT.storage.getSession("isAutoTest");
					var autorunTime = OBT.storage.getSession("autoTimeout");
					//清除现有考生的所有本地数据
					if(isAutoTest!=undefined){
						OBT.storage.setSession("isAutoTest",isAutoTest);
						OBT.storage.setSession("autoTimeout",autorunTime);
					}
					//自动化测试
					//显示"自动化测试..."
//					if(at=="1"||at==1){
//						OBT.storage.setSession();
//					}
					//存储考生信息
					alert(JSON.stringify(data.message.can));
					OBT.storage.setSession('CANDIDATE-INFO',JSON.stringify(data.message.can));
					OBT.storage.setSession("basepath",_base);
					var baseinfo = '{"basepath":"'+ _base +'","examname":"'+ data.message.examname +'","examyear":"'+ data.message.examyear +'"}';
					OBT.storage.setSession("BASE-INFO",baseinfo);
					//跳转到下一页面
					var url = _base+'/exam/before.html?time='+Date.parse(new Date());
					console.log(url);
					console.log("********照片："+data.message.can.zp);
					token = null;
					var ksinfo = OBT.storage.getSession('CANDIDATE-INFO');
			
				  if (!ksinfo) {
						loginbox.close();
						dialog({id:'messagebox',title:'登录信息',content:"登录信息有误，请联系监考老师做重置处理后再次登陆",quickClose: true}).show();
				  }
					window.location.replace(url);
			
				} else if (data.status==-10||data.status==-11) {
					loginbox.close();
					mmdialog(data.message);
				} else if(data.status==-2) {
					loginbox.close();
					zptxdialog(data.message);
				}  else if(data.status==-60){
					loginbox.close();
					tokendialog(data.message);				
				} else{
					loginbox.close();
					dialog({id:'messagebox',title:'登录信息',content:data.message,quickClose: true}).show();					
				}
			},
			error : function(req,data,error) {
				loginbox.close();
				if(req.status==0){
				  dialog({title:'登录信息',content:'您与服务器已断开连接，无法登录',quickClose: true}).show();
				} else {
					dialog({id:'messagebox',title:'系统错误',content:"数据库连接超时，请重新登录！",quickClose: true}).show();	
				}
			}
		});
	}
}

function denglu2() {
	var zkzh = $("#zkzh").val().trim();
	var zjbm = $("#zjbm").val().trim();
	var cdmm = $("#cdmm").val();
	if(null==zkzh||""==zkzh) {
		dialog({title:'登录信息',content:'请输入准考证号',quickClose: true}).show();
		$("#zkzh").focus();
		return;
	} else if(null==zjbm||""==zjbm) {
		dialog({title:'登录信息',content:'请输入证件号码',quickClose: true}).show();
		$("#zjbm").focus();
		return;
	} else {
		var ksinfo ;
		if(kmtype==1) {
			ksinfo = '{"userId":"88888888","userName":"xxx","sex":2,"candidateCode":"88888888","idno":"888888888888888888","ticketNo":"88888888","roomNo":"1","batchNo":4}'; 
		} else if (kmtype==2) {
			ksinfo = '{"userId":"88888888","userName":"xxx","sex":2,"candidateCode":"88888888","idno":"888888888888888888","ticketNo":"88888888","roomNo":"1","batchNo":4}';
		} else if (kmtype==3) {
			ksinfo = '{"userId":"88888888","userName":"xxx","sex":1,"candidateCode":"88888888","idno":"888888888888888888","ticketNo":"88888888","roomNo":"1","batchNo":4}';
		} else {
			ksinfo = '{"userId":"88888888","userName":"xxx","sex":1,"candidateCode":"88888888","idno":"888888888888888888","ticketNo":"88888888","roomNo":"1","batchNo":4}';
		}
		OBT.storage.setSession('CANDIDATE-INFO',ksinfo);
		url = 'exam/before.html?time='+Date.parse(new Date());
		window.location.replace(url);
		
	}
}
function showDLXX(kmtype) {
		$("#zkzh").val("88888888");
		$("#zjbm").val("888888888888888888");
}

function loadHTML(kmtype) {
	if (kmtype==1) {
		loadSj1();
	} else if(kmtype==2) {
		loadSjHtml(kmtype);
	} else if(kmtype==3) {
		loadSj3(3);
	}
}

function loadSj1() {
	for (var i = 1; i <= 100; i++) {
		$.ajax({
			url:'sj/1/4/sj1/'+ i +'.html',
			type:'GET',
			async:false,
			cache:true,
			success:function(data) {
				OBT.storage.setLocal(i,data);
			}
		});
	}
	console.log(OBT.storage.getLocal("2"));
}

function loadSjHtml(kmtype) {
	for (var i = 1; i <= 100; i++) {
		
		$.ajax({
			url:'sj/1/4/sj'+ kmtype +'/'+ i +'.html',
			type:'GET',
			async:false,
			cache:true,
			success:function(data) {
				OBT.storage.setLocal(i,data);
			}
		});
	}
}

function loadSj3(kmtype) {
	for (var i = 1; i <= 7; i++) {
		
		$.ajax({
			url:'sj/1/4/sj'+ kmtype +'/'+ i +'.html',
			type:'GET',
			async:false,
			cache:true,
			success:function(data) {
				OBT.storage.setLocal(i,data);
			}
		});
	}
}
/*function loadSjHtml(kmtype) {
	var y = 1;
	for (var i = 1; i <= 90; i++) {
		if (i<=85) {
			y = i;
		} else if (i==86) {
			y = 'I';
		} else if (i==87) {
			y = 'II';
		} else if (i==88) {
			y = 'III';
		} else if (i==89) {
			y = 'IV';
		} else if (i==90) {
			y = 'V';
		}
				

		$.ajax({
			url:'sj/1/4/sj'+ kmtype +'/'+ y +'.html',
			type:'GET',
			async:false,
			cache:true,
			success:function(data) {
				OBT.storage.setLocal(y,data);
			}
		});
	}
}*/