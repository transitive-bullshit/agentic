(async()=>{const u={linkedin:["3117BF26-4762-4F5A-8ED9-A85E69209A46",!1],rockstar:["A5A70501-FCDE-4065-AF18-D9FAF06EF479",!1],github:["20782B4C-05D0-45D7-97A0-41641055B6F6",!1],paypal:["9409E63B-D2A5-9CBD-DBC0-5095707D0090",!1],blizzard:["E8A75615-1CBA-5DFF-8032-D16BCF234E10",!1],twitch:["E5554D43-23CC-1982-971D-6A2262A2CA24",!1],demo1:["804380F4-6844-FFA1-ED4E-5877CA1F1EA4",!1],demo2:["D39B0EE3-2973-4147-98EF-C92F93451E2D",!1],"ea signup":["73BEC076-3E53-30F5-B1EB-84F494D43DBA",!1],"ea signin":["0F5FE186-B3CA-4EDB-A39B-9B9A3397D01D",!1],myprepaidcenter:["0F941BF0-7303-D94B-B76A-EAA2E2048124",!1],twitter:["2CB16598-CB82-4CF7-B332-5990DB66F3AB",!0],discoveryplus:["FE296399-FDEA-2EA2-8CD5-50F6E3157ECA",!1],minecraft:["D39B0EE3-2973-4147-98EF-C92F93451E2D",!1],imvu:["0C2B415C-D772-47D4-A183-34934F786C7E",!1],adobe:["430FF2C3-1AB1-40B7-8BE7-44FC683FE02C",!1]},h={outlook:["https://iframe.arkoselabs.com/B7D8911C-5CC8-A9A3-35B0-554ACEE604DA/index.html?mkt=en",!1],"outlook auth":["https://iframe-auth.arkoselabs.com/B7D8911C-5CC8-A9A3-35B0-554ACEE604DA/index.html?mkt=en",!1]};let E=1;function w(){g("linkedin",0,1),g("rockstar",0,1),g("demo1",0,1),g("blizzard",0,1),g("twitch",0,1),g("paypal",0,1),A("outlook auth",0,1),g("github",0,1),g("demo2",0,1),A("outlook",0,1),g("ea signup",0,1),g("ea signin",0,1),g("twitter",0,1),g("minecraft",0,1),g("imvu",0,1),g("adobe",0,1)}function g(t,o,n){n=n||E;for(let e=0;e<n;e++)!async function(e,t){var o=u[e][0],n="https://api.funcaptcha.com/fc/gt2/public_key/"+o,n=await Net.fetch(n,{headers:{accept:"*/*","accept-language":"en-US,en;q=0.9","cache-control":"no-cache","content-type":"application/x-www-form-urlencoded; charset=UTF-8",pragma:"no-cache","sec-ch-ua":'"Google Chrome";v="105", "Not)A;Brand";v="8", "Chromium";v="105"',"sec-ch-ua-mobile":"?0","sec-ch-ua-platform":'"Linux"',"sec-fetch-dest":"empty","sec-fetch-mode":"cors","sec-fetch-site":"cross-site"},referrer:"",referrerPolicy:"strict-origin-when-cross-origin",body:`bda=&public_key=${o}&site=${encodeURIComponent("")}&language=en&userbrowser=Mozilla%2F5.0%20(X11%3B%20Linux%20x86_64)%20AppleWebKit%2F537.36%20(KHTML%2C%20like%20Gecko)%20Chrome%2F105.0.0.0%20Safari%2F537.36&rnd=`+Math.random(),method:"POST",mode:"cors",credentials:"omit"}),o=JSON.parse(n),r={};for(const i of o.token.split("|")){var a=i.split("=");let e=a[0],t=a[1];a[1]||(e="token",t=a[0]),e.endsWith("url")&&(t=decodeURIComponent(t)),r[e]=t}n=new URLSearchParams(r).toString(),o="https://api.funcaptcha.com/fc/gc/?"+n;c(e,t,o,u[e][1])}(t,o)}function A(t,o,n){n=n||E;for(let e=0;e<n;e++)c(t,o,h[t][0],h[t][1])}function c(e,t,o,n=!1){var r=document.createElement("div"),a=(r.classList.add("iframe_wrap"),document.createElement("iframe"));n&&a.classList.add("small"),r.append(a),a.frameborder=0,a.scrolling="no",a.src=o;let i=document.querySelector("#iframe_row_"+t);i||((i=document.createElement("div")).classList.add("iframe_row"),i.id="iframe_row_"+t,document.body.append(i));n=document.createElement("div"),n.classList.add("name"),n.innerHTML=e,a=document.createElement("div");a.append(n),a.append(r),i.append(a)}!function e(){document.body.innerHTML="";const t=[`body, html {
                background-color: #212121;
            }`,`.input_row {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
            }`,`.input_row > * {
                height: 20px;
                line-height: 20px;
                padding: 0;
                border: 0;
                font-size: 12px;
            }`,`.input_row > input[type="button"] {
                width: 100px;
                cursor: pointer;
                transition: 200ms all;
            }`,`.input_row > input[type="button"]:hover {
                opacity: 0.8;
            }`,`#nframes_label {
                background-color: #fff;
                color: #222;
                width: 70px;
                text-align: center;
            }`,`#nframes, #nframes:active {
                width: 30px;
                border: none;
                outline: none;
            }`,`.name {
                color: #fff;
            }`,`.iframe_row {
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                justify-content: center;
            }`,`.iframe_wrap {
                background-color: #eee;
                width: 275px;
                height: 275px;
                padding: 0;
                overflow: hidden;
            }`,`iframe {
                border: none !important;
                width: 400px !important;
                height: 400px !important;
                -ms-zoom: 0.75 !important;
                -moz-transform: scale(0.75) !important;
                -moz-transform-origin: 0 0 !important;
                -o-transform: scale(0.75) !important;
                -o-transform-origin: 0 0 !important;
                -webkit-transform: scale(0.75) !important;
                -webkit-transform-origin: 0 0 !important;
            }`,`iframe.small {
                width: 550px !important;
                height: 550px !important;
                -ms-zoom: 0.5 !important;
                -moz-transform: scale(0.5) !important;
                -moz-transform-origin: 0 0 !important;
                -o-transform: scale(0.5) !important;
                -o-transform-origin: 0 0 !important;
                -webkit-transform: scale(0.5) !important;
                -webkit-transform-origin: 0 0 !important;
            }`];const o=document.body.appendChild(document.createElement("style")).sheet;for(const n in t)o.insertRule(t[n],n);let n=0;let r=1;const a={};a[0]=document.createElement("div");a[0].classList.add("input_row");document.body.append(a[0]);const i=document.createElement("div");i.id="nframes_label";i.innerText="# iframes";a[0].append(i);const c=document.createElement("input");c.id="nframes";c.placeholder="Number of iframes";c.value=E;c.addEventListener("input",()=>{E=parseInt(c.value)});a[0].append(c);const s={reset:{row:0,fn:e,args:[]},all:{row:0,fn:w,args:[]}};for(const m in u)n++%9==0&&r++,s[m]={row:r,fn:g,args:[m,0]};for(const d in h)n++%9==0&&r++,s[d]={row:r,fn:A,args:[d,0]};for(const[p,l]of Object.entries(s)){const r=l.row,f=(l.row in a||(a[l.row]=document.createElement("div"),a[l.row].classList.add("input_row"),document.body.append(a[l.row])),document.createElement("input"));f.type="button",f.value=p,f.addEventListener("click",()=>{e(),l.fn(...l.args)}),a[l.row].append(f)}}(),A("outlook",0,E)})();
