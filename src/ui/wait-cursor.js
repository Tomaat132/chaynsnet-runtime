import htmlToElement from 'html-to-element';

let waitCursorConfig = {};

export default class WaitCursor {

    /**
     * display or create a WaitCursor for the srcIframe
     * @param timeToTextDisplay
     * @param text
     * @param srcIframe
     */
    static show = (timeToTextDisplay = 5000, text, srcIframe) => {
        if (!srcIframe || srcIframe === window) {
            srcIframe = document.querySelector('#TappIframe') || document.querySelector('#CustomAjaxTapp');
            if (srcIframe) {
                srcIframe.name = 'TappIframe';
            } else {
                srcIframe = document.querySelector('.body-content');
                srcIframe.name = 'default';
            }
        }

        let config = waitCursorConfig[srcIframe.name] || {};

        if (!config.$waitCursor) {
            config.$waitCursor = getWaitCursor(srcIframe.name);
            config.$waitCursor.addEventListener('click', (e) => e.stopPropagation());
            (srcIframe.name !== 'default') ? srcIframe.parentElement.parentElement.appendChild(config.$waitCursor) : srcIframe.parentElement.appendChild(config.$waitCursor);
            config.$text = config.$waitCursor.querySelector('.loading-spinner-text');
        }
        config.$waitCursor.classList.remove('with-text');
        config.$waitCursor.style.width = `${srcIframe.offsetWidth || 566}px`;

        config.$text.classList.add('hidden');
        config.$text.innerHTML = (text && text.length > 0 && typeof text === 'string') ? text : 'Es tut uns leid, dass Du warten musst. Das dauert gerade länger als es eigentlich sollte...';

        clearTimeout(config.timeout);
        config.timeout = setTimeout(() => {
            config.$waitCursor.classList.add('with-text');
            config.$text.classList.remove('hidden');
            config.timeout = null;
        }, timeToTextDisplay);

        config.$waitCursor.classList.remove('hidden');
        config.startTime = Date.now();
        waitCursorConfig[srcIframe.name] = config;
    };

    /**
     * hide the WaitCursor of the srcIframe
     * @param srcIframe
     */
    static hide = (srcIframe) => {
        let iframeName = (srcIframe && srcIframe.name) ? srcIframe.name : 'TappIframe';
        if (iframeName === 'TappIframe') {
            let defaultWaitCursor = document.querySelector('.ChaynsLoadingCursor[data-iframe="default"]');
            if (defaultWaitCursor) {
                defaultWaitCursor.parentElement.removeChild(defaultWaitCursor);
                waitCursorConfig['default'] = undefined;
            }
        }

        let config = (iframeName) ? waitCursorConfig[iframeName] || null : null;

        if (!config || !config.$waitCursor) {
            return;
        }
        config.$waitCursor.classList.add('hidden');
        clearTimeout(config.timeout);

        let runningTime = new Date().getTime() - config.startTime;

        if (runningTime < 1000) {
            return;
        }

        config.startTime = null;
    };
}

/**
 * returns a WaitCurser dom node
 * @param frameName
 * @returns {*}
 */
function getWaitCursor(frameName) {
    return htmlToElement(`<div class="ChaynsLoadingCursor hidden" data-iframe="${frameName}">
                    <div class="loading-spinner-wrapper">
                        <div class="loading-spinner"></div>
                        <div class="loading-spinner-text"></div>
                    </div>
            </div>`);
}