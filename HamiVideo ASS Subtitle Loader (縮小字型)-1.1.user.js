// ==UserScript==
// @name         HamiVideo ASS Subtitle Loader (縮小字型)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在 HamiVideo 影片頁面載入 .ass 字幕檔，並自動縮小字型
// @match        https://hamivideo.hinet.net/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const FONT_SCALE = 0.6; // 字型縮小比例，可改 0.5~1.0

    // --- 動態載入 ASS.js ---
    function injectASS() {
        return new Promise((resolve, reject) => {
            if (window.ASS) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/assjs@0.1.3/dist/ass.global.min.js';
            script.onload = () => {
                console.log('[HamiVideo-ASS] ✅ ASS.js 已載入');
                resolve();
            };
            script.onerror = () => reject(new Error('ASS.js 載入失敗'));
            document.head.appendChild(script);
        });
    }

    // --- 建立載入字幕按鈕 ---
    function createButton(video) {
        if (document.getElementById('assLoaderBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'assLoaderBtn';
        btn.textContent = '載入 ASS 字幕';
        Object.assign(btn.style, {
            position: 'fixed',
            top: '10px',
            right: '10px',
            zIndex: '999999',
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.7)',
            color: '#fff',
            border: '1px solid #fff',
            borderRadius: '8px',
            cursor: 'pointer'
        });

        btn.onclick = async () => {
            try {
                await injectASS();
            } catch (err) {
                alert('ASS.js 載入失敗');
                return;
            }

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.ass';
            input.onchange = async e => {
                const file = e.target.files[0];
                if (!file) return;
                let text = await file.text();
                text = adjustFontsize(text, FONT_SCALE); // 自動縮小字型
                loadASS(text, video);
            };
            input.click();
        };

        document.body.appendChild(btn);
    }

    // --- 自動縮小字型函式 ---
    function adjustFontsize(assText, scale = 0.6) {
        return assText.replace(
            /^Style:(.+?),(\d+)(,.*)$/mg,
            (match, name, fontsize, rest) => `Style:${name},${Math.round(fontsize*scale)}${rest}`
        );
    }

    // --- 載入 ASS 字幕 ---
    function loadASS(assText, video) {
        if (!window.ASS) {
            console.error('[HamiVideo-ASS] ❌ ASS.js 尚未載入');
            return;
        }

        // 移除舊字幕
        const old = document.getElementById('ass-container');
        if (old) old.remove();

        const container = document.createElement('div');
        container.id = 'ass-container';
        Object.assign(container.style, {
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 2147483646
        });

        // 父層設定為 relative
        const parent = video.parentElement;
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
            parent.style.position = 'relative';
        }
        parent.appendChild(container);

        try {
            new window.ASS(assText, video, { container });
            console.log('[HamiVideo-ASS] ✅ 字幕已載入 (自動縮小)');
        } catch (err) {
            console.error('[HamiVideo-ASS] 字幕初始化錯誤', err);
            alert('字幕載入失敗');
        }
    }

    // --- 監測影片，建立按鈕 ---
    function waitForVideo() {
        const timer = setInterval(() => {
            const video = document.querySelector('video');
            if (video) {
                clearInterval(timer);
                createButton(video);
            }
        }, 500);
    }

    waitForVideo();

})();
