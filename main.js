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

// 统一的错误处理函数
function handleError(message, status, data) {
    throw `请求失败\n${message}\nHTTP状态码: ${status}\n${JSON.stringify(data)}`;
}

// 验证配置
function validateConfig(config) {
    if (!config) {
        throw '配置对象不能为空';
    }
    if (!config.apiUrl) {
        throw 'API URL不能为空';
    }
}

async function translate(text, from, to, options) {
    const { config, utils, detect } = options;
    const { tauriFetch: fetch } = utils;
    
    validateConfig(config);
    let { apiUrl: url, token } = config;
    url = processUrl(url);
    
    // 验证输入参数
    if (typeof text !== 'string' || !text.trim()) {
        throw '翻译文本不能为空';
    }
    
    // 先进行健康检查
    const healthCheck = await checkHealth(options);
    if (!healthCheck) {
        throw '翻译服务不可用，请检查服务状态';
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
    };
    
    // 判断源语言类型，如果是自动检测则调用detect函数
    if (from === 'auto') {
        from = detect;  
    }
    const body = { from, to, text };
    
    const res = await fetch(`${url}/translate`, {
        method: 'POST',
        headers,
        body: { type: 'Json', payload: body }
    });
    
    if (res.ok) {
        const result = res.data;
        return result?.result || handleError('服务器返回数据格式错误', res.status, res.data);
    } else {
        handleError('翻译请求失败', res.status, res.data);
    }
}

// 获取支持的语言对
async function getModels(options) {
    const { config, utils } = options;
    const { http } = utils;
    const { fetch } = http;
    
    validateConfig(config);
    let { apiUrl: url, token } = config;
    url = processUrl(url);
    
    const headers = {
        'Authorization': token
    };
    
    const res = await fetch(`${url}/models`, {
        headers
    });
    
    if (res.ok) {
        return res.data.models;
    } else {
        handleError('获取模型列表失败', res.status, res.data);
    }
}

// 批量翻译
async function batchTranslate(texts, from, to, options) {
    const { config, utils } = options;
    const { http } = utils;
    const { fetch } = http;
    
    validateConfig(config);
    let { apiUrl: url, token } = config;
    url = processUrl(url);
    
    // 验证输入参数
    if (!Array.isArray(texts) || texts.length === 0) {
        throw '批量翻译文本不能为空';
    }
    
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token
    };
    
    // 判断源语言类型，如果是自动检测则调用detect函数
    if (from === 'auto') {
        from = detect;
    }
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
            handleError('服务器返回数据格式错误', res.status, result);
        }
    } else {
        handleError('批量翻译请求失败', res.status, res.data);
    }
}

// 健康检查
async function checkHealth(options) {
    const { config, utils } = options;
    const { http } = utils;
    const { fetch } = http;
    
    validateConfig(config);
    let { apiUrl: url } = config;
    url = processUrl(url);
    
    const res = await fetch(`${url}/health`);
    
    if (res.ok) {
        return res.data.status === 'ok';
    } else {
        handleError('健康检查失败', res.status, res.data);
    }
}