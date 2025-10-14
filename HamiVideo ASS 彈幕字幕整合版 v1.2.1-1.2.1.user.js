// ==UserScript==
// @name         HamiVideo ASS 彈幕字幕整合版 v1.2.1
// @namespace    http://tampermonkey.net/
// @version      1.2.1
// @description  在 HamiVideo 播放頁面載入 ASS 彈幕字幕，支援自動縮小與影片切換偵測。
// @match        *://hamivideo.hinet.net/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const ASS_SOURCES = [
    'https://cdn.jsdelivr.net/gh/Assjs/ass.js/dist/ass.global.min.js',
    'https://unpkg.com/assjs/dist/ass.global.min.js',
    'https://raw.githubusercontent.com/Assjs/ass.js/master/dist/ass.global.min.js',
  ];

  // 逐一嘗試載入來源
  async function loadASSJS() {
    if (window.ASS) return;
    for (const src of ASS_SOURCES) {
      try {
        console.log('[HamiVideo-ASS] 嘗試載入', src);
        await new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = src;
          s.onload = () => resolve();
          s.onerror = reject;
          document.head.appendChild(s);
        });
        if (window.ASS) {
          console.log('[HamiVideo-ASS] ✅ ASS.js 載入成功');
          return;
        }
      } catch (err) {
        console.warn('[HamiVideo-ASS] 來源失敗：', src);
      }
    }
    console.error('[HamiVideo-ASS] ❌ 所有來源均載入失敗');
  }

  function createButton() {
    if (document.querySelector('#ass-load-btn')) return;
    const btn = document.createElement('button');
    btn.id = 'ass-load-btn';
    btn.textContent = '載入字幕';
    Object.assign(btn.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 999999,
      padding: '8px 14px',
      background: 'rgba(0,0,0,0.6)',
      color: '#fff',
      border: '1px solid #fff',
      borderRadius: '8px',
      cursor: 'pointer',
    });
    btn.onclick = onLoadASSClicked;
    document.body.appendChild(btn);
  }

  async function onLoadASSClicked() {
    await loadASSJS();
    if (!window.ASS) {
      alert('❌ 無法載入 ASS.js，請稍後再試');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.ass';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        window._assText = ev.target.result;
        setupASS(window._assText);
      };
      reader.readAsText(file, 'utf-8');
    };
    input.click();
  }

function setupASS(assText) {
  const video = document.querySelector('video');
  if (!video) {
    console.warn('[HamiVideo-ASS] ❌ 找不到 video');
    return;
  }

  // 清除舊字幕層
  document.querySelector('#ass-container')?.remove();

  // 建立容器與 canvas
  const container = document.createElement('div');
  container.id = 'ass-container';
  Object.assign(container.style, {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 9999,
    transformOrigin: 'top left',
    transform: 'scale(0.6)', // ✅ 統一縮小 60%
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'ass-canvas';
  Object.assign(canvas.style, {
    width: '100%',
    height: '100%',
  });

  container.appendChild(canvas);
  video.parentElement.appendChild(container);

  const renderer = new ASS(assText, video, {
    container,
    canvas,
    resampling: 'video_width',
  });
  window.assRenderer = renderer;

  console.log('[HamiVideo-ASS] ✅ 字幕已載入 (全域縮放 60%)');
}


  // 自動偵測新影片
  function watchVideoChange() {
    const observer = new MutationObserver(() => {
      const newVideo = document.querySelector('video');
      if (newVideo && newVideo !== window._lastVideo) {
        console.log('[HamiVideo-ASS] 🔄 偵測到新影片');
        window._lastVideo = newVideo;
        if (window._assText) {
          setTimeout(() => setupASS(window._assText), 1000);
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function init() {
    createButton();
    watchVideoChange();
    console.log('[HamiVideo-ASS] 🚀 啟動完成');
  }

  window.addEventListener('load', () => setTimeout(init, 2000));
})();
