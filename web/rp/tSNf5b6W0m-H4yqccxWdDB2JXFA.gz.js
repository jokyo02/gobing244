/// <reference path="../../../../../Shared/Content/Content/Script/Declarations/Shared.d.ts" />
/// <reference path="../../../../../Shared/Content/Content/Script/Declarations/CssClass.d.ts" />
var WelcomeScreenBold;
(function (WelcomeScreenBold) {
    var WELCOME_HEADER_SELECTOR = ".b_ziCont .b_wlcmHdr";
    var SLIDE_BAR_SELECTOR = "#sydChatFreTemplate .b_slideexp .b_slidebar";
    var IS_RTL = _G.RTL;
    var REDUCED_MARGIN_CLASS = "b_reduceMargin";
    var MARGIN_LEFT = "margin-left";
    var MARGIN_RIGHT = "margin-right";
    var STANDARD_WIDTH = 414; // iphone xr
    var STANDARD_MARGIN = -596;
    var enableHeaderReducedMarginBottom = false;
    /**
     * Add b_reduceMargin class to welcome header
     */
    function addReducedMarginClass() {
        var welcomeHeaders = sj_b.querySelectorAll(WELCOME_HEADER_SELECTOR);
        for (var _i = 0, welcomeHeaders_1 = welcomeHeaders; _i < welcomeHeaders_1.length; _i++) {
            var welcomeHeader = welcomeHeaders_1[_i];
            Lib.CssClass.add(welcomeHeader, REDUCED_MARGIN_CLASS);
        }
        if (enableHeaderReducedMarginBottom) {
            addReducedMarginClass();
        }
    }
    /**
     * Set the initial margin left/right for the carousel
     *
     * @param slideBar
     * @returns void
     */
    function setMargin(slideBar) {
        if (!slideBar) {
            return;
        }
        var widthDiff = _w.innerWidth - STANDARD_WIDTH;
        var marginMove = Math.ceil(widthDiff / 2);
        if (marginMove == 0) {
            return;
        }
        slideBar.style[IS_RTL ? MARGIN_RIGHT : MARGIN_LEFT] = (STANDARD_MARGIN + marginMove) + "px";
    }
    function init() {
        var _a, _b;
        enableHeaderReducedMarginBottom = ((_a = _w["ziFreBoldConfig"]) === null || _a === void 0 ? void 0 : _a.enHeaderReducedMargin) ? (_b = _w["ziFreBoldConfig"]) === null || _b === void 0 ? void 0 : _b.enHeaderReducedMargin : false;
        if (enableHeaderReducedMarginBottom) {
            addReducedMarginClass();
        }
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        setMargin(slideBar);
        sb_st(function () {
            sj_evt.fire("zi_bold_init_done");
        }, 1000);
    }
    sj_evt.bind("zi_bold_init", function () {
        init();
    });
})(WelcomeScreenBold || (WelcomeScreenBold = {}));
