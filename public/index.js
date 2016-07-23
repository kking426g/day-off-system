$(function () {
	var socket = io.connect('http://192.168.2.60:8003');
			CKFinder.setupCKEditor();
	var user,		//登入帳號
			pass,		//登入密碼
			testid,	//登入id
			verifyarray = [],
			lh;			//請假時數
			editor = CKEDITOR.replace( 'substance', {});

//頁面初始化
  $("#menu").hide();	//導航列關閉
  $("#content").hide();	//資訊顯示區關閉
  $("#employee_leave_search").hide();	 //請假關閉
	$("#board").hide(); //公告欄關閉
	$("#gallery").hide(); //活動花絮關閉
	$("#travel").hide(); //旅遊活動關閉
	$("#chpwd").hide(); //更改密碼關閉
	$("#leavepage").hide(); //請假頁面關閉
	$("#verifypage").hide();	//審核頁面關閉
	$("#leavetabs").hide();
	
//點擊登入按鈕
  $("#login").click(function(){
    user = $("#account").val();
    pass = $("#password").val();
	socket.emit("login", user, pass);
  }); 
  
//登入輸入框按Enter登入
  $('#myForm').keydown(function(e){
  	var key = e.which;
  	if (key == 13) {
    	user = $("#account").val();
    	pass=$("#password").val();
		socket.emit("login", user, pass);
	}
  });
	
//觸發導航列表-公佈欄
	$("#menuboard").click(function(){ 
		$("#board").show(); //公佈欄打開
		$("#travel").hide(); //旅遊活動關閉
		$("#gallery").hide(); //活動花絮關閉
		$("#employee_leave_search").hide();//請假關閉
		$("#chpwd").hide(); //更改密碼關閉
		$("#board_edit").hide(); //新增公告欄關閉	
		$("#verifypage").hide();
		$("#leavepage").hide();
		$("#leavetabs").hide();
  }); 
	
	
//觸發導航列表-旅遊活動
	$("#menutravel").click(function(){ 
		$("#travel").show(); //旅遊活動打開
		$("#board").hide(); //公佈欄關閉
		$("#gallery").hide(); //活動花絮關閉
		$("#employee_leave_search").hide(); //請假關閉
		$("#chpwd").hide(); //更改密碼關閉
		$("#board_edit").hide(); //新增公告欄關閉
		$("#verifypage").hide();
		$("#leavepage").hide();
		$("#leavetabs").hide();
	});

//觸發導航列表-活動花絮
	$("#picture").click(function(){
	  $("#piccontent").empty();//照片清空
		$("#folderlist").empty();//資料夾清空
    $("#put_p").empty();//照片播放器清空
		$("#gallery").show();//顯示花絮頁面
		//關閉其他頁面
		$("#board").hide(); //公佈欄關閉
		$("#travel").hide(); //旅遊活動關閉
		$("#employee_leave_search").hide(); //請假關閉
		$("#board_edit").hide(); //新增公告欄關閉	
		$("#chpwd").hide();//更改密碼關閉
		$("#verifypage").hide();
		$("#leavepage").hide();
		$("#leavetabs").hide();
		//隱藏活動花絮的功能紐
    $("#uploadForm").hide();//選擇檔案(瀏覽)隱藏
		$("#activitytext").hide();//新增資料夾的命名欄也先隱藏
		$("#addactivity").hide();//上傳照片紐先隱藏	
		$("#picture_show").hide();//照片播放器先隱藏	
		//傳給伺服器取出所有相簿資料夾
		socket.emit("getFolder");
	});	
		
//觸發導航列表-請假
	$("#dayoff").click(function(){ //觸發導航列表請假
  	socket.emit("checkM", user);
		$("#employee_leave_search").show(); //請假打開
		$("#leavetabs").show();
		$("#leavereocrd").tab('show');
		$("#gallery").hide(); //活動花絮關閉
		$("#board").hide(); //公佈欄關閉
		$("#leavepage").hide();
		$("#chpwd").hide(); //更改密碼關閉
		$("#board_edit").hide(); //新增公告欄關閉
		$("#travel").hide(); //旅遊活動關閉
		$("#verifypage").hide();
	});
	
//觸發更改密碼
	$("#changepwd").click(function(){
		socket.emit("emp_date", user);
		$("#chpwd").show(); //更改密碼打開
		$("#travel").hide(); //旅遊活動關閉
		$("#gallery").hide(); //活動花絮關閉
		$("#board").hide(); //公佈欄關閉
		$("#employee_leave_search").hide(); //請假關閉
		$("#board_edit").hide(); //新增公告欄關閉
		$("#emp_photo").empty();
		$("#verifypage").hide();
		$("#leavepage").hide();
		$("#leavetabs").hide();
	});	

//正確登入後畫面
	socket.on("change", function(username){
	  user = username;
		socket.emit("checkHR", user); //判斷是否為HR
		socket.emit("showboard", user); //登入後預設資訊列顯示公告訊息
    alert("login ok");	//登入成功提示
    $("#logindiv").hide();
		$("#board_edit").hide();
		$("#travel").hide();
		$("#chpwd").hide();
		$("#add_board").hide();
		$("#del_board").hide();
		$("#del_number").hide();
		$("#verifypage").hide();
		$("#leavepage").hide();
		$("#leavetabs").hide();
		$("#content").show();
		$("#menu").show();
		$("#board").show();
  });
	
	
//登入失敗畫面	
	socket.on("loginErr", function(){
		$("#account").val('');	//清空輸入帳號
		$("#password").val('');	//清空輸入密碼
		alert("account or password is wrong");
	});
	
	
//上傳檔案 成功顯示或失敗
	$('#uploadForm').submit(function() {
		$("#status").empty().text("請上傳JPG檔案");
		var str = $("#imagename").val();
		if(str.indexOf(".JPG") > 0){
			$(this).ajaxSubmit({
	  	  error: function(xhr){
					console.log(xhr)
			  	status('Error: ' + xhr.status);
	  	  },    
	  	  success: function(response){//伺服器回應
	  	  	console.log('get data')
	  	  	console.log(response)
	  			var td = $('<td></td>');
					var btn = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-trash"></span></button>');				
					var img = $('<img width="100px" height ="70px">'); //Equivalent: $(document.createElement('img'))
					img.attr({'src': '/' + response});
					img.appendTo(td);
					btn.appendTo(td);
					td.appendTo($("#piccontent"));
				 	$("#status").empty().text('檔案已上傳');
					socket.emit('dataRequest');
	  	  }
			});
		} else if (str.indexOf(".jpg") > 0){
			$(this).ajaxSubmit({
	  	  error: function(xhr){
					console.log(xhr)
			  	status('Error: ' + xhr.status);
	  	  },    
	  	  success: function(response){//伺服器回應
	  	  	console.log('get data')
	  	  	console.log(response)
	  			var td = $('<td></td>');
					var btn = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-trash"></span></button>');				
					var img = $('<img width="100px" height ="70px">'); //Equivalent: $(document.createElement('img'))
					img.attr({'src': '/' + response});
					img.appendTo(td);
					btn.appendTo(td);
					td.appendTo($("#piccontent"));
				 	$("#status").empty().text('檔案已上傳');
					socket.emit('dataRequest');
	  	  }
			});
		}
		return false;
	});
	
//取出檔案夾內所有資料	
	socket.on("pictures", function(files, dir){
		console.log(files);
		$("#put_p").empty();
		for(var i = 0; i < files.length; i++){
			console.log(files[i])
			var li = $('<li></li>');
			var img = $('<img width="600px" height ="400px" id="'+ i +'">'); //Equivalent: $(document.createElement('img'))
			var all = $('<a href="#"></a>');
			all.appendTo(li)
			img.attr({'src':'/uploads/'+ dir + '/' + files[i]});
			img.appendTo(li);
			li.appendTo($("#put_p"));				
		}
		
		$(function(){
		    // 預設圖片淡出淡入的動畫時間
		    var _fadeSpeed = 50;
			
		    // 把每一個 .slideshow 取出來做處理
		    $('.slideshow').each(function(){
			    // 先取得相關的 ul , li, 並產生控制器
			    var $this = $(this), 
					$ul = $this.find('ul'), 
					$li = $ul.find('li'), 
					$controller = $('<div class="slideshowController"><a href="#"></a><a href="#" class="play"></a><a href="#" class="next"></a></div>').css('opacity', 0), 
					_len = $li.length, 
					_index = 0, timer, _speed = 1000;
			
			    // 先把第一張圖片之外的都透明度設成 0
			    $li.eq(_index).css('z-index', 2).siblings().css('opacity', 0);
			
			    // 加入控制器並當滑鼠移入時顯示; 滑鼠移出時隱藏
			    $this.append($controller).hover(function(){
				    $controller.stop().animate({
					    opacity: 1
				    });
			    }, function(){
				    $controller.stop().animate({
					    opacity: 0
				    });
			    });
			
			   // 當點擊到控制器上面的按鈕時
			    $controller.delegate('a', 'click', function(){
				 // 先取得按鈕的 class
				    var $a = $(this), 
					_className = $a.attr('class');
				
				    // 如果按的是 play 或是 pause 鈕
				    if(('play pause').indexOf(_className) > -1){
					    // 切換目前按鈕圖案
					    // 並依狀態來啟動或停止計時器
					    $a.toggleClass('pause').hasClass('pause') ? timer = setTimeout(autoClickNext, _fadeSpeed + _speed) : clearTimeout(timer);
					    return false;
				    }
				
				    // 停止計時器
				    clearTimeout(timer);
				    // 移除 pause 鈕
				   $a.siblings('.pause').removeClass('pause');
				    // 依按鈕功能來決定上下張圖片索引
				    _index = ('next' == _className ? _index + 1 : _index - 1 + _len) % _len;
				    // 切換圖片
				    show();
				    return false;
			    });
			
			    // 自動播放下一張
			    function autoClickNext() {
				    _index = (_index + 1) % _len;
				    show();
				    timer = setTimeout(autoClickNext, _fadeSpeed + _speed);
			    }
			
			    // 淡入淡出圖片
			    function show() {
				    $li.eq(_index).animate({
					    opacity: 1, 
					    zIndex: 2
				    }, _fadeSpeed).siblings(':visible').animate({
					    opacity: 0, 
					    zIndex: 1
				    }, _fadeSpeed);
			    }

			    // 如果有設定預設自動播放的話
			    if($this.hasClass('autoPlay')){
				    $controller.find('.play').click();
			    }
		    });
	    });
	});	
	
	
//新增照片資料夾
	$("#addfloder").click(function(){
		$("#activitytext").show(); //顯示輸入資料夾名稱
		$("#addactivity").show(); //確定新增資料夾紐
	})
	
	
//上傳伺服器新增資料夾
	$("#addactivity").click(function(){
		var filename = $("#activitytext").val();  //取得資料夾命名名稱
		socket.emit("newFolder", filename);
		$("#activitytext").hide();
		$("#addactivity").hide();
		$("#activitytext").html("");
	})

//收到伺服器回傳已新增資料夾
	socket.on("folderCreated", function(fname){
		$("<div class='btn btn-primary'></div>").attr({"id":fname}).text(fname).appendTo($("#folderlist"));
    $("#activitytext").val('');
	});
	
	
//點擊資料夾事件
	$("#folderlist").on('click', 'div', function(){
	$("#piccontent").empty();
	$("#put_p").empty();
		console.log("floder clicked");
		$("#addactivity").hide();
		var fname = $(this).attr('id'); 
		console.log(fname);
		socket.emit("openFolder", fname);
		//$("#folderlist").hide();//隱藏所有資料夾			
		$("#uploadForm").show();//可上傳檔案	
    $("#picture_show").show();//顯示照片播放器	
    $("#addfloder").hide();	
    $("#activitytext").hide();			
	});

//顯示點擊資料夾底下的圖檔
	socket.on("picInFolder", function(files, dir){
	  console.log("picInFolder");
	  console.log(files);
		
		for(var i = 0; i < files.length; i++){
			var li = $('<li></li>');
			var img = $('<img width="600px" height ="400px" id="'+ i +'">'); //Equivalent: $(document.createElement('img'))
			var all = $('<a></a>');
			all.appendTo(li)
			img.attr({'src':'/uploads/'+ dir + '/' + files[i]});
			img.appendTo(li);
			li.appendTo($("#put_p"));
		}
		
		for(var i = 0; i < files.length; i++){	
			if(i%6==0){
			  var add_tr = $("<tr></tr>");
			  add_tr.appendTo($("#piccontent"));
			}	
			var td = $('<td></td>');
			var btn = $('<button type="button" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-trash"></span></button>');
			var img = $('<img width="100px" height ="70px" id="'+ i +'">'); //Equivalent: $(document.createElement('img'))
			img.attr({'src':'/uploads/'+ dir + '/' + files[i]});
			img.appendTo(td);
			btn.appendTo(td);
			td.appendTo($("#piccontent"));
		}

    $(function(){
		  // 預設圖片淡出淡入的動畫時間
		  var _fadeSpeed = 50;
		
		  // 把每一個 .slideshow 取出來做處理
		  $('.slideshow').each(function(){
		    // 先取得相關的 ul , li, 並產生控制器
		    var $this = $(this), 
				$ul = $this.find('ul'), 
				$li = $ul.find('li'), 
				$controller = $('<div class="slideshowController"><a href="#"></a><a href="#" class="play"></a><a href="#" class="next"></a></div>').css('opacity', 0), 
				_len = $li.length, 
				_index = 0, timer, _speed = 1000;
		
		    // 先把第一張圖片之外的都透明度設成 0
		    $li.eq(_index).css('z-index', 2).siblings().css('opacity', 0);
		
		    // 加入控制器並當滑鼠移入時顯示; 滑鼠移出時隱藏
		    $this.append($controller).hover(function(){
			    $controller.stop().animate({
				    opacity: 1
			    });
		    }, function(){
			    $controller.stop().animate({
				  	opacity: 0
			    });
		    });
		
		    // 當點擊到控制器上面的按鈕時
		    $controller.delegate('a', 'click', function(){
				// 先取得按鈕的 class
			    var $a = $(this), 
					_className = $a.attr('class');
			
			    // 如果按的是 play 或是 pause 鈕
			    if(('play pause').indexOf(_className) > -1){
				    // 切換目前按鈕圖案
				    // 並依狀態來啟動或停止計時器
				    $a.toggleClass('pause').hasClass('pause') ? timer = setTimeout(autoClickNext, _fadeSpeed + _speed) : clearTimeout(timer);
				    return false;
			    }
			
			    // 停止計時器
			    clearTimeout(timer);
			    // 移除 pause 鈕
			   	$a.siblings('.pause').removeClass('pause');
			    // 依按鈕功能來決定上下張圖片索引
			    _index = ('next' == _className ? _index + 1 : _index - 1 + _len) % _len;
			    // 切換圖片
			    show();
			    return false;
		    });
		
		    // 自動播放下一張
		    function autoClickNext() {
			    _index = (_index + 1) % _len;
			    show();
			    timer = setTimeout(autoClickNext, _fadeSpeed + _speed);
		    }
		
		    // 淡入淡出圖片
		    function show() {
			    $li.eq(_index).animate({
				    opacity: 1, 
				    zIndex: 2
			    }, _fadeSpeed).siblings(':visible').animate({
				    opacity: 0, 
				    zIndex: 1
			    }, _fadeSpeed);
		    }

		    // 如果有設定預設自動播放的話
		    if($this.hasClass('autoPlay')){
			    $controller.find('.play').click();
		    }
		  });
	  });			
	});
	
//刪除照片	
	$("#piccontent").on('click', 'button', function(){
		console.log('clicked!');
		var dd = $(this).parent(); //因為照片沒有固定的id所以找到parent
		console.log(dd.find('img'));
		var link = dd.find('img').attr("src");
		console.log(dd.find('img').attr("src"))		
		socket.emit('deletePic', link);
		dd.remove();
	})

//伺服器回傳取到的資料夾名稱
	socket.on("showFolders", function(folders){
		console.log(folders)
		console.log("資料夾名稱")
		$("#folderlist").empty(); //先清空資料夾清單
		for(var i = 0; i < folders.length; i++){
			$("<div class='btn btn-primary'></div>").attr({"id":folders[i]}).text(folders[i]).appendTo($("#folderlist"));
		}
		$("#folderlist").show();
		$("#addfloder").show();		
	});
	
//"是" HR show 新增/刪除/刪除內部編號格
	socket.on("isHR" ,function(){
		$("#add_board").show();
		$("#del_board").show();
		$("#del_number").show();
	});	
	
//"不是"主管隱藏審核鈕
	socket.on("notM" ,function(){
		$("#verify").hide();
	});	
	
//show 公告欄內容
	socket.on("info", function(all_board){
		var new_tr;
		for (var i = 0; i < all_board.length; i++) {
			console.log("test123");
			new_tr = $("<tr></tr>");
			$("<td align=center>" + (i+1) +  "</td>").appendTo(new_tr);
      $("<td align=center>" + all_board[i]['board_date'] + "</td>").appendTo(new_tr);
      $("<td align=center>" + all_board[i]['board_subject'] + "</td>").appendTo(new_tr);
      $("<td>" + all_board[i]['board_substance'] + "</td>").appendTo(new_tr);
			$("<td align=center>" + all_board[i]['board_publisher'] + "</td>").appendTo(new_tr);
		  $("<td align=center>" + all_board[i]['board_id'] + "</td>").appendTo(new_tr);
      new_tr.appendTo($("#tbBulletin"));
		}
	});
	
//新增公告
 	$("#add_board").click(function(){
 	   editor.setData('');
 	   var Today=new Date();
 	   $("#board_date").val(Today.getFullYear()+ "年" + (Today.getMonth()+1) + "月" + Today.getDate() + "日");
 	   $("#board_edit").show();
 	   $("#board").hide();
 	 });

//取消新增公告
	$("#board_cancel").click(function(){
		$("#board_edit").hide(); //開啟新增公告
		$("#board").show(); //公佈欄打開
	});

 //提交新增公告
  $("#board_submit").click(function(){
    var b_date=$("#board_date").val();
    var b_subject=$("#subject").val();
    var b_substance = editor.getData();
    var b_publisher=$("#publisher").val();
    if (b_subject == ''){
      alert("主旨不能為空白");
      return false;
    } else if (b_substance == ''){
      alert("內容不能為空白");
      return false;
    } else {
    	socket.emit("board_submit", b_date, b_subject, b_substance, b_publisher);
    	$("#board_edit").hide();
    	$("#board").show();    
    	socket.on("done of insert",$("#del_number").val(''),$("#board_date").val(''),$("#subject").val(''));
 	 	}
  });

//del board
	$("#del_board").click(function(){
    var b_id = $("#del_number").val(),
    		idxbull,
    		bullar = [];
		$('#tbBulletin tr').each(function(idx) {
			idxbull = $(this).children('td:eq(5)').html();
			if (idx > 0) {
				if (idxbull) {
					bullar.push(idxbull);
				}
			}
		});		
		for (var i = 0,barle = bullar.length; i < barle; i++) {
			if (bullar[i] == b_id) {
    		socket.emit("del_board", b_id);
    		socket.on("done of del_board", $("#del_number").val('')); //清空使用者輸入的值
    		return false;
			}
		}
		if (i == barle){
			alert('請輸入正確內部流水號');
		}
  });	

//刷新增加or刪除公告欄
  socket.on("update_board", function(update_board){
  	var keepLine = $("#tbBulletin").find("tr").eq(0);
		$("#tbBulletin").html(keepLine);
		var new_tr;
		for (var i = 0; i < update_board.length; i++) {
			console.log("test123");
			new_tr = $("<tr></tr>");
			$("<td align=center>" + (i+1) + "</td>").appendTo(new_tr);
      $("<td align=center>" + update_board[i]['board_date'] + "</td>").appendTo(new_tr);
      $("<td align=center>" + update_board[i]['board_subject'] + "</td>").appendTo(new_tr);
      $("<td>" + update_board[i]['board_substance'] + "</td>").appendTo(new_tr);
			$("<td align=center>" + update_board[i]['board_publisher'] + "</td>").appendTo(new_tr);
			$("<td align=center>" + update_board[i]['board_id'] + "</td>").appendTo(new_tr);
      new_tr.appendTo($("#tbBulletin"));
		}
	});

//點擊更換密碼頁籤show_emp_base_information
	socket.on("show_emp_base", function(base_info){		
	  $("#piccontent").empty();//照片清空
		$('#emp_id').html(base_info[0]['emp_id']);
		$('#emp_name').html(base_info[0]['emp_name']);
		$('#emp_phone').html(base_info[0]['emp_phone']);
		$('#emp_mail').html(base_info[0]['emp_mail']);
		testid= base_info[0]['emp_id'];
		var div = $('<div></div>');
		var img = $('<img width="250px" height ="250px" class="img-circle" alt="Cinque Terre">'); //Equivalent: $(document.createElement('img'))
		img.attr({'src':'/userPicture/'+ base_info[0]['emp_id'] +'.jpg','id': base_info[0]['emp_id']});
		img.appendTo(div);
		div.appendTo($("#emp_photo"));	
	});
	
//更改密碼
	$("#chpwd_submit").click(function(){
    var old_pwd=$("#oldpwd").val();
    var new_pwd=$("#newpwd").val();
		var new_pwd_cfm=$("#newpwd_confirm").val();
		if((old_pwd.indexOf(" ") == -1 && new_pwd_cfm.indexOf(" ") == -1) &&  new_pwd == new_pwd_cfm){
			console.log("new_pwd")
      console.log(new_pwd)
			socket.emit("chpwd_submit",old_pwd, new_pwd,new_pwd_cfm);
		}else {
		  console.log("fail")
		  alert("輸入錯誤or密碼不可以空白");
		}		                       
  });	
	
//更改密碼成功	
  socket.on('done of changepwd', function(){
		alert("更改密碼成功");
	  $("#oldpwd").val('');
		$("#newpwd").val('');
		$("#newpwd_confirm").val(''); 
	});

//更改密碼失敗	
	socket.on('old_pwd wrong', function(){
	  alert("舊密碼輸入錯誤");
		$("#oldpwd").val('');
		$("#newpwd").val('');
		$("#newpwd_confirm").val('');	 	 
	});	

//取消更改密碼
	$("#cancel_chpwd").click(function(){
		alert("取消更改密碼");
		$("#oldpwd").val('');
		$("#newpwd").val('');
		$("#newpwd_confirm").val('');		                       
  });	
	
	//使用本地端照片刷新
	var fileData;
	$("#idPhoto").change(function(){
    fileData = this;
	});
    
	//上傳empPhoto檔案 成功顯示或失敗(index.js)
	$('#up_emphoto').submit(function() {
		$("#status_1").empty().text("請上傳.jpg檔案");
		var str = $("#idPhoto").val();
		if(str.indexOf(".jpg") > 0){
		$(this).ajaxSubmit({
			error: function(xhr){
				console.log(xhr)
				status('Error: ' + xhr.status);
			},    
			success: function(response){//伺服器回應
				console.log('get data')
				//上傳成功	
				readURL(fileData);
				$("#status_1").empty().text('檔案已上傳');	
				}
			});
		}
		return false;
		});
		
	function readURL(input) {	
	 	if (input.files && input.files[0]) {
	 	  var reader = new FileReader();
	 		$("#emp_photo").empty();
	 	  reader.onload = function (e) {
	 	  	var div = $('<div></div>');
	 	  	var img = $('<img width="250px" height ="250px" class="img-circle" alt="Cinque Terre">');
				img.attr({'src': e.target.result});
				img.appendTo(div);
				div.appendTo($("#emp_photo"));
	 	  }	 	
	 	  reader.readAsDataURL(input.files[0]);
	 	}
	}
	
//顯示歷史請假紀錄
	socket.on("leave", function(selectleave,user,loginid,annual_hours,wIncharge){ //請假記錄
		console.log("leave table" + annual_hours);
	  var leaveid = $("<p>&nbsp;</p><p>員工編號：" + loginid + "<br>帳號：" + user + "<br>年假剩餘時數/小時：" + annual_hours + "<br>所屬主管：" + wIncharge + "</p>");
	  lh = annual_hours;
	  testid = loginid;
    var keeptitle = $("#leavetitle");
		$("#employee_leave_search1").html(keeptitle);
		
		for (var i = 0; i < selectleave.length; i++){
		  new_tr = $("<tr></tr>");
      $("<td align='center' style='padding:5px;'>" + selectleave[i]["leave_nature"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectleave[i]["start_date"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectleave[i]["end_date"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectleave[i]["start_time"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectleave[i]["end_time"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectleave[i]["leave_hours"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectleave[i]["reason"] + "</td>").appendTo(new_tr);
			if (selectleave[i]["check_event"]=='0') {
				$("<td align='center'>待主管審核</td>").appendTo(new_tr);
			} else {
				eve = evefun(selectleave[i]["event"]);
				$("<td align='center'>" + eve + "</td>").appendTo(new_tr);
			}
			new_tr.appendTo($("#employee_leave_search1"));
    }
    $('#showid').html(leaveid);
	});
	
	function evefun(eveResult) {	//資料庫資料為
		return (eveResult == 0)? "不核准" : "核准";
	}
	
	socket.on("verify", function(selectverify){ //審核記錄
    var keeptitle = $("#verifytr1");
		$("#verifytable").html(keeptitle);
		for (var i = 0; i < selectverify.length; i++){
		  new_tr = $("<tr></tr>");
      $("<td align='center' style='padding:5px;'>" + selectverify[i]["leave_id"] + "</td>").appendTo(new_tr);
      $("<td align='center' style='padding:5px;'>" + selectverify[i]["employee_account"] + "</td>").appendTo(new_tr);
      $("<td align='center' style='padding:5px;'>" + selectverify[i]["leave_nature"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectverify[i]["start_date"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectverify[i]["end_date"] + "</td>").appendTo(new_tr);
      $("<td align='center'>" + selectverify[i]["start_time"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectverify[i]["end_time"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectverify[i]["leave_hours"] + "</td>").appendTo(new_tr);
			$("<td align='center'>" + selectverify[i]["reason"] + "</td>").appendTo(new_tr);
			$("<td><div><input value='1' type='radio' name='radio"+selectverify[i]["leave_id"]+"' id ='"+selectverify[i]["leave_id"]+"_n' />核准</div><div><input value='0' type='radio' name='radio"+selectverify[i]["leave_id"]+"' id ='"+selectverify[i]["leave_id"]+"_y' />不核准</div></td>").appendTo(new_tr);
			new_tr.appendTo($("#verifytable"));
			verifyarray.push(selectverify[i]["total_hours"]);
    }
	});
	
	$('#verifybutton').click(function(){	//審核送出
		var verifyar = [],
				verity,
				verityid,
				idxend,
				emailname,
				leaid = [],
				verifyemail=[];
		
		$('#verifytable tr').each(function(idx) {
			idxend = idx;
			verity = $(this).find('input:checked').val();
			if (idx > 0){
				if(verity) {
				verifyar.push(verity);
				}
			}
		});
		
		$('#verifytable tr').each(function(idx) {
			verityid = $(this).find('td:eq(0)').html();
			if (verityid && idx) {
				leaid.push(verityid);
			}
		});
		
		if (verifyar.length < idxend) {
			alert('請選擇核准/不核准');
			return false;
		}	else {
			socket.emit('update',verifyar,leaid);
		}
		
		$('#verifytable tr').each(function(idx) {
			idxend = idx;
			emailname = $(this).find('td:eq(1)').html();
			if (emailname && idx) {
				verifyemail.push(emailname);
			}
		});
		
		if (verifyemail.length == idxend) {
			socket.emit('leaveemail',verifyemail);
		}
		totalhour();
	});
	
	function totalhour() {
		var tharray = [],
				verity,
				td1,
				td2;
		$('#verifytable tr').each(function(idx,ele) {
			if (idx > 0 ) {
				td1 = $(this).find('td:eq(2)').html();
				verity = $(this).find('input:checked').val();
				
				if (td1 == '年假' && verity == '1') {
					console.log('verity',verity);
					td2 = {'employee_account':$(this).find('td:eq(1)').html(),
								 'annual_hours':$(this).find('td:eq(7)').html()};
					tharray.push(td2);
				}
			}
		});
		if (tharray != '') {
			console.log('gogogo',tharray);
			socket.emit('counthours',tharray);
		}
	}
	
	$("#annual").click(function() {
    l_nature = $("#selecttype").val();
   	l_start_date = $("#datetimepicker1").val();
    l_end_date = $("#datetimepicker2").val();
   	l_start_hour1 = $("#starthour").val();
   	l_start_min1 = $("#startmin").val();
   	l_end_hour2 = $("#endhour").val();
   	l_end_min2 = $("#endmin").val();
   	l_start_time = l_start_hour1+l_start_min1;
   	l_end_time = l_end_hour2+l_end_min2;
   	l_reason = $("#leavetext").val();
		day1 = new Date(l_start_date);
		day2 = new Date(l_end_date);
		w1 = day1.getDay();
		w2 = day2.getDay();
				
		if(w1 == 0 || w1 == 6 || w2 == 0 || w2 == 6 ){//假日
			alert("不能選擇假日");
			return false;
		} else if (l_start_date == "") {
			alert("請選擇開始日期");
			return false;
		} else if (l_end_date == "") {
			alert("請選擇結束日期");
			return false;
		}	else if(day1 > day2){
			alert("開始日期大於結束日期");
			return false;
		} else if((l_start_date == l_end_date) && (l_start_time == l_end_time)){
			alert("日期時間選擇相同");
			return false;
		} else if((l_start_date == l_end_date) && (l_start_time > l_end_time)){
			alert("開始時間大於結束時間");
			return false;
		} else if((l_start_hour1 == 13 && l_start_min1 > 15) || (l_start_hour1 == 14 && l_start_min1 < 30) || (l_end_hour2 == 13 && l_end_min2 > 15) || (l_end_hour2 == 14 && l_end_min2 < 30)){//13:15 - 14:30
			alert("時間選擇有誤-是休息時間");
			return false;
		} else if((l_start_hour1 == 18 && l_start_min1 >= 00) || (l_end_hour2 == 18 && l_end_min2 > 00)){
			alert("時間選擇有誤-是下班時間");
			return false;
		} else if (l_reason == "") {
			alert("尚未填寫假由");
			return false;
		} else {
			leavehour = counting(l_start_date, l_end_date, l_start_hour1, l_end_hour2, l_start_min1, l_end_min2);
   		if ( l_nature == "年假" ) {
   			lh1 = lh - leavehour;
   			if (lh1 < 0) {
   				alert("年假不夠用囉!! 年假剩餘:" + lh + " , 扣除後：" + lh1);
   				$('#leave_submit').hide()
   				return false;
   			}
   		}else {
	  		lh1 = lh;
	  	}
	  	console.log("lh1:  "+lh1);
	   	$('#leftime').html('<p>請假時數：'+leavehour+'</p><p>請假後剩餘年假時數：'+lh1+'</p>');
	   	var cleave = $('#leftime').find('p'),
	   			countp = cleave.length;
	   	console.log("countp : "+countp);
	   	if (countp > 0) {
	   		$('#leave_submit').show()
	   	}
   	}
  });
	
	function counting(date1, date2, hours1, hours2, mins1, mins2){//請假
		var day1 = new Date(date1),
		    day2 = new Date(date2),
		    w1 = day1.getDay(),
		    w2 = day2.getDay(),
		    h = 0,//請假當天的時數
		    m = 0,//分鐘
		    oneDay = 24*60*60*1000, // hours*minutes*seconds*milliseconds
		    diffDays = Math.round(Math.abs((day1.getTime() - day2.getTime())/(oneDay))),
				totaldayoff = diffDays - 1;

//中間經過幾個工作天
    while (day1 < day2) {
      var day = day1.getDay();
      if((day == 6) || (day == 0)){ 
      	totaldayoff --;
      } //weekend found
      day1.setDate(day1.getDate() + 1);
    }
 
	//小時
		if(totaldayoff >= 0){	//有超過幾個整天	
			var h1 = calculate(parseInt(hours1), parseInt(mins1), 18, 0);//晚上六點
			var h2 = calculate(9, 0, parseInt(hours2), parseInt(mins2));//早上九點
			console.log('h1',h1)
			console.log('h2',h2)
			h = h1.hours + h2.hours;
			m = h1.mins + h2.mins;
			console.log('a總共請假幾小時'+ h)
			console.log('a總共請假幾分鐘'+ m)
			if(m > 60){
				m = m - 60;
				h++;
			}
			console.log('b總共請假幾小時'+ h)
			console.log('b總共請假幾分鐘'+ m)
			var minByHour = m / 60;
			var total = (totaldayoff * 7.75) + h + minByHour;
			console.log('total + '+ total)
			return total;
		}else {
			hh = calculate(parseInt(hours1), parseInt(mins1), parseInt(hours2), parseInt(mins2));
			h = hh.hours;
			console.log("HH: " +h);
			m = hh.mins;
			if(m > 60){
				m = m - 60;
				h++;
			}
			console.log('c總共請假幾小時'+ h)
			console.log('c總共請假幾分鐘'+ m)
			var minByHour = m / 60;
			var total = h + minByHour;
			console.log('c total '+ total)
			return total;
		}
	}
	
	function lunchtime(hours1, mins1, hours2, mins2){//是否經過午餐時間
		console.log('hours1',hours1,'mins1', mins1,'hours2', hours2,'mins2', mins2)
		if((hours1 >= 14 && mins1 >= 30 && hours2 == 18 && mins2 == 0) || (hours1 <= 13 && mins1 <= 15 && hours2 == 9 && mins2 == 0)){
  		//沒有經過午休
  		console.log("no lunch time1!!")
  		return false;
  	} 
  		else if((hours1 == 14 && mins1 >= 30) || hours1 > 14){	
  	  //沒有經過午休
  		console.log("no lunch time2!!")
  		return false;
  	} else if((hours1 == 13 && mins1 <= 15) || (hours1 <= 13 && hours2 <= 13)){
  		console.log("no lunch time3!!")
  		return false;
  	}else {
  		console.log('回傳true');
  	return true;
  	}
	}
	
	function calculate(hours1, mins1, hours2, mins2) {//啟始日 結束日
		console.log("min1s",mins1)	
		console.log("mins2",mins2)	
    var lunch = lunchtime(hours1, mins1, hours2, mins2);
  	var hours = hours2 - hours1, mins = 0;
    if(hours < 0) hours = Math.abs(hours);
    if(mins2 >= mins1) {
        mins = mins2 - mins1;
        console.log('1總共請假幾分鐘'+ mins)
    }
    else {
        mins = (mins2 + 60) - mins1;
        console.log('2總共請假幾分鐘'+ mins)
        hours--;
    } 
    //需要扣掉中午休息時間 1小時15分
    if(lunch){
    	//扣掉休息時間
    	console.log('lunch : ' , lunch)
    	hours--;
    	console.log('lunch',hours)
    	console.log('lunch',mins)
    	if(mins > 15 || mins == 15){
    		mins = mins - 15; 
    		console.log(mins)
    	} else{
    		mins = (mins + 60) - 15;
        hours--;
        console.log(hours)
        console.log(mins)
    	}
    }
    console.log('hours',hours)
    console.log('mins',mins)
    var h = parseInt(hours);
    var m = parseInt(mins);
    var obj = {'hours': h , 'mins': m}
    return obj;
  }	

  $('#leave_submit').click(function(){	//請假送出表單
    var ans = confirm("確定要請假了嗎? 假別:" + l_nature + ", 開始日期:" + l_start_date + ", 開始時間:" + l_start_time + ", 結束日期:" + l_end_date + ", 結束時間: " + l_end_time + "  (提醒:若有修改請再次點選計算時數)");
    if (ans) {
  		socket.emit('leave_submit',testid , l_nature, l_start_date, l_end_date, l_start_time, l_end_time, l_reason, leavehour);
  		socket.emit('sendemail',user);
  		$("#leavereocrd").tab('show');
  		$('#leavepage').hide(); //請假
  		$('#employee_leave_search').show(); //請假記錄
  		$('#selecttype').val('病假');
  		$('#datetimepicker1').val('');
  		$('#datetimepicker2').val('');
  		$('#starthour').val('09');
  		$('#endhour').val('09');
  		$('#startmin').val('00');
  		$('#endmin').val('00');
  		$('#leavetext').val('');
  		$('#leftime').html('');
  	} else {
  		return;
  	}
  });

	$("#leavereocrd").click(function(){ //觸發請假頁面的請假按鈕
		$("#employee_leave_search").show(); //請假關閉
		$("#gallery").hide(); //活動花絮關閉
		$("#board").hide(); //公佈欄關閉
		$("#leavepage").hide(); //請假頁面打開
		$("#leave_submit").hide()
		$("#verifypage").hide();
	});

	$("#leavebuttom").click(function(){ //觸發請假頁面的請假按鈕
		socket.emit("checkleave",user);
	});
	
	socket.on('checkleavecl', function (checkleavecl){
		console.log('checkleavecl',checkleavecl);
		if (checkleavecl != '') {
			alert('請主管先將之前的假單審核');
			$("#leavereocrd").tab('show');
			$("#employee_leave_search").show();
			$("#verifypage").hide();
		}	else {
			$("#employee_leave_search").hide(); //請假關閉
			$("#gallery").hide(); //活動花絮關閉
			$("#board").hide(); //公佈欄關閉
			$("#leavepage").show(); //請假頁面打開
			$("#leave_submit").hide()
			$("#verifypage").hide();
		}
	});
	
	$("#verify").click(function(){ //觸發審核頁面的請假按鈕
		$("#verifypage").show();//審核頁面打開
		$("#employee_leave_search").hide(); //請假關閉
		$("#gallery").hide(); //活動花絮關閉
		$("#board").hide(); //公佈欄關閉
		$("#leavepage").hide(); //請假頁面打開
	});
	
	$('#datetimepicker1').datetimepicker({	//請假開始日期
		onGenerate:function( ct ){
			$(this).find('.xdsoft_date.xdsoft_weekend')
			.addClass('xdsoft_disabled');
		},
		beforeShowDay: 'noWeekends',
		format:'Y-m-d',
		formatDate:'Y-m-d',
		timepicker:false
	});   
	
	$('#datetimepicker2').datetimepicker({	//請假結束日期
		onGenerate:function( ct ){
			$(this).find('.xdsoft_date.xdsoft_weekend')
			.addClass('xdsoft_disabled');
		},
		beforeShowDay: 'noWeekends',
		format:'Y-m-d',
		formatDate:'Y-m-d',
		timepicker:false
	});
	
  $(".nav-tabs a").click(function(){
    $(this).tab('show');
  });
  	
	$("#imagename").fileinput({
    previewFileType: "image",
    browseClass: "btn btn-success",
    browseLabel: "Pick JPG Image",
    browseIcon: "<i class=\"glyphicon glyphicon-picture\"></i> ",
    removeClass: "btn btn-danger",
    removeLabel: "Delete",
    removeIcon: "<i class=\"glyphicon glyphicon-trash\"></i> ",
    uploadClass: "btn btn-info",
    uploadLabel: "Upload",
    uploadIcon: "<i class=\"glyphicon glyphicon-upload\"></i> "
  });
  	
})