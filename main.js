// 提取URL处理逻辑
function processUrl(url) {
    // 设置默认URL
    const DEFAULT_URL = "http://localhost:8989";
    
    // 如果URL为空则返回默认值
    if (!url?.trim()) {
        return DEFAULT_URL;
    }
    
    // 去除URL末尾的斜杠并确保有http前缀
    return (url.endsWith("/") ? url.slice(0, -1) : url)
        .startsWith("http") ? url : `http://${url}`;
}

async function translate(text, from, to, options) {
    const { config, utils } = options;
    const { tauriFetch: fetch } = utils;
    let { apiUrl: url, token } = config;
    
    url = processUrl(url);
    
    // 先进行健康检查
    const healthCheck = await checkHealth(options);
    if (!healthCheck) {
        throw '翻译服务不可用，请检查服务状态';
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
    };
    
    const body = { from, to, text };
    
    const res = await fetch(`${url}/translate`, {
        method: 'POST',
        headers,
        body: { type: 'Json', payload: body }
    });
    
    if (res.ok) {
        const result = res.data;
        return result?.result || Promise.reject('服务器返回数据格式错误');
    } else {
        throw `请求失败\nHTTP状态码: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 获取服务版本
async function getVersion(options) {
    const { config, utils } = options;
    let { apiUrl: url } = config;
    const { http } = utils;
    const { fetch } = http;
    
    if (url === undefined || url.length === 0) {
        url = "http://localhost:8989";
    }
    
    if (!url.startsWith("http")) {
        url = `http://${url}`;
    }
    
    const res = await fetch(`${url}/version`);
    
    if (res.ok) {
        return res.data.version;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 获取支持的语言对
async function getModels(options) {
    const { config, utils } = options;
    let { apiUrl: url, token } = config;
    const { http } = utils;
    const { fetch } = http;
    
    if (url === undefined || url.length === 0) {
        url = "http://localhost:8989";
    }
    
    if (!url.startsWith("http")) {
        url = `http://${url}`;
    }
    
    const headers = {
        'Authorization': token
    };
    
    const res = await fetch(`${url}/models`, {
        headers
    });
    
    if (res.ok) {
        return res.data.models;
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 批量翻译
async function batchTranslate(texts, from, to, options) {
    const { config, utils } = options;
    let { apiUrl: url, token } = config;
    const { http } = utils;
    const { fetch } = http;
    
    if (url === undefined || url.length === 0) {
        url = "http://localhost:8989";
    }
    
    if (!url.startsWith("http")) {
        url = `http://${url}`;
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    };
    
    const body = {
        from,
        to,
        texts
    };
    
    const res = await fetch(`${url}/translate/batch`, {
        method: 'POST',
        headers,
        body: { type: 'Json', payload: body }
    });
    
    if (res.ok) {
        const result = res.data;
        if (result && result.results) {
            return result.results;
        } else {
            throw JSON.stringify(result);
        }
    } else {
        throw `Http Request Error\nHttp Status: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}

// 健康检查
async function checkHealth(options) {
    const { config, utils } = options;
    let { apiUrl: url } = config;
    const { http } = utils;
    const { fetch } = http;
    
    url = processUrl(url);
    
    const res = await fetch(`${url}/health`);
    
    if (res.ok) {
        return res.data.status === 'ok';
    } else {
        throw `健康检查失败\nHTTP状态码: ${res.status}\n${JSON.stringify(res.data)}`;
    }
}