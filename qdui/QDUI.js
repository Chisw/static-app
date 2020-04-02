/*
  QDUI.js
  @jisuowei 2019/1/3
*/

;(function() {

  var QD = {

    init: function() {
      this.extendNative();
      this.extendJQuery();
      this.initInputLimit();
      this.initEvent();
    },


    // 扩展原生
    extendNative: function() {

      // 修剪字符串
      String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
      };

      // 转义字符串中的 双引号
      String.prototype.encodeJSON = function() {
        return encodeURIComponent( this.replace(/\"/g, '&quot;') );
      };

      // 日期扩展
      Date.prototype.getDatetime = function() {
        var Y = this.getFullYear(),
          M = this.getMonth() + 1,
          D = this.getDate(),
          h = this.getHours(),
          m = this.getMinutes(),
          s = this.getSeconds();
        return Y + '/' + (M>9?M:'0'+M) +'/'+ (D>9?D:'0'+D) +' '+ (h>9?h:'0'+h) +':'+ (m>9?m:'0'+m) +':'+ (s>9?s:'0'+s);
      };

      // 地址栏参数
      var pairs = location.search.substring(1).split('&');

      location._search = {};

      pairs.forEach(function(o, i) {
        var pair = o.split('=');
        if ( pair[0] ) location._search[ pair[0] ] = pair[1];
      });

      pairs = null;

      location.seek = function(key) {
        var val = this._search[key];
        if ( val !== undefined ) {
          val = decodeURIComponent( val );
        } else {
          val = null;
        }
        return val;
      }
    },


    // 扩展 jQuery
    extendJQuery: function() {

      if ( !$ ) return null;

      // 组件激活
      $.fn.able = function() {
        $(this).removeAttr('disabled');
      };
      // 组件失活
      $.fn.disable = function() {
        $(this).attr('disabled', 'true');
      };
      // 组件活性
      $.fn.isDisabled = function() {
        return $(this).attr('disabled') !== undefined;
      };

      // 禁止滚动
      $.fn.extend({
        preventScroll: function() {
          $(this).each(function() {
            var that = this;
            if ( navigator.userAgent.indexOf('Firefox') >= 0 ) {
              that.addEventListener('DOMMouseScroll', function(e) {
                that.scrollTop += e.detail > 0 ? 60 : -60;
                e.preventDefault();
              }, false);
            } else {
              that.onmousewheel = function(e) {
                e = e || window.event;
                that.scrollTop += e.wheelDelta > 0 ? -60 : 60;
                return false;
              };
            }
          })
        }
      });

    },  // extendJQuery


    // 输入框限制
    initInputLimit: function() {

      $('body')
        // 最大输入长度
        .on('input propertychange', '[max-len]', function() {
          var $input = $(this),
            val = $input.val(),
            max = $input.attr('max-len') || 150,
            txt = $input.attr('max-len-tip') || ( '最多只能输入'+ max +'个字' );
          if ( val.length > max ) {
            $input.val( val.substring(0, max) );
            QD.toast(txt);
          }
        })
        // 价格校验
        .on('input propertychange', '[only-price]', function() {
          var $input = $(this),
            val  = $input.val();

          // 空串跳出
          if ( val === '' ) return false;

          // 去掉非数字、非点字符；并记录点个数
          var arr  = [],
            dots = 0;
          $.each(val.split(''), function(i, o) {
            if ( /\d{1}|\.{1}/.test(o) ) {
              arr.push(o);
              if ( o == '.' ) dots++;
            }
          });
          val = arr.join('');

          var firstDotIndex = val.indexOf('.');

          // 第一个字符为点 清空
          if ( firstDotIndex == 0 ) {

            val = '';

          } else if ( firstDotIndex != -1 ) {  // 存在点

            // 多个点时，截取第一个点后字符并清空剩余点
            if ( dots > 1 ) {
              var rest = val.substring( firstDotIndex + 1 ).replace(/\./g, '');
              val = val.substring(0, firstDotIndex + 1) + rest;
            }

            // 点后数字超过两位时
            if ( val.substring( firstDotIndex + 1 ).length > 2 ) {
              val = val.substring(0, firstDotIndex + 3 );
            }
          }

          if ( +val > 99999.99 ) val = 99999.99;

          $input.val( val )
        })
        .on('blur', '[only-price]', function() {
          var $input = $(this),
            val  = $input.val();

          if ( +val == 0 ) {
            $input.val('');
          } else {
            $input.val(parseFloat(val));
          }
        })
        // 校验输入数字
        .on('input propertychange', '[only-amount]', function() {
          var $this = $(this),
            val   = $(this).val();

          if( !val || isNaN(+val) ) {
            $this.val('');
          } else {
            if ( val > 99999 ) {
              val = 99999;
            }
            $this.val( parseInt(val) || '' );
          }
        })
    },  // initInputLimit


    // 事件代理
    initEvent: function() {

      var that = this;

      $('body')
        // 1 按钮
        .on('click', '.qd-btn', function() {
          var $btn   = $(this),
            disabled = $btn.isDisabled();

          if ( !disabled ) $btn.trigger('safe-click');

        })
        // 2-1 单选
        .on('click', '.qd-radio', function() {
          var $radio   = $(this),
            name   = $radio.attr('name'),
            disabled = $radio.isDisabled(),
            // 存在强制选中的情况
            $radioed = $('.qd-radio[name="'+ name +'"].on'),
            _dis   = $radioed.isDisabled();

          if ( _dis || disabled ) return null;

          $('.qd-radio[name="'+ name +'"]').removeClass('on');

          $radio
            .addClass('on')
            .trigger('safe-click');  // 触发自定义事件
        })

        // 2-2 复选框
        .on('click', '.qd-checkbox', function() {
          var $checkbox = $(this),
            disabled  = $checkbox.isDisabled();

          if ( disabled ) return null;

          $checkbox
            .toggleClass('on')
            .trigger('safe-click');
        })

        // 2-2 复选框 全选校验
        .on('safe-click', '.qd-checkbox', function() {
          var name  = $(this).attr('name'),
            all   = $('.qd-checkbox[name="'+ name +'"]').length,
            select  = $('.qd-checkbox[name="'+ name +'"].on').length,
            $allBtn = $('.qd-checkbox-all[name="'+ name +'"]');

          if ( !$allBtn ) return null;

          if ( select === 0 ) {
            $allBtn.removeClass('on half');
          } else if ( select < all ) {
            $allBtn.removeClass('on').addClass('half');
          } else if ( select === all ) {
            $allBtn.removeClass('half').addClass('on');
          }
        })
        // 2-2 复选框 全选
        .on('click', '.qd-checkbox-all', function() {
          var $this  = $(this),
            name   = $this.attr('name'),
            isAll  = $this.hasClass('on'),  // 是否已经全选了
            $list  = $('.qd-checkbox[name="'+ name +'"]'),  // 全部匹配的同 name 复选框
            all  = $list.length,
            select = 0;

          $list.each(function(i, o) {
            var $o   = $(o),
              canOpt = !$o.isDisabled();

            if ( canOpt ) {
              if ( isAll ) {
                $o.removeClass('on');
                $this.removeClass('on half');
              } else {
                $o.addClass('on');
                select++;
              }
            }
          });

          if ( select === 0 ) {
            $this.removeClass('on half');
          } else if ( select < all ) {
            $this.removeClass('on').addClass('half');
          } else if ( select === all ) {
            $this.removeClass('half').addClass('on');
          }

          $this.trigger('safe-click');

        })
        // 2-2 复选框 反选
        .on('click', '.qd-checkbox-reverse', function() {
          var $this = $(this),
            name  = $this.attr('name');

          if ( !name ) return null;

          $('.qd-checkbox[name="'+ name +'"]').each(function(i, o) {
            var $o = $(o);
            if ( !$o.isDisabled() ) $o.trigger('click');
          });
        })

        // 5 输入框
        .on('click', '.qd-input', function() {
          var $input   = $(this),
            disabled = $input.isDisabled();

          if ( !disabled ) $input.trigger('safe-click');
        })

        // 8 标签页 Tab
        .on('click', '.qd-tab .tab-item', function() {
          var $tab   = $(this),
            index  = $tab.index(),
            $list  = $tab.parent().siblings('.tab-body'),
            disabled = $tab.isDisabled();

          if ( disabled ) return null;

          $tab
            .addClass('on')
            .trigger('safe-click')
            .siblings().removeClass('on');

          if ( $list.length ) {
            $list
              .find('.tab-content')
              .hide()
              .eq(index)
              .show();
          }
        })

        // 10. Open
        .on('click', '.dialog-close', function() {
          var uuid = $(this).data('uuid');
          that.close(uuid);
        })
        .on('safe-click', '.qd-dialog-cancel', function() {
          $(this).parents('.qd-dialog').find('.dialog-close').trigger('click');
        })

        .on('dblclick', function() {

          if ( isNaN(that.devCount) ) that.devCount = 0;
          that.devCount++;

          if ( that.devCount === 20 ) {
            QD.open({title: 'location.href', content: location.href});
          }
        })


    },  // initEvent


    // 生成 uuid 字符串：用于 append 到 body 的遮盖层的 id 和 z-index，递增保证后来居上
    _count: 1024,
    _makeUUID: function() {
      return ''+ this._count++;
    },  // _uuid


    // 单选取值
    radio: function(name) {

      return $('.qd-radio[name="'+ name +'"].on').attr('value');

    },  // radio


    // 复选框取值
    checkbox: function(name) {

      var res = [];

      $('.qd-checkbox[name="'+ name +'"].on').each(function(i, o) {
        res.push( $(o).attr('value') );
      });

      return res;

    },  // checkbox


    /*
      # toast
      text  [str]*  弹出的文本内容
      time  [number]  显示的毫秒数，默认为 2000
    */
    toast: function(text, time) {

      var uuid  = this._makeUUID(),
        bread =
          '<div class="qd-toast" id="qd-toast-'+ uuid +'" style="z-index:'+ uuid +';">'+
          text +
          '</div>';

      $('body').append(bread);

      var $bread = $('#qd-toast-'+ uuid),
        width  = $bread.outerWidth();

      $bread
        .css({marginLeft: '-'+ ( width / 2 ) +'px'})
        .addClass('on');

      setTimeout(function() {
        $bread.remove();
      }, time || 2000);

    },  // toast


    /*
      # open 弹窗
      pa     [+]*    JSON 参数
      - title  [string]  弹框标题
      - width  [number]  宽度
      - height   [number]  高度
      - content  [string]  html 片段
      - btn    [string]  由于设计布局较为复杂，btn 仍以 html 片段形式填充
      - _class   [string]  内部参数，目前可选项有 ['-alert']
      # 返回 dialog uuid [string]
    */
    open: function(pa) {

      if ( !pa ) return null;

      var uuid   = this._makeUUID(),
        _class = pa._class || '',
        dialog =
          '<div class="qd-dialog-mask" id="qd-dialog-mask-'+ uuid +'" style="z-index:'+ uuid +';"></div>' +
          '<div class="qd-dialog '+ _class +'" data-uuid="'+ uuid +'" id="qd-dialog-'+ uuid +'" style="z-index:'+ uuid +';">' +
            '<div class="dialog-head">' +
              '<span class="dialog-title">'+ pa.title +'</span>' +
              '<span class="dialog-close" data-uuid="'+ uuid +'"></span>' +
            '</div>' +
            '<div class="dialog-body">' +
              pa.content +
            '</div>' +
            '<div class="dialog-foot">' +
              ( pa.btn || '' ) +
            '</div>' +
          '</div>';

      $('body').append(dialog);

      var css = {};

      if ( pa.width && !isNaN(pa.width) ) {
        css.width = pa.width +'px';
        css.marginLeft = '-'+ pa.width / 2 + 'px';
      }

      if ( pa.height && !isNaN(pa.height) ) {
        css.height = pa.height +'px';
        css.marginTop = '-'+ pa.height / 2 + 'px';
      }

      $('#qd-dialog-'+ uuid).css(css);
      $('#qd-dialog-mask-'+ uuid).preventScroll();

      return uuid;

    },  // open


    /*
      # 警告框
      pa     [+]*    JSON 参数
      - content  [string]  警告的文本
      - btn    [string]  由于设计布局较为复杂，btn 仍以 html 片段形式填充
      mini     [string]  小警告框
      # 返回 dialog uuid [string]
    */
    alert: function(pa, mini) {
      var _mini = mini ? '-mini' : '';
      this.open($.extend(pa, {title: '', _class: '-alert '+ _mini}));
    },  // alert

    miniAlert: function(pa) {
      this.alert(pa, 'mini');
    },  // miniAlert


    // close 通用关闭弹框方法
    close: function(uuid) {

      var selector = '';
      list = [
        '#qd-dialog-',
        '#qd-dialog-mask-',
        '#qd-loading-',
      ];

      $.each(list, function(i, o) {
        selector += ( i === 0 ? '' : ',' ) + o + uuid;
      });

      $(selector).remove();

    },  // close


    // 传入 $btn 关闭所在的 dialog
    closeWith: function($btn) {
      var uuid = $btn.parents('.qd-dialog').data('uuid');
      this.close(uuid);
    },  // closeWith


    // 加载遮罩
    loading: function(time) {

      var that = this;

      var uuid  = this._makeUUID(),
        loading = '<div class="qd-loading" id="qd-loading-'+ uuid +'" style="z-index:'+ uuid +';"></div>';

      $('body').append(loading);

      $('#qd-loading-'+ uuid).preventScroll();

      return uuid;

    },  // loading


    // 重载当前页面：默认立即刷新，传入 time 后倒计时
    reload: function(time) {

      setTimeout(function() {
        location.reload();
      }, time || 0);

    },  // reload


  };

  window.QD = QD;

  QD.init();

})();