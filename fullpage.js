;(function($, window){
    var def = {
        parent: '.inner',
        page: '.page',
        duration: 500,
        dir: 'v'
    };

    function Fullpage($this, conf){
        this.wrapper = $this;
        init.call(this, conf);
    }

    function init(conf){
        this.settings = $.extend(true, {}, def, conf);
        this.pagesLength = this.wrapper.find(this.settings.page).length;
        this.curIndex = 0;
        this.initUI();
        this.initEvent();
    }

    $.extend(Fullpage.prototype, {
        initUI: function(){
            var dir = this.settings.dir;
            var $page = this.wrapper.find(this.settings.page);
            var $parent = this.wrapper.find(this.settings.parent);

            if(dir == 'h'){
                $page.css('float', 'left');
                $parent.css({
                    'width': (this.pagesLength) * (this.wrapper.width()),
                    'height': this.wrapper.height()
                });
            }

            $page.css({
                'width': this.wrapper.width(),
                'height': this.wrapper.height()
            });

        },
        initEvent: function(){
            var that = this;
            var wrapper = this.wrapper;
            var startX, startY, changeX, changeY;

            wrapper.on('touchstart', function(e){
                startX = e.targetTouches[0].pageX;
                startY = e.targetTouches[0].pageY;
            });
            wrapper.on('touchend', function(e){
                changeX = e.changedTouches[0].pageX;
                changeY = e.changedTouches[0].pageY;

                var index;

                if(that.settings.dir == 'v'){
                    if(changeY - startY > 0){//下翻
                        index = that.fixIndex(that.curIndex - 1);
                        that.curIndex = index;
                    }else{//上翻
                        index = that.fixIndex(that.curIndex + 1);
                        that.curIndex = index;
                    }
                    
                }else if(that.settings.dir == 'h'){
                    if(changeX - startX > 0){//右翻
                        index = that.fixIndex(that.curIndex - 1);
                        that.curIndex = index;
                    }else{//左翻
                        index = that.fixIndex(that.curIndex + 1);
                        that.curIndex = index;
                    }
                }

                if( that.movingFlag ){
                    that.moveTo(index);
                }
                
            });
        },
        fixIndex: function(index){
            if(index < 0){
                this.movingFlag = false;
                return 0;
            }else if(index >= this.pagesLength){
                this.movingFlag = false;
                return this.pagesLength - 1;
            }else{
                this.movingFlag = true;
                return index;
            }
        },
        moveTo: function(index){
            var $parent = this.wrapper.find(this.settings.parent);
            var x = 0, y = 0;
            if(this.settings.dir == 'v'){
                y = -this.curIndex * this.wrapper.height();
            }else if(this.settings.dir == 'h'){
                x = -this.curIndex * this.wrapper.width();
            }

            $parent.css({
                '-webkit-transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0px);',
                'transform' : 'translate3d(' + x + 'px, ' + y + 'px, 0px);'
            }).addClass('anim');
        }
    });

    $.fn.fullpage = function(conf){
        return new Fullpage(this, conf);
    };
})(window.Zepto, window);