<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=8"/> 
	<title>国家统一法律职业资格考试计算机化考试模拟答题演示</title>
	<link type="image/x-icon" href="${base}/common/images/favicon.ico" rel="shortcut icon"/>
	<link rel="stylesheet" type="text/css" href="${base}/common/artdialog/ui-dialog.css" />
	<link rel="stylesheet" type="text/css" href="${base}/exam/css/login.css" />
 	<script language="javascript" src="${base}/common/js/jquery.min.js?version=${version}"></script>
  	<script language="javascript" src="${base}/common/artdialog/dialog-min.js?version=${version}"></script>
  	<script language="javascript" src="${base}/exam/js/obt.js?version=${version}"></script>
	<script language="javascript" src="${base}/common/js/util.js?version=${version}"></script>
	<script language="javascript" src="${base}/common/js/message.js?version=${version}"></script>
  	<script type="text/javascript">
  		_base = "${base}";
		token="${token}";
  		var at = "${autoTest}";
  		if(at=="1"||at==1){
	  		dynamicLoading.js("${base}/exam/js/auto.utils.js?version=${version}");
	  		dynamicLoading.js("${base}/exam/js/auto.step.1.js?version=${version}");
  		}

  	</script>
  	<!--<script language="javascript" src="${base}/exam/js/auto.utils.js?version=${version}"></script>
  	<script language="javascript" src="${base}/exam/js/auto.step.1.js?version=${version}"></script>-->
  	<script language="javascript" src="${base}/${exam}/js/kslogin.js?version=${version}"></script>
  	
</head>

<body>
 <div id="zdhcs" style="margin-left:180px;margin-top:60px;font-size:34px;color:red;font-weight:bold;position:relative;z-index:102;display:none">自动化测试中...</div>
<object id="webocx" classid="clsid:A8A7A65A-3E9E-419B-8E8D-B53DD9EDB953" style="display:none;"></object> 
	<div class="lg_main">
		<div class="ksZwh" id="zwh" style="display:none"></div>
		<div class="lg_header">
			<span>&nbsp;</span>
		</div>
		<div class="lg_from">
			<div class="kcmc">${kcmc}&nbsp;</div>
			<div class="shenfenz">
				<span>准考证号:</span>
				<input type="text" id="zkzh"/>
			</div>
			<div class="zhenjian">
				<span>身份证号:</span>
				<input type="text" id="zjbm" style="ime-mode:auto;"/>
			</div>
			<div class="buttonk">
				<input type="button" class="buttonDl" onmouseout="this.className='buttonDl'" onmouseover="this.className='buttonDlOnlie'" onmousedown="this.className='buttonDlDown'" id="loginbtn"/>
				<input type="button" class="buttonCz" onmouseout="this.className='buttonCz'" onmouseover="this.className='buttonCzOnlie'" onmousedown="this.className='buttonCzDown'" id="resetbtn"/>
			</div>
		</div>
		
		<div class="" id="tishi" style="margin-top:-100px;margin-left:450px;font-weight:bold" ><span>请按F11进入全屏</span></div>
		
		<div class="version"><span></span></div> 
	</div>
	
</body>
</html>