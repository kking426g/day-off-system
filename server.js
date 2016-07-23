var express = require("express")
, app = express()
, server = require('http').createServer(app)
, io = require('socket.io').listen(server);

io.set('log level', 1);
var fs = require('fs');

//設定連線
server.listen(8003, function(){
  console.log('listening on *:8003');
});

//DB資料  
var oracledb = require('oracledb'),
orawrap = require('orawrap-master'),
Promise = require('es6-promise').Promise,
async = require('async'),
dbConfig = {
  user: 'js1',
  password: 'js1',
  connectString: '192.168.2.37:1521/ora11g'
};	
	
//儲存DB資料
orawrap.setConnectInfo(dbConfig);	
	
//傳送頁面
app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});	
	
//資料夾路徑
app.use('/static', express.static(__dirname + '/public'));
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use('/userPicture', express.static(__dirname + '/userPicture'));	
	
//upload file
var foldername = '';
var multer = require('multer');
var storage	=	multer.diskStorage({
    destination: function (req, file, callback){
        callback(null, './uploads/' + foldername);
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + '.jpg');
    }
});
	
var upload = multer({ storage : storage}).single('userPhoto');
app.get('/',function(req,res){
    res.sendFile(__dirname + "/index.html");
});	

//upload emphoto
var userPic	=	multer.diskStorage({
	destination: function (req, file, callback) {
		callback(null, './userPicture/');
	},
	filename: function (req, file, callback) {
		file.fieldname = testid;
		callback(null, file.fieldname + '.jpg');
	}
});
var upload_userpic = multer({ storage : userPic}).single('empPhoto');
	
app.get('/',function(req,res){
	res.sendFile(__dirname + "/index.html");
});
	
//引用 nodemailer
var nodemailer = require('nodemailer');

//宣告發信物件
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'gamma.teamcnt@gmail.com',
        pass: 'gammacnt'
    }
});
	
//宣告調用index.js全域變數	
var all_member = [],//in db member  
		all_board = [],//in db board 
		update_board = [], //update new board
		base_info = [],
		all_leave = [],	//in db 請假記錄
		all_verify = [], //in db 審核記錄
		selectleave = [],  //請假記錄存成object格式
		selectverify = [],	//審核記錄存成object格式
		checkleavese = [],
		checkleavecl = [],
		annual_hours,	//in db年假時數
		wIncharge,	//in db主管名稱
		sUser,	//登入account
		chargemail,	//in db主管email
		testid;	//登入id

//socket連線
io.sockets.on('connection', function(socket){
  console.log('connection on');

  socket.on("sendemail", function(emailuser){//發送信件方法
		var options = {
  		//寄件者
  		from: 'gamma.teamcnt@gmail.com',
  		//收件者
  		to: chargemail, //該主管emil
  		//主旨
  		subject: '請審核'+emailuser+'的請假單', // Subject line
  		//純文字
  		text: '請到請假系統審核該員工之請假資料'
		}

		transporter.sendMail(options, function(error, info){
  		if(error){
  		  console.log(error);
  		}else{
  		  console.log('訊息發送: ' + info.response);
  		}
		});
	});

  socket.on("leaveemail", function(verifyemail){//發送信件方法
  	var emaillist = [],
  			verifyemail1 = verifyemail;
  	for (var i = 0; i < verifyemail.length; i++) {
  		var emailsql = "SELECT EMPLOYEE_MAIL,employee_account from tb_employee where EMPLOYEE_ACCOUNT ='"+ verifyemail[i] +"'";
  	orawrap.execute(emailsql,[],
			function(err, result){
				if (err) { console.error(err.message); return; }
				var checkemail = {db_email:result.rows[0][0],
													db_account:result.rows[0][1]};
				emaillist.push(checkemail);
				if (emaillist.length == i) {
					toemail(emaillist,verifyemail1);
					emaillist = [];
					verifyemail1 = [];
				}
			})
		}
	});

	function toemail (emaillist,verifyemail1) {
		for (var i = 0; i < emaillist.length; i++) {
			for (var j = 0; j < verifyemail1.length; j++) {
				if (emaillist[i]['db_account'] == verifyemail1[j]) {
					var options = {
  					//寄件者
  					from: 'gamma.teamcnt@gmail.com',
  					//收件者
  					to: emaillist[i]['db_email'], //請假者email
  					//主旨
  					subject: '主管已審核'+verifyemail1[j]+'的請假單',
  					//純文字
  					text: '請到請假系統查看請假單是否核准'
					}
					transporter.sendMail(options, function(error, info){
  					if(error){
  					  console.log(error);
  					}else{
  					  console.log('訊息發送: ' + info.response);
  					}
					});
				}
			}
		}
	}

	//取得活動花絮server資料夾照片路徑
	app.post('/api/photo',function(req,res){
	  console.log(foldername);
	  upload(req,res,function(err) {
	    if(err) {
	      return res.end("Error uploading file.");
	    }			
	    console.log(req.file.path)
	    console.log(req.file)
	    res.end(req.file.path);
	    //fileInFolder(foldername);
	    console.log(foldername);
	    console.log('./uploads/' + foldername);
	  });
  });
	
	app.post('/api/picture',function(req,res){
		fs.rename('./userPicture/' + testid + '.jpg', './userPicture/' + testid + '-1.jpg', function(err) {
			if ( err ) console.log('ERROR: ' + err);
		});
		upload_userpic(req,res,function(err) {
			if(err) {
				return res.end("Error uploading file.");
			}   
			console.log(req.file.path)
			console.log(req.file)
			res.end(req.file.path);
		});
		var data = readFolder();
	});
	
	function readFolder(){
		fs.readdir('./userPicture/', function(err, files) {
			return files;
		});  
	}
	
	socket.on('cca_eee', function(){
		var data = readFolder();
		socket.emit("show_ep", data);
	});
	
  //取出資料夾中檔案
  function fileInFolder(dir){
    fs.readdir('./uploads/' + dir, function(err, files) {//取得資料夾下檔案
      console.log('fileInFolder_function');
      console.log(files);
      console.log(dir)
      socket.emit("pictures", files, dir);
    });
  };

  //取出所有資料夾名稱
  socket.on("getFolder", function(){	
    var dir = './uploads'; 
    fs.readdir(dir, function(err, folders) {//取得資料夾下檔案
      console.log('all folder name');
      console.log(folders);
      socket.emit("showFolders", folders);
    });
  });

  socket.on('login', function(user, pass) { //登入
		sUser = user;
		var s = "SELECT EMPLOYEE_ACCOUNT,EMPLOYEE_PASSWORD,TOTAL_HOURS,who_incharge,employee_id from tb_employee where EMPLOYEE_ACCOUNT ='"+ user +"' and EMPLOYEE_PASSWORD ='"+ pass +"'";
		orawrap.execute(s,[],  // bind value 
			function(err, result){
			  if (err) {
			  	console.log("err msg");
			  	console.error(err.message);
			  } else {
			  	if(result.rows.length != 0){
			  	 	socket.emit('change',user);
			  	 	annual_hours = result.rows[0][2];
			  	 	wIncharge = result.rows[0][3];
			  	 	testid = result.rows[0][4];
			  	} else {
			  	 	socket.emit("loginErr");
			  	}
			  }
			  	//請假記錄SQL function start
			  orawrap.execute("SELECT a.EMPLOYEE_ID,a.START_DATE,a.LEAVE_NATURE,a.START_TIME,a.END_TIME,a.LEAVE_HOURS,a.REASON,a.EVENT,a.END_DATE,b.employee_account,b.total_hours,b.who_incharge,a.check_event from tb_leave_record a inner join tb_employee b on a.employee_id = b.employee_id order by start_date desc", [],
    		  function(err, result) {
    		    if (err) {
    		      console.error(err.message);
    		      return;
    		    }
    		    for (var i = 0; i < result.rows.length; i++) {
    		      var obj = {
    		        employee_id: result.rows[i][0],
    		        start_date: result.rows[i][1],
    		        leave_nature: result.rows[i][2],
    		        start_time: result.rows[i][3],
    		        end_time: result.rows[i][4],
    		        leave_hours: result.rows[i][5],
    		        reason: result.rows[i][6],
    		        event: result.rows[i][7],
    		        end_date: result.rows[i][8],
    		        employee_account: result.rows[i][9],
    		        total_hours: result.rows[i][10],
    		        who_incharge: result.rows[i][11],
    		        check_event: result.rows[i][12]
    		      }
    		      all_leave.push(obj);
    		    }
    		  	for (var i = 0; i < all_leave.length; i++) {
    		    	if (all_leave[i]['employee_account'] == sUser) {
    		     	  selectleave.push(all_leave[i]);
    		    	}
    		  	}
    		  	console.log(sUser+" testid: "+testid+" ah:  "+annual_hours+ " wi: " +wIncharge);
    		  	socket.emit('leave', selectleave,sUser,testid,annual_hours,wIncharge);
   			  	selectleave = [];
   			  	all_leave = [];
    		  });  //請假記錄SQL function end

    		  		//主管eamil SQL function start
			  var chemail = "select employee_mail from tb_employee where employee_account = '"+ wIncharge +"'";
			  orawrap.execute(chemail,[],
			  	function(err,result) {
			  		if (err) {
			  	  	console.log("err msg"); 
			  	  	console.error(err.message);
			  		}
			  		console.log("主管信箱" + result.rows);
			  		chargemail = result.rows;
			  	});
		 	});

		//Insert 請假記錄後select最新請假記錄 start
		var newleaverecord = function () {
    	orawrap.execute("SELECT tb_leave_record.EMPLOYEE_ID,tb_leave_record.START_DATE ,tb_leave_record.LEAVE_NATURE, tb_leave_record.START_TIME, tb_leave_record.END_TIME, tb_leave_record.LEAVE_HOURS, tb_leave_record.REASON, tb_leave_record.EVENT, tb_leave_record.END_DATE,tb_employee.employee_account,tb_employee.total_hours,tb_leave_record.check_event from tb_leave_record inner join tb_employee on tb_leave_record.employee_id=tb_employee.employee_id order by start_date desc", [],
    		function(err, result) {
    		  if (err) {
    		    console.error(err.message);
    		    return;
    		  }
    		  for (var i = 0; i < result.rows.length; i++) {
    		    var obj = {
    		      employee_id: result.rows[i][0],
    		      start_date: result.rows[i][1],
    		      leave_nature: result.rows[i][2],
    		      start_time: result.rows[i][3],
    		      end_time: result.rows[i][4],
    		      leave_hours: result.rows[i][5],
    		      reason: result.rows[i][6],
    		      event: result.rows[i][7],
    		      end_date: result.rows[i][8],
    		      employee_account: result.rows[i][9],
    		      total_hours: result.rows[i][10],
    		      check_event: result.rows[i][11]
    		    }
    		    all_leave.push(obj);
    		  }
    		  
     	 		for (var i = 0; i < all_leave.length; i++) {
     	 		  if (all_leave[i]['employee_account'] == user) {
     	 		    selectleave.push(all_leave[i]);
     	 		  }
     	 		}
     	 		annual_hours = selectleave[0]['total_hours'];
			 		socket.emit('leave', selectleave,sUser,testid,annual_hours,wIncharge);
     			selectleave = [];
     			all_leave = [];
    		});
		}  //Insert 請假記錄後select最新請假記錄 end
		
			//審核記錄SQL function start
			orawrap.execute("SELECT a.EMPLOYEE_ID,a.START_DATE,a.LEAVE_NATURE,a.START_TIME,a.END_TIME,a.LEAVE_HOURS,a.REASON,a.EVENT,a.END_DATE,b.employee_account,b.total_hours,b.who_incharge,a.leave_id,a.check_event from tb_leave_record a inner join tb_employee b on a.employee_id = b.employee_id order by start_date desc", [],
  			function(err, result) {
  				if (err) {
  			  	console.error(err.message);
  			  	return;
  			  }
  			  for (var i = 0; i < result.rows.length; i++) {
  			  	var obj = {
  			        employee_id: result.rows[i][0],
  			        start_date: result.rows[i][1],
  			        leave_nature: result.rows[i][2],
  			        start_time: result.rows[i][3],
  			        end_time: result.rows[i][4],
  			        leave_hours: result.rows[i][5],
  			        reason: result.rows[i][6],
  			        event: result.rows[i][7],
  			        end_date: result.rows[i][8],
  			        employee_account: result.rows[i][9],
  			        total_hours: result.rows[i][10],
  			        who_incharge: result.rows[i][11],
  			        leave_id: result.rows[i][12],
  			        check_event: result.rows[i][13]
  			    }
  			    all_verify.push(obj);
  			  }
  			  for (var i = 0; i < all_verify.length; i++) {
  			 		if (all_verify[i]['who_incharge'] == sUser) {
  			 			if (all_verify[i]['check_event'] == '0') {
  			    		selectverify.push(all_verify[i]);
  			    	}
						}
  			  }
  			 	socket.emit('verify', selectverify);
					all_verify = [];
  			 	selectverify = [];
    		});//審核記錄SQL function end

    		 //假單Insert into function start
    		socket.on('leave_submit', function(loginid, l_nature, l_start_date, l_end_date, l_start_time, l_end_time, l_reason, totalhour){
   				var sql = "INSERT INTO tb_leave_record "+
   				   				"(employee_id,  						 "+
   									"leave_nature,  						 "+
   									"start_date,  							 "+
   									"end_date,  								 "+
   									"start_time,  							 "+
   									"end_time,  								 "+
   									"reason,  									 "+
   									"leave_hours)  							 "+
   									"values  										 "+
   									"( '"+ loginid + "',  			 "+
   									" '"+ l_nature + "',  			 "+
   									" '"+ l_start_date + "',  	 "+
   									" '"+ l_end_date + "',  		 "+
   									" '"+ l_start_time + "',  	 "+
   									" '"+ l_end_time + "',  		 "+
   									" '"+ l_reason + "',  			 "+
   									" '"+ totalhour + "' )  		 ";
					orawrap.execute(sql,[],
						function(err, result){
							if (err) { console.error(err.message); return; }
							console.log('done of insert');
							newleaverecord();
						});
				});  //假單Insert into function end
				
 		});	//login socket end
 		
	socket.on('checkleave', function(user){ //確認請假記錄是否都審核
		orawrap.execute("SELECT b.employee_account,a.check_event from tb_leave_record a inner join tb_employee b on a.employee_id = b.employee_id order by start_date desc", [],
      function(err, result) {
        if (err) {
          console.error(err.message);
          return;
        }
        for (var i = 0; i < result.rows.length; i++) {
          var obj = {
            employee_account: result.rows[i][0],
            check_event: result.rows[i][1]
          }
          checkleavese.push(obj);
        }
      	for (var i = 0; i < checkleavese.length; i++) {
        	if (checkleavese[i]['employee_account'] == user) {
        		if (checkleavese[i]['check_event'] == '0') {
         	  	checkleavecl.push(checkleavese[i]['check_event']);
         		}

        	}
      	}
        socket.emit('checkleavecl', checkleavecl);
   	  	checkleavese = [];
   	  	checkleavecl = [];
     });  //確認請假記錄是否都審核SQL function end
	});
	
  //update年假時數 start
  var newannual =  function(after_annual){
		console.log('after_annual',after_annual);
  	console.log('update new annual');
  	for (var i = 0, aa_len = after_annual.length; i < aa_len; i++) {
  		var sqlup = "update tb_employee 													"+
  		   				"set  						 															"+
  							"total_hours =																	"+
  							" '" + after_annual[i]['afterminus'] + "'				"+
  							"where																					"+
  							"employee_account =															"+
  							" '" + after_annual[i]['employee_account'] + "' ";
			orawrap.execute(sqlup,[],
				function(err, result){
					if (err) { console.error(err.message); return; }
					console.log('done of update');
			});
		}
	} //update年假時數 end
	
	socket.on('counthours', function(tharray){
		var tharray1 = tharray,
				total_hours_db = [];
		for (var i = 0; i < tharray.length; i++) {
		orawrap.execute("SELECT total_hours,employee_account from tb_employee where employee_account = '"+ tharray[i]['employee_account'] +"'",[],
     	function(err, result){
     	  if (err) { console.error(err.message); return; }  
     	  var total_hours = {db_total_hours:result.rows[0][0],
     	  									 db_account:result.rows[0][1]};
     	  total_hours_db.push(total_hours);
     	  if (total_hours_db.length == i) {
     	  	minus(tharray1,total_hours_db);
     		}
     	});
   	}
	});
	
	function minus(tharray1,total_hours_db) {
		var afterminus,
				after_annual = [];
		for (var i = 0; i < total_hours_db.length; i++) {
			for (var j = 0; j < tharray1.length; j++) {
				if (total_hours_db[i]['db_account'] == tharray1[j]['employee_account']) {
					afterminus = total_hours_db[i]['db_total_hours'] - tharray1[j]['annual_hours'];
					after_annual.push({afterminus:afterminus,
									 					 employee_account:tharray1[j]['employee_account']});
				}
			}
		}
		newannual(after_annual);
	}
	

	socket.on('dataRequest', function(){
		fileInFolder(foldername);
	});

  //show db board
  socket.on('showboard', function(user, pass){
    var all_board = [];//公布欄
    orawrap.execute("SELECT id ,bulletin_date, bulletin_title_name,bulletin_detail, bulletin_name from tb_billboard ORDER BY id desc",[],
     function(err, result){
       if (err) { console.error(err.message); return; }
       console.log(result.row)
	     for(var i = 0; i < result.rows.length; i++){
  	   	 var obj = { 
		   	   board_id:result.rows[i][0],
	         board_date:result.rows[i][1] ,
	         board_subject:result.rows[i][2] ,
	         board_substance:result.rows[i][3],
	         board_publisher:result.rows[i][4]
		   	 }
         all_board.push(obj);
       }
	   	 socket.emit("info", all_board);
     }
    );
  });

	  //建立資料夾
	  socket.on("newFolder", function(fname){
	    var dir = './uploads/' + fname;
	    foldername = fname;
	    console.log(dir)
	    if (!fs.existsSync(dir)){//建立資料夾
		    fs.mkdirSync(dir);
		    console.log(dir)
		    socket.emit("folderCreated", fname);
	    }
		else {
		    console.log("cannot set this folder!")
		    socket.emit("folderErr");
	    }
	  });
	
	//取得資料夾下檔案
	socket.on("openFolder", function(fname){
	      var dir = './uploads/' + fname; 
	      foldername = fname;
	      console.log(foldername)
	      fs.readdir(dir, function(err, files){
	        console.log('file_system');
	        console.log(files);	
	        socket.emit("picInFolder", files, fname);		
	      });
  });

	//刪除資料
      socket.on('deletePic', function(img){
	      fs.unlinkSync('.' + img);
	      console.log('successfully deleted' + img)
      });
	
	//check hr yes or not
    socket.on("checkHR", function(name){
      var s = "SELECT EMPLOYEE_ID from tb_employee where EMPLOYEE_ACCOUNT = '"+ name +"'";
      console.log(s);
	    orawrap.execute("SELECT EMPLOYEE_ID from tb_employee where EMPLOYEE_ACCOUNT = '"+ name +"'",[], 
        function(err, result){
          if (err) { 
	          console.error(err.message); 
	          return; 
		  		}
	      	testid = result.rows[0][0];
	      	if(result.rows[0] == 7){ 
		    	  socket.emit("isHR"); 
		  		}
        }
			);
    });

	//emp_base_information_data
    socket.on("emp_date", function(name){
      var base_info = [];//基本資料	
      orawrap.execute("SELECT EMPLOYEE_ID,EMPLOYEE_Name,EMPLOYEE_phone,EMPLOYEE_mail from tb_employee where EMPLOYEE_ACCOUNT = '"+ name +"'",[],
      	function(err, result){
      	  if (err) { console.error(err.message); return; }
      	  console.log(result.row)
    	    var obj = {  
		      	emp_id:result.rows[0][0] , 
		      	emp_name:result.rows[0][1] , 
		      	emp_phone:result.rows[0][2],
		      	emp_mail:result.rows[0][3]
					}
        	base_info.push(obj); 			
	  	    console.log(base_info);
        	console.log(result.rows);
		    	socket.emit("show_emp_base",base_info);
					base_info = [];
        }
      );
    });
	
	//chaneg password               
    socket.on('chpwd_submit', function(old_pwd, new_pwd,new_pwd_cfm){
	    console.log(old_pwd, new_pwd,new_pwd_cfm, testid);
	    var e = "SELECT EMPLOYEE_Password from tb_employee where EMPLOYEE_ID = '"+ testid +"'"; 
	    orawrap.execute("SELECT EMPLOYEE_Password from tb_employee where EMPLOYEE_ID = '"+ testid +"'",[],
	  		function(err, result){
		  	  if (result.rows[0] == old_pwd) {			   
				    orawrap.execute("UPDATE tb_employee SET EMPLOYEE_Password = '" + new_pwd +"' WHERE  EMPLOYEE_ID = '" + testid +"'",[],
				    function(err, result){
		  	      if (err) {console.error(err.message); return; }
		  	      	console.log('done of changepwd');
								socket.emit("done of changepwd");
	    		  });
		  	  }	else{socket.emit('old_pwd wrong');}
	  		}
	    );
	  });		
	
	//check Manager  
    socket.on("checkM", function(name){
      var s = "SELECT WHETHER_INCHARGE from tb_employee where EMPLOYEE_ACCOUNT = '"+ name +"'";
	    orawrap.execute("SELECT WHETHER_INCHARGE from tb_employee where EMPLOYEE_ACCOUNT = '"+ name +"'",[],
      	function(err, result){
        	if (err) { console.error(err.message); return; }
	  	 		if(result.rows[0] == 1){
						console.log("notM");
						socket.emit("notM");
		    	}
        }
      );
    });
	
	//取得資料庫更新的公告欄
	var getAllBoard = function(){
	  var update_board = [];
	  orawrap.execute("SELECT id ,bulletin_date, bulletin_title_name,bulletin_detail, bulletin_name from tb_billboard ORDER BY id desc",[],
	    function(err, result){
	      if (err) { console.error(err.message); return; }
	      for(var i = 0; i < result.rows.length; i++){
	        var obj = { 
	        	board_id:result.rows[i][0], 
		      	board_date:result.rows[i][1] , 
		      	board_subject:result.rows[i][2] , 
		      	board_substance:result.rows[i][3], 
		      	board_publisher:result.rows[i][4]
		      }
	        update_board.push(obj);
	      }
	      socket.emit("update_board",update_board);
	    }
	  );
  };

	//add board
  socket.on('board_submit', function(b_date, b_subject, b_substance, b_publisher){
    console.log('b_date:'  +  b_date  +  "b_subject:"  +  b_subject  + "b_substance:" + b_substance + 'b_publisher:' + b_publisher);
	  orawrap.execute("INSERT INTO tb_billboard values('','" + b_date + "', '" + b_subject + "', '" + b_substance + "', '" + b_publisher + "')",[], 
	    function(err, result){
	      if (err) { console.error(err.message); return; }
	      console.log(result);
	      console.log('done of insert');
	      getAllBoard();
	    }
		);
  }); 
	
	//del board
  socket.on('del_board', function(b_id){
    console.log('b_id:'  +  b_id );
    orawrap.execute("delete tb_billboard where id=" + b_id +"",[], 
      function(err, result){
	   	  if (err) { console.error(err.message); return; }
	        console.log(result);
	        console.log('done of delete');
	        getAllBoard();
	  	}
    );
	  console.log('done of del_board');
	  socket.emit("done of del_board");	
  });
  
	//審核記錄SQL function start
	var updateve = function () { orawrap.execute("SELECT a.EMPLOYEE_ID,a.START_DATE,a.LEAVE_NATURE,a.START_TIME,a.END_TIME,a.LEAVE_HOURS,a.REASON,a.EVENT,a.END_DATE,b.employee_account,b.total_hours,b.who_incharge,a.leave_id,a.check_event from tb_leave_record a inner join tb_employee b on a.employee_id = b.employee_id order by start_date desc", [],
  		function(err, result) {
  			if (err) {
  		  	console.error(err.message);
  		  	return;
  		  }
  		  for (var i = 0; i < result.rows.length; i++) {
  		  	var obj = {
  		        employee_id: result.rows[i][0],
  		        start_date: result.rows[i][1],
  		        leave_nature: result.rows[i][2],
  		        start_time: result.rows[i][3],
  		        end_time: result.rows[i][4],
  		        leave_hours: result.rows[i][5],
  		        reason: result.rows[i][6],
  		        event: result.rows[i][7],
  		        end_date: result.rows[i][8],
  		        employee_account: result.rows[i][9],
  		        total_hours: result.rows[i][10],
  		        who_incharge: result.rows[i][11],
  		        leave_id: result.rows[i][12],
  		        check_event: result.rows[i][13]
  		    }
  		    all_verify.push(obj);
  		  }
  		  for (var i = 0; i < all_verify.length; i++) {
  		 		if (all_verify[i]['who_incharge'] == sUser) {
  		 			if (all_verify[i]['check_event'] == '0') {
  		    		selectverify.push(all_verify[i]);
  		    	}
					}
  		  }
  		 	socket.emit('verify', selectverify);
				all_verify = [];
  		 	selectverify = [];
  		});//審核記錄SQL function end
  	}
  	
	socket.on('update', function(verifyar,leaid){
		console.log("leaid",leaid,"verifyar",verifyar);
		for (var i = 0, vear = verifyar.length; i < vear; i++) {
			console.log("i",i);
   		var upve = "update tb_leave_record "+
   		   				"set  						 		   "+
   							"event =						   	 "+
   							" '" + verifyar[i] + "'	 "+
   							" ,											 "+
   							"check_event =					 "+
   							" '1'										 "+
   							"where								 	 "+
   							"leave_id =							 "+
   							" '" + leaid[i] + "'  	 ";
			orawrap.execute(upve,[],
				function(err, result){
					if (err) { console.error(err.message); return;}
					console.log('ve of update');
					updateve();
			});
		}
	});
	//socket斷線 
	socket.on('disconnect', function(){
	  console.log("disconnect");
	});
});	