"use strict";(()=>{var e={};e.id=660,e.ids=[660],e.modules={1070:(e,r,n)=>{n.r(r),n.d(r,{default:()=>o});var s=n(997),t=n(6859);function o(){return(0,s.jsxs)(t.Html,{lang:"en",children:[(0,s.jsxs)(t.Head,{children:[s.jsx("meta",{charSet:"utf-8"}),s.jsx("meta",{name:"description",content:"Cronos AI Platform - Agent-powered DeFi automation"}),s.jsx("link",{rel:"icon",href:"/favicon.ico"}),s.jsx("script",{dangerouslySetInnerHTML:{__html:`
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args.join(' ');
                  if (
                    msg.includes('chainId') ||
                    msg.includes('getter') ||
                    msg.includes('chrome-extension://') ||
                    msg.includes('moz-extension://')
                  ) {
                    console.warn('Suppressed extension error:', msg);
                    return;
                  }
                  originalError.apply(console, args);
                };

                // Suppress Next.js error overlay for extension errors
                if (typeof window !== 'undefined') {
                  window.addEventListener('error', function(e) {
                    if (
                      e.filename?.includes('chrome-extension://') ||
                      e.filename?.includes('moz-extension://') ||
                      e.message?.includes('chainId') ||
                      e.message?.includes('getter')
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                      return false;
                    }
                  }, true);

                  window.addEventListener('unhandledrejection', function(e) {
                    const msg = e.reason?.message || e.reason?.toString() || '';
                    if (
                      msg.includes('chainId') ||
                      msg.includes('getter') ||
                      msg.includes('chrome-extension://') ||
                      msg.includes('moz-extension://')
                    ) {
                      e.stopImmediatePropagation();
                      e.preventDefault();
                      return false;
                    }
                  }, true);
                }
              })();
            `}})]}),(0,s.jsxs)("body",{children:[s.jsx(t.Main,{}),s.jsx(t.NextScript,{})]})]})}},2785:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},6689:e=>{e.exports=require("react")},997:e=>{e.exports=require("react/jsx-runtime")},1017:e=>{e.exports=require("path")}};var r=require("../webpack-runtime.js");r.C(e);var n=e=>r(r.s=e),s=r.X(0,[859],()=>n(1070));module.exports=s})();