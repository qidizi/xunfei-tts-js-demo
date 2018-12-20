
function load_js(fn) {
    // 现代浏览器好像不支持md5，只能加载其它实现
    if (!document.getElementById('md5_js')) {
        var md5_js = document.createElement('script');
        md5_js.src = 'https://cdn.bootcss.com/blueimp-md5/2.10.0/js/md5.min.js';
        md5_js.id = 'md5_js';
        var head = document.getElementsByTagName('head');
        head = head ? head[0] : document.documentElement;
        head.appendChild(md5_js);
        var timer = setInterval(function () {
            if (!md5) return;
            clearInterval(timer);
            fn();
        }, 1000);
    } else {
        fn();
    }
}

function say() {
    if ('api.xfyun.cn' !== location.hostname) {
        // 因为对方要求post，且要从head传参数，iframe方式是行不通了，只能用ajax来获取mp3
        alert('即将打开：http://api.xfyun.cn/\n页面打开成功后，再复制并粘贴当前代码在console中运行即可');
        location.replace('http://api.xfyun.cn/');
        return;
    }

    var cfg = prompt('讯飞app参数及待合成文本', '应用id/应用key/待合成文本');

    if (!cfg || !(cfg = cfg.match(/^\s*(\w+)\/(\w+)\/([\s\S]+)/))) {
        alert('参数有误');
        return;
    }

    var date = new Date();
    var time_stamp = Math.floor(+date / 1000);
    // 申请app https://console.xfyun.cn/app/create
    var app_id = cfg[1];
    var app_key = cfg[2];
    var text = cfg [3];
    // 注意所有的值都要是string类型
    // 相关文档 https://doc.xfyun.cn/rest_api/%E8%AF%AD%E9%9F%B3%E5%90%88%E6%88%90.html
    var json = {
        // 声音清晰度
        auf: 'audio/L16;rate=16000',
        // 要mp3格式兼容性好
        aue: 'lame',
        // 免费app只有一个主播可选择
        voice_name: 'xiaoyan',
        // 语速
        speed: "50",
        // 声音大小
        volume: "100",
        // 音高
        pitch: "50",
        // 使用什么引擎来解析内容，这是中文引擎
        engine_type: 'intp65',
        // 没有见有其它值可值
        text_type: 'text'
    };

    json = JSON.stringify(json);
    var url = 'http://api.xfyun.cn/v1/service/v1/tts';
    var param = btoa(json);
    // jq 的ajax好像不对2二制有问题，随便用用吧
    window.http = new XMLHttpRequest();
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            var is_mp3 = 'audio/mpeg' === http.getResponseHeader('Content-type');
            var reader = new FileReader();
            reader.addEventListener("loadend", function () {
                // reader.result contains the contents of blob as a typed array
                if (!is_mp3) return alert(reader.result);
                var a = document.createElement('audio');
                a.setAttribute('autoplay','autoplay');
                a.setAttribute('controls','controls');
                a.src = reader.result;
                document.body.appendChild(a);
            });
            reader[is_mp3 ? 'readAsDataURL' : 'readAsText'](http.response);
        }
    };
    http.open("POST", url);
    // 相关文档 https://doc.xfyun.cn/rest_api/%E6%8E%A5%E5%8F%A3%E6%8F%8F%E8%BF%B0.html
    http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    http.setRequestHeader("X-Appid", app_id);
    http.setRequestHeader("X-CurTime", time_stamp);
    http.setRequestHeader("X-Param", param);
    http.setRequestHeader("X-CheckSum", md5(app_key + time_stamp + param));
    // 这里必须指定为blob，而不是留空
    http.responseType = 'blob';
    http.send('text=' + encodeURIComponent(text));
}

load_js(say);


