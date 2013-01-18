/*
 *  12306 Booking Helper Extension for Google Chrome and Chrome-base browsers such as 360chrome.
 *  Copyright (C) 2012 Landman
 * 
 *  Includes 12306 Auto Query => A javascript snippet to help you book tickets online.
 *  12306 Booking Assistant
 *  Copyright (C) 2011 Hidden
 * 
 *  Includes 12306 Auto Query => A javascript snippet to help you book tickets online.
 *  Copyright (C) 2011 Jingqin Lynn
 * 
 *  Includes 12306 Auto Login => A javascript snippet to help you auto login 12306.com.
 *  Copyright (C) 2011 Kevintop
 * 
 *  Includes jQuery
 *  Copyright 2011, John Resig
 *  Dual licensed under the MIT or GPL Version 2 licenses.
 *  http://jquery.org/license
 * 
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 * 
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 * 
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 */

// ==UserScript==  
// @name         12306 Booking Assistant
// @version		 1.4.0
// @author       zzdhidden@gmail.com
// @namespace    https://github.com/zzdhidden
// @description  12306 订票助手之(自动登录，自动查票，自动订单)
// @include      *://dynamic.12306.cn/otsweb/*
// @require	https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
// ==/UserScript== 

// listen to page
window.addEventListener("message", function(event) {
  if (event.source != window || !event.data.type)
    return;

  if (event.data.type == "FROM_PAGE") {
    //console.log("Content script received: " + event.data.text);
    chrome.extension.sendRequest({switchcdn:"now"}, function(response) {
      if(response.ret == "no") {
        //console.log("Switch failed.");
      }
      else {
        //console.log("Switch ok.");
      }
    });
  } else if (event.data.type == "FOR_NOTIFY") {
    if (event.data.text)
      chrome.extension.sendRequest({notify:event.data.text});
  }
}, false);

// added to check whether the origial extension is already running
function withjQuery1(callback, safe) {
  chrome.extension.sendRequest({active:"ikoognpeoaaobcflpincacplaeflccao"}, function(response)
  {
    if(response.ret == "no") withjQuery(callback, safe);
    //else alert("already installed");
  });
}

function withjQuery(callback, safe){
	if(typeof(jQuery) == "undefined") {
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.src = chrome.extension.getURL("172.js");//"https://ext.chrome.360.cn/html/172.js";//"https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";//"http://s1.qhimg.com/lib/jquery/172.js"

		if(safe) {
			var cb = document.createElement("script");
			cb.type = "text/javascript";
			cb.textContent = "jQuery.noConflict();(" + callback.toString() + ")(jQuery, window);";
			script.addEventListener('load', function() {
				document.head.appendChild(cb);
			});
		}
		else {
			var dollar = undefined;
			if(typeof($) != "undefined") dollar = $;
			script.addEventListener('load', function() {
				jQuery.noConflict();
				$ = dollar;
				callback(jQuery, window);
			});
		}
		document.head.appendChild(script);
	} else {
		setTimeout(function() {
			//Firefox supports
			callback(jQuery, typeof unsafeWindow === "undefined" ? window : unsafeWindow);
		}, 30);
	}
}

withjQuery1(function($, window){

  (function () {
    var __button = null;
    var pay_timer = setInterval(function () {

      if (!__button) {
        var buttons = $("button");
        for (var i = 0; i < buttons.length; i++) {
          var button = buttons[i];
          var value = button.value || button.innerHTML;
          if (value == "取消订单") {
            __button = button;
            break;
          }
        }
      } else {
        if ($(__button).is(":visible")) {
          buttons = $("button");
          for (var i = 0; i < buttons.length; i++) {
            button = buttons[i];
            var value = button.value || button.innerHTML;
            if (value == "继续支付") {
              notify("恭喜您！订单排队成功，快去支付吧！");
              clearInterval(pay_timer);
              pay_timer = null;
              break;
            }
          }
        } else {
          notify("订单排队失败了，请重新订票或尝试手工提交！");
          clearInterval(pay_timer);
          pay_timer = null;
        }
      }
    }, 1000);
  })();

  function delayInvoke(target, callback, timeout) {
		target = target || "#countEle";
		var e = typeof (target) == "string" ? $(target) : target;
		if (timeout <= 0) {
			e.html("正在执行");
			callback();
		} else {
			var str = (Math.floor(timeout / 100) / 10) + '';
			if (str.indexOf(".") == -1) str += ".0";
			e.html(str + " 秒后再来...");
			setTimeout(function () {
				delayInvoke(target, callback, timeout - 500);
			}, 500);
		}
	}
  
	function notify(str) {
    window.postMessage({ type: "FOR_NOTIFY", text: str }, "*");
    return;
	}

	function route(match, fn) {
		if( window.location.href.indexOf(match) != -1 ) {
			fn();
		};
	}


	function query() {

		//query
    var maxIncreaseDay  = 0 ;
    var start_autoIncreaseDay = null ;
    var index_autoIncreaseDay = 1 ;
    var pools_autoIncreaseDay = []  ;
    function  __reset_autoIncreaseDays(){
        maxIncreaseDay   = parseInt( document.getElementById('autoIncreaseDays').value ) || 1 ;
        if( maxIncreaseDay > 10 ) {
            maxIncreaseDay  = 10 ;
        }
        document.getElementById('autoIncreaseDays').value   = maxIncreaseDay ;
        start_autoIncreaseDay   = null ;
        $('#app_next_day,#app_pre_day').addClass('disabled').css('color', '#aaa' );
    }
    function  __unset_autoIncreaseDays(){
        if( start_autoIncreaseDay ) {
            document.getElementById('startdatepicker').value    = start_autoIncreaseDay ;
            start_autoIncreaseDay   = null ;
        }
        $('#app_next_day,#app_pre_day').removeClass('disabled').css('color', '#000' );
    }
    function __date_format( date ) {
            var y   = date.getFullYear() ;
            var m   = date.getMonth() + 1 ;
            var d   =  date.getDate() ;
            if( m <= 9 ) {
                m = '0' + String( m ) ;
            } else {
                m = String(  m ) ;
            }
            if( d <= 9 ) {
                d = '0' + String(  d ) ;
            } else {
                d = String( d );
            }
            return  String(y) + '-' + m + '-' + d ;
    }
    function __date_parse(txt){
            var a  =  $.map(txt.replace(/^\D+/, '').replace(/\D$/, '' ).split(/\D+0?/) , function(i){
                return parseInt(i) ;
            }) ;
            a[1]    -= 1 ;
            var   date  = new Date;
            date.setFullYear(  a[0]    ) ;
            date.setMonth( a[1]  , a[2]  ) ;
            date.setDate( a[2] ) ;
            return date ;
    }
    function __set_autoIncreaseDays() {
      if (maxIncreaseDay == 1) {
        // 1天循环的，直接使用当前框内的值
        return;
      }
      // 非1天循环，则刷票期间用户选择的时间是无效的。应该禁止用户选择。
      if( !start_autoIncreaseDay ) {
        start_autoIncreaseDay   =  document.getElementById('startdatepicker').value ;
        var date = __date_parse(start_autoIncreaseDay);
        pools_autoIncreaseDay  = new Array() ;
        for(var i = 0 ; i < maxIncreaseDay  ; i++) {
            pools_autoIncreaseDay.push(  __date_format(date) ) ;
            date.setTime(  date.getTime() + 3600 * 24 * 1000 ) ;
        }
        index_autoIncreaseDay = 1 ; 
        return ;
      }
      if( index_autoIncreaseDay >= pools_autoIncreaseDay.length ) {
        index_autoIncreaseDay   = 0 ;
      }
      var value   = pools_autoIncreaseDay[index_autoIncreaseDay++];
      document.getElementById('startdatepicker').value   = value ;
    }
    function getTimeLimitValues(){
        return $.map(  [ $('#startTimeHFrom').val()  , $('#startTimeMFrom').val(), $('#startTimeHTo').val(), $('#startTimeMTo').val() ] , function(val){
            return parseInt(val) || 0 ;
        }) ;
    }

    function setPref(name, value) {
	    window.localStorage.setItem(name, value);
	  }

    function getPref(name) {
	    return window.localStorage.getItem(name);
    }

		var isTicketAvailable = false;
		var firstRemove = false;

		window.$ && window.$(".obj:first").ajaxComplete(function() {
      var  _timeLimit = getTimeLimitValues();
			$(this).find("tr").each(function(n, e) {
				if(checkTickets(e, _timeLimit, n )){
					isTicketAvailable = true;
					highLightRow(e);
				}	
			});
			if(firstRemove) {
				firstRemove = false;
				if (isTicketAvailable) {
					if (isAutoQueryEnabled)
						document.getElementById("refreshButton").click();
					onticketAvailable(); //report
				}
				else {
					//wait for the button to become valid
				}
			}
		}).ajaxError(function() {
			if(isAutoQueryEnabled) doQuery();
		});

		//hack into the validQueryButton function to detect query
		var _delayButton = window.delayButton;

		var g_last_query_time = null;
		var g_ingore_doquery = false;
		window.delayButton = function() {
			_delayButton();
			if (isAutoQueryEnabled) {
			  var LEAST_PERIOD = 3000; //3s
			  var now = new Date();
			  now = now.getTime();//时间的毫秒数

			  if (g_last_query_time == null) {
			    // 直接刷新
			    g_last_query_time = now;
			    doQuery();
			  } else {
			    if (now > g_last_query_time) {
			      if (now - g_last_query_time < LEAST_PERIOD) {
			        if (g_ingore_doquery === false) {
			          g_ingore_doquery = true;
			          g_last_query_time = now + LEAST_PERIOD;
			          setTimeout(function () {
			            g_ingore_doquery = false;
			            doQuery();
			          }, LEAST_PERIOD);
			        }
			      } else {
			        g_last_query_time = now;
			        doQuery();
			      }
			    } else {
			      // should not happen
			      g_last_query_time = now;
			      doQuery();
			    }
			  }
			}
		}

	  //保存信息
		function saveTrainInfo() {
		  if ($("#fromStationText")[0].disabled) return;
		  setPref("ll_from_station_text", $("#fromStationText").val());
		  setPref("ll_from_station_telecode", $("#fromStation").val());
		  setPref("ll_to_station_text", $("#toStationText").val());
		  setPref("ll_to_station_telecode", $("#toStation").val());
		  setPref("ll_start_date", $("#startdatepicker").val());
		  setPref("ll_start_time", $("#startTime").val());

		}

	  //回填信息
		function fillTrainInfo() {
		  var FROM_STATION_TEXT = getPref('ll_from_station_text');
		  var FROM_STATION_TELECODE = getPref('ll_from_station_telecode');
		  var TO_STATION_TEXT = getPref('ll_to_station_text');
		  var TO_STATION_TELECODE = getPref('ll_to_station_telecode');
		  var DEPART_DATE = getPref('ll_start_date');
		  var DEPART_TIME = getPref('ll_start_time');

		  if (FROM_STATION_TEXT) {
		    $("#fromStationText").val(FROM_STATION_TEXT);
		    $("#fromStation").val(FROM_STATION_TELECODE);
		    $("#toStationText").val(TO_STATION_TEXT);
		    $("#toStation").val(TO_STATION_TELECODE);
		    $("#startdatepicker").val(DEPART_DATE);
		    $("#startTime").val(DEPART_TIME);
		  }
		}

		fillTrainInfo();
		$("#submitQuery, #stu_submitQuery").click(saveTrainInfo);

		//Trigger the button
		var doQuery = function() {
			displayQueryTimes(queryTimes++);
			firstRemove = true;
      __set_autoIncreaseDays();
      document.getElementById(isStudentTicket ? "stu_submitQuery" : "submitQuery").click();
		}

		var $special = $("<input type='text' />")	
		//add by 冯岩 begin 2012-01-18
		var $specialOnly = $("<input type='checkbox'  style='margin-left:26px; vertical-align: middle;' id='__chkspecialOnly'/><label for='__chkspecialOnly' style='color: blue; vertical-align: middle;'>仅显示限定车次<label>");
		var $includeCanOder = $("<input type='checkbox' style='margin-left: 39px; vertical-align: middle;' id='__chkIncludeCanOder'/><label for='__chkIncludeCanOder' style='color: blue; vertical-align: middle;'>显示可预定车次<label>");
		//add by 冯岩 end 2012-01-18
		var checkTickets = function(row, time_limit , row_index ) {

			var hasTicket = false;
			var v1 = $special.val().toUpperCase();
			var removeOther = $("#__chkspecialOnly").attr("checked");
			var includeCanOder = $("#__chkIncludeCanOder").attr("checked");
			if( v1 ) {
				var v2 = $.trim( $(row).find(".base_txtdiv").text() );
				if( v1.indexOf( v2 ) == -1 ) {
					//add by 冯岩 begin 2012-01-18
					if(removeOther)
					{
						if(v2 != "")
						{
							if(includeCanOder)
							{
								//包括其他可以预定的行
								if($(row).find(".yuding_u").size() == 0)
								{
									$(row).remove();
								}
							}
							else
							{
								$(row).remove();
							}
						}
					}
					//add by 冯岩 end 2012-01-18
					return false;
				}
			}

			if( $(row).find("td input.yuding_x[type=button]").length ) {
				return false;
			}
           
            var cells  = $(row).find("td") ;
            if( cells.length < 5 ) {
                return false ;
            }
            var _start_time = $.map(  $(cells[1]).text().replace(/^\D+|\D+$/, '').split(/\D+0?/) , function(val){
               return parseInt(val) || 0 ; 
            }) ;
            
            while( _start_time.length > 2 ) {
                _start_time.shift() ; // remove station name include number 
            }
            if( _start_time[0] < time_limit[0] ||  _start_time[0]  > time_limit[2] ) {
                return false ;
            }
            if( _start_time[0] == time_limit[0] && _start_time[1]  <  time_limit[1] ){
                return false ;
            }
            if( _start_time[0] == time_limit[2] && _start_time[1]  >  time_limit[3] ){
                return false ;
            }
            
			cells.each(function(i, e) {
				if(ticketType[i-1]) {
					var info = $.trim($(e).text());
					if( /^\d+$/.test(info) || info == "有" ) {// || (info != "--" && info != "无" && info != "*")) {
						hasTicket = true;
						highLightCell(e);
					}
				}
			});

			return hasTicket;
		}


		var queryTimes = 0; //counter
		var isAutoQueryEnabled = false; //enable flag

		//please DIY:
		var audio = null;

		var onticketAvailable = function() {
			if(window.Audio) {
				if(!audio) {
          //chrome-extension://hilbcakjhlicioieapgbkfmhhejogjik/dingpiao.wav
				  audio = new Audio("chrome-extension://jaojfpnikjjobngdfbgbhflfooidihmg/song.ogg");//("http://www.w3school.com.cn/i/song.ogg");//chrome.extension.getURL("dingpiao.wav");
					audio.loop = true;
				}
				audio.play();
				notify("可以订票了！");
			} else {
				notify("可以订票了！");
			}
		}
		var highLightRow = function(row) {
			$(row).css("background-color", "#D1E1F1");
		}
		var highLightCell = function(cell) {
			$(cell).css("background-color", "#2CC03E");
		}
		var displayQueryTimes = function(n) {
			document.getElementById("refreshTimes").innerHTML = n;
		};

		var isStudentTicket = false;

		//Control panel UI
		var ui = $("<div>请先选择好出发地，目的地，和出发时间。&nbsp;&nbsp;&nbsp;</div>")
			.append(
				$("<input id='isStudentTicket' type='checkbox' style='vertical-align: middle;' />").change(function(){
					isStudentTicket = this.checked ;
				})
			)
			.append(
				$("<label for='isStudentTicket' style='vertical-align: middle;'></label>").html("学生票&nbsp;&nbsp;")
			)
            .append(
				$("<input id='autoIncreaseDays' type='text' value='1'  maxLength=2 style='width:18px;height: 12px;line-height: 14px;vertical-align: middle;font-size: 14px;' />")
			)
			.append(
				$("<label for='autoIncreaseDays' style='vertical-align: middle;'></label>").html("天循环&nbsp;&nbsp;")
			)
			.append(
				$("<button style='padding: 5px 10px; background: #2CC03E;border-color: #259A33;border-right-color: #2CC03E;border-bottom-color:#2CC03E;color: white;border-radius: 5px;text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.2);'/>").attr("id", "refreshButton").html("开始刷票").click(function() {
					if(!isAutoQueryEnabled) {
            __reset_autoIncreaseDays() ;
						isTicketAvailable = false;
						if(audio && !audio.paused) audio.pause();
						isAutoQueryEnabled = true;
						doQuery();
						this.innerHTML="停止刷票";
					}
					else {
            __unset_autoIncreaseDays();
						isAutoQueryEnabled = false;
						this.innerHTML="开始刷票";
					}
				})
			)
			.append(
				$("<span>").html("&nbsp;(有票时会自动停止刷票并音乐提醒)&nbsp;尝试次数：").append(
					$("<span/>").attr("id", "refreshTimes").text("0")
				)
			)
      .append(
        '<hr style="margin: 2px 0 2px 0;color:gray;border-style:dashed;" size="1"/>'
      )
			.append( 
				$("<div>限定出发车次：</div>")
					.append( $special )
					.append( $specialOnly)
					.append( $includeCanOder )
					.append( "<span style='vertical-align:middle; margin-left: 10px;'>不限制不填写，限定多次用逗号分割，例如: G32,G34</span>" )
			)
      .append(
        '<hr style="margin: 2px 0 2px 0;color:gray;border-style:dashed;" size="1"/>'
      )
			.append( 
				//Custom ticket type
				$("<div>特定的票种，请在“余票信息”下面勾选</div>")
					.append($("<a href='#' style='text-decoration:none; margin-left: 30px; color: blue; vertical-align: middle;'>只勾选坐票&nbsp;&nbsp;</a>").click(function() {
						$(".hdr tr:eq(2) td").each(function(i,e) {
							var val = this.innerHTML.indexOf("座") != -1;
							var el = $(this).find("input").attr("checked", val);
							el && el[0] && ( ticketType[el[0].ticketTypeId] = val );
						});
						return false;
					}))
					.append($("<a href='#' style='text-decoration:none; margin-left: 70px; color: blue; vertical-align: middle;'>只勾选卧铺&nbsp;&nbsp;</a>").click(function() {
						$(".hdr tr:eq(2) td").each(function(i,e) {
							var val = this.innerHTML.indexOf("卧") != -1;
							var el = $(this).find("input").attr("checked", val);
							el && el[0] && ( ticketType[el[0].ticketTypeId] = val );
						});
						return false;
					}))
          .append($("<a href='#' style='text-decoration:none; margin-left: 110px; color: blue; vertical-align: middle;'>勾选全部&nbsp;&nbsp;</a>").click(function() {
						$(".hdr tr:eq(2) td").each(function(i,e) {
							var el = $(this).find("input").attr("checked", true);
							el && el[0] && ( ticketType[el[0].ticketTypeId] = true );
						});
						return false;
					}))
			)
      .append(
        '<hr style="margin: 5px 0 2px 0;color:gray;border-style:dashed;" size="1"/>'
      );
		var container = $(".cx_title_w:first");
		container.length ?
			ui.insertBefore(container) : ui.appendTo(document.body);
        
        $('<div style="position:relative;top:0px; left:0px; height:0px; width:1px; overflow:visiable; background-color:#ff0;"></div>')
                .append(
                        $('<a id="app_pre_day" style="position:absolute;top:26px; left:2px; width:40px; color:#000;">前一天</a>').click(function() {
                            if( $(this).hasClass("disabled") ) {
                                return false ;
                            }
                            var date = __date_parse( document.getElementById('startdatepicker').value );
                            date.setTime(  date.getTime() - 3600 * 24 * 1000 ) ;
                            document.getElementById('startdatepicker').value    =  __date_format(date)  ;
                            return false;
                        })
                    )
                .append(
                        $('<a id="app_next_day"  style="position:absolute;top:26px; left:114px; width:40px; color:#000;">下一天</a>').click(function() {
                            if( $(this).hasClass("disabled") ) {
                                return false ;
                            }
                            var date = __date_parse( document.getElementById('startdatepicker').value );
                            date.setTime(  date.getTime() + 3600 * 24 * 1000 ) ;
                            document.getElementById('startdatepicker').value    =  __date_format(date)  ;
                            return false;
                        })
                    )
                .insertBefore( $('#startdatepicker') ) ;
  
        setTimeout(function(){
            var box = $('<div style="position:relative;top:2px; left:0px; width:100px; height:18px; line-height:18px;  font-size:12px; padding:0px; overflow:hidden;"></div>') ;
            function makeSelect(id, max_value, default_value){
                var element  = $('<select id="' + id + '" style="margin:-2px 0px 0px -5px;padding:0px;font-size:12px; line-height:100%; "></select>') ;
                for(var i = 0; i <= max_value ; i++) {
                    element.append(
                       $('<option value="' + i + '" style="padding:0px;margin:0px;font-size:12px; line-height:100%;" ' + ( default_value == i ? ' selected="selected" ' : '' ) + '>' + ( i <= 9 ? '0' + i : i ) + '</option>' )
                    )
                }
                box.append(
                    $('<div style="width:18px; padding:0px; overflow:hidden; float:left;"></div>') .append(element)
                );
                return element ;
            }
            function check(evt){
                var tl  = getTimeLimitValues() ;
                if( tl[0] > tl[2] || (tl[0] == tl[2]  && tl[1] > tl[3]) ) {
                    alert('最早发车时间必须早于最晚发车时间，请重新选择！') ;
                    return false ;
                }
            }
            makeSelect('startTimeHFrom' , 23 ).change(check) ;
            box.append( $('<div style="float:left;">:</div>')) ;
            makeSelect('startTimeMFrom' , 59 ).change(check) ;
            box.append( $('<div style="float:left;padding:0px 1px;">--</div>')) ;
            makeSelect('startTimeHTo' , 23, 23 ).change(check) ;
            box.append( $('<div style="float:left;">:</div>')) ;
            makeSelect('startTimeMTo' , 59, 59 ).change(check) ;
            
            box.insertAfter(  $('#startTime') )
   
        }, 10 ) ;
        
		//Ticket type selector & UI
		var ticketType = new Array();
        var checkbox_list   = new Array();
		$(".hdr tr:eq(2) td").each(function(i,e) {
			ticketType.push(false);
			if(i<3) return;
			ticketType[i] = true;

			var c = $("<input/>").attr("type", "checkBox").attr("checked", true);
			c[0].ticketTypeId = i;
			c.change(function() {
				ticketType[this.ticketTypeId] = this.checked;
			}).appendTo(e);
            checkbox_list.push(c);
		});
        $.each([1, 2 ], function(){
            var c   = checkbox_list.pop() ;
            c[0].checked    = false ;
            ticketType[ c[0].ticketTypeId ] = this.checked ;
        });
        delete checkbox_list ;
	}

	route("querySingleAction.do", query);
	//route("myOrderAction.do?method=resign", query);//bugs
  route("confirmPassengerResignAction.do?method=cancelOrderToQuery", query);
  route("payConfirmOnlineSingleAction.do?method=cancelOrder", query);
	route("orderAction.do?method=cancelMyOrderNotComplete", query);

	route("loginAction.do?method=init", function() {
		if( !window.location.href.match( /init$/i ) ) {
			return;
		}
		//login
    var check_url = "https://dynamic.12306.cn/otsweb/loginAction.do?method=loginAysnSuggest";
		var login_url = "https://dynamic.12306.cn/otsweb/loginAction.do?method=login";
		var query_url = "https://dynamic.12306.cn/otsweb/order/querySingleAction.do?method=init";
    var refund_url = "https://dynamic.12306.cn/otsweb/order/myOrderAction.do?method=initRefundLogin";
    
		//Check had login, redirect to query url
		if( window.parent && window.parent.$ ) {
			var str = window.parent.$("#username_ a").attr("href");
			if( str && str.indexOf("sysuser/user_info") != -1 ){
				window.location.href = query_url;
				return;
			}
		}

    function checkAysnSuggest() {
      $.ajax({
        url: check_url,
        type: "POST",
        dataType: "json",
        success: function(data) {
          if (data.randError != 'Y') {
            $('#refreshButton').html("("+count_total+")次登录，已暂停，点击继续");
            is_retry_logining = false;
            alert('请换一张验证码并重新输入正确的验证码！');
          } else {
            $("#loginRand").val(data.loginRand);
            submitForm();
          }
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          //$('#refreshButton').html("("+count_total+")次登录，已暂停，点击继续");
          //is_retry_logining = false;
          //alert("网路忙，请稍后重试");
          //send the checkAysnSuggest again!
          count_submitform = max_same_suggest_login_times;
          reLogin();
        }
      });
    }
    
		function submitForm(){
      var bRefundLogin = false;
      if (('undefind' != $("[name='refundLoginCheck']")) && ($("[name='refundLoginCheck']").attr("checked") == true)) {
        bRefundLogin = true;
      }
			$.ajax({
				type: "POST",
				url: login_url,
				data: {
          "loginRand": $("#loginRand").val(),
          "refundLogin": bRefundLogin?"Y": "N",
          "refundFlag": $("#refundFlag").val(),
					"loginUser.user_name": $("#UserName").val(),
          "user.password": $("#password").val(),
          "randCode": $("#randCode").val()
				},
				beforeSend: function( xhr ) {
					try{
						xhr.setRequestHeader('X-Requested-With', {toString: function(){ return ''; }});
						xhr.setRequestHeader('Cache-Control', 'max-age=0');
						xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
					}catch(e){};
				},
				timeout: 30000,
				//cache: false,
				//async: false,
				success: function(msg){
					//密码输入错误
					//您的用户已经被锁定
					if ( msg.indexOf('请输入正确的验证码') > -1 ) {
            $('#refreshButton').html("("+count_total+")次登录，已暂停，点击继续");
            is_retry_logining = false;
            alert('请换一张验证码并重新输入正确的验证码！');
            $("#img_rrand_code").click();
            $("#randCode").val("")[0].select();
					} else if ( msg.indexOf('当前访问用户过多') > -1 ){
						reLogin();
					} else if( msg.match(/var\s+isLogin\s*=\s*true/i) ) {
            //reLogin();return;//TODO: TEST ONLY!!
            
            is_retry_logining = false;
            if (bRefundLogin) {
              notify('登录成功，开始退票吧！');
              window.location.replace( refund_url );
            } else {
              notify('登录成功，开始查询车票吧！');
              window.location.replace( query_url );
            }
					} else {
						msg = msg.match(/var\s+message\s*=\s*"([^"]*)/);
						if( msg && msg[1] ) {
              $('#refreshButton').html("("+count_total+")次登录，已暂停，点击继续");
              is_retry_logining = false;
							alert( msg && msg[1] );
						} else {
							reLogin();
						}
					}
				},
				error: function(msg){
					reLogin();
				}
			});
		}

    var is_retry_logining = false;
    var max_same_suggest_login_times = 3;
    // 每个站点尝试100次的3连发登录，约需耗半个小时
    // 每个站点尝试10次的3连发登录，约需耗2分钟
    // 折中取30次，约尝试10分钟后，切换站点～
    var max_retry_same_host_retry_times = max_same_suggest_login_times*30;// //TODO: 5 is for TEST ONLY!! 30 for release
    // 一共尝试切换多少次站点（考虑有多少站点可供切换，当然也可以循环切换）
    // 按单站点30次重试耗时10分钟计算，60次站点切换，约10个小时～～
    var max_retry_total = max_retry_same_host_retry_times*60;
    
		var count_total = 0;
    var count_submitform = 0;
    
    function real_login() {
      if (count_submitform <= max_same_suggest_login_times) {
        submitForm();
      } else {
        checkAysnSuggest();
        count_submitform = 1;
      }
    }

		function reLogin(){
      if (is_retry_logining == false)
        return;
      var RETRY_PERIOD = 3000;
			count_total ++;
      count_submitform ++;
      var timeout = RETRY_PERIOD;
      if (count_submitform == max_same_suggest_login_times + 1) {
        // new round
        //console.log(count_submitform + " of " + count_total);
        timeout += Math.floor((count_total%max_retry_same_host_retry_times)/10)*RETRY_PERIOD;
        // 最长隔15s发一次登录请求
        if (timeout > 5*RETRY_PERIOD) timeout = 5*RETRY_PERIOD;
      } else {
        // 点射：登录请求序列是 [AB(3s)B(3s)B]--3s*x(max 15s)--[AB(3s)B(3s)B]
        timeout = RETRY_PERIOD;
      }
      if (count_total <= max_retry_total) {
        if (count_total%max_retry_same_host_retry_times == 0) {
          window.postMessage({ type: "FROM_PAGE", text: "Switch Host!" }, "*");
          timeout = 2*60*1000; // reserve additional 2 minutes for connection closing and switching
          $('#refreshButton').html("("+count_total+")次登录，约需2分钟...");
        } else {
          $('#refreshButton').html("("+count_total+")次登录...");
        }
        setTimeout(real_login, timeout);
      } else {
        count_total = 0;
        $('#refreshButton').html("自动登录");
        is_retry_logining = false;
        alert("长时间连续尝试自动登录失败。为避免对网站造成过大压力，已停止自动登录。如需要请重新开始自动登录。");
      }
		}
    
		//初始化
		$("#subLink").after($("<a href='#' style='padding: 0 10px; position: absolute; margin-left: 120px; margin-top: 3px; line-height: 30px; background: #2CC03E;border-color: #259A33;border-right-color: #2CC03E;border-bottom-color:#2CC03E;color: white;border-radius: 5px;text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.2);'/>").attr("id", "refreshButton").html("自动登录").click(function() {
			if(is_retry_logining == false) {
        is_retry_logining = true;
        count_total++;
        $(this).html("("+count_total+")次登录...");
        checkAysnSuggest();
        count_submitform = 1;
      } else {
        // pause the retring
        is_retry_logining = false;
        $(this).html("("+count_total+")次登录，已暂停，点击继续");
      }
		}));
    
    if ($("#subLink").length > 0) {
      alert('如果使用自动登录功能，请务必输入正确的用户名、密码及验证码后点击自动登录，扩展会自动尝试登录！扩展将智能调整重试时间，以避免对服务器压力过大。');
    }

    $("#randCode").keyup(function (e) {
      e = e || event;
      if (e.charCode == 13 || ($("#randCode").val().length == 4 && $("#UserName").val().length && $("#password").val().length)) {
        $("#refreshButton").click();
      }
    });

	});
  
  
  
	route("confirmPassengerAction.do?method=init", initAutoCommitOrder);
function initAutoCommitOrder() {
  var g_auto_commit_counter = 0;
	var randCode = "";
	var g_is_submitting = false;
	var tourFlag = 'dc';
	var randEl = $("#rand");

    /**
		 * Auto Submit Order
		 * From: https://gist.github.com/1577671
		 * Author: kevintop@gmail.com  
     * From: https://github.com/iccfish/12306_ticket_helper
		 * Author: iFish@FishLee.net  
		 */
		
	if ($(".error_text").length > 0 && parent.$("#orderForm").length > 0) {
		parent.resubmitForm();

		return;
	}

	(function () {
		/'(dc|fc|wc|gc)'/.exec($("div.tj_btn :button:eq(2)")[0].onclick + '');
		tourFlag = RegExp.$1;
	})();

	function setCommitButtonText() {
	  if (g_is_submitting)
	    $("#btnAutoSubmit").html("提交中...");
	  else
	    $("#btnAutoSubmit").html("自动提交");
	}

  // stop the auto commit process!
	function stop(msg) {
	  g_is_submitting = false;

	  setCurOperationInfo(false, "出错 - 自动提交已停止！");
		setTipMessage(msg);
		setCommitButtonText();
		$("div.tj_btn button, div.tj_btn input").each(function () {
			this.disabled = false;
			$(this).removeClass().addClass("long_button_u");
		});
	}

	var reloadCode = function () {
		$("#img_rrand_code").click();
		$("#rand").val("")[0].select();
	};

	//订单等待时间过久的警告
	var waitTimeTooLong_alert = false;

	function submitForm() {
		randEl[0].blur();
		stopCheckCount();
		if (!window.submit_form_check || !submit_form_check("confirmPassenger")) {
			stop("请填写完整表单");
			return;
		}
		
		if (g_is_submitting===false) {
			stop("已取消自动提交");
			return;
		}

		++g_auto_commit_counter;
		waitTimeTooLong_alert = false;

		$("#confirmPassenger").ajaxSubmit({
			url: 'confirmPassengerAction.do?method=checkOrderInfo&rand=' + $("#rand").val(),
			type: "POST",
			data: { tFlag: tourFlag },
			dataType: "json",
			success: function (data) {
				if ('Y' != data.errMsg || 'N' == data.checkHuimd || 'N' == data.check608) {
					stop(data.msg || data.errMsg);
					reloadCode();
				}
				else {
          ajaxQueryQueueCount();
        }
			},
			error: function (msg) {
				setCurOperationInfo(false, "当前请求发生错误，正在自动重试...");
				delayInvoke(null, submitForm, 1000);
			}
		});
  }
  
	function ajaxQueryQueueCount() {
	  setCurOperationInfo(true, "正在自动查询排队人数....");
    var queryLeftData = {
      train_date: $("#start_date").val(),
      train_no: $("#train_no").val(),
      station: $("#station_train_code").val(),
      seat: $("#passenger_1_seat").val(),
      from: $("#from_station_telecode").val(),
      to: $("#to_station_telecode").val(),
      ticket: $("#left_ticket").val()
    };
    $.ajax({
      url: '/otsweb/order/confirmPassengerAction.do?method=getQueueCount' + '&' + Math.random(),
      data: queryLeftData,
      type: 'GET',
      timeout: 10000,
      dataType: 'json',
      success: function (result) {
        if (result.op_2) {
          stop("排队人数（" + result.count + "）过多，铁道部拒绝排队，请重新订票或尝试手工提交！");
          //delayInvoke(null, ajaxQueryQueueCount, 1000);
          return;
        }
        submitConfirmOrder();
      },
      error: function () {delayInvoke(null, ajaxQueryQueueCount, 2000);}
    });
	}

	function submitConfirmOrder() {
	  setCurOperationInfo(true, "正在自动排队....");
    //异步下单
    var order_type = 'confirmSingleForQueueOrder'; //'dc' 单程
    if (tourFlag == 'wc') {
      // 异步下单-往程
      order_type = 'confirmPassengerInfoGoForQueue';
    } else if (tourFlag == 'fc') {
      // 异步下单-返程
      order_type = 'confirmPassengerInfoBackForQueue';
    } else if (tourFlag == 'gc') {
      // 异步下单-改签
      order_type = 'confirmPassengerInfoResignForQueue';
    }
		$.ajax({
			url: '/otsweb/order/confirmPassengerAction.do?method=' + order_type,
			data: $('#confirmPassenger').serialize(),
			type: "POST",
			timeout: 10000,
			dataType: 'json',
			success: function (msg) {
				console.log(msg);
				var errmsg = msg.errMsg;
				if (errmsg != 'Y') {
				  if (errmsg.indexOf("包含未付款订单") != -1) {
				    stop("包含未付款订单");
						alert("您有未支付订单! 赶紧点“确定”去支付或取消了，否则无法继续提交订单。");
						window.location.replace("/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y");
						return;
					}
					if (errmsg.indexOf("重复提交") != -1) {
					  stop("重复提交错误，已在自动更新令牌，需要您重新输入验证码（若多次仍无法提交订单，请重新订票或尝试手工提交！）");
						reloadToken();
						reloadCode();
						return;
					}
					if (errmsg.indexOf("后台处理异常") != -1 || errmsg.indexOf("非法请求") != -1) {
					  stop("后台处理异常，请返回查询页重新订票或尝试手工提交！！");
						return;
					}
					if (errmsg.indexOf("包含排队中") != -1) {
						waitingForQueueComplete();
						return;
					}

					stop(errmsg);
					reloadCode();
				} else {
					waitingForQueueComplete();
				}
			},
			error: function (msg) {
			  setCurOperationInfo(false, "请求排队出错，正在继续自动重试...");
				delayInvoke(null, submitForm, 3000);
			}
		});
	}

	function reloadToken(submit) {
		setCurOperationInfo(true, "正在自动更新令牌....");
    $.ajax({
      url: "/otsweb/order/confirmPassengerAction.do?method=init",
      data: null,
      timeout: 10000,
      type: "POST",
      dataType: "text",
      success: function (text) {
        if (!/TOKEN"\s*value="([a-f\d]+)"/i.test(text)) {
          setCurOperationInfo(false, "更新令牌失败，正在继续自动重试...");
          delayInvoke("#countEle", reloadToken, 1000);
        } else {
          var token = RegExp.$1;
          setCurOperationInfo(false, "成功更新令牌");
          $("input[name=org.apache.struts.taglib.html.TOKEN]").val(token);
        }
      },
      error: function () { delayInvoke("#countEle", reloadToken, 1000); }
    });
	}

  function getSecondInfo(second) {
		var show_time = "";
		var hour = parseInt(second / 3600);  //时
		if (hour > 0) {
			show_time = hour + "小时";
			second = second % 3600;
		}
		var minute = parseInt(second / 60);  //分
		if (minute >= 1) {
			show_time = show_time + minute + "分";
			second = second % 60;
		} else if (hour >= 1 && second > 0) {
			show_time = show_time + "0分";
		}
		if (second > 0) {
			show_time = show_time + second + "秒";
		}

		return show_time;
	}
  
	function waitingForQueueComplete() {
		setCurOperationInfo(true, "订单提交成功, 正在自动等待排队完成...");

		$.ajax({
			url: '/otsweb/order/myOrderAction.do?method=getOrderWaitTime&tourFlag=' + tourFlag + '&' + Math.random(),
			data: {},
			type: 'GET',
			timeout: 10000,
			dataType: 'json',
			success: function (json) {
				if (json.waitTime == -1 || json.waitTime == 0) {
					//TODO：声音：赶紧去支付！
          notify("订票成功，可以付款了！");
					if (json.orderId)
						window.location.replace("/otsweb/order/confirmPassengerAction.do?method=payOrder&orderSequence_no=" + json.orderId);
					else window.location.replace('/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y');
				} else if (json.waitTime == -3) {
				  var msg = "很抱歉, 您的本次订单提交已被铁道部取消，请重新订票或尝试手工提交！";
					notify(msg);
					stop(msg);
					reloadCode();
				} else if (json.waitTime == -2) {
				  var msg = "很抱歉, 您的本次订单提交排队失败：" + json.msg + ', 请重新订票或尝试手工提交！';
				  reloadToken();
					notify(msg);
					stop(msg);
					reloadCode();
				}
				else if (json.waitTime < 0) {
					var msg = '很抱歉, 未知的状态信息 : waitTime=' + json.waitTime + ', 可能已成功，请验证未支付订单.';
					setTipMessage(msg);
					notify(msg);
					location.href = '/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y';
				} else {
					var msg = "订单需要 " + getSecondInfo(json.waitTime) + " 处理完成， 请等待。（排队人数=" + (json.waitCount || "未知") + "）";
					if (json.waitTime > 1800) {
						msg += "<span style='color:red; font-weight: bold;'>提示：排队时间大于30分钟，成功率较低，请尽快电话订票或重新订票！</span>";
					}
					setTipMessage(msg);

					if (json.waitTime > 1800 && !waitTimeTooLong_alert) {
						waitTimeTooLong_alert = true;
						notify("提示：排队时间大于30分钟，成功率较低，请尽快电话订票或重新订票！");
					}
          var delay_secs = 1000 + 1000 * Math.round(json.waitTime/60);
					delayInvoke("#countEle", waitingForQueueComplete, delay_secs);
				}
			},
			error: function (json) {
				notify("请求发生异常，可能是登录状态不对，如果登录状态没有问题，请手动进入“未完成订单”页面查询。");
				self.location.reload();
			}
		});
	}


	$("div.tj_btn").append("<button class='long_button_u_down' style='padding: 5px 10px; margin: 0px 20px; background: #2CC03E;border-color: #259A33;border-right-color: #2CC03E;border-bottom-color:#2CC03E;color: white;border-radius: 5px;text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.2);' type='button' id='btnAutoSubmit'>自动提交</button>");//<button class='long_button_u_down' type='button' id='btnCancelAuto' style='display:none;'>取消自动</button>
	$("#btnAutoSubmit").click(function () {
	  if (g_is_submitting) {
	    if ($("#btnAutoSubmit").html() != "正在努力") {
	      $("#btnAutoSubmit").html("正在努力");
	      setTimeout(setCommitButtonText, 3000);
	    }
	    return;
	  }
	  g_auto_commit_counter = 0;
		g_is_submitting = true;
		setCommitButtonText();
		submitForm();
	});

	randEl.keyup(function (e) {
	  if (!document.getElementById("autoStartCommit").checked) return;
	  if (e.charCode == 13
      || (randEl.val().length == 4)) {
	    $("#btnAutoSubmit").click();
	  }
	});

	//清除上次保存的预定信息
	var lastform = null;
	if (parent) {
		lastform = parent.$("#orderForm");
		if (lastform) lastform.attr("success", "1");
	}

  //输入完即提交
	$(".table_qr tr:last").before("<tr><td colspan='9'><label><input type='checkbox' id='autoStartCommit' /> 输入验证码后立刻开始自动提交（如果希望手工提交，请取消勾选）</label></td></tr>");
	document.getElementById("autoStartCommit").checked = typeof (window.localStorage["ll_disableAutoStartCommit"]) == 'undefined';
	$("#autoStartCommit").change(function () {
	  if (this.checked) window.localStorage.removeItem("ll_disableAutoStartCommit");
	  else window.localStorage.setItem("ll_disableAutoStartCommit", "1");
	});

	//进度提示框
	$("table.table_qr tr:last").before("<tr><td style='border-top:1px dotted #ccc;height:100px;' colspan='9' id='orderCountCell'></td></tr><tr><td style='border-top:1px dotted #ccc;' colspan='9'><ul id='tipScript'>" +
	"<li id='countEle' style='font-weight:bold; color:#EA5200;'>等待操作</li>" +
	"<li style='color:#EA5200;'><strong>提示信息</strong>：<span>--</span></li>" +
	"<li style='color:black;'><strong>提示时间</strong>：<span>--</span></li></ul></td></tr>");

	var ele_tip_msg_ = $("#tipScript li");
	var ele_cur_op_ = $("#countEle");

  // show operation detail: running is useless
	function setCurOperationInfo(running, msg) {
	  ele_cur_op_.html("第 " + g_auto_commit_counter + " 次提交：" + msg);
	}

  function getTimeInfo() {
		var d = new Date();
		return d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes() + ":" + (d.getSeconds() < 10 ? "0" : "") + d.getSeconds();
	}
  
  // show error message detail
	function setTipMessage(msg) {
	  ele_tip_msg_.eq(2).find("span").html(getTimeInfo());
	  ele_tip_msg_.eq(1).find("span").html(msg);
	}

	$(".table_qr tr:last").before("<tr><td colspan='9'><label><input type='checkbox' id='showHelp' /> 显示帮助 </label></td></tr>");
	document.getElementById("showHelp").checked = typeof (window.localStorage["showHelp"]) != 'undefined';
	$("#showHelp").change(function () {
		if (this.checked) {
			window.localStorage.setItem("showHelp", "1");
			$("table.table_qr tr:last").show();
		}
		else {
			window.localStorage.removeItem("showHelp");
			$("table.table_qr tr:last").hide();
		}
	}).change();

	var stopCheckCount = null;

	(function () {
		var data = { train_date: $("#start_date").val(), station: $("#station_train_code").val(), seat: "", from: $("#from_station_telecode").val(), to: $("#to_station_telecode").val(), ticket: $("#left_ticket").val() };
		var url = "confirmPassengerAction.do?method=getQueueCount";
		var allSeats = $("#passenger_1_seat option");
		var queue = [];
		var checkCountStopped = false;

		function beginCheck() {
			if (checkCountStopped) return;

			var html = [];
			html.push("<span style='font-size:125%;color:red;'>本次列车余票最新排队情况（每2秒刷新一次直至您开始提交订单）：</span>");


			allSeats.each(function () {
				queue.push({ id: this.value, name: this.text });
				html.push("【<span style='color:blue; font-weight: bold;'>" + this.text + "</span>】<span id='queueStatus_" + this.value + "'>等待查询中....</span>");
			});
			$("#orderCountCell").html(html.join("<br />"));
			if (queue.length > 0) executeQueue();
		}
		function checkTicketAvailable() {
			var queryLeftData = {
				'orderRequest.train_date': $('#start_date').val(),
				'orderRequest.from_station_telecode': $('#from_station_telecode').val(),
				'orderRequest.to_station_telecode': $('#to_station_telecode').val(),
				'orderRequest.train_no': $('#train_no').val(),
				'trainPassType': 'QB',
				'trainClass': 'QB#D#Z#T#K#QT#',
				'includeStudent': 00,
				'seatTypeAndNum': '',
				'orderRequest.start_time_str': '00:00--24:00'
			};
      $.ajax({
        url: "/otsweb/order/querySingleAction.do?method=queryLeftTicket",
        data: queryLeftData,
        timeout: 10000,
        type: "GET",
        dataType: "text",
        success: function (text) {
          window.ticketAvailable = '';
          if (/(([\da-zA-Z]\*{5,5}\d{4,4})+)/gi.test(text)) {
            window.ticketAvailable = RegExp.$1;
          }
        },
        error: function () {}
      });
		}
		function executeQueue() {
			if (checkCountStopped) return;

			var type = queue.shift();
			queue.push(type);

			data.seat = type.id;
			var strLeftTicket = '';
			checkTicketAvailable();
			if (window.ticketAvailable) {
				strLeftTicket = window.ticketAvailable;
			}
      $.ajax({
        url: url,
        data: data,
        timeout: 10000,
        type: "GET",
        dataType: "json",
        success: function (data) {
          var msg = "余票：<strong>" + getTicketCountDesc(strLeftTicket, type.id) + "</strong>";
          msg += "，当前【<span style='color:blue; font-weight: bold;'>" + data.count + "</span>】人排队订票，";
          if (data.op_2){ // || data.count > strLeftTicket) {
            msg += "<span style='color:blue; font-weight: red;'>请您尽快提交</span>。";
          } else {
            msg += "请您抓紧提交";
          }
          msg += "&nbsp;&nbsp;&nbsp;&nbsp;（更新于：" + getTimeInfo() + "）";

          $("#queueStatus_" + type.id).html(msg);
          setTimeout(executeQueue, 2000);
        },
        error: function () {setTimeout(executeQueue, 3000);}
      });
		}

		stopCheckCount = function () {
			checkCountStopped = true;
		}

		beginCheck();
	})();

  //#region 自动选择联系人
	function tryFillPassage() {
	  if (!$("input._checkbox_class:checked").length) {
	    try {
	      $("input._checkbox_class:first").attr("checked", true).click().attr("checked", true);
	    } catch (e) { };
	  }
	}

	$(window).ajaxComplete(function (e, xhr, s) {
	  if (s.url.indexOf("getPagePassengerAll") != -1) {
	    tryFillPassage();
	  }
	});

  //如果已经加载完成，那么直接选定
	if ($("#showPassengerFilter div").length) {
	  tryFillPassage();
	}
  //#endregion

	(function () {
		var obj = document.getElementById("rand");

		var oldOnload = window.onload;
		window.onload = function () {
			if (oldOnload) oldOnload();
			obj.select();
		};
		obj.select();
	})();

	parent.$("#main").css("height", ($(document).height() + 300) + "px");
	parent.window.setHeight(parent.window);
}

	function submit() {
		/**
		 * Auto Submit Order
		 * From: https://gist.github.com/1577671
		 * Author: kevintop@gmail.com  
		 */
		//Auto select the first user when not selected
		if( !$("input._checkbox_class:checked").length ) {
			try{
				//Will failed in IE
				$("input._checkbox_class:first").click();
			}catch(e){};
		}
		//passengerTickets

		var userInfoUrl = 'https://dynamic.12306.cn/otsweb/order/myOrderAction.do?method=queryMyOrderNotComplete&leftmenu=Y';

		var count = 1, freq = 1000, doing = false, timer, $msg = $("<div style='padding-left:470px;'></div>");

		function submitForm(){
			timer = null;
			//更改提交列车日期参数
			//var wantDate = $("#startdatepicker").val();
			//$("#start_date").val(wantDate);
			//$("#_train_date_str").val(wantDate);

			jQuery.ajax({
				url: $("#confirmPassenger").attr('action'),
				data: $('#confirmPassenger').serialize(),
				beforeSend: function( xhr ) {
					try{
						xhr.setRequestHeader('X-Requested-With', {toString: function(){ return ''; }});
						xhr.setRequestHeader('Cache-Control', 'max-age=0');
						xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
					}catch(e){};
				},
				type: "POST",
				timeout: 30000,
				success: function( msg )
				{
					//Refresh token
					var match = msg && msg.match(/org\.apache\.struts\.taglib\.html\.TOKEN['"]?\s*value=['"]?([^'">]+)/i);
					var newToken = match && match[1];
					if(newToken) {
						$("input[name='org.apache.struts.taglib.html.TOKEN']").val(newToken);
					}

					if( msg.indexOf('payButton') > -1 ) {
						//Success!
						var audio;
						if( window.Audio ) {
              //chrome-extension://hilbcakjhlicioieapgbkfmhhejogjik/fukuan.wav
						  audio = new Audio("chrome-extension://jaojfpnikjjobngdfbgbhflfooidihmg/song.ogg");//("http://www.w3school.com.cn/i/song.ogg");//chrome.extension.getURL("fukuan.wav");
							audio.loop = true;
							audio.play();
						}
						notify("恭喜，车票预订成！");
						setTimeout(function() {
							if( confirm("车票预订成，去付款？") ){
								window.location.replace(userInfoUrl);
							} else {
								if(audio && !audio.paused) audio.pause();
							}
						}, 100);
						return;
					}else if(msg.indexOf('未处理的订单') > -1){
						notify("有未处理的订单!");
						window.location.replace(userInfoUrl);
						return;
					}
					var reTryMessage = [
						'用户过多'
					  , '确认客票的状态后再尝试后续操作'
					  ,	'请不要重复提交'
					  , '没有足够的票!'
					  , '车次不开行'
					];
					for (var i = reTryMessage.length - 1; i >= 0; i--) {
						if( msg.indexOf( reTryMessage[i] ) > -1 ) {
							reSubmitForm( reTryMessage[i] );
							return;
						}
					};
					// 铁道部修改验证码规则后  update by 冯岩
					if( msg.indexOf( "输入的验证码不正确" ) > -1 ) {
						$("#img_rrand_code").click();
						$("#rand").focus().select();
						stop();
						return;
					}
					//Parse error message
					msg = msg.match(/var\s+message\s*=\s*"([^"]*)/);
					stop(msg && msg[1] || '出错了。。。。 啥错？ 我也不知道。。。。。');
				},
				error: function(msg){
					reSubmitForm("网络错误");
				}
			});
		};
		function reSubmitForm(msg){
			if( !doing )return;
			count ++;
			$msg.html("("+count+")次自动提交中... " + (msg || ""));
			timer = setTimeout( submitForm, freq || 50 );
		}
		function stop ( msg ) {
			doing = false;
			$msg.html("("+count+")次 已停止");
			$('#refreshButton').html("自动提交订单");
			timer && clearTimeout( timer );
			msg && alert( msg );
		}
		function reloadSeat(){
			$("select[name$='_seat']").html('<option value="M" selected="">一等座</option><option value="O" selected="">二等座</option><option value="1">硬座</option><option value="3">硬卧</option><option value="4">软卧</option>');
		}
		//初始化

		if($("#refreshButton").size()<1){

			//	//重置后加载所有席别
			//	$("select[name$='_seat']").each(function(){this.blur(function(){
			//		alert(this.attr("id") + "blur");
			//	})});
			////初始化所有席别
			//$(".qr_box :checkbox[name^='checkbox']").each(function(){$(this).click(reloadSeat)});
			//reloadSeat();

			//日期可选
			$("td.bluetext:first").html('<input type="text" name="orderRequest.train_date" value="' +$("#start_date").val()+'" id="startdatepicker" style="width: 150px;" class="input_20txt"  onfocus="WdatePicker({firstDayOfWeek:1})" />');
			$("#start_date").remove();

			$(".tj_btn").append($("<a style='padding: 5px 10px; background: #2CC03E;border-color: #259A33;border-right-color: #2CC03E;border-bottom-color:#2CC03E;color: white;border-radius: 5px;text-shadow: -1px -1px 0 rgba(0, 0, 0, 0.2);'></a>").attr("id", "refreshButton").html("自动提交订单").click(function() {
				//alert('开始自动提交订单，请点确定后耐心等待！');
				if( this.innerHTML.indexOf("自动提交订单") == -1 ){
					//doing
					stop();
				} else {
					if( window.submit_form_check && !window.submit_form_check("confirmPassenger") ) {
						return;
					}
					count = 0;
					doing = true;
					this.innerHTML = "停止自动提交";
					reSubmitForm();
				}
				return false;
			}));
			$(".tj_btn").append("自动提交频率：")
				.append($("<select id='freq'><option value='50' >频繁</option><option value='500' selected='' >正常</option><option value='2000' >缓慢</option></select>").change(function() {
					freq = parseInt( $(this).val() );
				}))
				.append($msg);
			//alert('如果使用自动提交订单功能，请在确认订单正确无误后，再点击自动提交按钮！');

			//铁道路修改验证码规则后 优化 by 冯岩
			$("#rand").bind('keydown', function (e) {
				var key = e.which;
				if (key == 13) {
					$("#refreshButton").click();
				}
			});
		}
	};

}, true);