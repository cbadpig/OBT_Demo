/*var OBT.storage.getSession("basepath") = OBT.storage.getSession("OBT.storage.getSession("basepath")");*/
;(function() {
	var timer;
	if (!window.console) {
		  window.console = window.console || (function() {
		    var c = {};
		    c.log = c.warn = c.debug = c.info = c.error = c.time = c.dir = c.profile = c.clear = c.exception = c.trace = c.assert = function() {};
		    return c;
		  })();
		}

	//var curSubject = OBT.paper.getCurSubject();
    //console.log();
  //ItemUrl = "../res/items/"+curSubject.kcdm+"/"+curSubject.kspcbh+"/"+curSubject.sjbwj+"/{0}.html?item={1}";
  var ItemUrl =OBT.storage.getSession("basepath")+'/res/items/{0}.html?item={1}';
  var $nav = $('#leftnav');
  var getTime = 300; 
  function boxResize (frameId,fixH){
    
    //作答区iframe最大化
    var $clientFrm = $('#'+frameId);
    var frameH = $clientFrm[0].offsetHeight || 0;
    var frameTop = $clientFrm[0].offsetTop || 0;
    var clientH = document.documentElement.clientHeight || document.body.clientHeight || 0;
    fixH = fixH || 0;

    console.info('frameH='+frameH);
    console.info('frameTop='+frameTop);
    console.info('frameHeight='+$clientFrm.height());
    console.info('clientH='+clientH);
    frameH = clientH - frameTop + fixH;
    $clientFrm.height(frameH);
    console.info('New frameHeight='+$clientFrm.height());
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
  };
  


  //保存考生作答
  function saveAnswer(ito){
	 
    $.ajax({
      url: OBT.storage.getSession("basepath")+'/exam/API/candidate/answer/save.do',
      type: 'POST',
      dataType: 'json',
      data:ito,
      cache: false, //禁用缓存 
      error: function(xml) {
        console.error('保存小题答案出错!');
      },
      success: function(data) {
        //更新session中保存标志
        if(data.status > 0){
          var omr = JSON.parse(OBT.storage.getSession(ito.key));
          ito.needsave = omr.needsave = false;
          OBT.storage.setSession(ito.key, JSON.stringify(omr));
        }
      }
    });
  }
  //提交试卷
  function submitPaper(){
	  if(sdialog) {
		  sdialog.close().remove();
	  }
	  var sdialog = dialog({
		  backdropBackground: '#2d6dae',
		  backdropOpacity:1,
		  innerHTML:$('#uploadAnswer').html(),
	  });
	  var papers = checkAllAnswer();
	  $.ajax({
		  url:OBT.storage.getSession("basepath")+'/exam/ccKs/checkAllAnswer.do',
		  type:'POST',
		  dataType:'json',
		  contentType:'application/json',
		  data:JSON.stringify(papers),
		  success:function(data) {
			  if(data.status>=0){
				  var basepath = OBT.storage.getSession("basepath");
				  sdialog.showModal();
				  setTimeout(function(){
					  OBT.storage.clearSession();//清除浏览器缓存
					  sdialog.close().remove();
					  $("#clock").timeTo("stop");
					  top.location = basepath +'/exam/end.html';
				  },5000);
			  } else if(data.status==-12) {
				  sdialog.close().remove();
				  dialog({content:data.message,width:100,quickClose: true}).show();;
				  $(".ui-dialog").css("left","-50px");
			  } else if(data.status==-13) {
				  sdialog.close().remove();
				  dialog({content:data.message,width:300,quickClose: true}).show();;
				  $(".ui-dialog").css("left","-200px");
			  } else {
				  $("#result").html("提交试卷失败");
			  }
		  },
		  error:function(){
			  $("#result").html("提交试卷请求无效");  
		  }
	  });
  }
  function checkAllAnswer(){
	  var papers = OBT.paper.getPapers();
	  var jsondata = [];
	  for(var i=0;i<papers.count;i++){
		  var items = papers.data[i].items;
		  for(var j=0;j<items.length;j++){
			  var item = items[j];
			  if(item.needsave){
				  jsondata.push(item);
			  }
		  }
	  }
	  return jsondata;
  }
  
  //切换试卷
  function changePaper(pcode){
	  if(timer) clearInterval(timer);
	  var _pcode = pcode; 
	  var qdialog = dialog({title:'切换试卷信息中...',cancel:false});
	  $.ajax({
		  url:OBT.storage.getSession("basepath")+'/exam/ccKs/changeSj.do',
		  type:'POST',
		  dataType:'json',
		  beforeSend:function(){
			  qdialog.showModal();
	      },
		  success:function(data){
			  //倒计时
			  if(data.status==1) {
				  qdialog.close().remove();
				  $("#clock").timeTo("kmToEnd",function(){
					  //交卷
					  submitPaper();
				  });
				  $.publish(OBT.EVENT_PAPER_CHANGING,[_pcode]);
			  }  else if(data.staus==-41) {
				  window.location.href=OBT.storage.getSession("basepath")+'/exam';
  			  } else {
				  var code = OBT.paper.getCurPaper().code;
				  setTimeout(changePaper(code),1000);
			  }
		  },
		  error:function(req, data, error){
  			if(data.staus==-41) {
  				window.location.href=OBT.storage.getSession("basepath")+'/exam';
  			} 
  			var code = OBT.paper.getCurPaper().code;
  			setTimeout(changePaper(code),1000);
  		}
	  });
  }
  //10秒倒计时
  function ten(pcode){
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
    
      if(results[index].done <=0){
    	  msg += '【'+results[index].name+'】尚未作答。<br/>';
    	  passed = false;
      }else if(results[index].done < results[index].count){
    	  msg += '【'+results[index].name+'】尚有'+ (results[index].count -results[index].done) +'道题未作答。<br/>';
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
                submitPaper();
                return true;
              }
            });
          return false;
        }}
        ]
      });
      dialogBox.showModal();
  }
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
        if(po.items[j].answer.length >0)
          chk.done ++;
      }
      results.push(chk);
    }
    return results;
  }
  function updatekksj(){
	 $.ajax({
		 url:OBT.storage.getSession("basepath")+'/exam/ccKs/addCcksKksj.do',
		 type:'POST',
		 dataType:'json',
		 success:function(data){
			 console.log(data);
			 console.log(data.status);
			 if(data.status==1) {
				 //倒计时
				 $("#clock").timeTo("kmToEnd",function(){
					 var subjects = OBT.paper.getSubjects();
					 var len = subjects.count;
					 var pcode = subjects.data[1].paperCode;
					 console.log(subjects);
					 if(len==1||OBT.paper.getCurPaper().code==pcode) {
						 //交卷
						 submitPaper();
					 } else if(OBT.paper.getCurPaper().code!=pcode){
						 //切换
						 ten(pcode);
					 }
				 });
			 } else {
				 setTimeout(updatekksj(),10000);
			 }
		 },
		 error:function(){
			 console.log("开考时间更新失败");
			 setTimeout(updatekksj(),10000);
		 }
	 });
}
 
  $(document).ready(function(){ 
	  autoHeight();
	  var ksinfo = OBT.storage.getSession('CANDIDATE-INFO');
	  ksinfo = JSON.parse(ksinfo);
	  if (!ksinfo) {
	    console.log('重新登录');
	    top.location = OBT.storage.getSession("basepath")+ '/exam/login.html';
	  } else {
		  $("#ksxm").text(ksinfo.userName);
		  $("#sfzh").text(ksinfo.idno);
		  
		  $('#kspic').attr('src', OBT.storage.getSession("basepath")+'/photos/' + ksinfo.zpwjm);
		  $("#xm").text(ksinfo.userName);
		  $('#xb').text(ksinfo.sex == 1 ? "男" : "女");
		  $("#zkzh").text(ksinfo.ticketNo);
		  $("#zjbm").text(ksinfo.idno);
	  }
	 
	
	  
    //装载考生试卷信息
	var loginbox = dialog({title:'装载考试试卷信息中...'});
    $.ajax({
      // url: "../testinit.json",
      url: OBT.storage.getSession("basepath")+"/exam/API/candidate/paper.do",
      type: 'POST',
      dataType: 'json',
      contentType:'application/json',
      cache: false, //禁用缓存 
      beforeSend:function(){
		loginbox.show();
      },
      error: function(xml) {
        console.error('获取试题信息出错!');
      },
      
      success: function(data) {
    	loginbox.close().remove();
        //试卷结构初始化
        OBT.paper.init(data.subjects,data.papers,{clearAnswer:false});
        //初始化导航按钮
        $('#itembar').ItemNav();
        //显示默认试题
        //当前小题
        var ito = OBT.paper.getCurItem();
        var curSubject = OBT.paper.getCurSubject();
        
        ItemUrl = OBT.storage.getSession("basepath")+"/res/items/"+curSubject.kcdm+"/"+curSubject.kspcbh+"/"+curSubject.sjbwj+"/{0}.html?item={1}";
        var iturl = ItemUrl.format(ito.code,JSON.stringify(ito));
        $('#question_frame').attr('src',iturl);

        //初始化上一题按钮
        $('#prevbtn').PrevButton();
        //初始化下一题按钮
        $('#nextbtn').NextButton();
        //显示科目名称
        var so = OBT.paper.getCurSubject();
        $('#subjectName').text(so.name);
        //设置设置开考时间
        updatekksj();
        //倒计时
        /*$("#clock").timeTo("kmToEnd",function(){
        	var subjects = OBT.paper.getSubjects();
        	var len = subjects.count;
	    	var pcode = subjects.data[1].paperCode;
	    	console.log(subjects);
	    	if(len==1||OBT.paper.getCurPaper().code==pcode) {
	    		//交卷
	    		submitPaper();
	    	} else if(OBT.paper.getCurPaper().code!=pcode){
	    		//切换
	    		ten(pcode);
	    	}
        });*/
        //boxResize('question_frame',-20);
      }
    });
    
    
    
    //客户端布局初始化
    $(window).resize(function(){
    	autoHeight();
    });
    function autoHeight(){
    	var thisH =  document.documentElement.clientHeight||0;
    	if($('#header').is(":hidden")) {
    		$('#question_frame').height(thisH - 42);
    	}else{
    		$('#question_frame').height(thisH - 106);
    	}
       
    };
    $('.zk').click(function(e) {
        $('#header').toggle(); 
        $(this).toggleClass('sq');
        autoHeight();
        //$(this).toggleClass('hidden');
      });
    
    //绑定左边栏隐藏按钮
    $('#navbtn').click(function(e) {
      $('#leftnav').toggle();   
      $(this).toggleClass('hidden');
    });

    //绑定详细信息按钮
    $('#detailbtn').click(function(e) {
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
      
    });
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
    	var msg;
    	if(ito.flag) {
    		msg ="小题"+ ito.code+",被标记";
    	} else {
    		msg ="小题"+ ito.code+",被取消标记";
    	}
    	var flagdata = '{"czlx":"FLAG","gjjb":"1","tjnr":"'+ msg +'"}';
    	OBT.saveKsgj.save(flagdata);
    }
    
    //绑定标记按钮
    $('#testflag').click(function(e) {
      var ito = OBT.paper.getCurItem();
    
      if(ito){
        var omr = JSON.parse(OBT.storage.getSession(ito.key));
        ito.flag = omr.flag = $(this).get(0).checked;
        OBT.storage.setSession(ito.key,JSON.stringify(omr));
        $.publish(OBT.EVENT_FLAG_CHANGED,[ito]);
        saveflag(ito);
      }
    });


    //处理小题更改事件，刷新标记Checkbox
    $.subscribe(OBT.EVENT_ITEM_CHANGED, function(_,old,ito){
      $('#testflag').get(0).checked = ito.flag;
      var curSubject = OBT.paper.getCurSubject();
      
      ItemUrl = OBT.storage.getSession("basepath")+"/res/items/"+curSubject.kcdm+"/"+curSubject.kspcbh+"/"+curSubject.sjbwj+"/{0}.html?item={1}";
      var iturl = ItemUrl.format(ito.code,JSON.stringify(ito));
      $('#question_frame').attr('src',iturl);
    });

    //保存点击小题号轨迹
    function savext(curito,ito){
    	//保存点击小题轨迹
        var inputData = '{"czlx":"INPUTXT","gjjb":"1","tjnr":"进入小题：'+ ito.code +'"}';
        OBT.saveKsgj.save(inputData);
        var outputData = '{"czlx":"OUTPUTXT","gjjb":"1","tjnr":"离开小题：'+ curito.code +'"}';
        OBT.saveKsgj.save(outputData);
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
      
      console.log(curito);
      
      //保存当前小题答案
      
      if(curito.needsave)
        saveAnswer(curito);
      
      //保存点击记录
      if(curito.no!=ito.no) {
    	  savext(curito,ito);
      }
      
      //设置当前小题为下一小题
      OBT.paper.setCurItem(ito.code);
      //显示下一小题
      //var ItemUrl ='../res/items/{0}.html?item={1}';
      var curSubject = OBT.paper.getCurSubject();
      
      ItemUrl = OBT.storage.getSession("basepath")+"/res/items/"+curSubject.kcdm+"/"+curSubject.kspcbh+"/"+curSubject.sjbwj+"/{0}.html?item={1}";
      var iturl = ItemUrl.format(ito.code,JSON.stringify(ito));
      $('#question_frame').attr('src',iturl);
      //console.log(JSON.stringify(iturl)+"******");
      console.log('小题切换：'+ito.code+' '+ito.name);

      //通知小题更改事件
      $.publish(OBT.EVENT_ITEM_CHANGED,[curito,ito]);
    });


    //小题答案更改事件，暂时无需
    $.subscribe(OBT.EVENT_ANS_CHANGED, function(_,ito,omr){
      //判断多选题在答案
    });
  });
})();

function getImg() {
	$.ajax({
		  url:OBT.storage.getSession("basepath")+'/exam/ks/getKs.do',
		  type:'post',
		  dataType:'json',
		  success:function(data){
			  if(data.status==1) {
				  OBT.storage.setSession('CANDIDATE-INFO',JSON.stringify(data.message));
				  var ksInfo = OBT.storage.getSession('CANDIDATE-INFO');
				  ksInfo = JSON.parse(ksInfo);
				  $('#kspic').attr('src', OBT.storage.getSession("basepath")+'/photos/' + ksinfo.zpwjm);
			  }
		  },
		  error:function(){
			  console.log("获取照片请求失败");
		  }
	  });
}