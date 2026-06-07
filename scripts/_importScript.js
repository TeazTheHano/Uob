// ==========================================================================
// APPLICATION SHELL & SPA ENGINE
// Encapsulates configuration, caching, renderers, and routing inside a single 
// modular object to prevent global namespace pollution and ensure solid architecture.
// ==========================================================================

const App = {
    // 1. Engine Configuration
    config: {
        retries: 3,
        retryDelayMs: 1000,
        defaultRoute: '#/landing',
        placeholders: {
            main: '#main_placeholder',
            header: '#header_placeholder',
            footer: '#footer_placeholder'
        },
        errorTemplate: (error) => `
            <div style="padding: 40px; color: #ef4444; font-family: 'Inter', sans-serif; text-align: center; background: #fee2e2; border-radius: 8px; margin: 20px;">
                <h3 style="margin-bottom: 12px; font-weight: 600;">Unable to load page</h3>
                <p style="opacity: 0.8; font-size: 14px;">${error.message || error}</p>
            </div>
        `
    },

    // 2. Component Template Registry
    components: {
        HEADER: 'components/header.html',
        FOOTER: 'components/footer.html',
        HERO: 'components/hero.html',
        INTRO1: 'components/intro1.html',
        INTRO2: 'components/intro2.html',
        LANDINGCONTACT: 'components/landingContact.html',
        DINNING_HERO: 'components/dinning_hero.html',
        DINNING1: 'components/dinning1.html',
        DINNING2: 'components/dinning2.html',
        PRIVILEGE_HERO: 'components/privilege_hero.html',
        PRIVILEGE1: 'components/privilege1.html',
        PRIVILEGE2: 'components/privilege2.html',
        PRIVILEGE3: 'components/privilege3.html',
        DINNING_DETAIL_HERO: 'components/dinning-detail_hero.html',
        DINNING_DETAIL1: 'components/dinning-detail1.html',
        DINNING_DETAIL2: 'components/dinning-detail2.html',
        DINNING_POPUP: 'components/dinning-popup.html',
        PRIVILEGE_POPUP: 'components/privilege-popup.html',
        PRIVILEGE_POPUP2: 'components/privilege-popup2.html',
        CONFIRM_POPUP: 'components/confirm-popup.html',
    },

    // 3. HTML Cache Store
    cache: new Map(),

    // 4. Utility Methods
    utils: {
        delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
    },

    // 5. HTML Loader & Fetch Engine
    async fetchHtml(path, retries = this.config.retries) {
        if (!path) {
            throw new Error('fetchHtml: Path must be a valid string.');
        }

        if (this.cache.has(path)) {
            return this.cache.get(path);
        }

        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(path);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${path} (${response.statusText})`);
                }
                const html = await response.text();
                this.cache.set(path, html);
                return html;
            } catch (error) {
                if (i === retries - 1) {
                    throw error;
                }
                await this.utils.delay(this.config.retryDelayMs);
            }
        }
    },

    async injectHtml(target, path) {
        const element = document.querySelector(target);
        if (!element) {
            throw new Error(`injectHtml: Target element "${target}" not found in DOM.`);
        }
        const html = await this.fetchHtml(path);
        element.innerHTML = html;
        return element;
    },

    // 6. Section & Page Render Engine
    async renderSection(section) {
        if (!section.component) {
            throw new Error(`renderSection: No template declared for target placeholder "${section.target}"`);
        }

        await this.injectHtml(section.target, section.component);

        if (typeof section.afterLoad === 'function') {
            await section.afterLoad();
        }
    },

    async renderPage(page) {
        // Render base shell page first
        await this.injectHtml(this.config.placeholders.main, page.template);

        // Render sub-sections sequentially to prevent DOM insertion collisions
        for (const section of page.sections) {
            await this.renderSection(section);
        }
    },

    async ensureLayout() {
        // Inject header if not loaded
        const headerEl = document.querySelector(this.config.placeholders.header);
        if (headerEl && !headerEl.innerHTML.trim()) {
            await this.injectHtml(this.config.placeholders.header, this.components.HEADER);
            if (typeof headerScroll === 'function') {
                headerScroll();
            }
        }

        // Inject footer if not loaded
        const footerEl = document.querySelector(this.config.placeholders.footer);
        if (footerEl && !footerEl.innerHTML.trim()) {
            await this.injectHtml(this.config.placeholders.footer, this.components.FOOTER);
        }
    },

    // 7. Client-side SPA Router
    routes: [],

    matchRoute(hash) {
        for (const route of this.routes) {
            if (typeof route.path === 'string' && route.path === hash) {
                return route;
            }
            if (route.path instanceof RegExp) {
                const match = hash.match(route.path);
                if (match) {
                    return {
                        ...route,
                        params: match
                    };
                }
            }
        }
        return null;
    },

    async routeController() {
        try {
            await this.ensureLayout();

            const hash = window.location.hash || this.config.defaultRoute;
            const route = this.matchRoute(hash);

            if (!route) {
                await this.injectHtml(this.config.placeholders.main, 'pages/404.html');
                return;
            }

            await this.renderPage(route.page);
        } catch (error) {
            console.error('[SPA Router Exception]:', error);
            const mainPlaceholder = document.querySelector(this.config.placeholders.main);
            if (mainPlaceholder) {
                mainPlaceholder.innerHTML = this.config.errorTemplate(error);
            }
        }
    },

    // 8. Initialization & Listeners
    init() {
        const handler = this.routeController.bind(this);
        window.addEventListener('load', handler);
        window.addEventListener('hashchange', handler);

        // Global click-outside listener to close open details dropdowns
        document.addEventListener('click', (event) => {
            const dropdowns = document.querySelectorAll('details.ui-dropdown');
            dropdowns.forEach(dropdown => {
                if (dropdown.hasAttribute('open') && !dropdown.contains(event.target)) {
                    dropdown.removeAttribute('open');
                }
            });
        });
    }
};

// ==========================================================================
// BACKWARD COMPATIBILITY & CONFIGURATION INJECTION
// Define components and pages cleanly within the App boundaries while
// exporting shorthand references if needed.
// ==========================================================================

const COMPONENTS = App.components;

const landingPage = {
    template: 'pages/landing.html',
    sections: [
        {
            target: '#hero-section_placeholder',
            component: COMPONENTS.HERO,
            // afterLoad() {
            //     if (typeof trackMousePosition === 'function') {
            //         trackMousePosition('#hero');
            //     }
            //     if (typeof autoNextSelection === 'function') {
            //         autoNextSelection({
            //             container: '#hero',
            //             itemSelector: 'input[name="hero"]',
            //             interval: 5000,
            //             type: 'radio'
            //         });
            //     }
            // }
        },
        {
            target: '#intro1_placeholder',
            component: COMPONENTS.INTRO1,
        },
        {
            target: '#intro2_placeholder',
            component: COMPONENTS.INTRO2,
            afterLoad() {
                if (typeof initIntro2Slider === 'function') {
                    initIntro2Slider('section-intro2', [
                        'section-intro2-privilege-selected-1',
                        'section-intro2-privilege-selected-2'
                    ]);
                }
                if (typeof initLogoMarquees === 'function') {
                    initLogoMarquees();
                }
            }
        },
        {
            target: '#landingContact_placeholder',
            component: COMPONENTS.LANDINGCONTACT,
        },
        {
            target: '#dinning_hero_placeholder',
            component: COMPONENTS.DINNING_HERO
        },
        {
            target: '#dinning1_placeholder',
            component: COMPONENTS.DINNING1
        },
        {
            target: '#dinning2_placeholder',
            component: COMPONENTS.DINNING2
        },
        {
            target: '#privilege_hero_placeholder',
            component: COMPONENTS.PRIVILEGE_HERO
        },
        {
            target: '#privilege1_placeholder',
            component: COMPONENTS.PRIVILEGE1
        },
        {
            target: '#privilege2_placeholder',
            component: COMPONENTS.PRIVILEGE2,
        },
        {
            target: '#privilege3_placeholder',
            component: COMPONENTS.PRIVILEGE3,
        },
        {
            target: '#dinning-detail_hero_placeholder',
            component: COMPONENTS.DINNING_DETAIL_HERO
        },
        {
            target: '#dinning-detail1_placeholder',
            component: COMPONENTS.DINNING_DETAIL1
        },
        {
            target: '#dinning-detail2_placeholder',
            component: COMPONENTS.DINNING_DETAIL2
        },
        {
            target: '#dinning_popup_placeholder',
            component: COMPONENTS.DINNING_POPUP
        },
        {
            target: '#privilege_popup_placeholder',
            component: COMPONENTS.PRIVILEGE_POPUP
        },
        {
            target: '#privilege_popup2_placeholder',
            component: COMPONENTS.PRIVILEGE_POPUP2
        },
        {
            target: '#confirm_popup_placeholder',
            component: COMPONENTS.CONFIRM_POPUP
        }

    ]
};

// 9. Attach Routes
App.routes = [
    {
        path: '#/landing',
        page: landingPage
    }
];

// 10. Start the App Shell
App.init();