String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
};
function enterWindow(msg,params){
	dialog({
	  	id:'entersqmdialogid',
		title:msg,
		content:'<input autofocus id="entersqm"/>',
		okValue:'确认',
		ok:function(){
			window.frames["right-content"].window.enterSQM(params,$("#entersqm").val());
			return true;
		}
	}).showModal();
};
var self_dia=null;
function _dialog(c,t,w,h){
	if(self_dia!=null){
		self_dia.close().remove();
	}
	self_dia = dialog({
		quickClose:true,
		title:t&&t!=""&&t!=undefined?t:"提示信息",
		content:c&&c!=""&&c!=undefined?c.replaceAll("\r\n","<br/>"):"",
		width:w&&w!=undefined?w:300
	});
	self_dia.show();
};
