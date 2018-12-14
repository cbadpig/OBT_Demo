function Jw(){}

/**
 * 本地 考生机位代码key
 */
Jw.Local_JWDM_KEY = "exam_ks_jwdm";

/**
 * 初始化页面
 */
Jw.prototype.init = function(){
	var jwdm = OBT.storage.getLocal(Jw.Local_JWDM_KEY);
	jw.validateJw(jwdm);
};

/**
 * 初始化页面
 */
Jw.prototype.initIndex = function(){
	var jwdm = OBT.storage.getLocal(Jw.Local_JWDM_KEY);
	if(!jwdm){
		window.location.replace(_base+"/exam");
	}
	
	$.ajax({
		type:"POST",
		dataType:"json",
		data:{
			jwdm:jwdm
		},
		url:_base+"/manage/jw/searchJwByJwdm.do?rand="+Math.random(),
		success:function(data){
			if(data.data && data.data.zwh){
				$("#showZwh").text(data.data.zwh);
			}else{
				window.location.replace(_base+"/exam");
			}
		}
	});
};

Jw.prototype.validateJw = function(jwdm){
	//去后台验证座位号
	//如果该机位还未绑定，则后台会生成新的机位信息
	$.ajax({
		type:"POST",
		dataType:"json",
		data:{
			jwdm:jwdm
		},
		url:_base+"/manage/jw/validateJw.do?rand="+Math.random(),
		success:function(data){
			if(data.data){
				if(data.data.zwh){
					$("#showZwh").text(data.data.zwh);
				}
				OBT.storage.setLocal(Jw.Local_JWDM_KEY,data.data.jwdm);
			}
		}
	});
};

Jw.prototype.szZwhHref = function(){
	var hrefVal = $("#szZwhHref").text();
	if(hrefVal == "确认修改"){
		jw.updateZwh();
	}else{
		jw.showSzZwh();
	}
};

Jw.prototype.cancelSz = function(){
	jw.showZwh();
};

/**
 * 显示设置座位号
 */
Jw.prototype.showSzZwh = function(){
	var value = $("#showZwh").text();
	if(!isNaN(value)){
		$("#zwhValue").val(value);
	}
	
	$("#showZwh").hide();
	$("#updateZwh").show();
	$("#qxSzZwhHref").show();
	$("#szZwhHref").text("确认修改");
	$("#zwhValue").select();
};

/**
 * 显示座位号
 */
Jw.prototype.showZwh = function(){
	$("#showZwh").show();
	$("#updateZwh").hide();
	$("#qxSzZwhHref").hide();
	$("#szZwhHref").text("设置座位号");
};

Jw.prototype.updateZwh = function(){
	var zwh = $("#zwhValue").val();
	if(jw.validateZwh(zwh)){
		var jwdm = OBT.storage.getLocal(Jw.Local_JWDM_KEY);
		var qdialog = dialog({title:'正在自动编排机位...',cancel:false});
		$.ajax({
			type:"POST",
			dataType:"json",
			data:{
				jwdm:jwdm,
				zwh:zwh
			},
			url:_base+"/manage/jw/setZwh.do?rand="+Math.random(),
			success:function(data){
				qdialog.close().remove();
				if(data.success){
					_dialog("设置座位号成功，已重新编排机位！");
					$("#showZwh").text(data.data.zwh);
					jw.showZwh();
				}else{
					_dialog(data.message);
				}
			},errot:function(data){
				qdialog.close().remove();
				_dialog("修改失败，请确认管理端是否已经登录！");
			}
		});
	}
};

/**
 * 验证座位号
 */
Jw.prototype.validateZwh = function(zwh){
	if(!zwh){
		_dialog("请输入座位号！");
		$("#zwhValue").focus();
		return false;
	}
	
	if(isNaN(zwh)){
		_dialog("请输入数字！");
		$("#zwhValue").select();
		return false;
	}
	
	//获取机位数量
	var total = jw.getTotal();
	if(zwh <= 0 || zwh > total){
		_dialog("座位号的范围在[1-"+total+"],请输入正确的座位号！");
		$("#zwhValue").select();
		return false;
	}
	
	return true;
}

/**
 * 获取机位数量
 */
Jw.prototype.getTotal = function(){
	var total = 0;
	$.ajax({
		type:"POST",
		dataType:"json",
		async:false,
		url:_base+"/manage/jw/getTotal.do?rand="+Math.random(),
		success:function(data){
			total = data.data;
		}
	});
	return total;
}




