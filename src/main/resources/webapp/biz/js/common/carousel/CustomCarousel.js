// 临时用组件
define(["Hammer", "jquery", "ipuUI"], function (Hammer, $, ipuUI) {
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
   * @constructor  不能直接访问该类，调用 {@link ipu#customCarousel}生成实例
   * @param {String|JqueryObj} slt
   *      jquery选择器字符串或jquery对象，用来查找要被组件初始化化的dom
   * @param {Object} option 组件配置参数，默认配置见 {@link #cfg-defaultOption}
   */
  function CustomCarousel(slt, option) {
    this.option = $.extend({}, this.defaultOption, option);
    this.el = $(slt).get(0);
    this._init();
  }

  $.extend(CustomCarousel.prototype, {
    /**
     * 组件默认配置项
     *
     * @cfg {Object} defaultOption
     * @cfg {Number} defaultOption.index 初始化时显示第几项，用户未指定时，会查找子项内容上有ipu-current的项显示，默认显示第一项
     * @cfg {Number} defaultOption.showItemSize 一屏最多时出现的子项数量（循环的时候要复制的数量）
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
      showItemSize: 1,
      startIndex: 0,  // 起始位置，有时起始位置不为0;
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
      this.showItemSize = this.option.showItemSize; // 一屏展示子项数量，默认显示1个，做循环显示时只需要复制一个子项

      if (this.showItemSize > this.itemSize + 1) {
        this.enable = false;
        return; // 不能正常工作，无法初始化此组件，需要做异常处理
      }

      this.enable = true;
      this.startIndex = Math.ceil(this.option.startIndex);   // 起始位置，表明0不会显示，因为没法显示0
      this.endIndex = this.startIndex + this.itemSize;       // 结束位置展现同起始位置，只是索引不同
      this.carouselItemWides = []; // 子项宽度尺寸

      /** @property {Number} 当前显示子项索引，从0开始 */
      this.currentIndex = 0; // 当前显示子项索引
      this.moveLen = 0;      // 当前滚动移动距离

      /** @type {Boolean} 循环展示时，第一项会被复制，显示项是第一项时，是否为第一项的复制项 */
      this.cloneItem = false; //这个参数用来标记是否复制项

      if (this.option.indicator) {
        this._addIndicator();
      }

      // 如果做循环展示，则要复制起始展示项到最后面
      if (this.option.loop) {
        var cloneItem = this.carouselItems.slice(0, this.showItemSize).clone().appendTo(this.wrapper).removeClass("ipu-current");  // 这里假设每个元素宽度都是相等的
        if (cloneItem.size() < this.showItemSize) {
          this.carouselItems.slice(0, 1).clone().appendTo(this.wrapper).removeClass("ipu-current");
        }
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

      this._show(this.currentIndex, false);
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
        if (this.realIndex == this.startIndex) {
          this._show(this.endIndex, false);
          this.wrapper.width();
          index = this.endIndex - 1;
        } else {
          index = this.realIndex - 1;
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
      var index;
      if (this.option.loop) {
        if (this.realIndex == this.endIndex) {
          this._show(this.startIndex, false);
          this.wrapper.width();
          index = this.startIndex + 1;
        } else {
          index = this.realIndex + 1;
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
    show: function (index) {  // 跳到指定索引处，这里是realIndex
      var index = index % this.itemSize;  // todo: 起始项与结束项相同，应该看离那项近，往那边移动？
      if (index < 0) {
        index = this.itemSize + index;
      }
      index = this.startIndex + index;
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
      $(this.wrapper).removeClass("ipu-carousel-animate").width();
      this.carouselItemWides = [];

      var that = this;
      $(">li", this.wrapper).each(function (index, dom) {
        that.carouselItemWides[index] = $(this).position().left;
      });
      this.mostSize = this.itemSize * this.itemWidth;           // 宽度*数量
      this.startSize = that.carouselItemWides[this.startIndex]; // 起始位置
      this.endSize = that.carouselItemWides[this.endIndex];     // 宽度*数量
      // console.log(this.startSize + "--" + this.endSize);
    },
    /**
     * 宽度信息或尺寸信息发生变更时，进行刷新计算
     * 判断是否需要重新计算尺寸，若宽度尺寸发生变化，进行重新尺寸计算
     */
    refresh: function () {
      if (this.wrapperWidth != this.wrapper.outerWidth(true)) {
        this._sizeCount();
        this._show(this.realIndex, false); //新的位置
      }
    },
    _move: function (moveLen) { // 拖动时的处理
      this._pause();
      $(this.wrapper).removeClass("ipu-carousel-animate");

      if (this.option.loop) { // 循环时，起始位置
        moveLen = moveLen % this.mostSize;
        var move = (this.moveLen - moveLen);
        if (move < this.startSize) {
          move = move + this.mostSize;
        } else if (move > this.endSize) {
          move = move - this.mostSize
        }
      } else {
        var move = this.moveLen - moveLen;
        if (move < 0) {
          move = move / 2;
        } else if (move > this.endSize) {
          move = this.endSize + (move - this.endSize) / 2;
        }
      }

      this.displayMoveLen = move;
      move = -move + "px";
      $(this.wrapper).css("transform", "translate3d(" + move + ", 0, 0)");
    },
    _show: function (index, animate) { // index = realIndex
      if (animate !== false) { // 默认值为true
        animate = true;
      }

      // console.log(index); // 判断距离起始始和结束哪个位置更近

      this._pause();
      $(this.wrapper).toggleClass("ipu-carousel-animate", animate);

      if (index < this.startIndex) {  // 起始位置不一定位于0
        index = this.itemSize + index;
      } else if (index > this.endIndex) {
        index = index - this.itemSize;
      }

      if ((index == this.startIndex || index == this.endIndex) && this.displayMoveLen) { // 对于重复位置，需要根据最靠近移动
        var moveSize = Math.abs(this.displayMoveLen / this.itemWidth);
        if (Math.abs(this.startIndex - moveSize) > Math.abs(this.endIndex - moveSize)) {
          index = this.endIndex;
        } else {
          index = this.startIndex;
        }
      }


      this.realIndex = index;
      this.currentIndex = index % this.itemSize;
      this.cloneItem = index >= this.itemSize;

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
      // console.log(this.realIndex + " : " + this.currentIndex);

      if (this.displayMoveLen) {  // 这个值只在pancancel时使用，否则清0
        this.displayMoveLen = 0;
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

        // console.log("平移位置：" + intValue);
        if (this.option.loop) {
          intValue = intValue % this.itemSize;
          index = (this.realIndex + intValue);

          if (index < this.startIndex) {
            index = index + this.itemSize;
          } else if (index > this.endIndex) {
            index = index - this.itemSize;
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
   * 生成HammerCarousel实例，参数信息见{@link CustomCarousel#method-constructor}
   *
   * @param {String} slt
   * @param {Object} option
   * @returns {CustomCarousel}
   */
  ipuUI.customCarousel = function (slt, option) {
    return new CustomCarousel(slt, option);
  };


});
