;(function() {

	$(document).keydown(function(event) {
		if(event.target.nodeName!=="TEXTAREA"){
			if(event.keyCode==8) {
				return false;
			}
		}
		
	});
	
	var timer;
	if (!window.console) {
		  window.console = window.console || (function() {
		    var c = {};
		    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
		    return c;
		  })();
	}

	
  
  var ItemUrl ='../res/items/{0}.html?item={1}';
  var $nav = $('#leftnav');
  var getTime = 300; 
  function boxResize (frameId,fixH){
    
    //作答区iframe最大化
    var $clientFrm = $('#'+frameId);
    var frameH = $clientFrm[0].offsetHeight || 0;
    var frameTop = $clientFrm[0].offsetTop || 0;
    var clientH = document.documentElement.clientHeight || document.body.clientHeight || 0;
    fixH = fixH || 0;
    frameH = clientH - frameTop + fixH;
    $clientFrm.height(frameH);
  }  //显示提示
  function showMessage(msg){
    var dialogBox = dialog({
      // 设置遮罩背景颜色
      backdropBackground: 'grey',
      // 设置遮罩透明度
      backdropOpacity: 0.8,
      innerHTML:$('#dialog').html(),
      content:msg,
      okValue: '返回作答',
      ok: function () {
      }
    });
    dialogBox.showModal();    
  }
  //设置左侧菜单宽度
  window.onload = function(){
	  var maxW = window.screen.availWidth;
	  $("#leftnav").css("width",maxW*0.2);
	  //设置footer的位置
	  var footerW = $("#footer").width();
	  var mLeft = (maxW*0.8 - footerW)/2;
	  mLeft = mLeft<0?0:mLeft;
	  $("#footer").css("margin-left",mLeft);
  };
  
  function validateKkTime(){
	  var result = false;
	  $.ajax({
			type:"POST",
			dataType:"json",
			async:false,
			url:OBT.storage.getSession("basepath")+"/exam/ks/validateKkTime.do?rand="+Math.random(),
			success:function(data){
				result = data.message;
			},
		      error: function(req, data, error) {
		        	if(req.status==401) {
		      			var url=OBT.storage.getSession("basepath")+'/exam';
		      			window.location.replace(url);
		      	}
		      }
		});
	  return result;
  }

  //保存考生作答（多个答案）
  var i_savaAn = 0;
  var d_savaAn = null;
  function saveAnswerAll(){
	  var papers = checkAllAnswer();
	  if(papers.length==0){
		  return;
	  }
	  $.ajax({
		  url: OBT.storage.getSession("basepath")+'/exam/API/candidate/answer/saveAll.do',
		  type: 'POST',
		  dataType: 'json',
		  contentType:'application/json',
		  data:JSON.stringify(papers),
		  cache: false, //禁用缓存 
	      error: function(req, data, error) {
	    	  console.error('保存小题答案出错!');
        	if(req.status==401) {
      			var url=OBT.storage.getSession("basepath")+'/exam';
      			window.location.replace(url);
	      	}
        	i_savaAn++;
        	console.log("error_i_savaAn:"+i_savaAn);
  			if(i_savaAn>=5){
  				d_savaAn = dialog({id:'lx',title:'提示信息',content:'您与服务器已断开连接(多次保存答案失效)，请联系监考员',width:380,cancel:function(){d=null;},cancelDisplay:false}).showModal();
  			}
	      },
		  success: function(data) {
			  i_savaAn=0;
			  console.log("success_i_savaAn:"+i_savaAn);
			  if(data.status==1){
				  var ids = data.message;
				  for(var i in ids){
					  var id = ids[i];
					  for(var j in papers){
						  var ito = papers[j];
						  if(id===ito.id){
							  ito.needsave = false;
							  OBT.storage.setSession(ito.key, JSON.stringify(ito));
						  }
					  }
				  }
			  }	else if(data.status==-41) {
				  var url=OBT.storage.getSession("basepath")+'/exam';
				  window.location.replace(url);
			  } else if(data.status==-15) {
				  //自动交卷（自动化测试用）
				  submitPaper(1);
			  }
		  }
	  });
  }
  //提交试卷,ksjgzt，1：自动交卷，2：手动交卷
  var flag_submit = true;
  function submitPaper(ksjgzt){
	  submitTestPaper = true;//自动化测试用
	  //如果已经调用了，交卷方法，则不能再次调用
	  if(!flag_submit) return;
	  flag_submit = false;
	  if(sdialog) {
		  sdialog.close().remove();
	  }
	  var sdialog = dialog({
		  backdropBackground: '#2d6dae',
		  backdropOpacity:1,
		  innerHTML:$('#uploadAnswer').html()
	  });
	  var papers = checkAllAnswer();
	  var curito = OBT.paper.getCurItem();
	  curito.czlx=4;
	  var data = "{\"papers\":"+ JSON.stringify(papers) +",\"ksjgzt\":\""+ ksjgzt +"\",\"curito\":"+ JSON.stringify(curito) +"}";
				  $("#clock").timeTo("stop");
				  var basepath = OBT.storage.getSession("basepath");
				  sdialog.showModal();
				  setTimeout(function(){
					  OBT.storage.clearSession();//清除浏览器缓存
					 
					  var url = 'end.html?time='+Date.parse(new Date());
					  window.location.replace(url);
				  },5000);

  }
  function checkAllAnswer() {
	
		var papers = OBT.paper.getPapers();
		var jsondata = [];
		for ( var i = 0; i < papers.count; i++) {
			var items = papers.data[i].items;
			for ( var j = 0; j < items.length; j++) {
				var item = items[j];
				if (item.needsave && item.type != 'COMPOSITE') {
					jsondata.push(item);
				}
			}
		}
		return jsondata;
	}
  /*
   * 切换试卷,flag_change为true，可以切换试卷，为false不可以切换
   * ajax 设置为同步操作
   */
  var flag_change = true;
  function changePaper(pcode){
	  if(!flag_change) return;
	  flag_change = false;
	  if(timer) clearInterval(timer);
	  var _pcode = pcode; 
	  var qdialog = dialog({title:'切换试卷信息中...',cancel:false});
	  $.ajax({
		  url:OBT.storage.getSession("basepath")+'/exam/ccKs/changeSj.do',
		  type:'POST',
		  dataType:'json',
		  async:false,
		  beforeSend:function(){
			  qdialog.showModal();
	      },
		  success:function(data){
			  //倒计时
			  if(data.status==1) {
				  if(qdialog)qdialog.close().remove();
				  $("#clock").timeTo("kmToEnd",function(){
					  //交卷，考试结果状态为，1：自动交卷
					  submitPaper(1);
				  });
				  $.publish(OBT.EVENT_PAPER_CHANGING,[_pcode]);
				  
				  //如果有下一个科目，则继续开始自动化测试
				  if(OBT.storage.getSession("isAutoTest")=="Y"&&!terminate&&terminate!=undefined){
					  terminate = true;
					  isSbm = false;
					  setTimeout(function(){
						  startTest;
					  },2000);
				  }
			  }  else if(data.status==-41) {
				  var url=OBT.storage.getSession("basepath")+'/exam';
				  window.location.replace(url);
  			  } else {
  				  //设置为true，可以访问切换方法
  				  flag_change = true;
  				  if(qdialog) qdialog.close().remove();
  				  setTimeout(changePaper(_pcode),3000);
			  }
		  },
		  error:function(req, data, error){
  			if(req.status==401) {
  				var url=OBT.storage.getSession("basepath")+'/exam';
  				window.location.replace(url);
  			} 
  			flag_change = true;
  			if(qdialog)qdialog.close().remove();
  			setTimeout(changePaper(_pcode),3000);
  		}
	  });
  }
  //10秒倒计时
  function ten(pcode){
	 if(timer) return;
	 var results = checkPaper();
  	 if(d){ d.close().remove(); }
	 var d = dialog({
		// 设置遮罩背景颜色
	    backdropBackground: '#2d6dae',
	    // 设置遮罩透明度
	    backdropOpacity:1,
		innerHTML:$('#ten_dialog').html(),
		content:'【'+results[0].name+'】交卷完成,即将开始【'+results[1].name+'】作答,<br>请勿离开座位。',
		button:[{id:'qd',value:'确定(<span id="tentime"></span>)',callback:function(){
			$("#clock").timeTo("stop");
			if(timer) clearInterval(timer);
			changePaper(pcode);
			return true;
		}}]
	  });
	 var i = 10;
	 $("#tentime").html(i);
	 timer = setInterval(function(){
		 i--;
		 if(i<10) {
			 $("#tentime").html('0'+i);
		 } else {
			 $("#tentime").html(i);
		 }
		 $("#clock").timeTo("stop");
		 if(i<=0){
			 $("#clock").timeTo("stop");
			 if(timer) clearInterval(timer);
			 $("#tentime").html(0);
			 d.close().remove();
			 changePaper(pcode);
		 }
	 },1000);
	 d.showModal();
  }
  
  //按钮提交
  function sp(index){
	  var results = checkPaper();
      var msg = '',passed = true;
	  var ss = OBT.storage.getSession("ss");
		if(results[index].done < results[index].count){
    	  msg += '【'+results[index].name+'】尚有'+ (results[index].count -results[index].done) +'道题未作答。<br/>';
      }
      msg += '&nbsp;&nbsp;还要继续交卷吗？<br/>';
      //是否通过检查
      if(!passed){
        showMessage(msg);
        return ;
      }
     
      var dialogBox = dialog({
          // 设置遮罩背景颜色
          backdropBackground: 'grey',
          // 设置遮罩透明度
          backdropOpacity: 0.8,
          innerHTML:$('#dialog').html(),
          content:msg,
          button:[
          {id:'rebtn',value:'返回作答',callback:function(){}},
          {id:'submitbtn',value:'交卷',callback:function(){
            this.content('再次确认是否交卷？<br/>交卷后将不能继续答题！');
            this.button(
              {id:'submitbtn',value:'确定交卷',callback: function(){
              	//人工交卷，2：人工交卷
                  submitPaper(2);
                  return true;
                }
              });
            return false;
          }}
          ]
        });
      
      //核实照片
      var ksinfo = JSON.parse(OBT.storage.getSession('CANDIDATE-INFO'));

	  var url = _obt + "/sign/signin/hqzp.do?url=signin/upload/photos/"+ ksinfo.batchNo +"/"+ ksinfo.roomNo +"/picture/"+ ksinfo.ticketNo +".jpg&time=" + new Date();
	  $('#hczp').attr('src',url);
	  var isAutoTest = OBT.storage.getSession("isAutoTest");

	  dialogBox.showModal();
  }

   function autoHeight(type){
    	var thisH =  document.documentElement.clientHeight||0;
    	var frameH =  $('#sjHtml').height();
		
    	
    	if($('#header').is(":hidden")) {
    		
    			$('#question_frame2').height(thisH-40);
    		
    		$('#leftnav').height(thisH);
		
    	}else{
    		
    			$('#question_frame2').height(thisH-140);
    		
    		$('#leftnav').height(thisH-104);
    	}

    };
  //点击提交按钮，进行切换试卷倒计时前的弹出层提示
  function cp(pcode){
	  var results = checkPaper();
      var msg = '',passed = true;
     
      if(results[0].done <=0){
    	  msg += '【'+results[0].name+'】尚未作答。<br/>';
    	  passed = false;
      }else if(results[0].done < results[0].count){
    	  msg += '【'+results[0].name+'】尚有'+ (results[0].count -results[0].done) +'道题未作答。<br/>';
      }
     
      msg += '&nbsp;&nbsp;请确定全部答完后交卷！<br/>';
      //是否通过检查
      if(!passed){
        showMessage(msg);
        return ;
      }
      var dialogBox = dialog({
        // 设置遮罩背景颜色
        backdropBackground: 'grey',
        // 设置遮罩透明度
        backdropOpacity: 0.8,
        innerHTML:$('#dialog').html(),
        content:msg,
        button:[
        {id:'rebtn',value:'返回作答',callback:function(){}},
        {id:'submitbtn',value:'交卷',callback:function(){
          this.content('再次确认是否交卷？<br/>交卷后将不能继续答题！');
          this.button(
            {id:'submitbtn',value:'确定交卷',callback: function(){
                ten(pcode);
                return true;
              }
            });
          return false;
        }}
        ]
      });
      dialogBox.showModal();
  }
  
  //检查科目作答情况，因个性化检查原因，此方法不能放在OBT.paper中。
  function checkPaper(){
    var results = new Array();
    var papers = OBT.paper.getPapers();
    for(var i=0;i<papers.count;i++){
      var chk = {
        name:null,
        code:null,
        count:0,
        done:0
      };
      var po = papers.data[i];
      //科目名称
      chk.name = OBT.paper.getSubject(po.code).name;
      //逐个小题检测
      var itemlen = po.items.length;
      for(var j=0;j<itemlen;j++){
        //复合题不计算在内
        if(po.items[j].type === 'COMPOSITE')
          continue;
        chk.count ++;
        if(po.items[j].answer.length >0&&parseInt(po.items[j].answer)!=0)
          chk.done ++;
      }
      results.push(chk);
    }
    return results;
  }
  function updatekksj(){

				 //倒计时
				 $("#clock").timeTo("kmToEnd",function(){
					 var subjects = OBT.paper.getSubjects();
					 var len = subjects.count;
					 var pcode = subjects.data[len-1].paperCode;
					 if(len==1){  //一科
						 //交卷，1：自动交卷，如果是这里不会调用
						 submitPaper(1);
					 } else if(len>1){ //两科
						 var pcode = subjects.data[len-1].paperCode;
						 if(OBT.paper.getCurPaper().code==pcode) {
							 //交卷，1：自动交卷，如果是这里不会调用
							 submitPaper(1);
						 } else if(OBT.paper.getCurPaper().code!=pcode){
							 //切换
							 ten(pcode);
						 }
					 } 
				 });

}
  
  //制作试卷
  function makesj(data){
	
	//试卷结构初始化
    OBT.paper.init(data.subjects,data.papers,{clearAnswer:false});
    //初始化导航按钮
    $('#itembar').ItemNav();
    //显示默认试题
    //当前小题
    var ito = OBT.paper.getCurItem();
    var curSubject = OBT.paper.getCurSubject();
 
    $('#sjHtml').html(OBT.storage.getLocal(ito.code));
	showEditorMenu2();
	changeXtAndXxList(ito);
	markshow(ito);
	themeShow();
	autoHeight(1);
    //设置进入当前小题的时间
    //OBT.paper.setCurItemTime(ito);
    //初始化上一题按钮
    $('#prevbtn').PrevButton();
    //初始化下一题按钮
    $('#nextbtn').NextButton();
    //显示科目名称
    var so = OBT.paper.getCurSubject();
    $('#subjectName').text(so.name);
    //设置设置开考时间
    updatekksj();
  }
  
 
  function loadsj(){
	 
	  var loginbox = dialog({title:'装载考试试卷信息中...'});
	  var kmtype = OBT.storage.getSession("kmtype");
	  var url = '../gzsfks/'+ kmtype +'.json';

	  $.ajax({
	      url: url,
	      type: 'get',
	      dataType: 'json',
	      async:false,//禁用异步
	      beforeSend:function(){
	    	  loginbox.close();
	      },
	      error:function(data) {
	    	  console.log("加载json数据有问题");
	      },
	      success:function(data) {
	    	  loginbox.close().remove();
	    	
	    	  makesj(data); 
	      }
	  });
  }
  //绑定点击考生详细信息按钮
  function ksinfoclick(){
	  //获取考生基本信息
	  var ksinfo = JSON.parse(OBT.storage.getSession('CANDIDATE-INFO'));
	  if(!ksinfo){
		  window.location.replace('../exam');
	  }
//	  var url = OBT.storage.getSession("basepath")+'/signin/upload/photos/'+ksinfo.batchNo+'/'+ksinfo.roomNo+'/picture/'+ ksinfo.ticketNo+'.jpg?time='+Date.parse(new Date());
	  var url = _obt + "/sign/signin/hqzp.do?url=signin/upload/photos/"+ ksinfo.batchNo +"/"+ ksinfo.roomNo +"/picture/"+ ksinfo.ticketNo +".jpg&time=" + new Date();
	  $('.kspic').attr('src',url);
	  $("#ksxm").text(ksinfo.userName);
	  $("#sfzh").text(ksinfo.idno);
	  $('#detailbtn').click(function(e) {
		  //获取照片
		  getImg();
	  });
  }
  
  //获取考生照片
  function getImg() {
	  var ksinfo = JSON.parse(OBT.storage.getSession('CANDIDATE-INFO'));
//	  var url = OBT.storage.getSession("basepath")+'/signin/upload/photos/'+ksinfo.batchNo+'/'+ksinfo.roomNo+'/picture/'+ ksinfo.ticketNo+'.jpg?time='+Date.parse(new Date());
	  var url = _obt + "/sign/signin/hqzp.do?url=signin/upload/photos/"+ ksinfo.batchNo +"/"+ ksinfo.roomNo +"/picture/"+ ksinfo.ticketNo +".jpg&time=" + new Date();
	  $("#ksxm").text(ksinfo.userName);
	  $("#sfzh").text(ksinfo.idno);
	  $('.kspic').attr('src',url);
	  $("#xm").text(ksinfo.userName);
	  $('#xb').text(ksinfo.sex == 1 ? "男" : "女");
	  $("#zkzh").text(ksinfo.ticketNo);
	  $("#zjbm").text(ksinfo.idno);
	  var dialogBox = dialog({
	      // 设置遮罩背景颜色
	      backdropBackground: 'grey',
	      // 设置遮罩透明度
	      backdropOpacity: 0.8,
          innerHTML:$('#ksinfodialog').html(),
          okValue:'返回作答',
          ok:function(){}
	  });
	  dialogBox.showModal();
  }
  
  function  changeXtAndXxList(ito) {
		//符合提醒暂不处理
		/*if (ito.type=='COMPOSITE') {
			return;
		}*/
		
		if(ito.type==="SAQ" || ito.type=='COMPOSITE'){
			
			$("#dqName").css('display','none');
			//$("#textArea01").html(ito.content);
			//$("#textArea01").find('textarea').bind("onblur",function() {ITEM.singleClick(this,ito)});
		}else{
			$('.choiceContext input').css('display','none');
			$("#xtName").html(ito.name);
			var xtList = '<input type="radio" name="item-'+ ito.code +'" value="1">A<input type="radio" name="item-'+ ito.code +'" value="2">B <input type="radio" name="item-'+ ito.code +'" value="4">C <input type="radio" name="item-'+ ito.code +'" value="8">D';   
			if (ito.type==="MULTIPLE"||ito.type==="SMULTIPLE" || ito.type==="CSMULTIPLE") {
				xtList = '<input type="checkbox" name="item-'+ ito.code +'" value="1">A<input type="checkbox" name="item-'+ ito.code +'" value="2">B <input type="checkbox" name="item-'+ ito.code +'" value="4">C <input type="checkbox" name="item-'+ ito.code +'" value="8">D';   
			}
			
			$("#xxList").html(xtList);
			
			$("#xxList").find('input[type="radio"]').bind("click",function() {ITEM.singleClick(this,ito)});
			$("#xxList").find('input[type="checkbox"]').bind("click",function() {ITEM.multipleClick(this,ito)});
			$("#xxList").find('input').css('margin-left',15);
			var itoAns = ito.answer;
			$("#xxList").find('input[value="'+itoAns+'"]').prop('checked',true);
			
			if((ito.type === 'MULTIPLE' ||ito.type==="SMULTIPLE" || ito.type==="CSMULTIPLE") && ito.answer != '' && ito.answer != '0'){
				var omrv = parseInt(ito.answer);
				var curAns_ = 1;
				for(var i =1;i <= omrv;i++){
				 if(omrv & curAns_){
					$("#xxList").find('input[value="'+curAns_+'"]').prop('checked',true);
				 }
				  curAns_ *= 2;
				}
			}
		}
	}
	
	
	function markshow(ito) {
		if(ito.type!='SMULTIPLE') {
			$('#mark').css('display','none');
			$('#unmark').css('display','none');
		}
	}
	  


	function themeShow() {
		console.log('thmeShow=========');
		var $themeLi = $('<li id="themeLi"><a id="themeP">风格</a><a id="themeF">字体</a></li>');
		var $theme1 = $('<div id="theme1" class="theme" onclick="setTheme()">风格一</div>');
		var $theme2 = $('<div id="theme2" class="theme" onclick="setTheme(2)">风格二</div>');
		var $theme3 = $('<div id="theme3" class="theme" onclick="setTheme(3)">风格三</div>');
		var $theme4 = $('<div id="theme4" class="theme" onclick="setTheme(4)">风格四</div>');
		var $theme5 = $('<div id="theme5" class="theme" onclick="setTheme(5)">风格五</div>');
		var $theme6 = $('<div id="theme6" class="theme" onclick="setFont(12)">小</div>');
		var $theme7 = $('<div id="theme7" class="theme" onclick="setFont(16)">中</div>');
		var $theme8 = $('<div id="theme8" class="theme" onclick="setFont(20)">大</div>');
		var $theme9 = $('<div id="theme9" class="theme" onclick="setFont(24)">更大</div>');
		var $theme10 = $('<div id="theme10" class="theme" onclick="setFont(28)">超大</div>');
		$themeLi.append($theme1).append($theme2).append($theme3).append($theme4).append($theme5).append($theme6).append($theme7).append($theme8).append($theme9).append($theme10);
		$('.paperTitle').append($themeLi);
		
		var curTheme = OBT.storage.getSession("theme");
		setTheme(curTheme);
		var flag = false;
		$('#themeP').click(function() {
			if(!flag){
				$('#theme1').show();
				$('#theme2').show();
				$('#theme3').show();
				$('#theme4').show();
				$('#theme5').show();
				$('#theme6').hide();
				$('#theme7').hide();
				$('#theme8').hide();
				$('#theme9').hide();
				$('#theme10').hide();
				flag = true;
			}else{
				$('#themeLi').find('div').hide();
				flag = false;
			}
			
		});
		$('#themeF').click(function() {
			if(!flag){
				$('#theme1').hide();
				$('#theme2').hide();
				$('#theme3').hide();
				$('#theme4').hide();
				$('#theme5').hide();
				$('#theme6').show();
				$('#theme7').show();
				$('#theme8').show();
				$('#theme9').show();
				$('#theme10').show();
				flag = true;
			}else{
				$('#themeLi').find('div').hide();
				flag = false;
			}
			
		});
		
	}

	function LRMove() {
		$('#boxline').bind('mousedown',startMove);
	}

	var downX;
	var leftBoxWidth;
	var rightBoxWidth;
	var boxLineLeft;
	var lenTemp;
	function startMove(e) {
	
		var explorer =navigator.userAgent ;
		if (explorer.indexOf("MSIE") >= 0) {
			var key = window.event.button;
			if(key!=0&&key!=1){
				return;
			}
		} else {
			console.log(2222);
			if(event.button!=0){
				return;
			}
		}
		lenTemp=0;
		downX=event.clientX; 
		leftBoxWidth = $('#leftbox').width();
		rightBoxWidth = $('#rightbox').width();
		boxLineLeft = $('#boxline').css('left');
		boxLineLeft = boxLineLeft.substring(0,boxLineLeft.length-2);

		$(document).bind("mousemove",move);  
		$(document).bind("mouseup",stop);  
	}
	
	function move() {
		var moveX=event.clientX; 
		
		var len = parseInt(moveX) - parseInt(downX);
		
		if ($('#leftbox').width()<300) {
			if (lenTemp==0) {
				lenTemp = Math.abs(len);
				return false;
			}
			if (len<0&&(Math.abs(len)-lenTemp)>0) {
				return false;
			} else {
				lenTemp = 0;
			}
		}

		if ($('#rightbox').width()<300) {
			if (lenTemp==0) {
				lenTemp = Math.abs(len);
				return false;
			}
			if (len>0&&(Math.abs(len)-lenTemp)>0) {
				return false;
			} else {
				lenTemp = 0;
			}
		}
		$('#leftbox').css('width',leftBoxWidth+len);
		$('#rightbox').css('width',rightBoxWidth-len);
		$('#boxline').css('left',new Number(boxLineLeft)+len);

	}
	
	function stop() {
		$(document).unbind("mousemove",move); 
		$(document).unbind("mouseup",stop);  
	}
	
	
	function openWin() {
		var thisH =  document.documentElement.clientHeight||0;
		var openItem = thisH-300;
		var closeItem = 200;
		var openItemAndTitle = thisH-200;
		var flag = $('#header').is(":hidden");
		//展开
		if(flag){
			//资料区放大状态
			if($('#I-0').height()==openItem){
				$('#window02').css("height",openItemAndTitle,"weight","100%");
				$('#I-0').css("height",openItemAndTitle);
			}
			//答题区放大状态
			if($('#window03').height()==openItem){
				$("#window03").css("height",openItemAndTitle,"weight","100%");
				$("#I-1").css("height",openItemAndTitle);
				$(".textAreaWh").css("height", openItemAndTitle-50);
			}
		}else{
			//资料区放大状态
			if($('#I-0').height()==openItemAndTitle){
				$('#window02').css("height",openItem,"weight","100%");
				$('#I-0').css("height",openItem);
			}
			//答题区放大状态
			if($('#window03').height()==openItemAndTitle){
				$("#window03").css("height",openItem,"weight","100%");
				$("#I-1").css("height",openItem);
				$(".textAreaWh").css("height", openItem-50);
			}	
		}
	}
	
	function upDownMove() {
		$('#line').bind('mousedown',startMoveY);
	}

	var downY;
	var topBoxHeight;
	var bottomBoxHeight;
	var LineTop;
	var lenTempY;
	function startMoveY(e) {
		var explorer =navigator.userAgent ;
		if (explorer.indexOf("MSIE") >= 0) {
			var key = window.event.button;
			if(key!=0&&key!=1){
				return;
			}
		} else {
			console.log(2222);
			if(event.button!=0){
				return;
			}
		}
		lenTempY=0;
		downY=event.clientY; 
		topBoxHeight = $('#window02 > div').height();
		bottomBoxHeight = $('textarea').height();
		LineTop = $('#line').css('top');
		LineTop = LineTop.substring(0,LineTop.length-2);

		$(document).bind("mousemove",moveY);  
		$(document).bind("mouseup",stopY);  
	}
	
	function moveY() {
		
		var moveYdirect=event.clientY; 
		
		var len = parseInt(moveYdirect) - parseInt(downY);
		console.info(len);
		if ($('#window02').height()< 100) {
			if (lenTempY==0) {
				lenTempY = Math.abs(len);
				return false;
			}
			if (len<0&&(Math.abs(len)-lenTempY)>0) {
				return false;
			} else {
				lenTempY = 0;
			}
		}

		if ($('textarea').height()< 100) {
			if (lenTempY==0) {
				lenTempY = Math.abs(len);
				return false;
			}
			if (len>0&&(Math.abs(len)-lenTempY)>0) {
				return false;
			} else {
				lenTempY = 0;
			}
		}
		$('#window02 > div').css('height',topBoxHeight + len);
		$('#line').css('top',new Number(LineTop) + len);
		$('textarea').css('height',bottomBoxHeight - len);   
	}
	
	function stopY() {
		$(document).unbind("mousemove",moveY); 
		$(document).unbind("mouseup",stopY);  
	}
 
$(document).ready(function(){ 
	//autoHeight();
	  
    //装载考生试卷信息
	var data = OBT.storage.getSession(OBT.KEY_PAPER_CACHE);
	if(data){
		makesj(JSON.parse(data));
	}else{
		loadsj();
	}
	
	document.title="国家统一法律职业资格考试计算机化考试模拟答题演示";
	$(".prname").text("国家统一法律职业资格考试计算机化考试模拟答题演示");
    //客户端布局初始化
    $(window).resize(function(){
    	autoHeight();
    });
   
   //设置默认风格
   //OBT.storage.setSession("theme",1);
   
   LRMove();
   upDownMove();
   
    $('.zk').click(function(e) {
        $('#header').toggle(); 
        $(this).toggleClass('sq');
        autoHeight();
		openWin();
     });
	 
	
    //绑定左边栏隐藏按钮
    $('#navbtn').click(function(e) {
      $('#leftnav').toggle();   
      $(this).toggleClass('hidden');
	  var maxW = window.screen.availWidth;
	  var footerW = $("#footer").width();
	  if($('#leftnav').is(":hidden")) {
		//设置footer的位置
		
		var mLeft = (maxW - footerW)/2;
		mLeft = mLeft<0?0:mLeft;
		$("#footer").css("margin-left",mLeft);
		//$("#footer").css("margin-left",maxW*0.2+40);
	  } else {
		//设置footer的位置
		var mLeft = (maxW*0.8 - footerW)/2;
		mLeft = mLeft<0?0:mLeft;
		$("#footer").css("margin-left",mLeft);
		//$("#footer").css("margin-left",40);
	  }
    });

    //绑定详细信息按钮
    ksinfoclick();
    //绑定交卷按钮
    $('#submitbtn').click(function(e) {

  				var subjects = OBT.paper.getSubjects();
  		    	var len = subjects.count;
  		    	if(len==1) {
  		    		sp(len-1); //交卷
  		    	} else if(len>1) {
  		    		var pcode = subjects.data[len-1].paperCode;
  		    		if(OBT.paper.getCurPaper().code==pcode) {
  		        		sp(len-1);	//交卷
  		        	} else if(OBT.paper.getCurPaper().code!=pcode){
  		        		cp(pcode); //切换
  		        	} else {
  		        		return; //其他按钮失效
  		        	} 
  		    	}

    	
    });
	
    function saveflag(ito) {
    	var flagdata = '[{"id":'+ ito.id +',"xtdm":"'+ ito.code +'","sjxth":"'+ ito.sjxth +'","czlx":"5","tjnr":"'+ ito.flag +'"}]';
    	OBT.saveKsgj.save(flagdata);
    }
    
    //绑定标记按钮
    $('#testflag').click(function(e) {
      var ito = OBT.paper.getCurItem();
      if(ito){
        var omr = JSON.parse(OBT.storage.getSession(ito.key));
        if($(this).get(0).checked){
        	ito.flag = omr.flag = 1;
        } else {
        	ito.flag = omr.flag = 2;
        }
        OBT.storage.setSession(ito.key,JSON.stringify(omr));
        $.publish(OBT.EVENT_FLAG_CHANGED,[ito]);
        //saveflag(ito);
      }
    });

    //处理小题更改事件，刷新标记Checkbox
    $.subscribe(OBT.EVENT_ITEM_CHANGED, function(_,old,ito){
    	if(ito.flag==1){
    		$('#testflag').get(0).checked = true;
    	} else {
    		$('#testflag').get(0).checked = false;
    	}
      var curSubject = OBT.paper.getCurSubject();
     
      $('#sjHtml').html(OBT.storage.getLocal(ito.code));
	  showEditorMenu2();
      autoHeight();
		LRMove();
		upDownMove();
    });

    //保存点击小题号轨迹
    function savext(curito,ito){
    	curito.czlx=4;
    	var str1 = JSON.stringify(curito);
    	ito.czlx=100;
    	var str2 = JSON.stringify(ito);
		var gjdata = '['+ str1 +','+ str2 +']';
		console.log("轨迹："+gjdata);
		OBT.saveKsgj.save(gjdata);
    }
	
	
    //处理试卷切换事件
    $.subscribe(OBT.EVENT_PAPER_CHANGING, function(_,pcode){
      // TODO，是否允许科目切换，会计的切换科目确认
      
      //切换科目tab
      $('#subjecttab').find('li').each(function(index, el) {
        $(this).toggleClass('active');
      });
      //切换试卷
      $('#papernav').find('ul').each(function(index, el) {
        $(this).toggle();
      });
      var old = OBT.paper.getCurItem();
      //设置当前试卷
      OBT.paper.setCurPaper(pcode);
      console.log('试卷切换：'+pcode);
      //显示科目名称
      var so = OBT.paper.getCurSubject();
      $('#subjectName').text(so.name);
      //试卷更换，小题也更换
      var ito = OBT.paper.getCurItem();
      //通知小题更改事件
      $.publish(OBT.EVENT_ITEM_CHANGED,[old,ito]);
    });

    //处理小题预切换事件
    $.subscribe(OBT.EVENT_ITEM_CHANGING, function(_,curito,ito){
      //判断当前小题是否是多选题
      if(curito.type === 'MULTIPLE' && curito.answer != '' && curito.answer != '0'){
        var omrv = parseInt(curito.answer);
        for(var i =1;i <= omrv;i *=2){
          if(!(i ^ omrv)){
            showMessage('多选题至少需要选两个答案！');
            return false;
          }
        }
      }
     
      //savext(curito,ito);
      //保存小题，每次保存都遍历所有小题，查出为需要保存的小题，重新保存
      //saveAnswerAll();
      //设置当前小题为下一小题
      OBT.paper.setCurItem(ito.code);
      
      //通知小题更改事件
      $.publish(OBT.EVENT_ITEM_CHANGED,[curito,ito]);
	  
	  //更换展示选项和题号
	  changeXtAndXxList(ito);
	  
	  //标记题干
	  markshow(ito);

	  //风格
	  themeShow();
    });


    //小题答案更改事件，暂时无需
    $.subscribe(OBT.EVENT_ANS_CHANGED, function(_,ito,omr){
      //判断多选题在答案
    });
  });
})();
