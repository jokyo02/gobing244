/// <reference path="../../../../../Shared/Content/Content/Script/Declarations/Shared.d.ts" />
/// <reference path="../../../../../Shared/Content/Content/Script/Declarations/CssClass.d.ts" />
///<reference path="../../../../../Web/Content/Content/Script/Declarations/SydneyFSCHelper.d.ts"/>
var WelcomeScreenBold;
(function (WelcomeScreenBold) {
    var WELCOME_SCREEN_SERVICE = "ZeroInput";
    var WELCOME_SCREEN_CLICK_EVENT_NAME = "welcomeScreenBoldClick";
    var WELCOME_SCREEN_SEEN_EVENT_NAME = "welcomeScreenBoldSeen";
    var WELCOME_SCREEN_SET_QUERY_EVENT_NAME = "welcomeScreenBoldSetQuery";
    var AUTO_ROTATE_CLASS = "a_rotate";
    var SUNO_CARD_CLASS = "b_sunocard";
    var MICA_CARD_CLASS = "b_micacard";
    var LEFT_MOST_POSITION = "left-most";
    var LEFT_POSITION = "left";
    var CENTER_POSITION = "center";
    var RIGHT_POSITION = "right";
    var RIGHT_MOST_POSITION = "right-most";
    var WELCOME_DESCRIPTION_SELECTOR = ".welcome_description";
    var WELCOME_CATEOGRY_SELECTOR = ".wt_cont";
    var SLIDE_BAR_SELECTOR = "#sydChatFreTemplate .b_slideexp .b_slidebar";
    var STEPS_BAR_SELECTOR = "#sydChatFreTemplate .zpcarousel .zi_steps";
    var VIEWPORT_SELECTOR = "#sydChatFreTemplate .b_slideexp .b_slidesContainer .b_viewport";
    var SLIDE_EXP_SELECTOR = "#sydChatFreTemplate .b_slideexp";
    var IS_RTL = _G.RTL;
    var RTL_CLASS = "rtl";
    var STEP_NAV_CLASS = "step_nav";
    var POSITION = "pos";
    var MINIMUM_SLIDE_COUNT = 5;
    var SWIPE_COMMAND = "SWIPED";
    var STEP_CLICKED = "STEP_CLICKED";
    var SUNO_PLUGIN_ID = "22b7f79d-8ea4-437e-b5fd-3e21f09f7bc1";
    var STRINGS = _w["_sydConvTranslation"];
    var FULL_TEXT_ATTRIBUTE = "fulltext";
    var SlideDataLoggingAttributeName = "seen";
    var InitialSlideIndexInViewPort = [1, 2, 3];
    var SLIDE_ID_PREFIX = "b_zislide_";
    var ARIA_SELECTED = "aria-selected";
    var ARIA_HIDDEN = "aria-hidden";
    var TAB_INDEX = "tabIndex";
    var SELECTED_CLASS = "selected";
    var PREV_CHEVRON_SELCTOR = "#sydChatFreTemplate .zpcarousel .b_overlay .btn.prev.rounded";
    var NEXT_CHEVRON_SELCTOR = "#sydChatFreTemplate .zpcarousel .b_overlay .btn.next.rounded";
    var NEXT_POSITIONS = {
        "left-most": "right-most",
        "left": "left-most",
        "left-adj": "left",
        "center": "left-adj",
        "right-adj": "center",
        "right": "right-adj",
        "right-most": "right"
    };
    var PREV_POSITIONS = {
        "left-most": "left",
        "left": "left-adj",
        "left-adj": "center",
        "center": "right-adj",
        "right-adj": "right",
        "right": "right-most",
        "right-most": "left-most"
    };
    var KeyboardEventType = {
        "ENTER": "Enter",
        "ARROWRIGHT": "ArrowRight",
        "ARROWLEFT": "ArrowLeft"
    };
    var carouselId = "";
    var userInteracted = false;
    var rotationDelay = 6000;
    var isInTransition = false;
    var enableAutoRotation = true;
    var carouselLength = 5;
    var boldCardCacheOptionSets = ""; // comma separated option sets
    var sunoBoldCardCacheOptionSets = ""; // comma separated option sets
    var enableSunoWelcomeMessage = false;
    var enableTwoTimeSendQuery = false;
    var isMSAAuthenticated = false;
    var enableSunoCacheForSignedIn = false;
    var enMobileAutoRotationFix = false;
    var enableA11YFix = false;
    var loggingPositionArray = ["left-adj", "right-adj", "center"];
    var enableSunoFromBE = false;
    var enableSunoGreetingsFromBE = false;
    var sunoPluginIdFromBE = "";
    var sunoOptionSetsFromBE = "";
    var sunoUnsignedGreetingFromBE = "";
    var sunoSignedGreetingFromBE = "";
    var enZiKeyboardNav = false;
    var enableMicaCard = false;
    var DIRECTION;
    (function (DIRECTION) {
        DIRECTION["PREV"] = "prev";
        DIRECTION["NEXT"] = "next";
    })(DIRECTION || (DIRECTION = {}));
    var INTERACTION_TYPES;
    (function (INTERACTION_TYPES) {
        INTERACTION_TYPES["AUTO_ROTATE"] = "auto_rotate";
        INTERACTION_TYPES["CLICK"] = "click";
        INTERACTION_TYPES["SWIPE"] = "swipe";
        INTERACTION_TYPES["STEP_CLICK"] = "STEP_CLICK";
    })(INTERACTION_TYPES || (INTERACTION_TYPES = {}));
    // define the sliding window of the carousel which ranges from left(including) to right(excluding)
    var slidingWindow = {
        "left": 0,
        "right": MINIMUM_SLIDE_COUNT
    };
    var carouselSelectedPosition = 2;
    function fetchCarouselId() {
        var slideExpElement = _d.querySelector(SLIDE_EXP_SELECTOR);
        if (slideExpElement) {
            var carouselId_1 = slideExpElement === null || slideExpElement === void 0 ? void 0 : slideExpElement.getAttribute("data-control-id");
            return carouselId_1;
        }
        return "";
    }
    // args[0]: event name
    // args[1]: event target id
    function isEventForMe(args) {
        if (!args || args.length < 2) {
            return false;
        }
        var targetId = args[1];
        return targetId == carouselId || targetId == (carouselId + "c");
    }
    function attachEvents() {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        sj_evt.bind("slideexp_slideprev", function (args) {
            if (!isEventForMe(args) || !(slideBar === null || slideBar === void 0 ? void 0 : slideBar.offsetParent) || isInTransition) {
                return;
            }
            var interactionType = getInteractionType(args && args.length > 2 ? args[2] : "");
            if (interactionType !== INTERACTION_TYPES.AUTO_ROTATE) {
                updateInteractionState();
            }
            isInTransition = true;
            SydFSCHelper.LogIntEvent(WELCOME_SCREEN_SERVICE, "CarouselRotate", {
                type: interactionType,
                direction: DIRECTION.PREV
            });
            updateCarousel(DIRECTION.PREV, interactionType);
        });
        sj_evt.bind("slideexp_slidenext", function (args) {
            if (!isEventForMe(args) || !(slideBar === null || slideBar === void 0 ? void 0 : slideBar.offsetParent) || isInTransition) {
                return;
            }
            var interactionType = getInteractionType(args && args.length > 2 ? args[2] : "");
            if (interactionType !== INTERACTION_TYPES.AUTO_ROTATE) {
                updateInteractionState();
            }
            isInTransition = true;
            SydFSCHelper.LogIntEvent(WELCOME_SCREEN_SERVICE, "CarouselRotate", {
                type: interactionType,
                direction: DIRECTION.NEXT
            });
            updateCarousel(DIRECTION.NEXT, interactionType);
        });
        resetTabIndex();
        stopPropagationFromAllAnchorClicks();
        if (enZiKeyboardNav) {
            attachZiStepsEvents();
        }
    }
    function attachZiStepsEvents() {
        var carouselStepsElement = sj_b.querySelector(STEPS_BAR_SELECTOR);
        if (!carouselStepsElement || !carouselStepsElement.children || carouselStepsElement.children.length < MINIMUM_SLIDE_COUNT) {
            return;
        }
        var _loop_1 = function (i) {
            var step = carouselStepsElement.children[i];
            step.addEventListener("keydown", function (e) { handleZIStepKeyboardEvent(e, i); });
        };
        for (var i = 0; i < carouselStepsElement.children.length; i++) {
            _loop_1(i);
        }
    }
    function handleZIStepKeyboardEvent(evt, index) {
        switch (evt.key) {
            case KeyboardEventType.ARROWLEFT:
                sj_evt.fire("slideexp_slideprev", carouselId, STEP_CLICKED);
                break;
            case KeyboardEventType.ARROWRIGHT:
                sj_evt.fire("slideexp_slidenext", carouselId, STEP_CLICKED);
                break;
            case KeyboardEventType.ENTER:
                var slideChildId = SLIDE_ID_PREFIX + index.toString();
                var slideChild = sj_b.querySelector("#" + slideChildId);
                if (!slideChild || !slideChild.parentElement) {
                    return;
                }
                slideChild.parentElement.focus();
                break;
        }
    }
    /**
     *
     * Updates aria-selected and tabIndex of pagination dot elements. Only marks
     * the selected dot aria-selected and focusable
     *
     * @param index
     * @returns
     */
    function updateA11yPropertiesOfPagnation() {
        var carouselStepsElement = sj_b.querySelector(STEPS_BAR_SELECTOR);
        if (!carouselStepsElement || !carouselStepsElement.children || carouselStepsElement.children.length < MINIMUM_SLIDE_COUNT) {
            return;
        }
        for (var i = 0; i < carouselStepsElement.children.length; i++) {
            var step = carouselStepsElement.children[i];
            var slideChildId = SLIDE_ID_PREFIX + i.toString();
            var slideChild = sj_b.querySelector("#" + slideChildId);
            if (!slideChild || !slideChild.parentElement) {
                return;
            }
            if (Lib.CssClass.contains(step, SELECTED_CLASS)) {
                step.setAttribute(TAB_INDEX, "0");
                step.setAttribute(ARIA_SELECTED, "true");
            }
            else {
                step.setAttribute(TAB_INDEX, "-1");
                step.setAttribute(ARIA_SELECTED, "false");
            }
        }
    }
    function getInteractionType(typeArg) {
        if (typeArg && typeArg === SWIPE_COMMAND) {
            return INTERACTION_TYPES.SWIPE;
        }
        else if (typeArg && typeArg === STEP_CLICKED) {
            return INTERACTION_TYPES.STEP_CLICK;
        }
        else if (isAutoRotating()) {
            return INTERACTION_TYPES.AUTO_ROTATE;
        }
        return INTERACTION_TYPES.CLICK;
    }
    /**
     * Get the new position for a slide based on the direction of the movement
     * @param slide
     * @param dir Direction
     * @returns new position
     */
    function getNewPosition(slide, dir) {
        var key = slide.getAttribute(POSITION);
        if (key && dir === DIRECTION.NEXT && Object.keys(NEXT_POSITIONS).indexOf(key) >= 0) {
            return NEXT_POSITIONS[key];
        }
        else if (key && dir === DIRECTION.PREV && Object.keys(PREV_POSITIONS).indexOf(key) >= 0) {
            return PREV_POSITIONS[key];
        }
        return "";
    }
    /**
     * Updates the pos attribute of the slide with new position value
     * @param slide
     * @param dir
     */
    function updateSlidePosition(slide, dir) {
        var newPosition = getNewPosition(slide, dir);
        slide.setAttribute(POSITION, newPosition);
        logSlideData(slide, newPosition);
    }
    /**
    * Log the slides that are in view port and has visible text
    * For mobile - center slide
    * for desktop left-aj/right-adj and center slide
    **/
    function logSlideData(slide, position) {
        if (slide
            && !slide.hasAttribute(SlideDataLoggingAttributeName)
            && loggingPositionArray.indexOf(position) > -1) {
            slide.setAttribute(SlideDataLoggingAttributeName, "");
            SydFSCHelper.LogIntEvent(WELCOME_SCREEN_SERVICE, "Slide", {
                source: WELCOME_SCREEN_SEEN_EVENT_NAME,
                category: getCategory(slide),
                position: position,
                text: getPromptText(slide)
            });
        }
    }
    /**
     * Update the whole carousel by updating all the slides position based on the direction.
     * e.g., For direction = next, right-adj will become center, center will become left-adj, and left-adj will become left
     *
     * @param dir
     * @returns
     */
    function updateCarousel(dir, interactionType) {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar || !slideBar.children || slideBar.children.length < MINIMUM_SLIDE_COUNT) {
            isInTransition = false;
            return;
        }
        if (enZiKeyboardNav) {
            updateCarouselSteps(dir, interactionType);
        }
        var _loop_2 = function (i) {
            var slide = slideBar.children[i];
            updateSlidePosition(slide, dir);
            var onTransitionEnd = function (e) {
                if (!e.target) {
                    return;
                }
                if (enMobileAutoRotationFix) {
                    // For mobile, not all 5 slides are visible on screen.
                    // In such casse, for some browsers (android), for DOM elements out of the viewport, the transitionend event is not fired proeprly.
                    // we can update transition state before moving the first / last slide.
                    isInTransition = false;
                }
                sj_ue(e.target, "transitionend", onTransitionEnd);
                sj_ue(e.target, "webkitTransitionEnd", onTransitionEnd);
                sj_ue(e.target, "oTransitionEnd", onTransitionEnd);
            };
            // TODO: only attach the events for the center slide
            sj_be(slide, "transitionend", onTransitionEnd);
            sj_be(slide, "webkitTransitionEnd", onTransitionEnd);
            sj_be(slide, "oTransitionEnd", onTransitionEnd);
        };
        for (var i = slidingWindow.left; i < slidingWindow.right; i++) {
            _loop_2(i);
        }
        updateFirstOrLastSlide(slideBar, dir);
        updateSlidingWindow(dir);
        if (enZiKeyboardNav) {
            adjustTabIndex(false);
        }
    }
    function updateCarouselSteps(dir, interactionType) {
        var carouselStepsElement = sj_b.querySelector(STEPS_BAR_SELECTOR);
        if (!carouselStepsElement || !carouselStepsElement.children || carouselStepsElement.children.length < MINIMUM_SLIDE_COUNT) {
            return;
        }
        if (carouselSelectedPosition >= 0 && carouselSelectedPosition < carouselStepsElement.children.length) {
            Lib.CssClass.remove(carouselStepsElement.children[carouselSelectedPosition], "selected");
            carouselStepsElement.children[carouselSelectedPosition].tabIndex = -1;
            if (dir === DIRECTION.NEXT) {
                carouselSelectedPosition++;
                carouselSelectedPosition = (carouselSelectedPosition % carouselStepsElement.children.length);
            }
            else if (dir === DIRECTION.PREV) {
                carouselSelectedPosition--;
                if (carouselSelectedPosition < 0) {
                    carouselSelectedPosition = carouselStepsElement.children.length - 1;
                }
            }
            Lib.CssClass.add(carouselStepsElement.children[carouselSelectedPosition], "selected");
            carouselStepsElement.children[carouselSelectedPosition].tabIndex = 0;
            if (interactionType === INTERACTION_TYPES.STEP_CLICK) {
                carouselStepsElement.children[carouselSelectedPosition].focus();
            }
        }
    }
    /**
     * Updates the sliding window bounderies.
     * For next direction, the window will shift right, for left direction it will shift left.
     *
     * @param dir
     */
    function updateSlidingWindow(dir) {
        if (dir === DIRECTION.NEXT && slidingWindow.right < carouselLength) {
            slidingWindow.left++;
            slidingWindow.right++;
        }
        else if (dir === DIRECTION.PREV && slidingWindow.left > 0) {
            slidingWindow.left--;
            slidingWindow.right--;
        }
    }
    /**
     * if dir == next
     *   if slidingWindow.right == slideBar.children.length
     *       move the left most to the right
     *   else
     *       we have some slides to the right, just move them left
     *
     * if dir == prev
     *   if slidingWindow.left == 0
     *       move the right most to the left
     *   else
     *       we have some slides to the left, just move them to right
     */
    function updateFirstOrLastSlide(slideBar, dir) {
        if (!slideBar || slideBar.children.length < MINIMUM_SLIDE_COUNT) {
            isInTransition = false;
            return;
        }
        if (!shouldAddOrRemoveSlides(dir)) {
            var slideToUpdate = null;
            if (dir === DIRECTION.NEXT && slidingWindow.right < carouselLength) {
                slideToUpdate = slideBar.children[slidingWindow.right];
            }
            else if (dir === DIRECTION.PREV && (slidingWindow.left - 1) >= 0) {
                slideToUpdate = slideBar.children[slidingWindow.left - 1];
            }
            updateSlidePosition(slideToUpdate, dir);
            isInTransition = false;
            return;
        }
        moveFirstOrLastSlide(slideBar, dir);
    }
    /**
     * This method deals with the edge cases where the there's no element in the right (for next direction), or
     * no element in the left (for previous direction).
     * For next movement,
     *  Move the left most item to the right
     * For previous movement,
     *  Move the right most item to the left
     *
     * @param slideBar
     * @param dir
     * @returns
     */
    function moveFirstOrLastSlide(slideBar, dir) {
        var slideToCopy = (dir === DIRECTION.NEXT ?
            slideBar.children[0]
            : slideBar.children[slideBar.children.length - 1]);
        if (!slideToCopy) {
            isInTransition = false;
            return;
        }
        var copiedSlide = slideToCopy.cloneNode(true);
        copiedSlide.setAttribute(POSITION, (dir === DIRECTION.NEXT ? RIGHT_MOST_POSITION : LEFT_MOST_POSITION));
        attachEventsToSlide(copiedSlide);
        if (dir === DIRECTION.NEXT) {
            slideBar.appendChild(copiedSlide);
        }
        else {
            slideBar.prepend(copiedSlide);
        }
        var onTransitionEnd = function (e) {
            isInTransition = false;
            removeSlideToCopy(slideBar, slideToCopy);
            sj_ue(copiedSlide, "transitionend", onTransitionEnd);
            sj_ue(copiedSlide, "webkitTransitionEnd", onTransitionEnd);
            sj_ue(copiedSlide, "oTransitionEnd", onTransitionEnd);
            sj_ue(copiedSlide, "onTransitionEnd", onTransitionEnd);
        };
        sj_be(copiedSlide, "transitionend", onTransitionEnd);
        sj_be(copiedSlide, "webkitTransitionEnd", onTransitionEnd);
        sj_be(copiedSlide, "oTransitionEnd", onTransitionEnd);
        sj_be(copiedSlide, "onTransitionEnd", onTransitionEnd);
        _w.requestAnimationFrame(function () {
            copiedSlide.setAttribute(POSITION, (dir === DIRECTION.NEXT ? RIGHT_POSITION : LEFT_POSITION));
            if (enMobileAutoRotationFix) {
                // For mobile, not all 5 slides are visible on screen.
                // In such casse, for some browsers (android), for DOM elements out of the viewport, the transitionend event is not fired proeprly.
                // That's why it's safe to remvoe the slide that was copied, here instead of the transitionend.
                removeSlideToCopy(slideBar, slideToCopy);
            }
        });
    }
    function removeSlideToCopy(slideBar, slideToCopy) {
        if (slideBar && slideToCopy && slideToCopy.parentElement) {
            slideBar.removeChild(slideToCopy);
        }
    }
    function shouldAddOrRemoveSlides(dir) {
        if ((dir === DIRECTION.NEXT && slidingWindow.right >= carouselLength) ||
            (dir === DIRECTION.PREV && (slidingWindow.left - 1) < 0)) {
            return true;
        }
        return false;
    }
    function attachEventsToSlide(slide) {
        slide.addEventListener("click", function (_event) { sendQueryToChat(_event, slide); });
        slide.addEventListener("mouseover", function (e) { updateInteractionState(); });
        if (enableA11YFix) {
            slide.addEventListener("keydown", function (e) { addKeyboardInteraction(e, slide); });
        }
        slide.addEventListener("focus", function (e) { updateInteractionState(); });
    }
    function addKeyboardInteraction(evt, slide) {
        switch (evt.key) {
            case KeyboardEventType.ARROWLEFT:
                sj_evt.fire("slideexp_slideprev", carouselId, STEP_CLICKED);
                adjustTabIndex(true);
                break;
            case KeyboardEventType.ARROWRIGHT:
                sj_evt.fire("slideexp_slidenext", carouselId, STEP_CLICKED);
                adjustTabIndex(true);
                break;
            case KeyboardEventType.ENTER:
                sendQueryToChat(evt, slide);
                break;
        }
    }
    function attachSendQueryEvent() {
        if (!CIB || !sj_b)
            return;
        var chatFreTemplate = _ge("sydChatFreTemplate");
        if (!chatFreTemplate)
            return;
        var slides = chatFreTemplate.querySelectorAll(".slide");
        if (!slides || !(slides === null || slides === void 0 ? void 0 : slides.length))
            return;
        for (var i = 0; i < slides.length; i++) {
            var slide = slides[i];
            attachEventsToSlide(slide);
            if (InitialSlideIndexInViewPort.indexOf(i) > -1) {
                logSlideData(slide, getPosition(slide));
            }
        }
    }
    function updateInteractionState() {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar) {
            return;
        }
        Lib.CssClass.remove(slideBar, AUTO_ROTATE_CLASS);
        userInteracted = true;
    }
    function getCategory(slide) {
        var _a, _b;
        var categoryElement = slide === null || slide === void 0 ? void 0 : slide.querySelector(WELCOME_CATEOGRY_SELECTOR);
        return (_b = (_a = categoryElement === null || categoryElement === void 0 ? void 0 : categoryElement.dataset) === null || _a === void 0 ? void 0 : _a.category) !== null && _b !== void 0 ? _b : "NONE";
    }
    function getPosition(slide) {
        var _a;
        return (_a = slide === null || slide === void 0 ? void 0 : slide.getAttribute(POSITION)) !== null && _a !== void 0 ? _a : "not-found";
    }
    function sendQueryToChat(_event, slide) {
        var _a, _b;
        updateInteractionState();
        if (!CIB)
            return;
        //ensures there is no ongoing pending requests
        if (!CIB.manager.chat.isRequestPending) {
            var promptText = getPromptText(slide);
            if (!promptText || promptText === "") {
                return;
            }
            var category = getCategory(slide);
            var position = getPosition(slide);
            // needed for getting chat FTR calculation correctly, this event doesn't get called as part of addmessage
            (_b = (_a = CIB === null || CIB === void 0 ? void 0 : CIB.manager) === null || _a === void 0 ? void 0 : _a.perfTracker) === null || _b === void 0 ? void 0 : _b.markEvent("QueryEntered");
            if (enableTwoTimeSendQuery) {
                SydFSCHelper.LogIntEvent(WELCOME_SCREEN_SERVICE, "Slide", {
                    source: WELCOME_SCREEN_SET_QUERY_EVENT_NAME,
                    category: category,
                    position: position,
                    text: promptText
                });
                if (isSunoCard(slide) && isMSAAuthenticated) {
                    var pluginId = enableSunoFromBE ? sunoPluginIdFromBE : SUNO_PLUGIN_ID;
                    CIB.togglePlugin(pluginId, true);
                }
                if (isMicaCard(slide)) {
                    sj_evt.fire("zi_query_mica_persona_two_time_send", promptText);
                }
                else {
                    CIB.setActionBarInputText && CIB.setActionBarInputText(promptText);
                }
            }
            else {
                SydFSCHelper.LogIntEvent(WELCOME_SCREEN_SERVICE, "Slide", {
                    source: WELCOME_SCREEN_CLICK_EVENT_NAME,
                    category: category,
                    position: position,
                    text: promptText
                });
                if (isMicaCard(slide)) {
                    sj_evt.fire("zi_query_mica_persona", promptText);
                }
                else {
                    sendMessage(slide, promptText);
                    CIB.focusChatInputElement && CIB.focusChatInputElement();
                }
            }
        }
    }
    function getPromptText(slide) {
        var _a;
        var descriptionElement = slide === null || slide === void 0 ? void 0 : slide.querySelector(WELCOME_DESCRIPTION_SELECTOR);
        if (!descriptionElement) {
            return "";
        }
        return (_a = descriptionElement.getAttribute(FULL_TEXT_ATTRIBUTE)) !== null && _a !== void 0 ? _a : "";
    }
    function sendMessage(slide, messageText) {
        var _a, _b, _c;
        if (!enableMicaCard && ((_c = (_b = (_a = CIB === null || CIB === void 0 ? void 0 : CIB.config) === null || _a === void 0 ? void 0 : _a.sydney) === null || _b === void 0 ? void 0 : _b.request) === null || _c === void 0 ? void 0 : _c.optionsSets)) {
            CIB.config.sydney.request.optionsSets = addOptionSets(CIB.config.sydney.request.optionsSets, boldCardCacheOptionSets);
        }
        if (enableSunoWelcomeMessage && isSunoCard(slide)) {
            var pluginId = enableSunoFromBE ? sunoPluginIdFromBE : SUNO_PLUGIN_ID;
            addSunoCacheOptionSets();
            if (isMSAAuthenticated) {
                CIB.togglePlugin(pluginId, true);
                addSignedInSunoGreeting();
            }
            else {
                addNonSignedInSunoGreeting(messageText);
            }
        }
        CIB.addMessage(messageText);
    }
    function addSunoCacheOptionSets() {
        if (!isMSAAuthenticated || enableSunoCacheForSignedIn) {
            CIB.config.sydney.request.optionsSets = addOptionSets(CIB.config.sydney.request.optionsSets, sunoBoldCardCacheOptionSets);
        }
    }
    function isSunoCard(slide) {
        if (slide && Lib.CssClass.contains(slide, SUNO_CARD_CLASS)) {
            return true;
        }
        return false;
    }
    function isMicaCard(slide) {
        if (slide && Lib.CssClass.contains(slide, MICA_CARD_CLASS)) {
            return true;
        }
        return false;
    }
    function addSignedInSunoGreeting() {
        if (enableSunoFromBE && enableSunoGreetingsFromBE && sunoSignedGreetingFromBE && sunoSignedGreetingFromBE !== "") {
            CIB.addBotGreeting(2, sunoSignedGreetingFromBE, []);
        }
        else {
            CIB.addBotGreeting(2, STRINGS["sunoPolicyText"], []);
        }
    }
    function addNonSignedInSunoGreeting(promptText) {
        var _a, _b;
        // non signed-in user, show sign in greeting prompt
        var url = new URL(window.location.href);
        url.searchParams.set('showconv', '1');
        url.searchParams.set('enablesuno', '1');
        url.searchParams.set('q', promptText);
        var signInUrl = CIB.config.buildUrl({
            baseUrl: window.location.origin,
            path: "/fd/auth/signin",
            query: {
                return_url: url.href,
                action: "interactive",
                provider: "windows_live_id"
            }
        });
        var nonSignedInGreeting = "[".concat(STRINGS["sunoNonSignedInGreetingsSignIn"], "](").concat(signInUrl.href, ")").concat(STRINGS["sunoNonSignedInGreetings1"], "[").concat((_a = STRINGS["pluginTerms"]) !== null && _a !== void 0 ? _a : "Terms of Use", "](https://www.suno.ai/terms)").concat(STRINGS["sunoNonSignedInGreetings2"], "[").concat((_b = STRINGS["pluginPrivacy"]) !== null && _b !== void 0 ? _b : "Privacy Policy", "](https://www.suno.ai/privacy)").concat(STRINGS["sunoNonSignedInGreetings3"]);
        if (enableSunoFromBE && enableSunoGreetingsFromBE && sunoUnsignedGreetingFromBE && sunoUnsignedGreetingFromBE !== "") {
            CIB.addBotGreeting(2, sunoUnsignedGreetingFromBE, [], true);
        }
        else {
            CIB.addBotGreeting(2, nonSignedInGreeting, [], true);
        }
        return;
    }
    function trySendingSunoQuery() {
        var urlParams = new URLSearchParams(_w === null || _w === void 0 ? void 0 : _w.location.search);
        var shouldEnableSuno = urlParams.get('enablesuno') === '1';
        var messageText = urlParams.get('q');
        if (shouldEnableSuno && messageText) {
            var pluginId = enableSunoFromBE ? sunoPluginIdFromBE : SUNO_PLUGIN_ID;
            CIB.togglePlugin(pluginId, true);
            CIB.addMessage(messageText);
        }
    }
    function addOptionSets(options, newOptionsString) {
        if (newOptionsString && newOptionsString !== "" && options) {
            var optArray = newOptionsString.split(",");
            optArray.forEach(function (opt) {
                if (opt && opt !== "" && options.indexOf(opt) < 0) {
                    options.push(opt);
                }
            });
        }
        return options;
    }
    function rotate() {
        if (userInteracted || !carouselId) {
            return;
        }
        sj_evt.fire("slideexp_slidenext", carouselId);
        autoRotate();
        if (enableA11YFix) {
            adjustTabIndex(false);
        }
    }
    function autoRotate() {
        sb_st(function () {
            rotate();
        }, rotationDelay);
    }
    function attachAutoRotateClass() {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar) {
            return;
        }
        Lib.CssClass.add(slideBar, AUTO_ROTATE_CLASS);
    }
    function isAutoRotating() {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar) {
            return false;
        }
        return Lib.CssClass.contains(slideBar, AUTO_ROTATE_CLASS);
    }
    function addAdditionalClassNames() {
        var zpCarousel = sj_b.querySelector(".zpcarousel");
        if (!zpCarousel) {
            return;
        }
        if (IS_RTL) {
            Lib.CssClass.add(zpCarousel, RTL_CLASS);
            zpCarousel.style["direction"] = "rtl";
        }
        if (enZiKeyboardNav) {
            Lib.CssClass.add(zpCarousel, STEP_NAV_CLASS);
        }
    }
    function disableHorizontalScroll() {
        var slideViewPort = sj_b.querySelector(VIEWPORT_SELECTOR);
        slideViewPort.addEventListener("scroll", function (e) {
            if (slideViewPort.scrollLeft !== 0) {
                slideViewPort.scrollLeft = 0;
            }
        });
    }
    /**
     * Add event listening slideexp_init_done to reset tab index.
     *
     * @param
     * @returns
     */
    function resetTabIndex() {
        if (enableA11YFix || enZiKeyboardNav) {
            adjustTabIndex(false);
            sj_evt.bind("slideexp_init_done", function (args) {
                adjustTabIndex(false);
            });
        }
    }
    /**
     * Find the center element and set tabindex to 0. Others to -1.
     *
     * @param shouldFocus: indicating the center element should be focused
     * @returns
     */
    function adjustTabIndex(shouldFocus) {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar || !slideBar.children || slideBar.children.length < MINIMUM_SLIDE_COUNT) {
            return;
        }
        for (var i = 0; i < slideBar.children.length; ++i) {
            var slide = slideBar.children[i];
            if (!slide) {
                continue;
            }
            slide.tabIndex = -1;
            slide.setAttribute(ARIA_HIDDEN, "true");
            setAnchorTabIndex(slide, -1);
            if (slide.getAttribute(POSITION) == CENTER_POSITION) {
                slide.tabIndex = 0;
                slide.removeAttribute(ARIA_HIDDEN);
                setAnchorTabIndex(slide, 0);
                if (shouldFocus) {
                    slide.focus();
                }
            }
        }
        if (enZiKeyboardNav) {
            updateA11yPropertiesOfPagnation();
        }
    }
    /**
     * Hide the chevrons from screen reader as we will allow navigation using pagination dots for screen reader users.
     */
    function hideChevronsFromScreenReader() {
        var prevChevron = sj_b.querySelector(PREV_CHEVRON_SELCTOR);
        if (prevChevron) {
            prevChevron.setAttribute(ARIA_HIDDEN, "true");
            prevChevron.setAttribute(TAB_INDEX, "-1");
        }
        var nextChevron = sj_b.querySelector(NEXT_CHEVRON_SELCTOR);
        if (nextChevron) {
            nextChevron.setAttribute(ARIA_HIDDEN, "true");
            nextChevron.setAttribute(TAB_INDEX, "-1");
        }
    }
    /**
     * Each slider may contains anchors which mess up keyboard control.
     * only enable keyboard control when these anchors are in the centered card.
     *
     * @param slide selected slide HTML element
     * @param tabIndexValue tabIndex value to be set.
     * @returns
     */
    function setAnchorTabIndex(slide, tabIndexValue) {
        var anchors = slide.getElementsByTagName("a");
        if (anchors && anchors.length > 0) {
            for (var i = 0; i < anchors.length; i++) {
                var anchor = anchors[i];
                if (anchor) {
                    anchor.tabIndex = tabIndexValue;
                }
            }
        }
    }
    /**
     * Stop propagation of events to parent from anchor clicks
     *
     * @returns
     */
    function stopPropagationFromAllAnchorClicks() {
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar) {
            return;
        }
        for (var i = 0; i < slideBar.children.length; i++) {
            stopPropagationFromAnchorClicks(slideBar.children[i]);
        }
    }
    function stopPropagationFromAnchorClicks(slide) {
        var anchors = slide.getElementsByTagName("a");
        if (anchors && anchors.length > 0) {
            for (var i = 0; i < anchors.length; i++) {
                var anchor = anchors[i];
                if (anchor) {
                    anchor.addEventListener("click", function (e) {
                        e.stopPropagation();
                    });
                }
            }
        }
    }
    function initializeCarouselSlidesPositions() {
        var _a, _b, _c, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16;
        enableAutoRotation = ((_a = _w["ziFreBoldConfig"]) === null || _a === void 0 ? void 0 : _a.enAutoRotate) ? (_b = _w["ziFreBoldConfig"]) === null || _b === void 0 ? void 0 : _b.enAutoRotate : false;
        enableSunoWelcomeMessage = ((_c = _w["ziFreBoldConfig"]) === null || _c === void 0 ? void 0 : _c.enSBSunoCard) ? (_e = _w["ziFreBoldConfig"]) === null || _e === void 0 ? void 0 : _e.enSBSunoCard : false;
        isMSAAuthenticated = ((_f = _w["ziFreBoldConfig"]) === null || _f === void 0 ? void 0 : _f.isMSAAuth) ? (_g = _w["ziFreBoldConfig"]) === null || _g === void 0 ? void 0 : _g.isMSAAuth : false;
        boldCardCacheOptionSets = ((_h = _w["ziFreBoldConfig"]) === null || _h === void 0 ? void 0 : _h.bCardCacheOpts) ? (_j = _w["ziFreBoldConfig"]) === null || _j === void 0 ? void 0 : _j.bCardCacheOpts : "";
        sunoBoldCardCacheOptionSets = ((_k = _w["ziFreBoldConfig"]) === null || _k === void 0 ? void 0 : _k.sunoBCardCacheOpts) ? (_l = _w["ziFreBoldConfig"]) === null || _l === void 0 ? void 0 : _l.sunoBCardCacheOpts : "";
        enableTwoTimeSendQuery = ((_m = _w["ziFreBoldConfig"]) === null || _m === void 0 ? void 0 : _m.enableTwoTimeSendQuery) ? (_o = _w["ziFreBoldConfig"]) === null || _o === void 0 ? void 0 : _o.enableTwoTimeSendQuery : false;
        enableSunoCacheForSignedIn = ((_p = _w["ziFreBoldConfig"]) === null || _p === void 0 ? void 0 : _p.enSunoCacheSignedIn) ? (_q = _w["ziFreBoldConfig"]) === null || _q === void 0 ? void 0 : _q.enSunoCacheSignedIn : false;
        enMobileAutoRotationFix = ((_r = _w["ziFreBoldConfig"]) === null || _r === void 0 ? void 0 : _r.enAutoRttFix) ? (_s = _w["ziFreBoldConfig"]) === null || _s === void 0 ? void 0 : _s.enAutoRttFix : false;
        enableA11YFix = ((_t = _w["ziFreBoldConfig"]) === null || _t === void 0 ? void 0 : _t.enableA11YFix) ? (_u = _w["ziFreBoldConfig"]) === null || _u === void 0 ? void 0 : _u.enableA11YFix : false;
        loggingPositionArray = ((_v = _w["ziFreBoldConfig"]) === null || _v === void 0 ? void 0 : _v.tileLogPosition) ? (_x = _w["ziFreBoldConfig"]) === null || _x === void 0 ? void 0 : _x.tileLogPosition.split(",") : [];
        enableSunoFromBE = ((_y = _w["ziFreBoldConfig"]) === null || _y === void 0 ? void 0 : _y.enSunoFromBE) ? (_z = _w["ziFreBoldConfig"]) === null || _z === void 0 ? void 0 : _z.enSunoFromBE : false;
        enableSunoGreetingsFromBE = ((_0 = _w["ziFreBoldConfig"]) === null || _0 === void 0 ? void 0 : _0.enSunoGrtFromBE) ? (_1 = _w["ziFreBoldConfig"]) === null || _1 === void 0 ? void 0 : _1.enSunoGrtFromBE : false;
        sunoPluginIdFromBE = ((_2 = _w["ziFreBoldConfig"]) === null || _2 === void 0 ? void 0 : _2.sunoPluginId) ? (_3 = _w["ziFreBoldConfig"]) === null || _3 === void 0 ? void 0 : _3.sunoPluginId : SUNO_PLUGIN_ID;
        sunoOptionSetsFromBE = ((_4 = _w["ziFreBoldConfig"]) === null || _4 === void 0 ? void 0 : _4.sunoOptionSets) ? (_5 = _w["ziFreBoldConfig"]) === null || _5 === void 0 ? void 0 : _5.sunoOptionSets : "";
        sunoUnsignedGreetingFromBE = ((_6 = _w["ziFreBoldConfig"]) === null || _6 === void 0 ? void 0 : _6.sunoUnsignedGreeting) ? (_7 = _w["ziFreBoldConfig"]) === null || _7 === void 0 ? void 0 : _7.sunoUnsignedGreeting : false;
        sunoSignedGreetingFromBE = ((_8 = _w["ziFreBoldConfig"]) === null || _8 === void 0 ? void 0 : _8.sunoSignedGreeting) ? (_9 = _w["ziFreBoldConfig"]) === null || _9 === void 0 ? void 0 : _9.sunoSignedGreeting : false;
        enZiKeyboardNav = ((_10 = _w["ziFreBoldConfig"]) === null || _10 === void 0 ? void 0 : _10.enZiKeyboardNav) ? (_11 = _w["ziFreBoldConfig"]) === null || _11 === void 0 ? void 0 : _11.enZiKeyboardNav : false;
        enableMicaCard = ((_12 = _w["ziFreBoldConfig"]) === null || _12 === void 0 ? void 0 : _12.enableMicaCard) ? (_13 = _w["ziFreBoldConfig"]) === null || _13 === void 0 ? void 0 : _13.enableMicaCard : false;
        var slideBar = sj_b.querySelector(SLIDE_BAR_SELECTOR);
        if (!slideBar) {
            return;
        }
        carouselId = fetchCarouselId();
        carouselLength = slideBar.children.length;
        addAdditionalClassNames();
        disableHorizontalScroll();
        attachEvents();
        attachSendQueryEvent();
        // ajax.load unbinds the custom events, that's why we need to re-attach on ajax.load
        sj_evt.bind("ajax.load", attachEvents);
        attachAutoRotateClass();
        if (enableAutoRotation) {
            autoRotate();
        }
        if (enableSunoFromBE) {
            sunoBoldCardCacheOptionSets = sunoOptionSetsFromBE && sunoOptionSetsFromBE !== "" ? sunoOptionSetsFromBE : sunoBoldCardCacheOptionSets;
        }
        trySendingSunoQuery();
        if (enZiKeyboardNav) {
            hideChevronsFromScreenReader();
        }
        if (enableMicaCard && ((_16 = (_15 = (_14 = CIB === null || CIB === void 0 ? void 0 : CIB.config) === null || _14 === void 0 ? void 0 : _14.sydney) === null || _15 === void 0 ? void 0 : _15.request) === null || _16 === void 0 ? void 0 : _16.optionsSets)) {
            CIB.config.sydney.request.optionsSets = addOptionSets(CIB.config.sydney.request.optionsSets, boldCardCacheOptionSets);
        }
        sj_evt.fire("zi_bold_init");
    }
    sb_st(function () { initializeCarouselSlidesPositions(); }, 10);
})(WelcomeScreenBold || (WelcomeScreenBold = {}));
