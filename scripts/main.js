function trackMousePosition(elementQuery) {
    const trackElement = document.querySelector(elementQuery);
    if (!trackElement) return;

    const reset = () => {
        trackElement.style.setProperty('--mouse-x', '50%');
        trackElement.style.setProperty('--mouse-y', '50%');

        const bg = trackElement.querySelector('.bg-slides');
        if (bg) {
            bg.style.transform = 'translate(0, 0) scale(1.05)';
        }
    };

    trackElement.addEventListener('mousemove', (event) => {
        const rect = trackElement.getBoundingClientRect();

        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const normalizedX = (x / rect.width) * 100;
        const normalizedY = (y / rect.height) * 100;

        trackElement.style.setProperty('--mouse-x', `${normalizedX}%`);
        trackElement.style.setProperty('--mouse-y', `${normalizedY}%`);

        // Parallax (viewport-based cho cảm giác tự nhiên)
        const parallaxOffsetX = (event.clientX - window.innerWidth / 2) / 50;
        const parallaxOffsetY = (event.clientY - window.innerHeight / 2) / 50;

        const bg = trackElement.querySelector('.bg-slides');
        if (bg) {
            bg.style.transform =
                `translate(${parallaxOffsetX}px, ${parallaxOffsetY}px) scale(1.05)`;
        }

        // Debug text (optional)
        const text = trackElement.querySelector('.tech-coords-value');
        if (text) {
            text.innerHTML =
                `X: ${normalizedX.toFixed(2)}% | Y: ${normalizedY.toFixed(2)}%`;
        }
    });

    // 👇 RESET KHI RỜI CHUỘT
    trackElement.addEventListener('mouseleave', reset);

    // optional: reset khi vừa load
    reset();
}

function autoNextSelection({
    container,
    itemSelector,
    interval = 5000,
    type = 'radio' // 'radio' | 'select'
}) {
    const root = document.querySelector(container);
    if (!root) return;

    let currentIndex = 0;
    let timerId;

    function getItems() {
        return document.querySelectorAll(itemSelector);
    }

    function autoSelect() {
        const items = getItems();
        if (!items.length) return;

        const nextIndex = (currentIndex + 1) % items.length;

        if (type === 'radio') {
            items[nextIndex].checked = true;
        } else if (type === 'select') {
            root.selectedIndex = nextIndex;
        }

        currentIndex = nextIndex;
    }

    function restartTimer() {
        clearInterval(timerId);
        timerId = setInterval(autoSelect, interval);
    }

    restartTimer();

    document.addEventListener('change', (e) => {
        if (e.target.matches(itemSelector)) {
            restartTimer();
        }
    });
}


function headerScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        header.classList.toggle('scrolled', currentScrollY > 100);

        if (currentScrollY > 100) {
            if (currentScrollY > lastScrollY) {
                // Scrolling down -> hide top bar
                header.classList.add('hide-top-bar');
            } else {
                // Scrolling up -> show top bar
                header.classList.remove('hide-top-bar');
            }
        } else {
            // At top -> show top bar
            header.classList.remove('hide-top-bar');
        }

        lastScrollY = currentScrollY;
    });

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        const mediaQuery = window.matchMedia('(min-width: 769px)');
        const handleScreenChange = (e) => {
            if (e.matches && menuToggle.checked) {
                menuToggle.checked = false;
            }
        };
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', handleScreenChange);
        } else {
            mediaQuery.addListener(handleScreenChange);
        }
        // Run check once immediately on load to handle pre-checked HTML on desktop
        handleScreenChange(mediaQuery);
    }
}


function eventQuarterText(cardsSelector) {
    const eventlist = document.querySelectorAll(cardsSelector);

    function quarterText(event, startDateTime) {
        if (!startDateTime) return;

        const data = startDateTime;
        const quater = data.split(' ')[1];

        const target = event.querySelector('.event_content_cards_mark')
        if (target) target.innerHTML = quater
    }

    eventlist.forEach(event => {
        const startDateTimeUtc = event.querySelector('.startDateTimeUtc');
        const endDateTimeUtc = event.querySelector('.endDateTimeUtc');
        const dateP = event.querySelector('.card-date');
        const timeP = event.querySelector('.card-time');
        const eventSchedules = event.querySelector('.event-schedule');

        if (!startDateTimeUtc || !endDateTimeUtc || !dateP || !timeP) return;

        try {
            const startDateTime = new Date(startDateTimeUtc.innerText);
            const endDateTime = new Date(endDateTimeUtc.innerText);

            const optionsDate = { year: 'numeric', month: 'short', day: 'numeric' };
            const optionsTime = { hour: '2-digit', minute: '2-digit' };


            let startdateText = startDateTime.toLocaleDateString('en-GB', optionsDate).toUpperCase();
            let enddateText = endDateTime.toLocaleDateString('en-GB', optionsDate).toUpperCase();
            let timeText = `${startDateTime.toLocaleTimeString('en-GB', optionsTime)} - ${endDateTime.toLocaleTimeString('en-GB', optionsTime)}`;

            dateP.innerText = startdateText === enddateText ? startdateText : `${startdateText} - ${enddateText}`;
            timeP.innerText = timeText;

            quarterText(event, startdateText);

        } catch (error) {
            console.error(`Error in eventQuarterText: ${error}`);
        }
    });
}

function sliderControl({
    listElementQuery,
    childElement,
    nextBtnQuery,
    prevBtnQuery,
    filtersQuery = null
}) {
    const slider = document.querySelector(listElementQuery)
    if (!slider) return

    const nextBtn = document.querySelector(nextBtnQuery)
    const prevBtn = document.querySelector(prevBtnQuery)

    if (!nextBtn || !prevBtn) return

    function getVisibleItems() {
        return [...slider.querySelectorAll(childElement)]
            .filter(el => getComputedStyle(el).display !== 'none')
    }

    function getStep() {
        const visible = getVisibleItems()
        if (visible.length < 2) return 0

        return visible[1].offsetLeft - visible[0].offsetLeft
    }

    function scrollNext(direction = 1) {
        const step = getStep()
        if (!step) return

        slider.scrollBy({
            left: step * direction,
            behavior: 'smooth'
        })
    }

    nextBtn.addEventListener('click', () => scrollNext(1))
    prevBtn.addEventListener('click', () => scrollNext(-1))

    slider.addEventListener('wheel', event => {
        const step = getStep()
        if (!step) return

        const isDown = event.deltaY > 0
        const isUp = event.deltaY < 0

        const isAtStart = slider.scrollLeft <= 0
        const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 1

        if ((isUp && isAtStart) || (isDown && isAtEnd)) {
            return
        }

        event.preventDefault()
        scrollNext(isDown ? 1 : -1)

    }, { passive: false })

    // ✅ Reset scroll khi filter thay đổi
    if (filtersQuery) {
        const filters = document.querySelectorAll(filtersQuery)

        filters.forEach(filter => {
            filter.addEventListener('change', () => {
                requestAnimationFrame(() => {
                    slider.scrollTo({ left: 0, behavior: 'smooth' })
                })
            })
        })
    }
}

function autoSlide({
    listElementQuery,
    itemQuery,
    delayTime = 3000
}) {
    const slider = document.querySelector(listElementQuery)
    if (!slider) return

    const items = slider.querySelectorAll(itemQuery)
    if (!items.length) return

    const item = items[0]
    const gap = parseFloat(getComputedStyle(slider).columnGap || 0)
    const step = item.offsetWidth + gap

    let currentIndex = 0
    let timerId

    function getVisibleCount() {
        return Math.round(slider.clientWidth / step)
    }

    function getMaxIndex() {
        return items.length - getVisibleCount()
    }

    function slideNext() {
        const maxIndex = getMaxIndex()

        if (currentIndex >= maxIndex) {
            currentIndex = 0
        } else {
            currentIndex++
        }

        slider.scrollTo({
            left: currentIndex * step,
            behavior: 'smooth'
        })
    }

    function start() {
        timerId = setInterval(slideNext, delayTime)
    }

    function stop() {
        clearInterval(timerId)
    }

    start()

    slider.addEventListener('mouseenter', stop)
    slider.addEventListener('mouseleave', start)

    window.addEventListener('resize', () => {
        slider.scrollTo({ left: currentIndex * step })
    })
}

function PagingContent({
    containerQuery,
    itemsQuery,
    paginationContainerQuery,
    itemsPerPage = 6,
    filtersQuery = null,
    autoNextTime = 0,
}) {

    const container = document.querySelector(containerQuery)
    const paginationContainer = document.querySelector(paginationContainerQuery)

    if (!container || !paginationContainer) return

    const allItems = Array.from(container.querySelectorAll(itemsQuery))
    if (!allItems.length) return

    let filteredItems = [...allItems]
    let currentPage = 1

    function renderPage() {

        const totalPages = Math.ceil(filteredItems.length / itemsPerPage)

        const start = (currentPage - 1) * itemsPerPage
        const end = start + itemsPerPage

        // Ẩn toàn bộ
        allItems.forEach(item => item.classList.add('d-none'))

        // Hiển thị items của page hiện tại
        filteredItems.slice(start, end).forEach(item => {
            item.classList.remove('d-none')
        })

        // Render pagination
        paginationContainer.innerHTML = ''

        if (totalPages === 0) return
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button')
            btn.innerText = i

            btn.classList.add('button-chip', 'button-rounded')
            if (i === currentPage) {
                btn.classList.add('active')
            }
            btn.style.lineHeight = '1'
            btn.addEventListener('click', () => {
                currentPage = i
                renderPage()
            })
            paginationContainer.appendChild(btn)
        }
    }

    // AUTO NEXT
    function autoNext() {
        setTimeout(() => {
            const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
            if (totalPages === 0) return
            if (currentPage < totalPages) {
                currentPage++
            } else {
                currentPage = 1
            }

            renderPage()
            autoNext()
        }, autoNextTime)
    }

    // FILTER
    if (filtersQuery) {
        const filters = document.querySelectorAll(filtersQuery)

        filters.forEach(filter => {
            filter.addEventListener('change', (e) => {
                const value = e.target.value?.trim().toLowerCase()
                if (!value || value === 'all') {
                    filteredItems = [...allItems]
                } else {
                    filteredItems = allItems.filter(item => {
                        const cate = (item.getAttribute('course-cate') || '')
                            .trim()
                            .toLowerCase()
                        return cate.includes(value)
                    })
                }
                currentPage = 1
                renderPage()
            })

        })
    }

    renderPage()

    if (autoNextTime > 0) {
        autoNext()
    }

}

function formFillFromHtmlContent({
    formQuery,
    formTargetQueryIds = [],
    contentQueryIds = [],
}) {
    // 1. Validate input
    if (formTargetQueryIds.length !== contentQueryIds.length) {
        throw new Error(
            `Target (${formTargetQueryIds.length}) and content (${contentQueryIds.length}) must have the same length`
        )
    }

    // 2. Get form
    const form = document.querySelector(formQuery)

    if (!form) {
        throw new Error(`Cannot find form with query: ${formQuery}`)
    }

    // 3. Map elements
    const targets = formTargetQueryIds.map(q => form.querySelector(q))
    const contents = contentQueryIds.map(q => document.querySelector(q))

    // 4. Fill
    targets.forEach((target, index) => {
        const content = contents[index]
        const targetQuery = formTargetQueryIds[index]
        const contentQuery = contentQueryIds[index]

        // Debug rõ ràng từng cái
        if (!target) {
            console.error('❌ Missing target:', targetQuery)
            throw new Error(`Cannot find target with query: ${targetQuery}`)
        }

        if (!content) {
            console.error('❌ Missing content:', contentQuery)
            throw new Error(`Cannot find content with query: ${contentQuery}`)
        }

        // Lấy text an toàn
        const value = content.textContent?.trim() || ''

        // Set value
        target.value = value
    })
}

function observeAndTrigger({
    observeTargetQuery,
    triggerCondition,
    triggerSelector,
    triggerEventOn,
    triggerEventOff,
    bounceDelay = 200,
    onDelay = 0,
    offDelay = 0
}) {
    const observeTarget = document.querySelector(observeTargetQuery);
    const triggerElement = document.querySelector(triggerSelector);

    if (!observeTarget || !triggerElement) {
        console.error('❌ Missing target or trigger element');
        return;
    }

    const onEvent = triggerEventOn || 'open-dialog';
    const offEvent = triggerEventOff || onEvent;

    function debounce(fn, delay) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    }

    let lastState = null; // 🔥 chống spam event

    const handleMutation = () => {
        // 🔥 FIX: dùng querySelector thay vì matches
        const conditionMet = observeTarget.matches(triggerCondition)
            || !!observeTarget.querySelector('h4.check:not(:empty)');

        // tránh spam event
        if (conditionMet === lastState) return;
        lastState = conditionMet;

        if (conditionMet) {
            setTimeout(() => {
                if (triggerElement.tagName === 'DIALOG' && !triggerElement.open) {
                    triggerElement.showModal();
                }
                triggerElement.dispatchEvent(new Event(onEvent, { bubbles: true }));
            }, onDelay);
        } else {
            setTimeout(() => {
                if (triggerElement.tagName === 'DIALOG' && triggerElement.open) {
                    triggerElement.close();
                }
                triggerElement.dispatchEvent(new Event(offEvent, { bubbles: true }));
            }, offDelay);
        }
    };

    const debouncedHandler = debounce(handleMutation, bounceDelay);

    const observer = new MutationObserver(debouncedHandler);

    observer.observe(observeTarget, {
        childList: true,
        subtree: true,
        characterData: true,
    });

    return observer;
}

function initIntro2Slider() {
    const section = document.getElementById('section-intro2');
    if (!section) return;

    const rightContainer = section.querySelector('.right');
    const items = rightContainer ? rightContainer.querySelectorAll('.item-containter') : [];
    if (!items.length) return;

    const tabs = [
        document.getElementById('section-intro2-privilege-selected-1'),
        document.getElementById('section-intro2-privilege-selected-2')
    ];

    let activeIndex = 0;

    function updateSlider(index) {
        activeIndex = Math.max(0, Math.min(index, items.length - 1));

        items.forEach((item, idx) => {
            // Static stack z-index logic: first card is always on top of the next card.
            // This ensures cards moving up/out slide on top of the active card, keeping transitions visible.
            const naturalZIndex = items.length - idx;
            item.style.zIndex = String(naturalZIndex);

            if (idx < activeIndex) {
                // Passed (move up and out)
                item.style.transform = 'translateY(-105%) scale(0.9)';
                item.style.opacity = '0';
                item.style.filter = 'brightness(0.5) saturate(0.1) contrast(1.3)';
                item.style.pointerEvents = 'none';
            } else if (idx === activeIndex) {
                // Active
                item.style.transform = 'translateY(0) scale(1)';
                item.style.opacity = '1';
                item.style.filter = 'brightness(1) saturate(1) contrast(1)';
                item.style.pointerEvents = 'auto';
            } else {
                // Upcoming (stacked underneath)
                const diff = idx - activeIndex;
                item.style.transform = `translateY(${diff * 16}px) scale(${1 - diff * 0.04})`;
                item.style.opacity = '1';
                // Progressively darken upcoming cards as they sit deeper in the stack
                const brightnessVal = Math.max(0.3, 1 - diff * 0.15);
                item.style.filter = `brightness(${brightnessVal}) saturate(0.1) contrast(1.3)`;
                item.style.pointerEvents = 'none';
            }
        });

        // Sync tab input state
        if (tabs[activeIndex]) {
            tabs[activeIndex].checked = true;
        }
    }

    // Initialize initial states
    updateSlider(0);

    // Sync tabs click to index
    tabs.forEach((tab, tabIdx) => {
        if (tab) {
            tab.addEventListener('change', () => {
                if (tab.checked && activeIndex !== tabIdx) {
                    updateSlider(tabIdx);
                }
            });
        }
    });

    // Scroll interception with debounce
    let lastWheelTime = 0;
    const scrollThreshold = 400; // ms threshold between steps to prevent rapid skipping

    rightContainer.addEventListener('wheel', (event) => {
        const now = Date.now();
        if (now - lastWheelTime < scrollThreshold) {
            // Lock scrolling but ignore duplicate wheel events
            if ((event.deltaY > 0 && activeIndex < items.length - 1) ||
                (event.deltaY < 0 && activeIndex > 0)) {
                event.preventDefault();
            }
            return;
        }

        const isDown = event.deltaY > 0;
        const isUp = event.deltaY < 0;

        if (isDown && activeIndex < items.length - 1) {
            event.preventDefault();
            lastWheelTime = now;
            updateSlider(activeIndex + 1);
        } else if (isUp && activeIndex > 0) {
            event.preventDefault();
            lastWheelTime = now;
            updateSlider(activeIndex - 1);
        }
    }, { passive: false });

    // Touch event swipe tracking for mobile
    let touchStartY = 0;
    let touchStartX = 0;

    rightContainer.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
        touchStartX = event.touches[0].clientX;
    }, { passive: true });

    rightContainer.addEventListener('touchmove', (event) => {
        if (!touchStartY) return;

        const currentY = event.touches[0].clientY;
        const diffY = touchStartY - currentY; // positive = swipe up (scroll down)

        // Only trigger vertical swipes
        const currentX = event.touches[0].clientX;
        const diffX = touchStartX - currentX;
        if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 50) {
            const now = Date.now();
            if (now - lastWheelTime < scrollThreshold) {
                if ((diffY > 0 && activeIndex < items.length - 1) ||
                    (diffY < 0 && activeIndex > 0)) {
                    event.preventDefault();
                }
                return;
            }

            if (diffY > 0 && activeIndex < items.length - 1) {
                event.preventDefault();
                lastWheelTime = now;
                updateSlider(activeIndex + 1);
                touchStartY = currentY; // reset reference
            } else if (diffY < 0 && activeIndex > 0) {
                event.preventDefault();
                lastWheelTime = now;
                updateSlider(activeIndex - 1);
                touchStartY = currentY; // reset reference
            }
        }
    }, { passive: false });
}

// CALLING FUNCTIONs
headerScroll();

function landingPageCall() {
    sliderControl({
        listElementQuery: '#Course_content_cards',
        childElement: '.card',
        nextBtnQuery: '#Course .cards-slider-controller-next',
        prevBtnQuery: '#Course .cards-slider-controller-prev',
        filtersQuery: 'input[name="Course_content_cate"]'
    });
    sliderControl({
        listElementQuery: '#News_content_cards',
        childElement: '.card',
        nextBtnQuery: '#News .cards-slider-controller-next',
        prevBtnQuery: '#News .cards-slider-controller-prev',
        filtersQuery: 'input[name="News_content_cate"]'
    });

    trackMousePosition('#Programme')
    trackMousePosition('#Contact')
    trackMousePosition('#hero')
    eventQuarterText('#Event_content_cards .card');
    autoNextSelection({
        container: '#hero',
        itemSelector: 'input[name="hero"]',
        interval: 5000,
        type: 'radio'
    });

    autoSlide({
        listElementQuery: '#Feedback_content_cards',
        itemQuery: '.card',
        delayTime: 3000
    });
    PagingContent({
        containerQuery: '#Partner_content_cards',
        itemsQuery: '.card',
        paginationContainerQuery: '#Partner_pagination',
        itemsPerPage: 10,
        autoNextTime: 5000,
    });
    initIntro2Slider();
}

function courseListPageCall() {
    PagingContent({
        containerQuery: '#Course_content_cards',
        itemsQuery: '.card',
        paginationContainerQuery: '#Course_pagination',
        itemsPerPage: 9,
        filtersQuery: 'input[name="Course_content_cate"]'
    })
    sliderControl({
        listElementQuery: '#Related_content_cards',
        childElement: '.card',
        nextBtnQuery: '#Related .cards-slider-controller-next',
        prevBtnQuery: '#Related .cards-slider-controller-prev'
    });
}

function eventListPageCall() {
    PagingContent({
        containerQuery: '#Course_content_cards',
        itemsQuery: '.card',
        paginationContainerQuery: '#Course_pagination',
        itemsPerPage: 12,
        filtersQuery: 'input[name="Course_content_cate"]'
    })
    eventQuarterText('#Course_content_cards .card');
    formFillFromHtmlContent({
        formQuery: '[id="65218bb1-57eb-dc54-4d0d-00cf5ac21e86"].after-login-show',

        formTargetQueryIds: [
            'input#fullName',
            'input#mobile',
            'input#email',
        ],

        contentQueryIds: [
            '#CourseDetailDescription #AfterLogin span.displayName',
            '#CourseDetailDescription #AfterLogin span.displayMobile',
            '#CourseDetailDescription #AfterLogin span.displayEmail',
        ]
    })
    sliderControl({
        listElementQuery: '#Course_content_cards',
        childElement: '.card',
        nextBtnQuery: '#Related .cards-slider-controller-next',
        prevBtnQuery: '#Related .cards-slider-controller-prev'
    });
    observeAndTrigger({
        observeTargetQuery: '#EventSignUp',
        triggerCondition: 'h4.check:not(:empty)',
        triggerSelector: '#EventSignUp',
        triggerEventOn: 'notification-show',
        triggerEventOff: 'notification-hide',
        offDelay: 3000
    });

    if (window.location.pathname.includes('vc-101-hieu-ve-venture-capital-tong-quan-cho-founder')) {
        disableEventFormWhenReady();
        console.log('disableEventForm');

    }
}

function disableEventFormWhenReady() {
    const observer = new MutationObserver(() => {
        let form = document.querySelector('[id="65218bb1-57eb-dc54-4d0d-00cf5ac21e86"].after-login-show');

        if (form) {
            let button = form.querySelector('button[type="submit"]');

            if (button) {
                button.disabled = true;
                button.style.cursor = 'not-allowed';
                button.title = 'Form đã đóng đăng ký';
                console.log('✅ Form disabled via observer');
                observer.disconnect(); // stop luôn
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

switch (true) {
    case window.location.pathname.includes('/pages/danh-sach-khoa-hoc') ||
        window.location.pathname.includes('/danh-sach-khoa-hoc') ||
        window.location.pathname.includes('/pages/danh-sach-bai-viet/') ||
        window.location.pathname.includes('/danh-sach-bai-viet/') ||
        window.location.pathname.includes('/pages/bai-viet/') ||
        window.location.pathname.includes('/bai-viet/') ||
        window.location.pathname.includes('/pages/san-pham/') ||
        window.location.pathname.includes('/san-pham/')
        :
        courseListPageCall();
        break;

    case window.location.pathname.includes('/pages/danh-sach-su-kien/') ||
        window.location.pathname.includes('/danh-sach-su-kien') ||
        window.location.pathname.includes('/pages/su-kien') ||
        window.location.pathname.includes('/su-kien')
        :
        eventListPageCall();
        break;
    default:
        landingPageCall();
        break;
}