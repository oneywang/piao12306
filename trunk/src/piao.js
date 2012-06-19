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
		script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js";

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
	$(document).click(function() {
		if( window.webkitNotifications && window.webkitNotifications.checkPermission() != 0 ) {
			window.webkitNotifications.requestPermission();
		}
	});
	function notify(str, timeout, skipAlert) {
		if( window.webkitNotifications && window.webkitNotifications.checkPermission() == 0 ) {
			var notification = webkitNotifications.createNotification(
				"http://www.12306.cn/mormhweb/images/favicon.ico",  // icon url - can be relative
				'订票',  // notification title
				str
			);
			notification.show();
			if ( timeout ) {
				setTimeout(function() {
					notification.cancel();
				}, timeout);
			}
			return true;
		} else {
			if( !skipAlert ) {
				alert( str );
			}
			return false;
		}
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
        function  __set_autoIncreaseDays() {
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

		window.delayButton = function() {
			_delayButton();
			if(isAutoQueryEnabled) doQuery();
		}

		//Trigger the button
		var doQuery = function() {
			displayQueryTimes(queryTimes++);
			firstRemove = true;
            __set_autoIncreaseDays();
			document.getElementById(isStudentTicket ? "stu_submitQuery" : "submitQuery").click();
		}

		var $special = $("<input type='text' />")	
		//add by 冯岩 begin 2012-01-18
		var $specialOnly = $("<label style='margin-left:10px;color: blue;'><input type='checkbox'  id='__chkspecialOnly'/>仅显示限定车次<label>");
		var $includeCanOder = $("<label style='margin-right:10px;color: blue;'><input type='checkbox' id='__chkIncludeCanOder'/>显示可预定车次<label>");
		//add by 冯岩 end 2012-01-18
		var checkTickets = function(row, time_limit , row_index ) {

			var hasTicket = false;
			var v1 = $special.val();			
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
					if(info != "--" && info != "无") {
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
					audio = new Audio("http://www.w3school.com.cn/i/song.ogg");
					audio.loop = true;
				}
				audio.play();
				notify("可以订票了！", null, true);
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
				$("<input id='isStudentTicket' type='checkbox' />").change(function(){
					isStudentTicket = this.checked ;
				})
			)
			.append(
				$("<label for='isStudentTicket'></label>").html("学生票&nbsp;&nbsp;")
			)
            .append(
				$("<input id='autoIncreaseDays' type='text' value='1'  maxLength=2 style='width:18px;' />") 
			)
			.append(
				$("<label for='autoIncreaseDays'></label>").html("天循环&nbsp;&nbsp;")
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
				$("<span>").html("&nbsp;&nbsp;尝试次数：").append(
					$("<span/>").attr("id", "refreshTimes").text("0")
				)
			)
			.append( 
				//Custom ticket type
				$("<div>如果只需要刷特定的票种，请在余票信息下面勾选。</div>")
					.append($("<a href='#' style='color: blue;'>只勾选坐票&nbsp;&nbsp;</a>").click(function() {
						$(".hdr tr:eq(2) td").each(function(i,e) {
							var val = this.innerHTML.indexOf("座") != -1;
							var el = $(this).find("input").attr("checked", val);
							el && el[0] && ( ticketType[el[0].ticketTypeId] = val );
						});
						return false;
					}))
					.append($("<a href='#' style='color: blue;'>只勾选卧铺&nbsp;&nbsp;</a>").click(function() {
						$(".hdr tr:eq(2) td").each(function(i,e) {
							var val = this.innerHTML.indexOf("卧") != -1;
							var el = $(this).find("input").attr("checked", val);
							el && el[0] && ( ticketType[el[0].ticketTypeId] = val );
						});
						return false;
					}))
			)
			.append( 
				$("<div>限定出发车次：</div>")
					.append( $special )
					.append( $specialOnly)
					.append( $includeCanOder )
					.append( "不限制不填写，限定多次用逗号分割,例如: G32,G34" )
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
	route("myOrderAction.do?method=resign", query);
	route("confirmPassengerResignAction.do?method=cancelOrderToQuery", query);

}, true);