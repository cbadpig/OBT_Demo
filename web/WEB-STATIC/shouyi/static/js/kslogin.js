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
	
	 function getQueryString(name) {
    
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }
    kmtype = getQueryString("kmtype");
	
	//	disenablekey();
	
	showDLXX(kmtype);
	
	OBT.storage.clearSession();

	//显示考生座位号
	//showZwh();
	//显示"自动化测试..."
	if(at=="1"||at==1){
		$("#zdhcs").css("display","block");
	}
	//绑定重置按钮事件
	$('#resetbtn').click(function() {
		
	});
	//mmdialog();
	
	//setTimeout(cl,2000);
	$('#loginbtn').click(function(){
		denglu2();
	});
	 function cl() {
	loginbox2.close();
}
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
				console.log("******************"+JSON.stringify(data.message)+"******************")
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
var d ;
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
	}
	
		//加载答案页面
	d = dialog({title:'系统正在加载数据, 请稍等...',content:'<p style="text-align:center;">1%</p>',cancel:false,width:180}).showModal();
	//loginbox4.show();
	setTimeout(function() {d.content('<p style="text-align:center;">12%</p>')},300);
	setTimeout(function() {d.content('<p style="text-align:center;">27%</p>')},500);
	setTimeout(function() {d.content('<p style="text-align:center;">46%</p>')},700);
	setTimeout(function() {d.content('<p style="text-align:center;">65%</p>')},800);
	setTimeout(function() {d.content('<p style="text-align:center;">72%</p>')},800);
	setTimeout(function() {d.content('<p style="text-align:center;">81%</p>')},800);
	setTimeout(function() {d.content('<p style="text-align:center;">93%</p>')},1000);
	setTimeout(function() {d.content('<p style="text-align:center;">99%</p>')},1000);
//xx();
	setTimeout(xx,600);
}

function xx() {
	
	loadHTML(kmtype);
	

	var ksinfo ;
	if(kmtype==1) {
		ksinfo = '{"userId":"8888888888","userName":"xxx","zwh":"001","candidateCode":"8888888888","idno":"888888888888888888","ticketNo":"8888888888","roomNo":"1","batchNo":4}'; 
	} else if (kmtype==2) {
		ksinfo = '{"userId":"8888888888","userName":"xxx","zwh":"001","candidateCode":"8888888888","idno":"888888888888888888","ticketNo":"8888888888","roomNo":"1","batchNo":4}';
	} else if (kmtype==3) {
		ksinfo = '{"userId":"8888888888","userName":"xxx","zwh":"001","candidateCode":"8888888888","idno":"888888888888888888","ticketNo":"8888888888","roomNo":"1","batchNo":4}';
	} else {
		ksinfo = '{"userId":"8888888888","userName":"xxx","zwh":"001","candidateCode":"8888888888","idno":"888888888888888888","ticketNo":"8888888888","roomNo":"1","batchNo":4}';
	}
	setTimeout(function() {d.content('<p style="text-align:center;">100%</p>')},300);
	OBT.storage.setSession(kmtype+'CANDIDATE-INFO',ksinfo);
	url = 'exam/before.html?kmtype='+ kmtype +'&time='+Date.parse(new Date());
	window.location.replace(url);


}
function showDLXX(kmtype) {
		$("#zkzh").val("8888888888");
		$("#zjbm").val("888888888888888888");
}

function loadHTML(kmtype) {
	if (kmtype==1) {
		loadSj1();
	} else {
		loadSj2();
	}
}


function loadSj1() {
	
	var keys = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60","61","62","63","64","65","66","67","68","69","70","71","72","73","74","75","76","77","78",
		"79","80","I","QJ","BY","BS","BL","BB","JL","JE","JS",
		"101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150","151","152","153","154","155","156","157","158","159","160","161","162","163","164","165",
		"166","167","168","169","170","171","172","173","174","175","176","II","III","YLL","YLJ","YQE","YQW","YQB","YBS"
	];
	
	$.each(keys,function(index,value){
		
		$.ajax({
			url:'sj/1/4/sj1/'+ value +'.html',
			type:'GET',
			async:false,
			cache:true,
			
			success:function(data) {
				OBT.storage.setLocal(kmtype+value,data);
				
				
			}
		});
	});
}


function loadSj2() {
	
	var keys = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45","46","47","48","49","50","51","52","53","54","55","56","57","58","59","60",
				"61","62","63","64","65","66","67","68","69","70","71","72","I","II","III","IV","V","LY","LS","LW","LQ","QS","QE",
				"101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128",
				"129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150","151","152","153","154","155","156","157",
				"VI","VII","VIII","IX","X","XI","XII","XIII","XIV","XV","XVI","XVII","XVIII",
				"YEJ","YSY","YSS","YSW"
			];
	
	
	$.each(keys,function(index,value){
		
		$.ajax({
			url:'sj/1/4/sj2/'+ value +'.html',
			type:'GET',
			async:false,
			cache:true,
			
			success:function(data) {
				OBT.storage.setLocal(kmtype+value,data);
				
			}
		});
	});
	
}

