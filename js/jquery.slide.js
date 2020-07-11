////////////////////////////////////////
//　SCRIPT
////////////////////////////////////////
$(function() {
  var setElm = $('.slider'),
    slideSpeed = 500,
    slideDelay = 5000,
    slideEasing = 'linear',
    slideMaxWidth = 800,
    openingFade = 1000;

  $(window).load(function() {
    setElm.each(function() {
      var self = $(this),
        findUl = self.find('ul'),
        findLi = findUl.find('li'),
        findLiCount = findLi.length,
        findImg = findLi.find('img'),
        slideTimer;

      findLi.each(function(i) {
        $(this).attr('class', 'viewList' + (i + 1));
      });

      if (findLiCount > 1) {
        self.wrapAll('<div class="sliderCover" />');
        findUl.wrapAll('<div class="sliderWrap" />');

        var findCover = self.parent('.sliderCover'),
          findWrap = self.find('.sliderWrap');

        findUl.clone().prependTo(findWrap);
        findUl.clone().appendTo(findWrap);

        findWrap.find('ul').eq('1').addClass('mainList');

        var mainList = findWrap.find('.mainList').find('li');
        mainList.eq('0').addClass('mainActive');

        var allList = findWrap.find('li'),
          allListCount = findWrap.find('li').length;

        // スライダーエリアのレスポンシブ設定
        function setSlideSize() {
          var wdWidth = $(window).width();

          if (slideMaxWidth >= wdWidth || slideMaxWidth == 0) {
            allList.css({ width: wdWidth });
          } else if (slideMaxWidth < wdWidth) {
            allList.css({ width: slideMaxWidth });
          }

          imgWidth = findImg.width();
          imgHeight = findImg.height();

          self.css({ height: imgHeight });
          findCover.css({ height: imgHeight });
          allList.css({ height: imgHeight });

          baseWrapWidth = imgWidth * findLiCount;
          allLWrapWidth = imgWidth * allListCount;

          findWrap.css({ width: allLWrapWidth, height: imgHeight }).find('ul').css({ width: baseWrapWidth, height: imgHeight });

          posResetNext = -(baseWrapWidth) * 2;
          posResetPrev = -(baseWrapWidth) + (imgWidth);
        }
        setSlideSize();

        findWrap.css({ left: -(baseWrapWidth) });

        // ページネーション設定
        var pagination = $('<div class="pagiNation"></div>');
        self.append(pagination);

        findLi.each(function(i) {
          pagination.append('<a href="javascript:void(0);" class="pn' + (i + 1) + '"></a>');
        });

        var pnPoint = pagination.find('a'),
          pnFirst = pagination.find('a:first'),
          pnLast = pagination.find('a:last'),
          pnCount = pagination.find('a').length;

        pnFirst.addClass('pnActive');

        pnPoint.click(function() {
          timerStop();
          var showCont = pnPoint.index(this),
            moveLeft = (imgWidth * showCont) + baseWrapWidth;
          findWrap.stop().animate({ left: -(moveLeft) }, slideSpeed, slideEasing);
          pnPoint.removeClass('pnActive');
          $(this).addClass('pnActive');
          activePos();
          timerStart();
        });

        function movePnNext() {
          var setActive = pagination.find('.pnActive'),
            pnIndex = pnPoint.index(setActive),
            listCount = pnIndex + 1;
          if (pnCount == listCount) {
            setActive.removeClass('pnActive');
            pnFirst.addClass('pnActive');
          } else {
            setActive.removeClass('pnActive').next().addClass('pnActive');
          }
        }

        function movePnPrev() {
          var setActive = pagination.find('.pnActive'),
            pnIndex = pnPoint.index(setActive),
            listCount = pnIndex + 1;
          if (1 == listCount) {
            setActive.removeClass('pnActive');
            pnLast.addClass('pnActive');
          } else {
            setActive.removeClass('pnActive').prev().addClass('pnActive');
          }
        }

        function activePos() {
          var posActive = pagination.find('.pnActive'),
            posIndex = pnPoint.index(posActive);
          findLi.removeClass('mainActive').eq(posIndex).addClass('mainActive');
        }

        // サイドナビボタン設定
        self.append('<a href="javascript:void(0);" class="btnPrev"></a><a href="javascript:void(0);" class="btnNext"></a>');
        var btnNext = self.find('.btnNext'),
          btnPrev = self.find('.btnPrev');

        function sideNavSize() {
          var slideWidth = self.width(),
            btnSize = ($(window).width() - slideWidth) / 2;
          if ($(window).width() > slideWidth) {
            btnNext.css({ right: -btnSize, width: btnSize, height: imgHeight });
            btnPrev.css({ left: -btnSize, width: btnSize, height: imgHeight });
          }
        }
        sideNavSize();

        $(window).on('resize', function() {
          sideNavSize();
        });

        function slideNext() {
          if (!findWrap.is(':animated')) {
            timerStop();
            var posLeft = parseInt($(findWrap).css('left')),
              moveLeft = posLeft - imgWidth;
            findWrap.stop().animate({ left: moveLeft }, slideSpeed, slideEasing, function() {
              var adjustLeft = parseInt($(findWrap).css('left'));
              if (adjustLeft <= posResetNext) {
                findWrap.css({ left: -(baseWrapWidth) });
              }
            });

            movePnNext();
            activePos();
            timerStart();
          }
        }

        function slidePrev() {
          if (!findWrap.is(':animated')) {
            timerStop();
            var posLeft = parseInt($(findWrap).css('left')),
              moveLeft = posLeft + imgWidth;
            findWrap.stop().animate({ left: moveLeft }, slideSpeed, slideEasing, function() {
              var adjustLeft = parseInt($(findWrap).css('left'));
              if (adjustLeft >= posResetPrev) {
                findWrap.css({ left: posResetNext + imgWidth });
              }
            });

            movePnPrev();
            activePos();
            timerStart();
          }
        }

        btnNext.click(function() { slideNext(); });
        btnPrev.click(function() { slidePrev(); });

        // タッチ（スワイプ／フリック）イベント
        findWrap.on({
          'touchstart': function(e) {
            if (findWrap.is(':animated')) {
              e.preventDefault();
            } else {
              timerStop();
              startPosX = event.changedTouches[0].pageX;
              startPosLeft = parseInt($(this).css('left'));
              touchState = true;
            }
          },
          'touchmove': function(e) {
            if (!touchState) {
              return false
            }
            e.preventDefault();

            var slidePosLeft = startPosLeft - (startPosX - event.changedTouches[0].pageX);
            $(this).css({ left: slidePosLeft });
          },
          'touchend': function(e) {
            if (!touchState) {
              return false
            }
            touchState = false;

            var leftPos = parseInt($(this).css('left'));

            if (startPosLeft > leftPos) {
              var moveLeft = startPosLeft - imgWidth;
              findWrap.stop().animate({ left: moveLeft }, slideSpeed, slideEasing, function() {
                var adjustLeft = parseInt($(findWrap).css('left'));
                if (adjustLeft <= posResetNext) {
                  findWrap.css({ left: -(baseWrapWidth) });
                }
              });

              movePnNext();

            } else if (startPosLeft < leftPos) {
              var moveLeft = startPosLeft + imgWidth;
              findWrap.stop().animate({ left: moveLeft }, slideSpeed, slideEasing, function() {
                var adjustLeft = parseInt($(findWrap).css('left'));
                if (adjustLeft >= posResetPrev) {
                  findWrap.css({ left: posResetNext + imgWidth });
                }
              });

              movePnPrev();

            }
            activePos();
            timerStart();
          }
        });

        function timerStart() {
          slideTimer = setInterval(function() {
            slideNext();
          }, slideDelay);
        }
        timerStart();

        function timerStop() {
          clearInterval(slideTimer);
        }

      }

      self.css({ visibility: 'visible', opacity: '0' }).animate({ opacity: '1' }, openingFade);

      $(window).on('load resize', function() {
        timerStop();
        setSlideSize();

        var posActive = pagination.find('.pnActive'),
          setNum = pnPoint.index(posActive),
          moveLeft = ((imgWidth) * (setNum)) + baseWrapWidth;
        findWrap.css({ left: -(moveLeft) });

        timerStart();
      });
    });
  });
});