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
        throw new Error('配置对象不能为空');
    }
    if (!config.apiUrl) {
        throw new Error('API URL不能为空');
    }
}

async function translate(text, from, to, options) {
    const { config, detect } = options;
    
    validateConfig(config);
    let { apiUrl: url, token } = config;
    url = processUrl(url);
    
    // 验证输入参数
    if (typeof text !== 'string' || !text.trim()) {
        // 对于空文本，直接返回空字符串，而不是抛出错误
        return '';
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
        // 检查result和result.result是否存在，如果不存在则抛出错误
        if (result && typeof result.result !== 'undefined') {
            return result.result;
        } else {
            handleError('服务器返回数据格式错误', res.status, result);
        }
    } else {
        const errorData = await res.json();
        handleError('翻译请求失败', res.status, errorData);
    }
}

// 健康检查
async function checkHealth(options) {
    const { config } = options;
    
    try {
        validateConfig(config);
        let { apiUrl: url } = config;
        url = processUrl(url);
        
        const res = await window.fetch(`${url}/health`);
        
        if (res.ok) {
            const data = await res.json();
            return data.status === 'ok';
        }
    } catch (error) {
        // 任何错误都表示健康检查失败
        console.error("健康检查失败:", error);
        return false;
    }
    
    // 如果请求未成功（例如，HTTP状态码不是2xx），也视为失败
    return false;
}
