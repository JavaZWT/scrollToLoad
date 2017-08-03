/**
 * create by ZWT at 2017-6-30
 * 
 * 
 * 这个版本修复了各种bug冲突
 * 
 * 码段代码压压惊。
 * 
 * 该插件必须在iscroll-probe.js 和 handlebars.js  加载后才可以使用
 * 该插件必须在iscroll-probe.js 和 handlebars.js  加载后才可以使用
 * 该插件必须在iscroll-probe.js 和 handlebars.js  加载后才可以使用
 * 
 * Vesion 2.0
 */

var ScrollToLoadFinal=function(options){
	
	var scroll={};
	/**
	 * 定义了一堆有用没用的对象(⊙o⊙)…
	 */
	
	scroll.o={};
	scroll.showCard = {};
	scroll.STArray=["requestUrl","scrollID","responseDataName","pageNum","pageSize","pageNumAdd","pageSizeAdd","offset_maxScrollY","template","viewContainer","height","loadMoreLi","loadMoreTips","preventDefaultException","scrollX"];
	scroll.initArray=["requestUrl","pageNum","pageSize","responseDataName","template","viewContainer"];
	/**
	 * 全局配置
	 */
	scroll.config = {
		requestUrl : '', // ajax请求url        必须给值
		scrollID : 'scrollCon',// 需要绑定scroll插件的div ID 默认 scrollCon
		responseDataName : '',// 返回的obj对象的name         必须给值
		pageNum : 1,// 页码,默认1
		pageSize : 10,// 页码，默认10
		pageNumAdd:1,//页码增量，默认1
		pageSizeAdd:10,//页数量增量，默认10
		offset_maxScrollY : 100,// myscroll底部偏移量 用于放置上拉加载更多   默认100
		template:'template-single',//单个模板的数组   两个数组长度须一致
		viewContainer:'template-all',//最后汇总的模板数组       两个数组长度须一致
		height:"200px",  //滑动结果div高度              必须给值
		loadMoreLi:"loadMoreLi",
		loadMoreTips:"loadMoreTips",
		preventDefaultException:{ tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },
		scrollX:false
	};
	
	/**
	 * 初始化数据
	 */
	
	scroll.init=function(){
	    options = options || {};
	    
	    $(scroll.STArray).each(function(index,element){
	    	scroll.o[element]=scroll.showCard.isNull(options[element])?scroll.config[element]:options[element];
	    });
	    
	    scroll.showCard.run();
	}
	
	/**
	 * 主程序function
	 */
	scroll.showCard.run=function(){
		var myScrollID = "#" + scroll.o.scrollID;
		
		// 进入页面计算距离用于滑动,必须在滑动加载之前
		changeHt();
		function changeHt() {
			var window_h = $("body").height();
			$(myScrollID).css({
				// 这个距离，一般取要显示的滑动div的距离
				"height" : window_h-scroll.o.height
			});
		}
		// 横竖屏切换时，重新计算距离
		$(window).resize(function() {
			changeHt();
		})
		
		/**
		 * 初始化滑动控件
		 * @type {any}
		 */
		scroll.o.myScroll = new IScroll(myScrollID, {
			probeType : 3,
			mouseWheel : true,
			offset_maxScrollY : scroll.o.offset_maxScrollY,
			preventDefaultException: scroll.o.preventDefaultException,
			scrollX:scroll.o.scrollX
		});
		scroll.showCard.initView();
		scroll.showCard.scrollToLoad();
	}
	
	
	/**
	 * 版本号(⊙o⊙)…
	 */
	scroll.version="2.0";
	
	/**
	 * 初始化滑动UI相关
	 */
	scroll.showCard.initView = function() {
		// 为结果列表添加事件 当滚动到底部时 读取数据
		scroll.o.myScroll.on('scroll', scroll.showCard.scrollToLoad);
	}
	
	/**
	 * 滑动加载更多
	 */
	scroll.showCard.scrollToLoad = function() {
		// 如果还有更多数据 则加载
		if ($('#'+scroll.o.loadMoreLi).data('fullFlag') != '1') {
			// 如果位移超过100 并且没有在加载数据则读取更多数据
			if (this.y < 0 && this.y - this.maxScrollY <= -100
					&& $('#'+scroll.o.loadMoreLi).data('loading') == '0') {
				$('#'+scroll.o.loadMoreLi).data('loading', '1');
				scroll.o.pageNum += scroll.o.pageNumAdd;// 页数一次加一
				//o.pageSize += o.pageSizeAdd;// 条数一次加10
				scroll.showCard.queryData();
			}
		}
	}
	
	/**
	 * ajax请求
	 */
	scroll.showCard.queryData = function(requestData,data,callback) {
		//十条数据bug问题
		scroll.o.tenBug=false;
		
		if(!scroll.showCard.isNull(data)){
			$(scroll.initArray).each(function(index,element){
				scroll.o[element]=scroll.showCard.isNull(data[element])?scroll.o[element]:data[element];
			});
		}
		scroll.o.requestData=scroll.showCard.isNull(requestData)?scroll.o.requestData:requestData;
		
		if(callback && (typeof callback === "function"))scroll.o.callback=callback;
		
		var page={
				pageNum:scroll.o.pageNum,
				pageSize:scroll.o.pageSize
		}
		scroll.o.requestDataFinal=scroll.showCard.mergeToJSON(scroll.o.requestData,page);
		console.log(scroll.o.requestDataFinal);
		sino.ajax({
			url : scroll.o.requestUrl,
			data : scroll.o.requestDataFinal,
			type : "post",
			// async : false,
			success : function(data) {
				scroll.showCard.showResult(data);
				if(scroll.o.callback && (typeof scroll.o.callback === "function")) scroll.o.callback();
			}
		});
	}
	
	/**
	 * 刷新位置
	 */
	scroll.refresh=function(){
		scroll.o.myScroll.refresh();
	}

	/**
	 * 展示获取到的数据
	 * @param data
	 */
	scroll.showCard.showResult = function(data) {
		var tempData = data[scroll.o.responseDataName];
		if (tempData) {
			var success = tempData.success;
			if (success == true) {
				var result = tempData.result;
				// 设置下拉指示器的值
				// 查询时，如果数据为10条则加载更多，不足10条认为没有更多数据
				if (result.length == 10) {
					scroll.showCard.showResult1();
					scroll.o.tenBug=true;
				} else {
					scroll.o.tenBug=false;
					scroll.showCard.showResult2();
				}
				scroll.showCard.createResultItem(result);
				scroll.o.myScroll.refresh();
			} else {
				//如果是true,说明查过数据，但正好10条，success为false，不用滑动后弹框，直接不查了
				if(scroll.o.tenBug==true){
					scroll.o.tenBug=false;
					scroll.showCard.showResult2();
				}else{
					switch(scroll.o.responseDataName){
					case "getInsuranceTrajectory":
						sino.alert(tempData.message);
						scroll.showCard.showResult3();
						break;
					case "queryBirthCustm":
						scroll.showCard.showResult3();
						break;
					default:
						sino.alert("请重新录入查询条件("+tempData.message+")!");
						scroll.showCard.showResult3();
						break;
					}
				}
				scroll.o.myScroll.refresh();
			}
		}
		$('#'+scroll.o.loadMoreLi).data('loading', '0');
	}
	/**
	 * 第一种，滑动加载更多
	 */
	scroll.showCard.showResult1=function(){
		$('#'+scroll.o.loadMoreTips).show();
		$('#'+scroll.o.loadMoreTips).html('加载更多数据');
		$('#'+scroll.o.loadMoreLi).data('fullFlag', '0');
		$('#'+scroll.o.loadMoreLi).css('display', 'block');
	}
	/**
	 * 第二种，没有更多数据
	 */
	scroll.showCard.showResult2=function(){
		$('#'+scroll.o.loadMoreTips).show();
		$('#'+scroll.o.loadMoreTips).html('没有更多数据');
		$('#'+scroll.o.loadMoreLi).data('fullFlag', '1');
		$('#'+scroll.o.loadMoreLi).css('display', 'block');
	}
	
	/**
	 * 第三种，没有更多数据！  就是连查都没查到
	 */
	scroll.showCard.showResult3=function(){
		$('#'+scroll.o.loadMoreTips).show();
		$('#'+scroll.o.loadMoreTips).html('没有查到数据!');
		$('#'+scroll.o.loadMoreLi).data('fullFlag', '1');
		$('#'+scroll.o.loadMoreLi).css('display', 'block');
	}
	/**
	 * 第四种   白版
	 */
	scroll.showCard.showResult4=function(){
		$('#'+scroll.o.loadMoreTips).hide();
		$('#'+scroll.o.loadMoreTips).html('没有查到数据!');
		$('#'+scroll.o.loadMoreLi).data('fullFlag', '1');
		$('#'+scroll.o.loadMoreLi).css('display', 'none');
	}
	
	/**
	 * 使用模板引擎创建列表数据
	 * @param data
	 */
	scroll.showCard.createResultItem = function(data) {
		var html = $("#"+scroll.o.template).toHtml(data); 
		$("#"+scroll.o.viewContainer).append(html); 
	}
	
	/**
	 * 校验对象是否合法
	 * @param data
	 * @returns {Boolean}
	 */
	scroll.showCard.isNull=function(data){
		return data==undefined||data=="undefined"||data==null||data=="null"||data==''||data.length==0;
	}
	
	/**
	 * 把两个json拼成一个json
	 * @param json
	 * @param json1
	 * @param json2
	 */
	scroll.showCard.mergeToJSON=function(json1,json2){
		var json={};
		for(var attr in json1){
			json[attr]=json1[attr];
		}
		for(var attr in json2){
			json[attr]=json2[attr];
		}
		return json;
	}
	
	/**
	 * 返回创建的对象
	 */
	
	return scroll;
};