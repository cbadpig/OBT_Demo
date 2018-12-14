var ieVersion = "";
$(function() {

	$(".main_cb").click(function() {
		selAllCheckbox(this);
	});

	/*$(".cb_group").click(function() {
		$(".k-grid-pager").offset(comm_offset);
	});*/
	
});

String.prototype.replaceAll = function(s1, s2) {
	return this.replace(new RegExp(s1, "gm"), s2);
};

//var comm_offset = null;
function getDSInstance(url){
	return new kendo.data.DataSource({
	    transport: {
	        read: {
				type : "GET",
				url : url,
				dataType : "JSON",
				contentType : "APPLICATION/JSON;CHARSET=UTF-8",
				cache: false
	        },
	        parameterMap : function(options, operation) {
				if (operation == "read") {
					return {
						currentPage : options.page,
						pageSize : options.pageSize
					};
				}
			}
	    },
	    requestEnd: function(e){
			setTimeout(function(){
				//parent.document.getElementById("right-content").height=this.document.body.scrollHeight+100;
				$(".main_cb").click(function() { 
					//$(".k-grid-pager").css({"margin-top":0});
					selAllCheckbox(this);
				});
				
				/*$(".cb_group").click(function() {
					$(".k-grid-pager").css({"margin-top":0});
				});*/
				//comm_offset = $(".k-grid-pager").offset().top; 
			},50);
		},
	    page: 1,
	    pageSize: 20,
	    schema : {
			data : function(d) {
				return d.data;
			},
			total : function(d) {
				return d.total;
			}
		},
		serverPaging : true
	});
}

var checkedIds = {};

function selectRow(zthis,s) {
    var checked = zthis.checked,
            tempRow = $(zthis).closest("tr"),
            tempGrid = $("#"+s).data("kendoGrid"),
            tempDataItem = tempGrid.dataItem(tempRow);

    checkedIds[tempDataItem.id] = checked;
    if (checked) {
    	tempRow.addClass("k-state-selected");
    } else {
    	tempRow.removeClass("k-state-selected");
    }
}

//on dataBound event restore previous selected rows:
function onDataBound(e) {
    var view = this.dataSource.view();
    for(var i = 0; i < view.length;i++){
        if(checkedIds[view[i].id]){
            this.tbody.find("tr[data-uid='" + view[i].uid + "']")
                    .addClass("k-state-selected")
                    .find(".checkbox")
                    .attr("checked","checked");
        }
    }
}

$.extend({
	iPost : function(option) {	// 例子：$.iPost({url:"http://www.baidu.com",data:{"a":"1","b":"2"}});
		var _form = $("<form id='jsForm' method='post' style='display:none'></form>"), _input;
		$("body").append(_form);
		_form.attr({
			"action" : option.url
		});
		var args = option.data;
		if (args && args != undefined) {
			$.each(args, function(key, value) {
				_input = $("<input type='hidden'>");
				_input.attr({
					"name" : key
				});
				_input.val(value);
				_form.append(_input);
			});
		}
		_form.submit();
	},
	iAjax : function(option) {
		jQuery.ajax({
			dataType:isNull(option.dataType)?"json":option.dataType,
			type : isNull(option.type)?"post":option.type,
			url : option.url,
			cache : false,
			data : isNull(option.data)?{}:option.data,
			beforeSend:function(){
				parent.lockScreen();
			},
			complete : function() {
				parent.closeLockScreen();
			},
			success : option.success,
			error : function() {
				parent.closeLockScreen();
				top._dialog("操作失败");
			}
		});
	},
	iDialog:function(content){
		dialog({
			title:"提示信息",
			content:content
		}).show();
	}
});

function isNull(o) {
	return typeof o == 'undefined' || o == null || o == "";
}
function isNumber(o) {
	var patrn = /^[]{0,1}[0-9]{0,}[.]{0,1}[0-9]{0,}$/;
	if (!patrn.exec(o)) {
		return false;
	}
	return true;
}

function isInt(value,max) {
	var f = false;
	if (/^(\+|-)?\d+$/.test(value)) {
		if(max == undefined){
			if(value > 0){
				f = true;
			}
		}else{
			if(/^(\+|-)?\d+$/.test(max) && value >= max && max>0){
				f = true;
			}
		}
	}
	return f;
}

// 全选/全不选 方法
function selAllCheckbox(zthis) {
	$('.cb_group').each(function() {
		if (zthis.checked == true) {
			this.checked = true;
		} else {
			this.checked = false;
		}
	});
}
 

function goForward(u){
	 parent.document.getElementById("right-content").src=u;
	 //parent.selectMenu(u);
}

function uploadTestRep(){
	
	$.iAjax({url:parent.global_base+"/manage/autoTest/uploadTestReport.do",success:
		function(data){
			parent._dialog(data.msg);
		}}
	);
}

//function enterWindow(msg){
//	dialog({
//	  	id:'entersqmdialogid',
//		title:msg,
//		content:'<input autofocus id="entersqm"/>',
//		okValue:'确认',
//		ok:function(){
//			window.frames["right-content"].window.enterSQM($("#entersqm").val());
//			return true;
//		}
//	}).showModal();
//};

var dynamicLoading = {
	css:function(path){
		if(!path||path.length===0){
			throw new Error("需要引入的文件路径不能为空！");
		}
		var head = document.getElementsByTagName("head")[0];
		var link = document.createElement("link");
		link.href=path;
		link.rel="stylesheet";
		link.type="text/css";
		head.appendChild(link);
	},
	js:function(path){
		if(!path||path.length===0){
			throw new Error("需要引入的文件路径不能为空！");
		}
		var head = document.getElementsByTagName("head")[0];
		var script = document.createElement("script");
		script.src=path;
		script.type="text/javascript";
		head.appendChild(script);
	}
};
function isIE8Up(){
	if(navigator.userAgent.indexOf("MSIE 6.0")>0||
			navigator.userAgent.indexOf("MSIE 7.0")>0||
			navigator.userAgent.indexOf("MSIE 8.0")>0){
		return true;
	}
	return false;
}

function backToIndex(){
	if(navigator.userAgent.indexOf("Firefox")>-1||navigator.userAgent.indexOf("MSIE")>-1){
		window.parent.location.href="/obt/manage/main2.do";
	}else{
		window.parent.location.reload();
	}
	
	//parent.document.getElementById("right-content").src=parent.document.getElementById("back2Index").href;
}

function quickExits(n){
	 $.ajax({
      type : 'post', 
	   dataType : 'json',
      url:n+"/manage/logout.do",
      success:function(data){ 
    	  $.iPost({url:n+"/manage/main2.do"});
    	  //$.iPost(n+"/manage/main2.do");
   	   //window.location.href="${base}/singlemanage";
      },
      error:function(e){
    	  $.iPost({url:n+"/manage/main2.do"});
    	  //$.iPost(n+"/manage/main2.do");
      	//window.location.href="${base}/singlemanage";
      }
	});
}