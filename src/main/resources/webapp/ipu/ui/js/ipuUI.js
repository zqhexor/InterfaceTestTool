(function () {
  "use strict";

  function setup(jQuery, iScroll, Hammer, FastClick) {

    /**
     * @class ipuUI对象，通过此对象实例UI组件
     *
     */

    var ipuUI = {
      version: '0.2.2'
    };

// tap点击效果处理，只针对jquery上面的click事件，依赖touch事件
    (function (ipuUI, $) {
      var active = {};

      var defaultOption = {
        distanceAllow: 10,   // 最大移动距离，超过移除效果
        displayDelay: 100,  // 延时显示时间，以防止是滚动操作
        hideDelay: 120,     // 隐藏延时时间
        eventName: 'click', // 事件处理是click
        activeClass: 'ipu-active',   // 激活时的class
        getHandleNode: function (node) {  // 找到最先一级处理此click事件的元素
          if (!node || !node.nodeType) return;

          var distNode = null;
          var nodeArray = [];

          // 还有其它情形考虑，如a标签的跳转，或在原生元素添加事件属性的
          function findHander(inNode) {
            // 此方法适用于jquery, 1.12.4, 2.2.4, 3.2.1版本，_data方法以后可能会被移除。$.data是一些老版本写法
            var eventHandlers = ($._data || $.data)(inNode, 'events');

            if (eventHandlers) {
              eventHandlers = eventHandlers[option.eventName];
            }

            if (!eventHandlers) {
              return;
            }

            var thisNode = false;
            $.each(eventHandlers, function (index, handler) {
              if (handler.selector) {
                var objs = $(handler.selector, inNode);
                $.each(nodeArray, function (tIndex, tNode) {
                  if (objs.is(tNode)) {
                    distNode = tNode;
                    return false;
                  }
                });

                if (distNode) {
                  return false; //
                }
              } else {
                thisNode = true;  // 保存distNode，有可能有子节点满足条件，所以只保存此值为默认值
              }
            });

            if (thisNode && distNode == null) { // 如果没在子节点找到click事件，而当前节点又有click事件，就使用当前节点
              distNode = inNode;
            }

            return distNode;
          }

          while (!("tagName" in node) || !findHander(node)) {
            if (!node.parentNode || node.parentNode.nodeType != 1) {
              break;
            }
            nodeArray.push(node);
            node = node.parentNode;
          }

          return distNode;
        }
      };

      var option = defaultOption;

      function getOriginalEvent(e) {
        return e.originalEvent || e;
      }

      function getXY(e) {
        var x = e.touches ? e.touches[0].pageX : e.clientX;
        var y = e.touches ? e.touches[0].pageY : e.clientY;
        return [x, y];
      }

      //根据不同浏览器获取不同原生事件event
      var hasTouch = "ontouchstart" in window,
          START_EVENT = hasTouch ? 'touchstart' : 'mousedown',
          MOVE_EVENT = hasTouch ? 'touchmove' : 'mousemove',
          END_EVENT = hasTouch ? 'touchend' : 'mouseup',
          CANCEL_EVENT = hasTouch ? 'touchcancel' : '';

      $(function () {
        var startXY, tapEl, timeOutID;
        var dom = document.body;

        // force为false的时候，不用管timeOutID，在老的timeOutID未移除的情况下，有可能又产生了新的，
        // 导致else代码未被执行，导致老的点击元素class未被移除
        function removeClass(dom, force) {
          if (force && timeOutID) {
            window.clearTimeout(timeOutID);
          } else {
            $(dom).removeClass(option.activeClass);
          }
        }

        function removeActive(force) {
          if (force) {
            removeClass(tapEl, force);
          } else {
            window.setTimeout(removeClass, option.hideDelay, tapEl, force);
          }
          startXY = null;
          tapEl = null;
        }

        $(dom).bind(START_EVENT, function (e) {
          if (tapEl) {    // 多点接触时处理
            removeActive(true);
            return;
          }

          e = getOriginalEvent(e);
          startXY = getXY(e);
          tapEl = option.getHandleNode(e.target);

          if (tapEl) {
            timeOutID = window.setTimeout(function (dom) {
              timeOutID = null;
              $(dom).addClass(option.activeClass);
            }, option.displayDelay, tapEl);
          }
        });

        $(dom).bind(MOVE_EVENT, function (e) {
          if (!tapEl) {
            return;
          }

          e = getOriginalEvent(e);

          var xy = getXY(e);
          if (startXY && (Math.abs(xy[0] - startXY[0]) > option.distanceAllow || Math.abs(xy[1] - startXY[1]) > option.distanceAllow)) {
            removeActive(true);
          }
        });

        $(dom).bind(END_EVENT, function (e) {
          if (tapEl) {
            removeActive();
          }
        });

        // 手机来电等非用户取消操作时触发事件
        if (CANCEL_EVENT) {
          $(dom).bind(CANCEL_EVENT, function (e) {
            if (tapEl) {
              removeActive();
            }
          });
        }
      });

      // 更新默认值
      active.setOption = function (opts) {
        option = this.option = $.extend({}, defaultOption, opts);
      };
      ipuUI.active = active;
    })(ipuUI || window, jQuery);


    (function (ipuUI, $, iscroll) {

      /**
       * @uses IScroll.js
       * @class 简单封装IScroll.js的snap功能，实现banner功能
       * @private 可以使用hammerCarousel代替
       *
       *     @example
       *     <!-- 组件html结构如下，li里的内容用户可自定义  -->
       *     <div class="ipu-carousel">
       *       <ul class="ipu-carousel-wrapper">
       *         <li ><img src="../../biz/img/01.jpg" alt=""></li>
       *         <li ><img src="../../biz/img/02.jpg" alt=""></li>
       *         <li ><img src="../../biz/img/03.jpg" alt=""></li>
       *         <li ><img src="../../biz/img/04.jpg" alt=""></li>
       *       </ul>
       *     </div>
       *
       * @constructor 不能直接访问该类，使用ipuUI.carousel(slt, option)生成实例 {@link ipuUI#carousel}
       * @param {Dom|JqueryObj|String} slt jquery对象或者jquery选择器或Dom元素
       * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
       *
       */
      function Carousel(slt, option) {
        this.option = option = $.extend({}, this.defaultOption, option);
        this.el = $(slt).eq(0);  // 一次只能实例化一个
        this.autoPlay = option.autoPlay;
        this.hasIndicator = option.indicator;
        this.callBack = option.callBack;
        this.currentIndex = null;

        this._init();
        this.play();
      }

      Carousel.prototype = {
        /**
         * 组件默认配置项
         *
         * @cfg {Object} defaultOption
         * @cfg {Number} defaultOption.index 默认显示的项
         * @cfg {Boolean} defaultOption.autoPlay 是否自动播放
         * @cfg {Number} defaultOption.duration 自动播放间隔，单位ms
         * @cfg {Boolean} defaultOption.indicator 是否生成指示器
         * @cfg {Function} defaultOption.callBack 切换显示时的回调函数
         * @cfg {Number} defaultOption.callBack.index 当前显示项索引
         *
         */
        defaultOption: {
          index: null,            // 默认显示索引，未设置时先查找对就active,未找到时是0
          autoPlay: false,       //  是否自动播放
          duration: 3000,         //  自动播放延时
          indicator: false,       // 是否生成指示器
          callBack: null           // 变更时回调函数
        },
        _init: function () {
          var wrapper = $(">.ipu-carousel-wrapper", this.el);
          var carouselItems = $(">li", wrapper);
          this.carouselItems = carouselItems;
          this.size = carouselItems.size();
          var that = this;

          if (this.option.index == null) {
            var activeIndex = carouselItems.filter(".ipu-current").index();
            this.option.index = activeIndex != -1 ? activeIndex : 0;
          }

          if (this.hasIndicator) {
            this._addIndicator();
          }

          $(window).resize(function () {
            that.refresh();
            that.show(that.currentIndex, 0);
          });

          var scrollOpt = {
            snap: "li",          // carousel效果
            momentum: false,     // 移除惯性处理
            scrollX: true,       // X轴移动
            scrollY: false,
            hScrollbar: false,   // 没有纵向滚动条
            onScrollStart: function () {
              that._pause();
            },
            onTouchEnd: function () {
            },
            onScrollEnd: function () {
              that._end();
            }
          };
          this.iscroll = new iscroll(this.el.get(0), scrollOpt);
          this.show(this.option.index, 0);
        },
        /**
         * 停止自动播放
         */
        stop: function () {
          this._pause();
          this.autoPlay = false;
        },
        _pause: function () {
          if (this.autoPlay && this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }
        },
        /**
         * 显示上一项
         */
        prev: function () {
          var index = this.currentIndex == 0 ? this.size - 1 : this.currentIndex - 1;
          this.show(index);
        },
        /**
         * 显示下一项
         */
        next: function () {
          var index = this.currentIndex == this.size - 1 ? 0 : this.currentIndex + 1;
          this.show(index);
        },
        /**
         * 显示索引index对应的索
         *
         * @param {Number} index 显示项索引
         */
        show: function (index, time) {
          this._pause();
          this.iscroll.scrollToPage(index, 0, time);
        },
        /**
         * 开始自动播放
         */
        play: function () {
          this.autoPlay = true;
          this._play();
        },
        /**
         * 若窗口发生大小变更，调用此方法更新位移
         */
        refresh: function () {
          this.show(this.currentIndex);
        },
        _play: function () {
          if (this.autoPlay && !this.timeoutId) {
            var that = this;
            this.timeoutId = setTimeout(function () {
              that.timeoutId = null;
              that.next();
            }, that.option.duration);
          }
        },
        _end: function () {
          var currentIndex = this.iscroll.currPageX;
          if (currentIndex != this.currentIndex) {
            if (this.callBack) {
              this.callBack(currentIndex, this.currentIndex);
            }
            this.currentIndex = currentIndex;

            if (this.hasIndicator) {
              this.indicatorIndexs.eq(currentIndex).addClass("ipu-current").siblings().removeClass("ipu-current");
            }
            this.carouselItems.eq(currentIndex).addClass("ipu-current").siblings().removeClass("ipu-current");
          }
          this._play();
        },
        _addIndicator: function () {
          var html = "";
          for (var i = 0; i < this.size; i++) {
            html += "<li></li>";
          }
          html = "<ul class='ipu-carousel-indicator'>" + html + "</ul>";
          this.indicator = $(html).appendTo(this.el);
          this.indicatorIndexs = $("li", this.indicator);
        },
        destroy: function () {
          // 自己怎么销毁，相关事件移除？？
          this.iscroll.destroy();
        }
      };

      /**
       * @member ipuUI
       * 生成Carousel实例，参数信息见{@link Carousel#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {Carousel}
       */
      ipuUI.carousel = function (slt, option) {
        return new Carousel(slt, option);
      };

    })(ipuUI || window, jQuery, iScroll);

// todo:添加判断平台如mobile ,tablet, pc，参考其它类似功能库，添加webview判断
    (function (ipuUI, $) {
      var device = {};  // Classes
      var classNames = [];
      var ua = navigator.userAgent;

      var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
      var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
      var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
      var iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/);

      device.ios = device.android = device.iphone = device.ipad = device.androidChrome = false;


      // Android
      if (android) {
        device.os = 'android';
        device.osVersion = android[2];
        device.android = true;
        device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
      }
      if (ipad || iphone || ipod) {
        device.os = 'ios';
        device.ios = true;
      }
      // iOS
      if (iphone && !ipod) {
        device.osVersion = iphone[2].replace(/_/g, '.');
        device.iphone = true;
      }
      if (ipad) {
        device.osVersion = ipad[2].replace(/_/g, '.');
        device.ipad = true;
      }
      if (ipod) {
        device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
        device.iphone = true;
      }
      // iOS 8+ changed UA
      if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
        if (device.osVersion.split('.')[0] === '10') {
          device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
        }
      }

      // Pixel Ratio
      device.pixelRatio = window.devicePixelRatio || 1;
      classNames.push('pixel-ratio-' + Math.floor(device.pixelRatio));
      if (device.pixelRatio >= 2) {
        classNames.push('retina');
      }

      // OS classes
      if (device.os) {
        classNames.push(device.os, device.os + '-' + device.osVersion.split('.')[0], device.os + '-' + device.osVersion.replace(/\./g, '-'));
        if (device.os === 'ios') {
          var major = parseInt(device.osVersion.split('.')[0], 10);
          for (var i = major - 1; i >= 6; i--) {
            classNames.push('ios-gt-' + i);
          }
        }
      }

      device.wx = /MicroMessenger/i.test(ua);  // 是否微信
      device.ipu = /ipumobile/i.test(ua);         // 是否ipu环境运行

      if (device.wx) {
        classNames.push('wx');
      }
      if (device.ipu) {
        classNames.push('ipu');
      }

      var classPrev = "ipu-";

      // Add html classes
      if (classNames.length > 0) {
        $('html').addClass(classPrev + classNames.join(' ' + classPrev));
      }

      ipuUI.device = device;
    })(ipuUI || window, jQuery);

// dtPicker  此版本最大值与最小值，存在问题，当时间跨过一天时
// show方法调用时，若没有值，则为当前值，还是有值就不变动了，点了确认按钮后，就不再变动了
// 日期范围的选择处理
// 不选择字符串连接符，合并后占空间

    (function (ipuUI, $) {
      var Picker = ipuUI.Picker;
      var defaultPickerDate = new Date();   // 有些时间不齐全。如time，需要一个默认日期来协助运算

      /**
       * @class 日期选择器，替代默认的web日历选择，日期格式如下<br>
       * type=datetime：yyyy-mm-dd hh:mi<br>
       * type=date：yyyy-mm-dd<br>
       * type=time： hh:mi<br>
       * type=month： yyyy-mm<br>
       * type=hour： yyyy-mm-dd hh<br>
       *
       * @constructor 不能直接访问该，调用{@link ipuUI#dtPicker}生成实例
       * @param {object} option 组件参数，默认配置见 {@link #cfg-defaultOption}
       */
      function DtPicker(option) {
        this.option = $.extend({}, this.defaultOption, option);

        if (!Picker) {
          Picker = ipuUI.Picker;
        }
        this._init();
      }

      /**
       * 组件默认配置项
       *
       * @cfg {Object} defaultOption=
       * @cfg {String} defaultOption.template 组件模板html，不建议变更
       * @cfg {[String]} defaultOption.buttons=['取消', '确认', '清除'] 按钮名称
       * @cfg {[String]} defaultOption.labels=['年', '月', '日', '时', '分'] 年月日标签
       * @cfg {datetime|time|date|hour|month} defaultOption.type='datetime' 日期类型
       * @cfg {Boolean} defaultOption.hasClear=false 是否显示清除按钮
       * @cfg {Date} defaultOption.beginDate=null 日期开始时间，默认设置为当时间前5年
       * @cfg {Date} defaultOption.endDate=null 日期结束时间，默认设置为开始时间后10年
       * @cfg {Function} defaultOption.callBack=null 点击按钮时的回调函数，回调的参数同{@link #show show()}法设置 的回调
       */
      DtPicker.prototype.defaultOption = {
        template: ''
        + '<div class="ipu-poppicker ipu-dtpicker">'
        + ' <div class="ipu-poppicker-header">'
        + '   <button class="ipu-btn ipu-btn-s ipu-poppicker-btn-cancel">取消</button>'
        + '   <button class="ipu-btn ipu-btn-s ipu-poppicker-btn-ok">确定</button>'
        + '   <button class="ipu-btn ipu-btn-s ipu-poppicker-btn-clear">清除</button>'
        + ' </div>'
        + ' <div class="ipu-poppicker-title">'
        + '   <label class="ipu-dtpicker-y"></label>'
        + '   <label class="ipu-dtpicker-m"></label>'
        + '   <label class="ipu-dtpicker-d"></label>'
        + '   <label class="ipu-dtpicker-h"></label>'
        + '   <label class="ipu-dtpicker-mi"></label>'
        + ' </div>'
        + ' <div>'
        + '   <div class="ipu-poppicker-body">'
        + '     <div class="ipu-picker" data-id="picker-y">'
        + '     <div class="ipu-picker-selectbox"></div>'
        + '     <ul></ul>'
        + '   </div>'
        + '   <div class="ipu-picker" data-id="picker-m">'
        + '     <div class="ipu-picker-selectbox"></div>'
        + '     <ul></ul>'
        + '   </div>'
        + '   <div class="ipu-picker" data-id="picker-d">'
        + '     <div class="ipu-picker-selectbox"></div>'
        + '     <ul></ul>'
        + '   </div>'
        + '   <div class="ipu-picker" data-id="picker-h">'
        + '     <div class="ipu-picker-selectbox"></div>'
        + '     <ul></ul>'
        + '   </div>'
        + '   <div class="ipu-picker" data-id="picker-mi">'
        + '     <div class="ipu-picker-selectbox"></div>'
        + '     <ul></ul>'
        + '   </div>'
        + ' </div>'
        + '</div>',
        buttons: ['取消', '确认', '清除'],
        labels: ['年', '月', '日', '时', '分'],
        type: 'datetime',
        customData: {},
        hasClear: false,
        beginDate: null,
        endDate: null,
        callBack: null
      };

      DtPicker.prototype._init = function () {
        var self = this;
        this.mask = this.createMask();

        var _picker = this.holder = $(this.option.template).appendTo("body");
        var ui = self.ui = {
          picker: this.holder,
          ok: $('.ipu-poppicker-btn-ok', _picker),
          cancel: $('.ipu-poppicker-btn-cancel', _picker),
          clear: $('.ipu-poppicker-btn-clear', _picker),
          buttons: $('.ipu-poppicker-header .ipu-btn', _picker),
          labels: $('.ipu-poppicker-title label', _picker)
        };


        ui.i = new Picker($('[data-id="picker-mi"]', _picker), {listen: false}); // 分钟变更无需要处理

        ui.h = new Picker($('[data-id="picker-h"]', _picker), {         // 小时变更，有最小值或最大值，需要变更分钟
          listen: false,
          onChange: function (item, index) {
            if (index !== null && (self.option.beginMonth || self.option.endMonth)) {
              self._createMinutes();
            }
          }
        });

        ui.d = new Picker($('[data-id="picker-d"]', _picker), { //仅提供了beginDate时，触发day,hours,minutes的change
          listen: false,
          onChange: function (item, index) {
            if (index !== null && (self.option.beginMonth || self.option.endMonth)) {
              self._createHours();
            }
          }
        });

        ui.m = new Picker($('[data-id="picker-m"]', _picker), { // 月变更时，总要变更day
          listen: false,
          onChange: function (item, index) {
            if (index !== null) {
              self._createDay();
            }
          }
        });

        ui.y = new Picker($('[data-id="picker-y"]', _picker), { // 年发生变更，如果没有结束月，此时有所有的月，是不需要变更月的，只需要变更day
          listen: false,
          onChange: function (item, index) {
            if (index != null) {
              if (self.option.beginMonth || self.option.endMonth) {
                self._createMonth();
              } else {
                self._createDay();
              }
            }
          }
        });


        self._create();

        //设定label
        self._setLabels();
        self._setButtons();
        //设定类型
        ui.picker.attr('data-type', this.option.type);

        //设定默认值

        self._setSelectedValue(this.option.value);

        //防止滚动穿透 TODO:待确认情况
        /* self.ui.picker.addEventListener($.EVENT_START, function (event) {
         event.preventDefault();
         }, false);
         self.ui.picker.addEventListener($.EVENT_MOVE, function (event) {
         event.preventDefault();
         }, false);*/
      };

      /**
       * 返回当前选中的日期，只有在点确认时，返回的才是正确的值，在点清除、或取消后，调用此方法返回的值不可控
       *
       * @return 选择的日期信息
       * @return {datetime|time|date|hour|month} return.type 日期类型
       * @return {String} return.text  日期文本（text字段）拼接，格式yyyy-mm-dd hh:mi 根据上面的日期类型返回对应字符串
       * @return {String} return.value 日期项值（value字段）拼接
       * @return {Object} return.y 选择的年项
       * @return {Object} return.m 选择的月项
       * @return {Object} return.d 选择的日项
       * @return {Object} return.h 选择的时项
       * @return {Object} return.i 选择的分项
       * @return {Function} return.toString 返回value字段的值
       */
      DtPicker.prototype.getSelected = function () {
        var self = this;
        var ui = self.ui;
        var type = self.option.type;
        var selected = {
          type: type,
          y: ui.y.getSelectedItem(),
          m: ui.m.getSelectedItem(),
          d: ui.d.getSelectedItem(),
          h: ui.h.getSelectedItem(),
          i: ui.i.getSelectedItem(),
          toString: function () {
            return this.value;
          }
        };
        switch (type) {
          case 'datetime':
            selected.value = selected.y.value + '-' + selected.m.value + '-' + selected.d.value + ' ' + selected.h.value + ':' + selected.i.value;
            selected.text = selected.y.text + '-' + selected.m.text + '-' + selected.d.text + ' ' + selected.h.text + ':' + selected.i.text;
            break;
          case 'date':
            selected.value = selected.y.value + '-' + selected.m.value + '-' + selected.d.value;
            selected.text = selected.y.text + '-' + selected.m.text + '-' + selected.d.text;
            break;
          case 'time':
            selected.value = selected.h.value + ':' + selected.i.value;
            selected.text = selected.h.text + ':' + selected.i.text;
            break;
          case 'month':
            selected.value = selected.y.value + '-' + selected.m.value;
            selected.text = selected.y.text + '-' + selected.m.text;
            break;
          case 'hour':
            selected.value = selected.y.value + '-' + selected.m.value + '-' + selected.d.value + ' ' + selected.h.value;
            selected.text = selected.y.text + '-' + selected.m.text + '-' + selected.d.text + ' ' + selected.h.text;
            break;
        }
        return selected;
      };

      DtPicker.prototype._setSelectedValue = function (value) {
        var self = this;
        var ui = self.ui;

        if (!value) {
          if (this.option.type == 'time') {
            value = '00:00';
          } else {
            value = defaultPickerDate.getFullYear() + '-' + (defaultPickerDate.getMonth() + 1) + '-' + defaultPickerDate.getDate() + ' '
                + defaultPickerDate.getHours() + ':' + defaultPickerDate.getMinutes();
          }
        }
        var parsedValue = self._parseSetValue(value);

        ui.y.setListen(true);
        ui.m.setListen(false);
        ui.d.setListen(false);
        ui.h.setListen(false);
        ui.i.setListen(false);
        ui.y.setSelectedValue(parsedValue.y);

        ui.m.setListen(true);
        ui.m.setSelectedValue(parsedValue.m);

        ui.d.setListen(true);
        ui.d.setSelectedValue(parsedValue.d);

        ui.h.setListen(true);
        ui.h.setSelectedValue(parsedValue.h);

        ui.i.setListen(true);
        ui.i.setSelectedValue(parsedValue.i);

        this.value = this.getSelected().value;
      };

      /**
       * 设置日期值，value为字符串时，格式请参照 yyyy-mm-dd hh:mi具体格式与配置项type相关
       *
       * @param {String|Date} value
       */
      DtPicker.prototype.setSelectedValue = function (value) {
        this._setSelectedValue(value);
      };

      /**
       * 是否润年
       *
       * @param {Number} year 年份
       * @returns {Boolean}
       */
      DtPicker.prototype.isLeapYear = function (year) {
        return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
      };

      DtPicker.prototype._inArray = function (array, item) {
        for (var index in array) {
          var _item = array[index];
          if (_item === item) return true;
        }
        return false;
      };

      DtPicker.prototype.getDayNum = function (year, month) {
        var self = this;
        if (self._inArray([1, 3, 5, 7, 8, 10, 12], month)) {
          return 31;
        } else if (self._inArray([4, 6, 9, 11], month)) {
          return 30;
        } else if (self.isLeapYear(year)) {
          return 29;
        } else {
          return 28;
        }
      };

      DtPicker.prototype._fill = function (num) {
        num = num.toString();
        if (num.length < 2) {
          num = 0 + num;
        }
        return num;
      };

      DtPicker.prototype._isBeginYear = function () {
        return this.option.beginYear === parseInt(this.ui.y.getSelectedValue());
      };

      DtPicker.prototype._isBeginMonth = function () {
        return this.option.beginMonth && this._isBeginYear() && this.option.beginMonth === parseInt(this.ui.m.getSelectedValue());
      };

      DtPicker.prototype._isBeginDay = function () {
        return this._isBeginMonth() && this.option.beginDay === parseInt(this.ui.d.getSelectedValue());
      };

      DtPicker.prototype._isBeginHours = function () {
        return this._isBeginDay() && this.option.beginHours === parseInt(this.ui.h.getSelectedValue());
      };

      DtPicker.prototype._isEndYear = function () {
        return this.option.endYear === parseInt(this.ui.y.getSelectedValue());
      };

      DtPicker.prototype._isEndMonth = function () {
        return this.option.endMonth && this._isEndYear() && this.option.endMonth === parseInt(this.ui.m.getSelectedValue());
      };

      DtPicker.prototype._isEndDay = function () {
        return this._isEndMonth() && this.option.endDay === parseInt(this.ui.d.getSelectedValue());
      };

      DtPicker.prototype._isEndHours = function () {
        return this._isEndDay() && this.option.endHours === parseInt(this.ui.h.getSelectedValue());
      };

      DtPicker.prototype._createYear = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;

        //生成年列表
        var yArray = [];
        if (option.customData.y) {
          yArray = option.customData.y;
        } else {
          var yBegin = option.beginYear;
          var yEnd = option.endYear;
          for (var y = yBegin; y <= yEnd; y++) {
            yArray.push({
              text: y + '',
              value: y
            });
          }
        }
        ui.y.setItems(yArray);
      };

      DtPicker.prototype._createMonth = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;

        //生成月列表
        var mArray = [];
        if (option.customData.m) {
          mArray = option.customData.m;
        } else {
          var m = option.beginMonth && self._isBeginYear() ? option.beginMonth : 1;
          var maxMonth = option.endMonth && self._isEndYear() ? option.endMonth : 12;
          for (; m <= maxMonth; m++) {
            var val = self._fill(m);
            mArray.push({
              text: val,
              value: m
            });
          }
        }
        ui.m.setItems(mArray);
      };

      DtPicker.prototype._createDay = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;

        //生成日列表
        var dArray = [];
        if (option.customData.d) {
          dArray = option.customData.d;
        } else {
          var d = self._isBeginMonth() ? option.beginDay : 1;
          var maxDay = self._isEndMonth() ? option.endDay : self.getDayNum(parseInt(this.ui.y.getSelectedValue()), parseInt(this.ui.m.getSelectedValue()));
          for (; d <= maxDay; d++) {
            var val = self._fill(d);
            dArray.push({
              text: val,
              value: d
            });
          }
        }
        ui.d.setItems(dArray);
        //current = current || ui.d.getSelectedValue();
        //ui.d.setSelectedValue(current);
      };

      DtPicker.prototype._createHours = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;
        //生成时列表
        var hArray = [];
        if (option.customData.h) {
          hArray = option.customData.h;
        } else {
          var h = self._isBeginDay() ? option.beginHours : 0;
          var maxHours = self._isEndDay() ? option.endHours : 23;
          for (; h <= maxHours; h++) {
            var val = self._fill(h);
            hArray.push({
              text: val,
              value: h
            });
          }
        }
        ui.h.setItems(hArray);
        //ui.h.setSelectedValue(current);
      };

      DtPicker.prototype._createMinutes = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;

        //生成分列表
        var iArray = [];
        if (option.customData.i) {
          iArray = option.customData.i;
        } else {
          var i = self._isBeginHours() ? option.beginMinutes : 0;
          var maxMinutes = self._isEndHours() ? option.endMinutes : 59;
          for (; i <= maxMinutes; i++) {
            var val = self._fill(i);
            iArray.push({
              text: val,
              value: i
            });
          }
        }
        ui.i.setItems(iArray);
        //ui.i.setSelectedValue(current);
      };

      DtPicker.prototype._setLabels = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;
        ui.labels.each(function (i, label) {
          label.innerText = option.labels[i];
        });
      };

      DtPicker.prototype._setButtons = function () {
        var self = this;
        var option = self.option;
        var ui = self.ui;
        ui.cancel.text(option.buttons[0]);
        ui.ok.text(option.buttons[1]);

        if (option.hasClear) {
          ui.clear.text(option.buttons[2])
        } else {
          ui.clear.hide();
        }

        ui.buttons.each(function (index) {
          $(this).click(function () {
            self.clickCall(index);
          })
        })
      };

      // 解析设置的值，目前是字符串，完整日期格式 2012-12-12 12:21
      // 对于time类型时，或未完整的时间值，使用defaultPickerDate来填充
      DtPicker.prototype._parseSetValue = function (value) {
        var now = defaultPickerDate;
        var type = this.option.type;

        var rs = {
          y: now.getFullYear(),
          m: now.getMonth() + 1,
          d: now.getDate(),
          h: now.getHours(),
          i: now.getMinutes()
        };

        if (value instanceof Date) {
          if (type == 'time') {
            value = value.getHours() + ":" + value.getMinutes();
          } else {
            value = value.getFullYear() + '-' + (value.getMonth() + 1) + '-' + value.getDate() + ' '
                + value.getHours() + ":" + value.getMinutes();
          }
        }

        var parts = value.replace(":", "-").replace(" ", "-").split("-");
        for (var i = 0, j = parts.length; i < j; i++) {
          parts[i] = parseInt(parts[i]);
        }

        if (type == 'datetime') {
          rs.y = parts[0];
          rs.m = parts[1];
          rs.d = parts[2];    //
          rs.h = parts[3];    //
          rs.i = parts[4];
        } else if (type == 'date') {
          rs.y = parts[0];
          rs.m = parts[1];
          rs.d = parts[2];    //
          rs.h = 0;    //
          rs.i = 0;
        } else if (type == 'time') {
          rs.h = parts[0];    //
          rs.i = parts[1];
        } else if (type == 'hour') {
          rs.y = parts[0];
          rs.m = parts[1];
          rs.d = parts[2];    //
          rs.h = parts[3];    //
          rs.i = 0;
        } else if (type == 'month') {
          rs.y = parts[0];
          rs.m = parts[1];
          rs.d = 1;    //
          rs.h = 0;    //
          rs.i = 0;
        }

        return rs;
      };

      // 生成日期数据
      DtPicker.prototype._create = function () {
        var self = this;
        var option = this.option;
        var now = defaultPickerDate;
        var beginDate = option.beginDate;

        if (beginDate) {  // 若有设置开始日期
          beginDate = this._parseSetValue(beginDate);
          option.beginYear = beginDate.y;
          option.beginMonth = beginDate.m;
          option.beginDay = beginDate.d;
          option.beginHours = beginDate.h;
          option.beginMinutes = beginDate.i;
        } else if (option.type == 'time') { // 未设置开始日期，但日期格式是time
          option.beginYear = now.getFullYear();
          option.beginMonth = now.getMonth() + 1;
          option.beginDay = now.getDate();
          option.beginHours = 0;
          option.beginMinutes = 0;
        } else {
          option.beginYear = now.getFullYear() - 5;   // 其它，未设置开始日期，type也不为time，设置默认起始时间
        }

        var endDate = option.endDate;
        if (endDate) { //设定了结束日期
          endDate = this._parseSetValue(endDate);
          option.endYear = endDate.y;
          option.endMonth = endDate.m;
          option.endDay = endDate.d;
          option.endHours = endDate.h;
          option.endMinutes = endDate.i;
        } else if (option.type == 'time') {
          option.endYear = now.getFullYear();
          option.endMonth = now.getMonth() + 1;
          option.endDay = now.getDate();
          option.endHours = 23;
          option.endMinutes = 59;
        } else {
          option.endYear = option.beginYear + 10;
        }

        //生成
        self._createYear();
        self._createMonth();
        self._createDay();
        self._createHours();
        self._createMinutes();
      };

      /**
       * 设置组件日期范围
       *
       * @param {String|Date} beginDate 开始时间
       * @param {Stirng|Date} endDate 结束时间
       */
      DtPicker.prototype.setDateRange = function (beginDate, endDate) {
        this.option.beginDate = beginDate;
        this.option.endDate = endDate;
        this._create();
      };

      /**
       * 设置开始组件的开始据时间
       * @param {String|Date} date
       */
      DtPicker.prototype.setBeginDate = function (date) {
        this.option.beginDate = date;
        this._create();
      };

      /**
       * 设置组件的结束时间
       *
       * @param {String|Date} date
       */
      DtPicker.prototype.setEndDate = function (date) {
        this.option.endDate = date;
        this._create();
      };

      DtPicker.prototype.dispose = function () {
        var self = this;
        self.hide();
        setTimeout(function () {
          self.ui.picker.parentNode.removeChild(self.ui.picker);
          for (var name in self) {
            self[name] = null;
            delete self[name];
          }
          self.disposed = true;
        }, 300);
      };

      /**
       * 显示组件
       *
       * @param {Function} callBack 点击按钮时的回调函数，设置此参数会覆盖初始化时的回调函数
       * @param {Object} callBack.sltDate 当前选中的日期信息，具体格式，见方法{@link #getSelected getSelected()}的返回
       * @param {Number} callBack.index 被点击的按钮索引，0取消，1确认，2清除
       */
      DtPicker.prototype.show = function (callBack) {
        if (callBack) {
          this.option.callBack = callBack;
        }
        this.mask.show();
        this.setSelectedValue(this.value);
        this.holder.addClass("ipu-current");
      };

      DtPicker.prototype.clickCall = function (index) {
        var self = this;
        var sltDate = self.getSelected();
        var rs = self.option.callBack.call(this, sltDate, index);
        if (rs !== false) {
          if (index == 1) { // 假定确认按钮在第二个位置，传回true则存储当前值
            self.value = sltDate.value;
          } else if (index == 2) {
            self.value = null;
          }
          self.hide();
        }
      };

      /**
       * 隐藏组件
       */
      DtPicker.prototype.hide = function () {
        this.mask.close();
        this.holder.removeClass("ipu-current");
      };

      // 应该移除callback参数，提取出业成一个工具方法
      DtPicker.prototype.createMask = function (callback) {
        var self = this;
        var element = document.createElement('div');
        element.classList.add("ipu-picker-backup");
        //element.addEventListener($.EVENT_MOVE, $.preventDefault);
        element.addEventListener('click', function () {
          self.clickCall(0);
        });
        var mask = [element];
        mask._show = false;
        mask.show = function () {
          mask._show = true;
          element.setAttribute('style', 'opacity:1');
          document.body.appendChild(element);
          return mask;
        };
        mask._remove = function () {
          if (mask._show) {
            mask._show = false;
            element.setAttribute('style', 'opacity:0');
            setTimeout(function () {
              var body = document.body;
              element.parentNode === body && body.removeChild(element);
            }, 350);
          }
          return mask;
        };
        mask.close = function () {
          if (mask._show) {
            if (callback) {
              if (callback() !== false) {
                mask._remove();
              }
            } else {
              mask._remove();
            }
          }
        };
        return mask;
      };

      /**
       * @member ipuUI
       * 生成DtPicker实例，参数信息见{@link DtPicker#method-constructor}
       *
       * @param {Object} option
       * @returns {DtPicker}
       */
      ipuUI.dtPicker = function (option) {
        return new DtPicker(option);
      };
    })(ipuUI || window, jQuery);

// 更新方法和属性命名
// 不能支持元素隐藏时，使用百比分处理移动距离。。。？
// 支持两个以内容同时显示
// 支持类似snap实现
// 上下移动？
// 理想是移除carousel.js的实现，用hammerCarousel.js实现所有相关功能
// indicatorPosition: 'center',  // left|right|center;暂不支持，不知道怎么支持在中间显示，用全宽度，配合point-event:none,可能ok，参考humUI和mui

    (function (ipuUI, $, Hammer) {
      /**
       * @class
       * @uses Hammer.js
       * 通过hammer.js实现的banner功能组件，
       * 因为实现轮播，显示第一项后，再显示第一项，所以第一项有被复制到添加到最后
       *
       *        @example
       *        <!-- 组件html结构如下，li里的内容用户可自定义  -->
       *        <div class="ipu-carousel ipu-hammer-carousel">
       *          <ul class="ipu-carousel-wrapper">
       *            <li ><img src="../../biz/img/01.jpg" alt=""></li>
       *            <li ><img src="../../biz/img/02.jpg" alt=""></li>
       *            <li ><img src="../../biz/img/03.jpg" alt=""></li>
       *            <li ><img src="../../biz/img/04.jpg" alt=""></li>
       *          </ul>
       *        </div>
       *
       * @constructor  不能直接访问该类，调用 {@link ipu#hammerCarousel}生成实例
       * @param {String|JqueryObj} slt
       *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
       */
      function HammerCarousel(slt, option) {
        this.option = $.extend({}, this.defaultOption, option);
        this.el = $(slt).get(0);
        this._init();
      }

      $.extend(HammerCarousel.prototype, {
        /**
         * 组件默认配置项
         *
         * @cfg {Object} defaultOption
         * @cfg {Number} defaultOption.index 初始化时显示第几项，用户未指定时，会查找子项内容上有ipu-current的项显示，默认显示第一项
         * @cfg {Boolean} defaultOption.loop 是否循环切换，只有轮播切换时，才能自动轮播
         * @cfg {Boolean} defaultOption.autoPlay 是否自动轮播
         * @cfg {Number} defaultOption.duration 自动轮播时的间隔时间，单位ms
         * @cfg {Boolean} defaultOption.indicator 是否生成banner提示器，true右下角出现小点
         * @cfg {Function} defaultOption.callBack 轮播显示某项时的回调函数
         * @cfg {Number} defaultOption.callBack.index 当前显示的项索引
         * @cfg {Function} defaultOption.clickBack
         *          切换项时被点击时的回调函数，此处主要是为了处理复制项与第一项的点击事件进行处理，
         *          让用户不关注点击的是第一项或是复制项，回调作用域为组件对象
         * @cfg {Number} defaultOption.clickBack.index 点击的项索引
         */
        defaultOption: {
          index: null,
          loop: true,
          autoPlay: false,
          duration: 3000,
          indicator: false,
          callBack: null,
          clickBack: null
        },
        _init: function () {
          this.wrapper = $(">.ipu-carousel-wrapper", this.el);
          this.carouselItems = $(">li", this.wrapper);
          this.itemSize = this.carouselItems.size();  // 子项数量

          this.showItemSize = 1; // 假设一屏默认显示1个，所以做循环显示只需要复制一个子项
          this.carouselItemWides = []; // 子项宽度尺寸

          /** @property {Number} 当前显示子项索引，从0开始 */
          this.currentIndex = 0; // 当前显示子项索引
          this.moveLen = 0;      // 当前滚动移动距离

          /** @type {Boolean} 循环展示时，第一项会被复制，显示项是第一项时，是否为第一项的复制项 */
          this.cloneItem = false; // index是0的时候，有可能显示的是第一项，也有可能显示的是复制项，这个参数用来标记是否复制项

          if (this.option.indicator) {
            this._addIndicator();
          }

          // 如果做循环展示，则要复制起始展示项到最后面
          if (this.option.loop) {
            this.carouselItems.slice(0, this.showItemSize).clone().appendTo(this.wrapper);  // 这里假设每个元素宽度都是相等的
          }

          var that = this;
          if (this.option.clickBack) {
            $(">li", this.wrapper).each(function (i) {
              $(this).click(function () {
                that.option.clickBack.call(this, i % that.size);
              });
            })
          }

          this.hammer = new Hammer.Manager(this.el);
          this.hammer.add(new Hammer.Pan({direction: Hammer.DIRECTION_HORIZONTAL, threshold: 10}));
          this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this._onPan, this));

          this._sizeCount();
          $(window).resize(function () { // 在窗口尺寸变化时，更新尺寸信息
            that.refresh();
          });

          if (this.option.index == null) {
            var activeIndex = this.carouselItems.filter(".ipu-current").index();
            this.currentIndex = activeIndex != -1 ? activeIndex : 0;
          }

          this.show(this.currentIndex, false);
        },
        /**
         * 停止自动滚动
         */
        stop: function () {
          this._pause();
          this.option.autoPlay = false;
        },
        _pause: function () {
          if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
          }
        },
        /**
         * 切换到上一项
         */
        prev: function () {
          var index;
          if (this.option.loop) {
            index = this.currentIndex == 0 ? this.itemSize - 1 : this.currentIndex - 1;
            if (index == this.itemSize - 1) {
              this._show(this.itemSize, false);
              this.wrapper.width();
            }
          } else {
            index = (this.currentIndex - 1 + this.itemSize) % this.itemSize;
          }

          this._show(index);
        },
        /**
         * 切换到下一项
         */
        next: function () {//下一张
          var index
          if (this.option.loop) {
            index = this.currentIndex == this.itemSize ? 1 : this.currentIndex + 1;
            if (index == 1) {
              this._show(0, false);
              this.wrapper.width();
            }
          } else {
            index = (this.currentIndex + 1) % this.itemSize;
          }

          this._show(index);
        },
        /**
         * 切换显示指定项
         *
         * @param {Number} index 要切换到的项索引
         *
         */
        show: function (index) {//跳到指定索引处
          var index = index % this.itemSize;
          if (index < 0) {
            index = this.itemSize + index;
          }
          this._show(index); // 默认追加动画
        },
        /**
         * 自动轮播
         */
        play: function () {
          this.option.autoPlay = true;
          this._play();
        },
        _play: function () {
          if (this.option.autoPlay && this.option.loop && !this.timeoutId) {
            var that = this;
            this.timeoutId = setTimeout(function () {
              that.timeoutId = null;//清空这个timeoutId，代表该次处理已经执行了
              that.next();
            }, that.option.duration);
          }
        },
        _addIndicator: function () {
          var html = "";
          for (var i = 0; i < this.itemSize; i++) {
            html += "<li></li>";
          }
          html = "<ul class='ipu-carousel-indicator'>" + html + "</ul>";
          this.indicator = $(html).appendTo(this.el);
          this.indicatorIndexs = $("li", this.indicator);
        },
        _sizeCount: function () {
          this.wrapperWidth = this.wrapper.outerWidth(true);
          this.itemWidth = this.carouselItems.eq(0).outerWidth(true);
          this.mostSize = this.itemSize * this.itemWidth; // 宽度*数量
          $(this.wrapper).removeClass("ipu-carousel-animate").width();
          this.carouselItemWides = [];

          var that = this;
          $(">li", this.wrapper).each(function (index, dom) { // 此处要注意，最后一个子项是后加进入的，要重新使用jquery处理一下，不能直接使用this.xx来处理
            that.carouselItemWides[index] = $(this).position().left;
          });
        },
        /**
         * 宽度信息或尺寸信息发生变更时，进行刷新计算
         * 判断是否需要重新计算尺寸，若宽度尺寸发生变化，进行重新尺寸计算
         */
        refresh: function () {
          if (this.wrapperWidth != this.wrapper.outerWidth(true)) {
            this._sizeCount();
            this._show(this.currentIndex, false); //新的位置
          }
        },
        _move: function (moveLen) { // 拖动时的处理
          this._pause();
          $(this.wrapper).removeClass("ipu-carousel-animate");

          if (this.option.loop) {
            var move = (this.moveLen - moveLen) % this.mostSize;
            move = (move + this.mostSize) % this.mostSize;

          } else {
            var move = this.moveLen - moveLen;
            if (move < 0) {
              move = move / 2;
            } else if (move > this.mostSize) {
              move = this.mostSize + (move - this.mostSize) / 2;
            }
          }

          this.displayMoveLen = move;
          move = -move + "px";
          $(this.wrapper).css("transform", "translate3d(" + move + ", 0, 0)");
        },
        _show: function (index, animate) { // 知道最终移动到的项时，调用
          if (animate !== false) { // 默认值为true
            animate = true;
          }

          this._pause();
          $(this.wrapper).toggleClass("ipu-carousel-animate", animate);
          this.currentIndex = index % this.itemSize;
          this.cloneItem = index == this.itemSize;

          this.moveLen = this.carouselItemWides[index];
          var move = -this.moveLen + "px";

          $(this.wrapper).css("transform", "translate3d(" + move + ", 0, 0)");

          var currentIndex = this.currentIndex;
          if (animate && this.option.callBack) {
            this.option.callBack(currentIndex, this.cloneItem);//返回当前索引,以及是滞最后一项参数
          }

          if (this.indicator) {
            this.indicatorIndexs.eq(currentIndex).addClass("ipu-current").siblings().removeClass("ipu-current");
          }

          this._play();//处理自动播放
        },
        _onPan: function (ev) {
          var delta = ev.deltaX;  // 内容往左，deltaX为正值

          // pancancel与panend，有效的pan事件结束与无效的pan事件结束？
          if (ev.type == 'panend' || ev.type == 'pancancel') {
            var value = delta / this.itemWidth;
            var intValue = parseInt(Math.abs(value));               // 取整数
            var decimal = Math.abs(value) % 1;                      // 取小数

            if (decimal > 0.2) { // 滑动超过页面宽20%；
              intValue = intValue + 1;
            }
            if (delta > 0) {
              intValue = -intValue;
            }
            var index;

            if (this.option.loop) {
              index = (this.currentIndex + intValue) % this.itemSize;
              index = (index + this.itemSize) % this.itemSize; // 因为可能是个负值，转换成正值

              // 当前位移大于一个项的长度，这由move方法导致的，所以此时只能是最后一项在显示，所以要显示最后一项
              if (index == 0 && this.displayMoveLen > this.itemWidth) {
                index = this.itemSize;
              }
            } else { // 非循环时
              index = this.currentIndex + intValue;
              if (index < 0) {
                index = 0;
              } else if (index > this.itemSize - 1) {
                index = this.itemSize - 1;
              }
            }

            this._show(index);
          } else if (ev.type == 'panmove') {
            this._move(delta);
          }
        }
      });

      /**
       * @member ipuUI
       * 生成HammerCarousel实例，参数信息见{@link HammerCarousel#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {HammerCarousel}
       */
      ipuUI.hammerCarousel = function (slt, option) {
        return new HammerCarousel(slt, option);
      };
    })(ipuUI || window, jQuery, Hammer);

// 添加一些jquery扩展
    (function (ipuUI, $) {
      // 在android部分手机上，部分窗体，在jqurey的ready函数执行时，宽度值还未确认，会导致部分UI或依赖宽度计算的代码出现问题
      // 皮函数用来处理此问题，等宽度明确或等待最多6s后，执行相关函数
      var readyBacks = [];
      var isSizeReady = false; // 需要记录状态

      $.extend({ // 扩展jquery工具方法
        sizeReady: function (callBack) {
          if (isSizeReady) {
            callBack();
          } else {
            readyBacks.push(callBack);
          }
        }
      });

      $(function () { // 添加监听页面ready函数
        var count = 0;
        var delayTime = 40; // 间隔时间ms
        var totalTime = 6000; // 最高等待6s=6000ms

        function checkSizeReady() {
          if (window.innerHeight != 0 || delayTime * count >= totalTime) {
            isSizeReady = true;
            for (var i = 0, j = readyBacks.length; i < j; i++) {
              readyBacks[i]();
            }
          } else {
            count++;
            setTimeout(checkSizeReady, delayTime);
          }
        }

        checkSizeReady();
      });


    })(ipuUI || window, jQuery);

    (function (ipuUI, $) {

      /**
       * @class modal，模拟框实现对象，所有方法可直接通过ipuUI调用
       *
       */
      var modal = {};

      function __dealCssEvent(eventNameArr, callback) {
        var events = eventNameArr,
            i, dom = this;// jshint ignore:line

        function fireCallBack(e) {
          /*jshint validthis:true */
          if (e.target !== this) return;
          callback.call(this, e);
          for (i = 0; i < events.length; i++) {
            dom.off(events[i], fireCallBack);
          }
        }

        if (callback) {
          for (i = 0; i < events.length; i++) {
            dom.on(events[i], fireCallBack);
          }
        }
      }

      $.fn.transitionEnd = function (callback) {
        __dealCssEvent.call(this, ['webkitTransitionEnd', 'transitionend'], callback);
        return this;
      };

      var _modalTemplateTempDiv = document.createElement('div');

      var defaults = {
        modalTitle: '',
        modalStack: true,
        modalButtonOk: '确定',
        modalButtonCancel: '取消',
        modalPreloaderTitle: '加载中',
        modalContainer: document.body ? document.body : 'body'
      };

      modal.modalStack = [];

      modal.modalStackClearQueue = function () {
        if (ipuUI.modalStack.length) {
          (ipu.modalStack.shift())();
        }
      };

      modal.modal = function (params) {
        params = params || {};
        var buttonsHTML = '';
        if (params.buttons && params.buttons.length > 0) {
          for (var i = 0; i < params.buttons.length; i++) {
            buttonsHTML += '<span class="ipu-modal-button' + (params.buttons[i].bold ? ' ipu-modal-button-bold' : '') + '">' + params.buttons[i].text + '</span>';
          }
        }
        var extraClass = params.extraClass || '';
        var titleHTML = params.title ? '<div class="ipu-modal-title">' + params.title + '</div>' : '';
        var textHTML = params.text ? '<div class="ipu-modal-text">' + params.text + '</div>' : '';
        var afterTextHTML = params.afterText ? params.afterText : '';
        var noButtons = !params.buttons || params.buttons.length === 0 ? 'ipu-modal-no-buttons' : '';
        var verticalButtons = params.verticalButtons ? 'ipu-modal-buttons-vertical' : '';

        var modalHTML = '<div class="ipu-modal ' + extraClass + ' ' + noButtons + '"><div class="ipu-modal-inner">' + (titleHTML + textHTML + afterTextHTML) + '</div><div class="ipu-modal-buttons ' + verticalButtons + '">' + buttonsHTML + '</div></div>';

        _modalTemplateTempDiv.innerHTML = modalHTML;

        var modalObj = $(_modalTemplateTempDiv).children();

        $(defaults.modalContainer).append(modalObj[0]);

        // Add events on buttons
        modalObj.find('.ipu-modal-button').each(function (index, el) {
          $(el).on('click', function (e) {
            if (params.buttons[index].close !== false) modal.closeModal(modalObj);
            if (params.buttons[index].onClick) params.buttons[index].onClick(modalObj, e);
            if (params.onClick) params.onClick(modalObj, index);
          });
        });
        modal.openModal(modalObj);
        return modalObj[0];
      };

      /**
       * @member modal
       * 弹出警告消息
       *
       * @param {String} text 警句文本
       * @param {String} title 警告标题，可选参数
       * @param {Function} callbackOk 用户确认后的回调函数，可选参数
       */
      modal.alert = function (text, title, callbackOk) {
        if (typeof title === 'function') {
          callbackOk = arguments[1];
          title = undefined;
        }
        return modal.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          buttons: [{text: defaults.modalButtonOk, bold: true, onClick: callbackOk}]
        });
      };

      /**
       * @member modal
       * 弹出确认消息
       *
       * @param {String} text 确认文本
       * @param {String} title 确认标题，可选参数
       * @param {Function} callbackOk 用户确认后的回调函数，可选参数
       * @param {Function} callbackCancel 用户确认后的回调函数，可选参数
       */
      modal.confirm = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
          callbackCancel = arguments[2];
          callbackOk = arguments[1];
          title = undefined;
        }
        return modal.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          buttons: [
            {text: defaults.modalButtonCancel, bold: true, onClick: callbackCancel},
            {text: defaults.modalButtonOk, bold: true, onClick: callbackOk}
          ]
        });
      };

      /**
       * @member modal
       * 弹出输入框
       *
       * @param {String} text 输入提示文本
       * @param {String} title 输入提示标题，可选参数
       * @param {Function} callbackOk 用户确认后的回调函数，可选参数
       * @param {Function} callbackCancel 用户确认后的回调函数，可选参数
       */
      modal.prompt = function (text, title, callbackOk, callbackCancel) {
        if (typeof title === 'function') {
          callbackCancel = arguments[2];
          callbackOk = arguments[1];
          title = undefined;
        }
        return modal.modal({
          text: text || '',
          title: typeof title === 'undefined' ? defaults.modalTitle : title,
          afterText: '<input type="text" class="ipu-modal-text-input">',
          buttons: [
            {
              text: defaults.modalButtonCancel
            },
            {
              text: defaults.modalButtonOk,
              bold: true
            }
          ],
          onClick: function (modal, index) {
            if (index === 0 && callbackCancel) callbackCancel($(modal).find('.ipu-modal-text-input').val());
            if (index === 1 && callbackOk) callbackOk($(modal).find('.ipu-modal-text-input').val());
          }
        });
      };

      var minLoad = false;        // 是否最小时间调用方式
      var loadOverTime = false;   // 是否超过最小调用时间
      var loadEnd = false;        // 是否调用结束
      var loadTimeOut = null;     // 延时调用ID

      /**
       *  @member modal
       * 弹出加载消息提示
       *
       * @param {String} title 加载提示文本
       * @param {Number} minTime 消息最小显示时间，单位ms，可选参数
       */
      modal.showPreloader = function (title, minTime) {
        modal.hidePreloader(true);

        modal.showPreloader.preloaderModal = modal.modal({
          title: title || defaults.modalPreloaderTitle,
          text: '<div class="ipu-preloader"></div>'
        });

        if (minTime) {
          minLoad = true;
          loadTimeOut = setTimeout(function () {
            loadOverTime = true;
            if (loadEnd) {
              modal.hidePreloader();
            }
          }, minTime);
        }

        return modal.showPreloader.preloaderModal;
      };

      /**
       * @member modal
       * 隐藏加载消息提示
       *
       * @param {Boolean} force 是否强制隐藏，不管最小提示时间，可选
       */
      modal.hidePreloader = function (force) {
        if (force || !minLoad || (minLoad && loadOverTime)) {
          if (force && loadTimeOut) {
            window.clearTimeout(loadTimeOut);
          }
          modal.showPreloader.preloaderModal && modal.closeModal(modal.showPreloader.preloaderModal);
          minLoad = false; // 重置各标志位
          loadOverTime = false;
          loadEnd = false;
          loadTimeOut = null;
        } else {
          loadEnd = true;
        }
      };

      /**
       * @member modal
       * 显示加载状态
       */
      modal.showIndicator = function () {
        if ($('.ipu-preloader-indicator-modal')[0]) return;
        $(defaults.modalContainer).append('<div class="ipu-preloader-indicator-overlay"></div><div class="ipu-preloader-indicator-modal"><span class="ipu-preloader ipu-preloader-white"></span></div>');
      };

      /**
       * @member modal
       * 隐藏加载状态
       */
      modal.hideIndicator = function () {
        $('.ipu-preloader-indicator-overlay, .ipu-preloader-indicator-modal').remove();
      };

      /**
       * @member modal
       * 显示操作选项
       *
       * @param{[[Object]]} actions
       * @param {Object} actions.Object
       * @param {String} actions.Object.text 操作名称
       * @param {Boolean} actions.Object.label 是否标签，非标签就是操作项，操作项有后续的配置，标签项无须后续配置项
       * @param {String:warning} actions.Object.color 样式，可选
       * @param {String:warning} actions.Object.bg 背景样式，可选
       * @param {Function} actions.Object.onClick 点击时回调函数
       */
      modal.actions = function (params) {
        var modalObj, groupSelector, buttonSelector;
        params = params || [];

        if (params.length > 0 && !$.isArray(params[0])) {
          params = [params];
        }
        var modalHTML;
        var buttonsHTML = '';
        for (var i = 0; i < params.length; i++) {
          for (var j = 0; j < params[i].length; j++) {
            if (j === 0) buttonsHTML += '<div class="ipu-actions-modal-group">';
            var button = params[i][j];
            var buttonClass = button.label ? 'ipu-actions-modal-label' : 'ipu-actions-modal-button';
            if (button.bold) buttonClass += ' ipu-actions-modal-button-bold';
            if (button.color) buttonClass += ' ipu-color-' + button.color;
            if (button.bg) buttonClass += ' ipu-bg-' + button.bg;
            if (button.disabled) buttonClass += ' disabled';
            buttonsHTML += '<span class="' + buttonClass + '">' + button.text + '</span>';
            if (j === params[i].length - 1) buttonsHTML += '</div>';
          }
        }
        modalHTML = '<div class="ipu-actions-modal">' + buttonsHTML + '</div>';
        _modalTemplateTempDiv.innerHTML = modalHTML;
        modalObj = $(_modalTemplateTempDiv).children();
        $(defaults.modalContainer).append(modalObj[0]);
        groupSelector = '.ipu-actions-modal-group';
        buttonSelector = '.ipu-actions-modal-button';

        var groups = modalObj.find(groupSelector);
        groups.each(function (index, el) {
          var groupIndex = index;
          $(el).children().each(function (index, el) {
            var buttonIndex = index;
            var buttonParams = params[groupIndex][buttonIndex];
            var clickTarget;
            if ($(el).is(buttonSelector)) clickTarget = $(el);
            // if (toPopover && $(el).find(buttonSelector).length > 0) clickTarget = $(el).find(buttonSelector);

            if (clickTarget) {
              clickTarget.on('click', function (e) {
                if (buttonParams.close !== false) modal.closeModal(modalObj);
                if (buttonParams.onClick) buttonParams.onClick(modalObj, e);
              });
            }
          });
        });
        modal.openModal(modalObj);
        return modalObj[0];
      };

      //显示一个消息，会在2秒钟后自动消失
      /**
       * @member modal
       * 悬浮提示消息
       *
       * @param {String} msg 消息文本
       * @param {Number} duration=2000 消息显示时间，单位ms
       */
      modal.toast = function (msg, duration, extraclass) {
        var $toast = $('<div class="ipu-modal ipu-toast ' + (extraclass || '') + '">' + msg + '</div>').appendTo(document.body);
        modal.openModal($toast, function () {
          setTimeout(function () {
            modal.closeModal($toast);
          }, duration || 2000);
        });
      };

      modal.openModal = function (modalObj, cb) {
        modalObj = $(modalObj);
        var isModal = modalObj.hasClass('ipu-modal'),
            isNotToast = !modalObj.hasClass('ipu-toast');
        isNotToast = false; // 强制打开新窗口

        if ($('.ipu-modal.ipu-modal-in:not(.ipu-modal-out)').length && defaults.modalStack && isModal && isNotToast) {
          modalObj.modalStack.push(function () {
            modal.openModal(modalObj, cb);
          });
          return;
        }

        var isPopup = modalObj.hasClass('ipu-popup');
        var isLoginScreen = modalObj.hasClass('ipu-login-screen');
        var isPickerModal = modalObj.hasClass('ipu-picker-modal');
        var isToast = modalObj.hasClass('ipu-toast');

        if (isModal) {
          modalObj.show();
          modalObj.css({
            marginTop: -Math.round(modalObj.outerHeight() / 2) + 'px'
          });
        }

        if (isToast) {
          modalObj.css({
            marginLeft: -Math.round(modalObj.outerWidth() / 2) + 'px' //1.185 是初始化时候的放大效果
          });
        }

        var overlay;
        if (!isLoginScreen && !isPickerModal && !isToast) {
          if ($('.ipu-modal-overlay').length === 0 && !isPopup) {
            $(defaults.modalContainer).append('<div class="ipu-modal-overlay"></div>');
          }
          if ($('.ipu-popup-overlay').length === 0 && isPopup) {
            $(defaults.modalContainer).append('<div class="ipu-popup-overlay"></div>');
          }
          overlay = isPopup ? $('.ipu-popup-overlay') : $('.ipu-modal-overlay');
        }

        //Make sure that styles are applied, trigger relayout;
        var clientLeft = modalObj[0].clientLeft;

        // Trugger open event
        modalObj.trigger('open');

        // Picker modal body class
        if (isPickerModal) {
          $(defaults.modalContainer).addClass('ipu-with-picker-modal');
        }

        // Classes for transition in
        if (!isLoginScreen && !isPickerModal && !isToast) {
          overlay.addClass('ipu-modal-overlay-visible');
        }
        modalObj.removeClass('ipu-modal-out').addClass('ipu-modal-in').transitionEnd(function (e) {
          if (modalObj.hasClass('ipu-modal-out')) modalObj.trigger('closed');
          else modalObj.trigger('opened');
        });
        // excute callback
        if (typeof cb === 'function') {
          cb.call(this);
        }
        return true;
      };

      modal.closeModal = function (modalObj) {
        modalObj = $(modalObj || '.ipu-modal-in');
        if (typeof modalObj !== 'undefined' && modalObj.length === 0) {
          return;
        }
        var isModal = modalObj.hasClass('ipu-modal'),
            isPopup = modalObj.hasClass('ipu-popup'),
            isToast = modalObj.hasClass('ipu-toast'),
            isLoginScreen = modalObj.hasClass('ipu-login-screen'),
            isPickerModal = modalObj.hasClass('ipu-picker-modal'),
            removeOnClose = modalObj.hasClass('ipu-remove-on-close'),
            overlay = isPopup ? $('.ipu-popup-overlay') : $('.ipu-modal-overlay');
        if (isPopup) {
          if (modalObj.length === $('.ipu-popup.ipu-modal-in').length) {
            overlay.removeClass('ipu-modal-overlay-visible');
          }
        }
        else if (!(isPickerModal || isToast)) {
          overlay.removeClass('ipu-modal-overlay-visible');
        }
        modalObj.trigger('close');

        // Picker modal body class
        if (isPickerModal) {
          $(defaults.modalContainer).removeClass('ipu-with-picker-modal');
          $(defaults.modalContainer).addClass('ipu-picker-modal-closing');
        }

        modalObj.removeClass('ipu-modal-in').addClass('ipu-modal-out').transitionEnd(function (e) {
          if (modalObj.hasClass('ipu-modal-out')) modalObj.trigger('closed');
          else modalObj.trigger('opened');

          if (isPickerModal) {
            $(defaults.modalContainer).removeClass('ipu-picker-modal-closing');
          }
          if (isPopup || isLoginScreen || isPickerModal) {
            modalObj.removeClass('ipu-modal-out').hide();
            if (removeOnClose && modalObj.length > 0) {
              modalObj.remove();
            }
          }
          else {
            modalObj.remove();
          }
        });
        if (isModal && defaults.modalStack) {
          modal.modalStackClearQueue();
        }

        return true;
      };

      function handleClicks(e) {
        /*jshint validthis:true */
        var clicked = $(this);
        var url = clicked.attr('href');


        //Collect Clicked data- attributes
        /* var clickedData = clicked.dataset();

         // Popup
         var popup;
         if (clicked.hasClass('ipu-open-popup')) {
         if (clickedData.popup) {
         popup = clickedData.popup;
         }
         else popup = '.ipu-popup';
         ipu.popup(popup);
         }
         if (clicked.hasClass('ipu-close-popup')) {
         if (clickedData.popup) {
         popup = clickedData.popup;
         }
         else popup = '.ipu-popup.modal-in';
         ipu.closeModal(popup);
         }*/

        // Close Modal
        if (clicked.hasClass('ipu-modal-overlay')) {
          if ($('.ipu-modal.ipu-modal-in').length > 0 && defaults.modalCloseByOutside)
            modal.closeModal('.ipu-modal.ipu-modal-in');
          if ($('.ipu-actions-modal.ipu-modal-in').length > 0 && defaults.actionsCloseByOutside)
            modal.closeModal('.ipu-actions-modal.ipu-modal-in');

        }
        if (clicked.hasClass('ipu-popup-overlay')) {
          if ($('.ipu-popup.ipu-modal-in').length > 0 && defaults.popupCloseByOutside)
            modal.closeModal('.ipu-popup.modal-in');
        }
      }

      $.extend(ipuUI, modal);


      $(document).on('click', ' .ipu-modal-overlay, .ipu-popup-overlay, .ipu-close-popup, .ipu-open-popup, .ipu-close-picker', handleClicks);
    })(ipuUI || window, jQuery);

    (function (ipuUI, $) {
      /**
       * @class 导航切换组件
       *
       *      @example
       *
       *      <!-- 组件的html分成导航和内容两部分，一般与flex栅格配合布局-->
       *
       *      <!--  组件导航部分 -->
       *      <nav class="ipu-navbar ">
       *        <a class="ipu-navbar-item " href="javascript:;">
       *          <span class="ipu-icon fa fa-home"></span>
       *          <span class="ipu-navbar-item-label">插件</span>
       *        </a>
       *        <a class="ipu-navbar-item " href="javascript:;">
       *          <span class="ipu-icon fa fa-dashcube"></span>
       *          <span class="ipu-navbar-item-label">JS组件</span>
       *        </a>
       *        <a class="ipu-navbar-item ipu-current" href="javascript:;">
       *           <span class="ipu-icon fa fa-map"></span>
       *           <span class="ipu-navbar-item-label">静态组件</span>
       *        </a>
       *        <a class="ipu-navbar-item" href="javascript:;">
       *           <span class="ipu-icon fa fa-mortar-board"></span>
       *           <span class="ipu-navbar-item-label">更多</span>
       *        </a>
       *      </nav>
       *
       *      <!-- 内容部分 -->
       *      <div class="ipu-nav-content">
       *        <ul>
       *          <li>
       *             自定义内容1
       *          </li>
       *          <li>
       *             自定义内容
       *          </li>
       *          <li>
       *             自定义内容
       *          </li>
       *          <li>
       *             自定义内容
       *          </li>
       *        </ul>
       *      </div>
       *
       *
       * @constructor  不能直接访问该类，调用{@link ipu#navBar ipuUI.navBar(slt, option)}生成实例
       * @param {String|jqueryObj} slt jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
       */
      function NavBar(slt, option) {
        this.option = $.extend({}, this.defaultOption, option);
        this.content = $(this.option.contentSlt);
        this.nav = $(slt);
        this.wrapper = $(">ul", this.content);
        this.contents = $(">li", this.wrapper);
        this.navs = $(">a", this.nav);
        var me = this;

        var activeIndex = this.navs.filter(".ipu-current").index(); // 查找默认有active的索引
        if (activeIndex == -1) {
          activeIndex = this.contents.filter(".ipu-current").index(); // 查找默认有active的索引
        }
        this.option.index = activeIndex != -1 ? activeIndex : 0;

        if (!this.option.animate) {
          this.wrapper.addClass("ipu-no-animation")
        }

        this.navs.each(function (index, i) {
          $(this).click(function () {
            me.show(index);
          });
        });

        this.lastIndex = null;
        this.currentIndex = null;
        me.show(this.option.index);
      }

      /**
       * 组件默认配置项
       *
       * @cfg {Object} defaultOption
       * @cfg {Boolean} defaultOption.animate=false 切换时是否添加动画效果
       * @cfg {Dom|String|JqueryObj} defaultOption.contentSlt='.ipu-nav-content' 内容dom选择器，页面有多个navBar组件时，需要设置此值
       * @cfg {Function} defaultOption.callBack 切换时的回调函数
       * @cfg {Number} defaultOption.callBack.index 当前显示项索引
       */
      NavBar.prototype.defaultOption = {
        animate: false,
        contentSlt: ".ipu-nav-content",
        callBack: function (currentIndex, lastIndex) {
        }
      };

      /**
       * 显示第几项内容
       * @param {Number} index 显示内容项索引
       */
      NavBar.prototype.show = function (index) {
        if (this.currentIndex != index) {
          $(this.contents[index]).addClass("ipu-show");

          if (this.option.animate) {
            if (this.lastIndex != null && this.lastIndex != index) {
              $(this.contents[this.lastIndex]).removeClass("ipu-show"); // 隐藏上上个元素
            }

            if (this.currentIndex != null) {        // 非第一次需要动画效果
              if (this.currentIndex < index) {   // 需要内容为往左走，显示右边的内容
                if (this.lastIndex != null && this.lastIndex < this.currentIndex) {  // 内容已经左走过了，则需要移除动画复原位置，再通过width()方法强制生效
                  this.wrapper.addClass("ipu-no-animation").removeClass("ipu-nav-content-right").width(); // 可以强制刷新，默认jquery应该会将这些dom上的修改延时处理？
                }
              } else {
                if (this.lastIndex == null || this.lastIndex > this.currentIndex) { // 类似同上
                  this.wrapper.addClass("ipu-no-animation").addClass("ipu-nav-content-right").width(); // 可以强制刷新不？
                }
              }
              this.wrapper.removeClass("ipu-no-animation").toggleClass("ipu-nav-content-right");
            }
          } else {
            $(this.contents[this.currentIndex]).removeClass("ipu-show");
          }

          // 更新class，ipu-current状态
          $(this.contents[index]).addClass("ipu-current").siblings(".ipu-current").removeClass("ipu-current");
          $(this.navs[index]).addClass("ipu-current").siblings(".ipu-current").removeClass("ipu-current");

          this.lastIndex = this.currentIndex;
          this.currentIndex = index;

          if (this.option.callBack) {
            this.option.callBack(this.currentIndex, this.lastIndex);
          }
        }
      };

      /**
       * @member ipuUI
       * 生成NavBar实例，参数信息见{@link NavBar#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {NavBar}
       */
      ipuUI.navBar = function (slt, option) {
        return new NavBar(slt, option);
      };
    })(ipuUI || window, jQuery);

    (function (ipuUI, $) {
      function __dealCssEvent(eventNameArr, callback) {
        var events = eventNameArr,
            i, dom = this;// jshint ignore:line

        function fireCallBack(e) {
          if (e.target !== this) return;
          callback.call(this, e);
          for (i = 0; i < events.length; i++) {
            dom.off(events[i], fireCallBack);
          }
        }

        if (callback) {
          for (i = 0; i < events.length; i++) {
            dom.on(events[i], fireCallBack);
          }
        }
      }

      $.fn.animationEnd = function (callback) {
        __dealCssEvent.call(this, ['webkitAnimationEnd', 'animationend'], callback);
        return this;
      };

      function submitForm(doc, url, params) {
        var form = doc.createElement("form");
        form.action = url;
        form.method = "post";
        form.style.display = "none";

        for (var x in params) {
          var ele = doc.createElement("input");
          ele.type = "hidden";
          ele.name = x;
          ele.value = params[x];
          form.appendChild(ele);
        }

        doc.body.appendChild(form);
        form.submit();
      }

      // 检查是否有ipu-pages的结构
      function checkPages() {
        if (!hasPages) {
          pagesObj = $(".ipu-pages"); // pagesObj为空则进行jquery取值
          if (pagesObj.size() == 0) {
            pagesObj = $("<div class='ipu-pages'><div class='ipu-page ipu-show " + zeroPageClass + "' id='" + pageIdPrefix + "0'></div>").appendTo("body");
          }
          hasPages = true;
        }
      }

      // 站位页面
      function isZeroPage(page) {
        return $(page).hasClass(zeroPageClass);
      }

      var page = {};
      var hasPages = false;
      var maps = {};
      var pageNo = 1; // 编号0留给主页面或当前页面，或没有
      var pageIdPrefix = "ipuPage-";
      var pagesObj = null;
      var animateInClass = "ipu-anim ipu-slideRightIn";
      var animateOutClass = "ipu-anim ipu-slideRightOut";
      var eventName = "ipuUIPageBack";
      var zeroPageClass = 'ipu-page-zero';   // 占位页面，对于为当前页面
      var zeroPagesClass = 'ipu-pages-zero';   // 占位页面的特殊class，作用已忘记，应该是用来标记显示用

      /**
       * @private
       * @class page 单页面实现功能对象
       * 以iframe加载子页面的方式，页面后退（后退时，后退到a页面，所有在a页面后打开的页面全都关闭）
       * ipu框架在浏览器运行时，使用此对象实现与客户端运行类似的效果
       * 大致实现是当前页面进行处理，所有的后续页面加载都放在一个iframe中，所有页面按加载顺序排序，关闭或后退按页面打开的顺序处理
       */


      /**
       * 组件默认配置项
       *
       * @cfg {Object} defaultOption page组件默认配置项
       * @cfg {Window} defaultOption.target = window.parent 默认执行的窗口对象，子页面调用相关方法，默认都都是在parent窗口执行，需要指定此参数，如顶层父窗口
       * @cfg {Number} defaultOption.backIndex=-1 回退索引，大于0时，正序计算，小于0时，倒序计算，-1即为当页面的上一个页面
       * @cfg {Number} defaultOption.closeIndex 关闭页面索引，参数说明同上
       * @cfg {Object} defaultOption.params Json格式参数，POST方式打开页面时，使用此参数传递参数，暂不支持数组格式参数
       * @cfg {Boolean} defaultOption.animate=true 是否使用动画，打开或回退页面时有效参数
       * @cfg {Boolean} defaultOption.showLoading=true 是否显示加载提示，打开或回退页面时有效参数
       * @cfg {Boolean} defaultOption.loadingMessage='正在加载中' 是否显示加载提示，打开或回退页面时有效参数
       * @cfg defaultOption.data=null 回退页面时，传递给回退到的页面的参数，回退到的页面有设置监听函数时，监听函数可以接收此参数
       * @cfg {String} defaultOption.pageName='' 页面的名称，打开或回退页面时有效参数
       * @cfg {Number} defaultOption.pageMax=''  保留的最大页面数，大于2
       * @cfg {Function} defaultOption.callBack 方法执行结束时的回调函数
       */
      page.defaultOption = {     // 那个窗口执行open,默认父窗口
        target: window.parent, // 默认执行父窗口，方法：all
        backIndex: -1,    // 默认回退一页         方法：back
        closeIndex: -1,   // 默认关闭最近一个页面 方法：close
        params: {},        // post的传参            方法：post
        animate: true,     // 是否动画效果        方法：open post
        showLoading: true,   // 是否显示加载消息  方法：open post
        loadingMessage: '正在加载中',  //          方法：open post
        method: null,     // 请求方式，内置参数，方法自己设置，用户不需要设置  方法：无
        minMessageTime: 500, // 最小显示加载时间，避免出现闪现的情况 方法：open post
        data: null,         // 回退时，回传参数， 方法：back
        pageName: '',     // 给打开的页面命名，以便根据此页面名称来切换页面 方法：open post back close
        pageMax: 8,        // 允许的最大打开页面数
        callBack: function () { // 事件回调       方法：open post close back
        }
      };

      // 新增限制最大页面数
      page.limitPages = function () {
        var pageMax = this.defaultOption.pageMax - 2; //
        $(".ipu-page.ipu-show").prevAll(".ipu-page:gt(" + pageMax + ")").remove();
      };

      // 当前页面加载，针对顶层父窗口
      page.openPage = function (url, option) {
        var newPage = null;
        var nowPageNo = pageIdPrefix + (pageNo++);
        maps[nowPageNo] = url;

        checkPages();

        if (option.showLoading) {
          ipuUI.showPreloader(option.loadingMessage, option.minMessageTime);
        }

        if (option.method == 'post') {
          newPage = $("<div class='ipu-page' id='" + nowPageNo + "' data-name='" + option.pageName + "'><iframe class='ipu-page-iframe'></iframe></div>");
        } else {
          newPage = $("<div class='ipu-page' id='" + nowPageNo + "' data-name='" + option.pageName + "'><iframe class='ipu-page-iframe' src='" + url + "'></iframe></div>");
        }

        var zeroPage = isZeroPage($(".ipu-page:last", pagesObj));
        var animatePage = newPage;
        if (zeroPage) {
          animatePage = pagesObj.addClass(zeroPagesClass);
        }

        function end() {
          if (option.showLoading) {
            ipuUI.hidePreloader();
          }

          if (option.animate) {
            animatePage.removeClass(animateInClass);
          }

          newPage.siblings(".ipu-show").removeClass('ipu-show');
          if (option.callBack) {
            option.callBack();
          }

          // 新增限制最大页面数
          page.limitPages();
        }

        $(".ipu-page-iframe", newPage).one('load', function () {
          newPage.addClass("ipu-show").width(); // 强制生效，否则可能出现页面闪现，无动画情况

          if (zeroPage) {
            animatePage.removeClass(zeroPagesClass);
          }
          if (option.animate) {
            animatePage.addClass(animateInClass).animationEnd(end);
          } else {
            end();
          }
        });

        newPage.appendTo(pagesObj);
        if (option.method == 'post') {
          var pageDoc = $(".ipu-page-iframe", newPage)[0].contentDocument;
          submitForm(pageDoc, url, option.params);
        }
      };

      // post方式加载页面
      page.postPage = function (url, option) {
        option.method = 'post';
        page.openPage(url, option);
      };

      // 当前页面后退，针对顶层父窗口
      page.backPage = function (option) {
        var backIndex = option.backIndex;
        var page = null;
        var nowPage = $(".ipu-page.ipu-show", pagesObj);

        if (option.pageName) {
          page = $(".ipu-page[data-name='" + option.pageName + "']:first", pagesObj);
        } else if (backIndex == 0) {
          page = $(".ipu-page:first", pagesObj);
        } else { // 越界的情况
          var prevPage = nowPage.prevAll(".ipu-page");
          if (backIndex < 0) {
            page = $(prevPage[-backIndex - 1]);
          } else {
            page = $(prevPage[prevPage.size() - backIndex]);
          }
        }

        var animatePage = nowPage;
        var zeroPage = isZeroPage(page);

        // 主页面模式时
        if (zeroPage) {
          animatePage = pagesObj;
        } else {
          page.addClass("ipu-show"); //显示前一个
        }

        function end() {
          $(this).removeClass(animateOutClass);
          page.nextAll(".ipu-page").remove();

          var iframe = $(".ipu-page-iframe", page);
          var nowDoc;

          if (iframe.size() == 0) { // 找不到子窗口就当是返回了主页面，在当前窗口触发
            nowDoc = window.document;
          } else {
            nowDoc = iframe[0].contentDocument;
          }

          if (zeroPage) {
            pagesObj.addClass(zeroPagesClass);
          }

          var evt = nowDoc.createEvent('Event');
          evt.initEvent(eventName, true, true);
          if (option.data) {
            evt.data = option.data;
          }
          nowDoc.body.dispatchEvent(evt);
          if (option.callBack) {
            option.callBack();
          }
        }

        if (option.animate) {
          animatePage.addClass(animateOutClass).animationEnd(end);
        } else {
          end();
        }
      };

      // 往前关闭窗口
      page.closePage = function (option) {
        var closeIndex = option.closeIndex;
        var prevPage = $(".ipu-page.ipu-show", pagesObj).prevAll(".ipu-page");

        if (option.pageName) {
          closeIndex = $(".ipu-page[data-name='" + option.pageName + "']:first", pagesObj).index();
        } else if (closeIndex < 0) {
          closeIndex = -closeIndex - 1;
        } else {
          closeIndex = prevPage.size() - closeIndex;
        }

        $(prevPage[closeIndex]).remove();
        if (option.callBack) {
          option.callBack();
        }
      };

      /**
       * get请求的方式加载页面
       *
       * @param {String} url
       * @param {Object} option 回退参数，见{@link #cfg-defaultOption}
       */
      page.open = function (url, option) {
        option = $.extend({}, this.defaultOption, option);
        option.target.ipuUI.page.openPage(url, option);
      };

      /**
       * 使用post方式加载一个新页面
       *
       * @param {String} url 要打开的页面地址
       * @param {Object} option 回退参数，见{@link #cfg-defaultOption}
       */
      page.post = function (url, option) {
        option = $.extend({}, this.defaultOption, option);
        option.method = 'post';
        option.target.ipuUI.page.openPage(url, option);
      };

      /**
       * 回退到某个历史页面，可以根据pageName回退，也可根据backIndex回退，默认回退上一个页面
       *
       * @param {Object} option 回退参数，见{@link #cfg-defaultOption}
       */
      page.back = function (option) {
        option = $.extend({}, this.defaultOption, option);
        option.target.ipuUI.page.backPage(option);
      };

      /**
       * 回退到首页
       *
       * @param {Object} option 回退参数，见{@link #cfg-defaultOption}
       */
      page.backHome = function (option) {
        option = option || {};
        option.backIndex = 0;
        page.back(option);
      };

      // 子窗口，待确认
      page.close = function (option) {
        option = $.extend({}, this.defaultOption, option);
        option.target.ipuUI.page.closePage(option);
      };

      /**
       * 给页面增加一个监听，从其它页面回退到此页面，调用此函数，可以接收其它页面传来的数据
       *
       * @param {Function} back 监听函数
       * @param back.data 其它页面传过来的参数，推荐字符串或Json对象
       */
      page.onBack = function (back) {
        $("body").on(eventName, function (e) {
          var data = e.originalEvent.data;
          back(data);
        });
      };

      // 提供一个关闭一群窗口的方法
      ipuUI.page = page;
    })(ipuUI || window, jQuery);

// picker
    (function (ipuUI, $, Hammer) {
      var showItemSize = 9;   // 显示的子项数量，
      var r = 90;             // 计算旋转的圆半径，结果应该缩小，是为了r不要距离容器太近，是否不应该设置px，使用rem
      var itemAngle = 180 / showItemSize;   // 每项对应的角度是 180/9 = 20
      var maxExceed = itemAngle;         // 滚动时允许超出边界的最大角度，允许最多翻过一项
      // itemHeight = 40px;每项数据的高度设置       // 需要给出r=89是怎么计算出来的，是根据 40/2/Math.tan(40/2/180*Math.PI)=113，直接太大不好看


      function toRem(num) {
        return num / 100;
      }

      /**
       * @private
       * @class 选择器，被DtPicker和PopPicker使用，实现选择与滚动等基础功能
       *
       * @constructor  初始化方法
       * @param {String|DOM|JQueryObj} slt
       * @param {object} option 组件参数，默认配置见 {@link #cfg-defaultOption}
       */
      function Picker(slt, option) {
        this.el = $(slt)[0];
        this.option = $.extend({}, this.defaultOption, option);
        this._init();
      }

      /**
       * 组件默认配置项
       *
       * @cfg {Object} defaultOption=
       * @cfg {Boolean} defaultOption.listen=true 是否需要监听变化
       * @cfg {[Object]} defaultOption.data=[] 可选择项数组，每个项须有text属性
       * @cfg {String} defaultOption.data.text 子项展示文本
       * @cfg {Function} defaultOption.onChange=null 选择变化时的回调函数
       * @cfg {Object} defaultOption.onChange.sltItem  选中项
       * @cfg {Number} defaultOption.onChange.newIndex 新的选中项索引
       * @cfg {Number} defaultOption.onChange.oldIndex 旧的选中项索引
       * @cfg {Boolean} defaultOption.onChange.newData 是否为调用setItem()方法触发
       */
      Picker.prototype.defaultOption = {
        listen: true,
        data: [],
        onChange: null
      };

      Picker.prototype._init = function () {
        var self = this;
        this.wrap = $(">ul", this.el);
        this.index = null;                                   // 选中项索引
        this.listen = !!this.option.listen;

        this.beginAngle = 0;                                  //  开始角度
        this.beginExceed = this.beginAngle - maxExceed;       // 最小角度值
        this.stopInertiaMove = false;
        this.lastAngle = null; // 保存滑动前的角度           // 当前滚动的角度

        // 如果是ios，则ul的旋转中心点，样式不同于android
        if (ipuUI.device.ios) {
          this.wrap.css("transform-origin", "center center " + toRem(r) + "rem"); //如果是ios，要变更旋转的中心点
        }


        this.setItems(this.option.data);

        this.hammer = new Hammer.Manager(this.el);
        this.hammer.add(new Hammer.Pan({direction: Hammer.DIRECTION_VERTICAL, threshold: 5}));
        this.hammer.add(new Hammer.Press({threshold: 4}));  //
        this.hammer.on("panstart panmove panend pancancel", Hammer.bindFn(this._onPan, this));

        // 处理滚动中，用户点中某项，停止
        this.hammer.on("press pressup", function (e) {  // 如果用户点击了，是停止自动滚动
          if (this.empty) {
            return;
          }

          self.stopInertiaMove = true;
          if (e.type == 'pressup') {
            self.endScroll();
          }
        });
      };

      /**
       * 设置选择项
       *
       * @param {[Object]} data 设置项数组
       */
      Picker.prototype.setItems = function (data, textName) {  // textNam字体暂不支持
        this.wrap.empty(); // 清空历史数据
        this.data = data = data || [];
        this.empty = data.length == 0; // 数据是否为空

        this.newData = true; //  是否为新设置数据标记
        var self = this;
        var lis = "";
        textName = textName || 'text';

        for (var i = 0, j = data.length; i < j; i++) {
          lis = lis + "<li>" + data[i][textName] + "</li>";
        }

        $(lis).appendTo(this.wrap);

        this.items = $(">li", this.wrap);
        this.itemsSize = this.items.size();

        this.endAngle = (this.empty ? 0 : this.itemsSize - 1) * itemAngle;
        this.endExceed = this.endAngle + maxExceed;  // 最大旋转角度值

        // 初始化各子项角度
        this.items.each(function (i) {
          $(this).css({
            "transform": "translateZ(" + toRem(r) + "rem) rotateX(-" + (i * itemAngle) + "deg)",
            "transform-origin": "center center -" + toRem(r) + "rem"
          });
          $(this).click(function () {
            self.stopInertiaMove = true;
            self.setAngle(i * itemAngle, true);
          })
        });

        var newAngle;
        if (this.empty || this.index == null) {
          newAngle = 0;
        } else {
          if (this.index > this.itemsSize - 1) {  // 取最大值
            newAngle = (this.itemsSize - 1) * itemAngle;
          } else {
            newAngle = this.index * itemAngle;
          }
        }
        this.setAngle(newAngle, true);
      };

      Picker.prototype._onPan = function (ev) {
        if (this.empty) {
          return;
        }

        //console.log(ev.deltaX + "=="+ ev.deltaY);
        if (ev.type == 'panstart') { // 好像一定要移动才有startg事件
          self.stopInertiaMove = true;
          this.lastAngle = this.angle;
          this.wrap.addClass("ipu-noanimate");    // 移除动画
          this.stopInertiaMove = true; //  停止自动减速滚动

        } else if (ev.type == 'panmove') {
          var moveAngle = this.calcAngle(ev.deltaY);
          var newAngle = this.lastAngle - moveAngle;   //最新的角度
          //console.log('=='+newAngle);
          // 一个可以转动的最小值和最大值过滤
          if (newAngle < this.beginExceed) {
            newAngle = this.beginExceed;
          }
          if (newAngle > this.endExceed) {
            newAngle = this.endExceed;
          }
          this.setAngle(newAngle);

        } else { // end or cancel事件
          // console.log('end or cancel:' + ev.type);
          var v = ev.overallVelocityY;    // 滑动的速度
          var dir = v > 0 ? -1 : 1; //加速度方向
          var deceleration = dir * 0.0006 * -1;
          var duration = Math.abs(v / deceleration); // 速度消减至0所需时间
          var dist = v * duration / 2; //最终移动多少

          var startAngle = this.angle;
          var distAngle = -this.calcAngle(dist);
          //  console.log("dist=" + dist + ", distAngle" + distAngle);

          //----
          var srcDistAngle = distAngle;
          if (startAngle + distAngle < this.beginExceed) {
            distAngle = this.beginExceed - startAngle;
            duration = duration * (distAngle / srcDistAngle) * 0.6;
          }
          if (startAngle + distAngle > this.endExceed) {
            distAngle = this.endExceed - startAngle;
            duration = duration * (distAngle / srcDistAngle) * 0.6;
          }

          if (distAngle == 0) {
            this.endScroll();
            return;
          }
          this.scrollDistAngle(startAngle, distAngle, duration);
        }
      };

      // 计算移动的角度，转动的角度，就是移动的距离对应相关圆周
      // 2*r*PI = 360,  angle = 360*c/(2*r*PI)
      var ca = 360 / (2 * r * Math.PI);
      Picker.prototype.calcAngle = function (c) {
        return c * ca;
      };

      /**
       * 为组件设置新的滚动角度
       *
       * @param {Number} newAngle 新的滚动角度
       * @param {Boolean} endScroll 是否为最终滚动角度，为最终滚动角度时，若索引更新可以触发onChange的回调
       */
      Picker.prototype.setAngle = function (newAngle, endScroll) {
        this.angle = newAngle; // 存储最新值
        this.wrap.css("transform", "perspective(" + toRem(1000) + "rem) rotateY(0deg) rotateX(" + newAngle + "deg)");
        this.calcItemVisable(newAngle);

        if (endScroll) {
          var index = newAngle / itemAngle;
          var oldIndex = this.index;
          this.index = this.empty ? null : index; // 这里可以做一个判断，如果是empty，则index值可以不改变

          // 这个地方要判断下，数据更新或索引更新都要触发
          if (oldIndex != index || this.newData) {
            if (this.option.onChange && this.listen) {
              this.option.onChange(this.getSelectedItem(), this.index, oldIndex, this.newData);
            }
            this.newData = false;
          }
        }
      };

      /**
       * 计算各子项滚动角度与新的滚动角度的值差异来决定显示的情况
       * 角度大于 90-(itemAngle/2)时，隐藏
       * 角度小于itemAngle/2表示最中心的项，显示并高亮
       * 其它值则表示此项为显示
       *
       * @param {Number} angle 新的滚动角度
       */
      Picker.prototype.calcItemVisable = function (angle) {
        this.items.each(function (index) {
          var difference = Math.abs(index * itemAngle - angle);

          if (difference < itemAngle / 2) {
            $(this).addClass("ipu-highlight ipu-visible");
          } else if (difference >= (90 - itemAngle / 2)) { // 距离不能超过90度
            $(this).removeClass("ipu-highlight ipu-visible");
          } else {
            $(this).addClass("ipu-visible").removeClass("ipu-highlight");
          }
        });
      };

      // 设置最后回归位置
      Picker.prototype.endScroll = function () {
        this.wrap.removeClass("ipu-noanimate");
        var endAngle;

        if (this.angle < this.beginAngle) {
          endAngle = this.beginAngle;
        } else if (this.angle > this.endAngle) {
          endAngle = this.endAngle;
        } else {
          var index = parseInt((this.angle / itemAngle).toFixed(0));
          endAngle = (itemAngle * index);
        }

        this.setAngle(endAngle, true);
      };

      // 进行惯性滚动
      Picker.prototype.scrollDistAngle = function (startAngle, distAngle, duration) {
        var self = this;
        var nowTime = new Date().getTime();
        this.stopInertiaMove = false;
        duration = 1 * duration; // 滚动时长控制修改

        // hammer调用的惯性函数
        (function (nowTime, startAngle, distAngle, duration) {
          var frameInterval = 13;
          var stepCount = duration / frameInterval;
          var stepIndex = 0;

          (function inertiaMove() {
            if (self.stopInertiaMove) return;
            var newAngle = self.quartEaseOut(stepIndex, startAngle, distAngle, stepCount);
            self.setAngle(newAngle);
            stepIndex++;

            if (stepIndex > stepCount - 1 || newAngle < self.beginExceed || newAngle > self.endExceed) {
              self.endScroll();
              return;
            }

            setTimeout(inertiaMove, frameInterval);
          })();

        })(nowTime, startAngle, distAngle, duration);
      };

      /**
       * 设置是否监听触发onChange回调
       *
       * @param {Boolean} listen
       */
      Picker.prototype.setListen = function (listen) {
        this.listen = !!listen;
      };

      Picker.prototype.quartEaseOut = function (t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
      };

      /**
       * 设置选中项，若子项的value属性为value，则设置该项为选中项
       *
       * @param value
       */
      Picker.prototype.setSelectedValue = function (value) {
        var self = this;
        for (var index in self.data) {
          var item = self.data[index];
          if (item.value == value) {
            self.setAngle(index * itemAngle, true);
            return;
          }
        }
      };

      /**
       * 获取选中的子项，若子项集为空时，返回空对象
       *
       * @returns {Object}
       */
      Picker.prototype.getSelectedItem = function () {
        return this.empty ? {} : this.data[this.index];
      };

      /**
       * 获取选中的子项的value属性
       * @returns
       */
      Picker.prototype.getSelectedValue = function () {
        return this.getSelectedItem().value;
      };

      /**
       * 返回选中项的text属性
       * @return {String}
       */
      Picker.prototype.getSelectedText = function () {
        return this.getSelectedItem().text;
      };

      /**
       * 获取选中项的索引，若子项集为空则返回null
       * @returns {Number}
       */
      Picker.prototype.getSelectedIndex = function () {
        return this.index;
      };

      ipuUI.Picker = Picker;

    })(ipuUI || window, jQuery, Hammer);

// popPicker
    (function (ipuUI, $) {
      var Picker = ipuUI.Picker;

      /**
       * @class
       * 原生select的替代实现，适应数据较多或级联的情况
       *
       *      @example
       *    // 配置项data的数据结构
       *    var data = [{text:'显示名称'， value:''}...];
       *
       *    //　layer=1的数据结构
       *    var data-1 = [{text:'湖南'， value:'HN'}, {text:'湖北'， value:'HB'}];
       *
       *    // layer=2时的数据结构，有额外data属性存放下一层级数据
       *    var data-1 = [{
   *      text:'湖南'，value:'HN', data:[{text:'长沙', value:'CS'}, {text:'湘谭'， value:'XT'}]
   *     },{
   *      text:'湖北'，value:'HB', data:[{text:'武汉', value:'WH'}, {text:'天门'， value:'TM'}]
   *      }
       *    ];

       *
       * @constructor  不能直接访问该类，调用{@link ipuUI.popPicker(slt, option)}生成实例
       * @param {String|jqueryObj} slt
       *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
       */
      function PopPicker(option) {
        this.option = $.extend({}, this.defaultOption, option);
        if (!Picker) {
          Picker = ipuUI.Picker;
        }
        this._init();
      }

      PopPicker.prototype._init = function () {
        this.holder = $(this.option.template).appendTo("body");
        var bodyHtml = $(".ipu-poppicker-body", this.holder);

        var layer = this.option.layer;
        var width = (100 / layer) + "%";
        this.pickers = new Array(layer);
        var self = this;
        var pickerHtml;
        this.mask = this.createMask();

        // 先初始化最底层picerk，再上面来
        for (var i = layer - 1; i >= 0; i--) {
          pickerHtml = $(this.option.pickerTemplate).prependTo(bodyHtml).css({width: width});

          this.pickers[i] = new Picker(pickerHtml, {
            onChange: (function (i) {
              return function (item) { // 更新底部的值
                if (i != layer - 1) {
                  self.pickers[i + 1].setItems(item.data);
                }
              };
            })(i)
          });
        }

        $(".ipu-poppicker-btn-ok", this.holder).click(function () {
          var rs = self.getSelectItems();
          if (self.option.callBack(rs) !== false) {
            self.hide();
          }
        }).text(this.option.btns[1]);

        $(".ipu-poppicker-btn-cancel", this.holder).click(function () {
          self.hide();
        }).text(this.option.btns[0]);
      };

      /**
       * 组件默认配置项
       *
       * @cfg {Object} defaultOption
       * @cfg {String} defaultOption.template html结构
       * @cfg {String} defaultOption.pickerTemplate 内容dom选择器
       * @cfg {Object[]} defaultOption.data 选择项数据
       * @cfg {String} defaultOption.data.text 子项展示文本
       * @cfg {*} defaultOption.data.value 子项值
       * @cfg {Object[]} defaultOption.data.data 有更多层级时，此属性存放下一层级的数据
       * @cfg {Number} defaultOption.layer=1 数据层数
       * @cfg {String[]} defaultOption.btns=['取消', '确认'] 按钮文本
       * @cfg {Function} defaultOption.callBack=null 回调函数
       */
      PopPicker.prototype.defaultOption = {
        template: '<div class="ipu-poppicker">'
        + '<div class="ipu-poppicker-header">'
        + '<button class="ipu-btn ipu-btn-s ipu-poppicker-btn-cancel">取消</button>'
        + '<button class="ipu-btn ipu-btn-s ipu-poppicker-btn-ok">确定</button>'
        + '</div>'
        + '<div class="ipu-poppicker-body">'
        + '</div>'
        + '</div>',
        pickerTemplate: '<div class="ipu-picker">'
        + '<div class="ipu-picker-selectbox"></div>'
        + '<ul></ul>'
        + '</div>',
        data: [],    // 数据
        layer: 1,   // 数据层级
        btns: ['取消', '确认'],
        callBack: function () { // 选择数据时的回调函数

        }
      };

      /**
       * 设置选择项数据
       *
       * @param{[Object]} data 选择项数组
       * @param {String} data.text 每个选择项的文本
       * @param {[Object]} data.data 如果有多层选择的话，应该有一个data属性
       */
      PopPicker.prototype.setData = function (data) {
        this.pickers[0].setItems(data);
      };

      /**
       * 显示选择器
       *
       * @param callBack
       */
      PopPicker.prototype.show = function (callBack) {
        if (callBack) {
          this.option.callBack = callBack;
        }
        this.mask.show();
        this.holder.addClass("ipu-current");
      };

      /**
       * 隐藏选择器
       */
      PopPicker.prototype.hide = function () {
        this.mask.close();
        this.holder.removeClass("ipu-current");
      };

      /**
       * 获取用户选择的项，如果配置项layer为1，则直接返回选择项，
       * 否则返回一个数组返回每层选中的项
       *
       */
      PopPicker.prototype.getSelectItems = function () {
        if (this.option.layer == 1) {
          return this.pickers[0].getSelectedItem();
        } else {
          var rs = [];
          for (var i = 0; i < this.option.layer; i++) {
            rs.push(this.pickers[i].getSelectedItem());
          }
          return rs;
        }
      };

      // 应该移除callback参数，提取出业成一个工具方法
      PopPicker.prototype.createMask = function (callback) {
        var self = this;
        var element = document.createElement('div');
        element.classList.add("ipu-picker-backup");
        //element.addEventListener($.EVENT_MOVE, $.preventDefault);
        element.addEventListener('click', function () {
          self.hide();
        });
        var mask = [element];
        mask._show = false;
        mask.show = function () {
          mask._show = true;
          element.setAttribute('style', 'opacity:1');
          document.body.appendChild(element);
          return mask;
        };
        mask._remove = function () {
          if (mask._show) {
            mask._show = false;
            element.setAttribute('style', 'opacity:0');
            setTimeout(function () {
              var body = document.body;
              element.parentNode === body && body.removeChild(element);
            }, 350);
          }
          return mask;
        };
        mask.close = function () {
          if (mask._show) {
            if (callback) {
              if (callback() !== false) {
                mask._remove();
              }
            } else {
              mask._remove();
            }
          }
        };
        return mask;
      };

      /**
       * @member ipuUI
       * 生成PopPicker实例，参数信息见{@link PopPicker#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {PopPicker}
       */
      ipuUI.popPicker = function (option) {
        return new PopPicker(option);
      };

    })(ipuUI || window, jQuery);

    (function (ipuUI, $) {

      /**
       * @class
       * 进度条
       *
       *      @example
       *       <!-- 组件html -->
       *       <div class="ipu-progress ">
       *         <span class="ipu-progressbar"></span>
       *       </div>
       *
       *
       * @constructor  不能直接访问该类，调用 {@link ipuUI#progressBar}生成实例
       * @param {String|jqueryObj} slt
       *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
       */
      function ProgressBar(id, option) {
        this.id = id;
        this.level = option.level;
        this.progress = option.progress;
        this.progressBar = $(id).eq(0);

        if (option.progress != null) {
          this.setProgress(this.progress);
        }
        if (option.level != null) {
          this.setLevel(this.level);
        }
      }

      /**
       * @cfg defaultOption 刷新组件默认配置
       * @cfg {default|warning|highlight|success} defaultOption.level='default' 级别，显示颜色
       * @cfg {Number} defaultOption.progress=null    当前进度百分比
       *
       */

      /**
       * 设置百分进度
       *
       * @param {Number} pro
       */
      ProgressBar.prototype.setProgress = function (pro) {
        if (pro < 0 || pro > 100) return;

        $(this.progressBar.find(".ipu-progressbar")).css("transform", "translate3d(" + (-(100 - pro)) + "%, 0px, 0px)");
        this.progress = pro;
      };

      /**
       * 获取百分进度
       *
       * @returns {Number|*}
       */
      ProgressBar.prototype.getProgress = function () {
        return this.progress;
      };

      /**
       * 设置进度条级别
       *
       * @param {default | success | highlight | warning} level
       */
      ProgressBar.prototype.setLevel = function (level) {
        if (level == "default") {
          $(this.progressBar).removeClass("ipu-progressbar-success ipu-progressbar-hightlight ipu-progressbar-warning");
          $(this.progressBar).addClass("ipu-progress");
        } else if (level == "success") {
          $(this.progressBar).removeClass("ipu-progressbar-highlight ipu-progressbar-warning");
          $(this.progressBar).addClass("ipu-progressbar-success");
        } else if (level == "highlight") {
          $(this.progressBar).removeClass("ipu-progressbar-success ipu-progressbar-warning");
          $(this.progressBar).addClass("ipu-progressbar-highlight");
        } else if (level == "warning") {
          $(this.progressBar).removeClass("ipu-progressbar-success ipu-progressbar-highlight");
          $(this.progressBar).addClass("ipu-progressbar-warning");
        }
      };

      /**
       * @member ipuUI
       * 生成PopPicker实例，参数信息见{@link ProgressBar#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {ProgressBar}
       */
      ipuUI.progressBar = function (slt, option) {
        return new ProgressBar(slt, option);
      };
    })(ipuUI || window, jQuery);

// 设置上下条件长度，或计算函数
// 处理resize的问题，用户主动调用refresh？？
// 底部启用或停用时，应该刷新组件iscroll高度
// 顶部正在加载时，自动停止底端加载状态，停用底部加载，停用底部加载时，可以不隐藏，变性成显示不见，或者隐藏，然后修改iscroll参数

    (function (ipuUI, $, iScroll) {
      /**
       * @class
       * 通过IScroll.js实现上拉下拉加载
       *
       *      @example
       *      <!-- 组件html结构，最外层div应有一个固定的高度，会在此元素上初始化iScroll -->
       *      <div>
       *        <div class="ipu-refresh-wrapper">
       *          <!-- 此处组件初始化后，会添加上拉html -->
       *          <div class="refresh-content">
       *            内容区...
       *          </div>
       *          <!-- 此处组件初始化后，会添加下拉html -->
       *        </div>
       *      </div>
       *
       * @uses IScroll.js
       *
       * @constructor  不能直接访问该类，调用ipuUI.refresh(slt, option)生成实例
       * @param {String|JqueryObj|Dom} slt
       *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {Object} option
       *      组件参数
       */
      function Refresh(slt, option) {
        this.option = $.extend({}, this.defaultOption, option);
        this.el = $(slt).get(0);
        this._initBottomAndTop();
        var me = this;

        this.iScrollOption = {
          onScrollMove: function (e) {
            if (me.topEnable && !me.topLoading) { // 顶部是松手才加载
              if (this.y >= me.topPullOffset && !me.topEl.hasClass('ipu-refresh-toload')) { // 达到刷新距离，更新显示状态
                me.topEl.addClass('ipu-refresh-toload');
              } else if (this.y < me.topPullOffset && me.topEl.hasClass('ipu-refresh-toload')) { // 从达到刷新距离更新为未达到距离，更新显示状态
                me.topEl.removeClass('ipu-refresh-toload');
              }
            }

            me._checkBottomLoading(); // 底部加载条件和顶部条件不一样，只要滚动离底部一定高度就开始加载
            me.goTop = this.y > me.topPullOffset; // 记录是否位于顶部位置，以便刷新后可以回到此位置
          },
          onBeforeScrollEnd: function () {    // 一定是用户拖动触发，在滚动结束前应该触发
            me._checkTopLoading();
            me._checkBottomLoading();
          },
          onScrollEnd: function () { // 这个事件可能由非用户拖动时触发，可能是拖动惯性导致，所有顶部不应该处理，但顶部不管是否惯性，位置条件满足即触发
            if (me.topLoading && this.y < this.minScrollY && me.goTop) {
              me.iScroll.scrollTo(0, this.minScrollY, 0);
            }
            me._checkBottomLoading(); // 在beforend执行还不够，还在要end执行
          },
          onRefresh: function () { // 刷新时，若顶部加载还在进行，且当前显示的顶部加载，则继续显示，否则刷新后会消失顶部加载,这里代码没有考虑重用了,应该可以做一步提取
            if (me.topLoading) { // 如果顶部在加载，则刷新的时候，设置最小顶部距离，显示顶部加载状态
              this.minScrollY = this.minScrollY + me.topPullOffset;
            }
          }
        };

        this.iScrollOption = $.extend({}, this.option.iScrollOption, this.iScrollOption);
        this.iScroll = new iScroll(this.el, this.iScrollOption);
        this._checkContentLoading();
      }

      /**
       * @cfg defaultOption 刷新组件默认配置
       * @cfg {Function} defaultOption.bottomLoadFun=null 上拉时，触发底加载的响应函数
       * @cfg {Function} defaultOption.topLoadFun=null    下拉时，触发顶部加载的响应函数
       * @cfg {Boolean} defaultOption.initEnableTop=true   初始化时，是否启用顶部加载功能
       * @cfg {Boolean} defaultOption.initEnableBottom=true   初始化时，是否启用底部加载功能
       * @cfg {String} defaultOption.bottomLoadHtml=...   底部加载时显示的html片段，不建议变动
       * @cfg {String} defaultOption.topLoadHtml=...   顶部加载时显示的html片段，不建议变动
       * @cfg {Number} defaultOption.bottomAddLen=0   距离底部多远时，触发底部加载
       *
       */
      Refresh.prototype.defaultOption = {
        bottomLoadFun: null,           // 底部加载处理函数
        topLoadFun: null,               // 顶部加载处理函数
        initEnableTop: true,            // 初始时启用刷新，有时用户并不想启用
        initEnableBottom: true,         // 初始时启用加载更多，用时用户并不想启用
        bottomLoadHtml: '<div class="ipu-refresh-bottom"><span class="ipu-refresh-loading"></span></div>',  // 默认底部加载显示内容
        topLoadHtml: '<div class="ipu-refresh-top"><span class="ipu-refresh-loading"></span><div class="ipu-refresh-arrow"></div></div>',
        // 默认顶部加载显示内容，最上层节点class有下面三个阶段变化
        // 默认阶段，不是顶部加载状态时，且拖动时未达到加载距离，无特殊class，移除ipu-refresh-top-loading
        // 拖动达到加载距离，则增加class:ipu-refresh-toload
        // 加载中，则增加class:ipu-refresh-top-loading，移除class:ipu-refresh-toload
        bottomAddLen: 0,  // 底部提前加载距离，单位px
        iScrollOption: {} // 主要是用来接收外面一些函数，不能传递回调的相关函数如refresh,也可在本地函数调用完后，再调用参数的函数，不推荐
      };

      Refresh.prototype._initBottomAndTop = function () {
        this.scrollEl = $(">.ipu-refresh-wrapper", this.el);
        this.bottomEl = $(this.option.bottomLoadHtml).appendTo(this.scrollEl);
        this.topEl = $(this.option.topLoadHtml).prependTo(this.scrollEl);

        this.topPullOffset = this.topEl.outerHeight();
        this.bottomPullOffset = this.bottomEl.outerHeight() + this.option.bottomAddLen; // 增加100;最好配一个额外参数

        /** @property {Boolean} 顶部是否加载中 */
        this.topLoading = false;        // 顶部正在载加载

        /** @property {Boolean} 底部是否加载中 */
        this.bottomLoading = false;     // 底部正在加载

        /** @property {Boolean} 底部是否可加载 */
        this.bottomEnable = this.option.initEnableBottom && !!this.option.bottomLoadFun;

        /** @property {Boolean} 顶部是否可加载 */
        this.topEnable = this.option.initEnableTop && !!this.option.topLoadFun;

        this.goTop = false;         // 用来处理，因为iScroll使用momentum（惯性）， 导致有时顶部显示不正确问题，true表示顶部显示加载条

        this.enableBottom(this.bottomEnable);
        this.enableTop(this.topEnable);
      };

      // 检查是否需要底部加载
      Refresh.prototype._checkBottomLoading = function () {
        if (this.bottomEnable) {
          if (this.iScroll.y < this.iScroll.maxScrollY + this.bottomPullOffset) {
            this._startBottomLoading();
          }
        }
      };

      Refresh.prototype._checkTopLoading = function () {
        if (this.topEnable) {
          if (this.topEl.hasClass('ipu-refresh-toload')) {
            this._startTopLoading();
          }
        }
      };

      // 检查内容是否超出容器高度，未超出时，自动调用底部加载
      Refresh.prototype._checkContentLoading = function () {
        if (this.bottomEnable) {
          if (this.iScroll.maxScrollY >= -this.bottomPullOffset) { // 此处要计算底端的高度
            this._startBottomLoading();
          }
        }
      };

      // 开始底部加载
      Refresh.prototype._startBottomLoading = function () {
        if (!this.bottomLoading) {
          this.bottomLoading = true;
          this.option.bottomLoadFun(); // 刷新当前索引加载更多的数据
        }
      };

      // 开始顶部加载
      Refresh.prototype._startTopLoading = function () {
        if (!this.topLoading) {
          this.topLoading = true;
          this.topEl.removeClass('ipu-refresh-toload').addClass('ipu-refresh-top-loading');
          this.iScroll.minScrollY = this.iScroll.minScrollY + this.topPullOffset;
          this.option.topLoadFun(); // 刷新当前索引加载更多的数据
        }
      };

      /**
       * 结束底部加载，defaultOption.bottomLoadFun中处理完加载后，最后调用此方法
       */
      Refresh.prototype.endBottomLoading = function () {
        this.bottomLoading = false;
        this.refresh();
      };

      /**
       * 结束顶部加载，defaultOption.topLoadFun中处理完加载后，最后调用此方法
       */
      Refresh.prototype.endTopLoading = function () {
        this.topEl.removeClass('ipu-refresh-top-loading');
        this.topLoading = false;
        // this.iScroll.scrollTo(0, 0); // 刷新加载则应该回到顶部，待测试确认
        this.refresh();
      };

      /**
       * 是否启动顶部加载功能
       *
       * @param {Boolean} enable
       */
      Refresh.prototype.enableTop = function (enable) {
        this.topEnable = enable;
        if (enable) {
          this.topEl.show();
        } else {
          this.topEl.hide();
        }
      };

      /**
       * 是否启用底部加载功能
       *
       * @param {Boolean} enable
       */
      Refresh.prototype.enableBottom = function (enable) {
        this.bottomEnable = enable;
        if (enable) {
          this.bottomEl.show();
        } else {
          this.bottomEl.hide();
        }
      };

      /**
       * 在内容发生变化时，但是又不是因为顶部加载或底部加载导致的，此时调用此方法刷新IScroll
       */
      Refresh.prototype.refresh = function () {
        this.iScroll.refresh();
        this._checkContentLoading();
      };


      /**
       * @member ipuUI
       * 生成PopPicker实例，参数信息见{@link Refresh#method-constructor}
       *
       * @param {String} slt
       * @param {Object} option
       * @returns {Refresh}
       */
      ipuUI.refresh = function (slt, optoins) {
        return new Refresh(slt, optoins);
      };

    })(ipuUI || window, jQuery, iScroll);

// Tab
    (function (ipuUI, $) {

      /**
       * @class
       * tab切换组件功能实现
       *
       *      @example
       *      <!-- html结构 -->
       *      <div class="ipu-tab">  <!-- 如果class中添加 ipu-tab-fixed，则可固定头部，此时需要父元素的高度是确定的 -->
       *        <ul class="ipu-tab-title ipu-tab-title-link"> <!-- 页头有 ipu-tab-title-link 和 ipu-tab-title-button两种样式 -->
       *          <li>热门推荐</li>
       *          <li class="ipu-current">全部表情</li>  <!-- class为ipu-current为默认选中项 -->
       *          <li>表情</li>
       *          <li>表情</li>
       *        </ul>
       *        <div class="ipu-tab-body">
       *          <ul class="ipu-tab-body-wrapper">
       *            <li>自定义内容</li>
       *            <li class="">选项2内容</li>
       *            <li class="">选项3内容</li>
       *            <li class="">选项4内容</li>
       *          </ul>
       *        </div>
       *      </div>
       *
       *
       * @constructor  不能直接访问该类，调用ipuUI.tab(slt, option)生成实例
       * @param {string|jqueryObj} slt
       *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
       * @param {object} option
       *      组件参数
       */
      function Tab(slt, option) {
        this.el = $(slt).get(0);
        this.titleItems = $(".ipu-tab-title:first>li", this.el);
        this.bodyWrapper = $(".ipu-tab-body-wrapper:first", this.el);
        this.contentItems = $(">li", this.bodyWrapper);

        this.option = $.extend({}, this.defaultOption, option);
        this.itemSize = this.contentItems.size();
        this.fixed = $(this.el).is(".ipu-tab-fixed"); // 是否为固定高度的

        var that = this;
        this.titleItems.each(function (index) {
          $(this).click(function () {
            that.show(index);
          });
        });

        var index = this.titleItems.filter(".ipu-current").index();
        if (index == -1) {
          index = 0;
        }

        this.show(index);
      }

      /**
       * 默认配置项
       * @cfg defaultOption = { callBack: function (index) {}};
       * @cfg defaultOption.callBack 切换tab项时的回调函数，参数为显示的项索引
       */
      Tab.prototype.defaultOption = {
        callBack: function (index) {
        }
      };

      /**
       * 显示第几项内容
       * @param {number} index 要显示的项索引
       */
      Tab.prototype.show = function (index) {
        if (this.fixed) {
          var move = -index * 100 + "%";
          this.bodyWrapper.css("transform", "translate3d(" + move + ", 0, 0)");
        }
        this.contentItems.eq(index).addClass("ipu-current").siblings().removeClass("ipu-current");
        this.titleItems.eq(index).addClass("ipu-current").siblings().removeClass("ipu-current");
        this._end(index);
      };

      Tab.prototype._end = function (index) {
        this.lastIndex = this.currentIndex;
        this.currentIndex = index;

        if (this.option.callBack) {
          this.option.callBack(index, this.lastIndex);
        }
      };

      ipuUI.tab = function (slt, option) {
        return new Tab(slt, option);
      };
    })(ipuUI || window, jQuery);


    // 初始化代码
    jQuery(function () {
      // 添加一个touchstart空函数，让:active样式可以在ios上生效
      // 新版默认不需要事件好像也可生效
      jQuery("body").on("touchstart", function (e) {
      });

      // 处理ios点击延迟问题
      FastClick.attach(document.body);
    });

    return ipuUI;
  }

  // todo:可以添加一个和其它库的适配处理，
  // 这里假设第三方库，jquery，iScroll，Hammer的史称已经固定
  if (typeof define === "function" && define.amd) {
    define(['jquery', 'iScroll', 'Hammer', 'FastClick'], function (jQuery, iScroll, Hammer, FastClick) {
      return window.ipuUI = setup(jQuery, iScroll, Hammer, FastClick);
    });
  } else {
    window.ipuUI = setup(window.jQuery, window.iScroll, window.Hammer, window.FastClick);
  }

})();

