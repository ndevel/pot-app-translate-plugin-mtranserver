// 提取URL处理逻辑
function processUrl(url) {
    // 设置默认URL
    const DEFAULT_URL = "http://localhost:8989";
    
    // 如果URL为空则返回默认值
    if (!url?.trim()) {
        return DEFAULT_URL;
    }
    
    // 去除URL末尾的斜杠
    const trimmedUrl = url.endsWith("/") ? url.slice(0, -1) : url;
    
    // 确保有http前缀
    return trimmedUrl.startsWith("http") ? trimmedUrl : `http://${trimmedUrl}`;
}

// 统一的错误处理函数
function handleError(message, status, data) {
    const error = new Error(`请求失败\n${message}\nHTTP状态码: ${status}\n${JSON.stringify(data)}`);
    error.status = status;
    error.data = data;
    throw error;
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
    const { config, detect } = options;
    
    validateConfig(config);
    let { apiUrl: url, token } = config;
    url = processUrl(url);
    
    // 验证输入参数
    if (typeof text !== 'string' || !text.trim()) {
        throw new Error('翻译文本不能为空');
    }
    
    // 先进行健康检查
    const healthCheck = await checkHealth(options);
    if (!healthCheck) {
        throw new Error('翻译服务不可用，请检查服务状态');
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
    
    const res = await window.fetch(`${url}/translate`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    });
    
    if (res.ok) {
        const result = await res.json();
        return result?.result || handleError('服务器返回数据格式错误', res.status, result);
    } else {
        const errorData = await res.json();
        handleError('翻译请求失败', res.status, errorData);
    }
}

// 健康检查
async function checkHealth(options) {
    const { config } = options;
    
    validateConfig(config);
    let { apiUrl: url } = config;
    url = processUrl(url);
    
    const res = await window.fetch(`${url}/health`);
    
    if (res.ok) {
        const data = await res.json();
        return data.status === 'ok';
    } else {
        const errorData = await res.json();
        handleError('健康检查失败', res.status, errorData);
    }
}