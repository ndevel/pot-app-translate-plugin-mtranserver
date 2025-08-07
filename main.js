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

    // 确保有http(s)前缀
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
        return trimmedUrl;
    }

    return `http://${trimmedUrl}`;
}

// 统一的错误处理函数
function handleError(message, status, data) {
    let errorMessage = `[MTranServer] ${message}`;

    if (status) {
        if (status < 0) {
            errorMessage += `\n错误码: ${status}`;
        } else {
            errorMessage += `\nHTTP状态码: ${status}`;
        }
    }

    if (data && Object.keys(data).length > 0) {
        const details = data.message ? data.message : JSON.stringify(data);
        errorMessage += `\n详细信息: ${details}`;
    }

    const error = new Error(errorMessage);
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
    const { token } = config;
    const url = processUrl(config.apiUrl);

    // 验证输入参数
    if (typeof text !== 'string' || !text.trim()) {
        // 对于空文本，直接返回空字符串，而不是抛出错误
        return '';
    }

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
    };

    // 如果源语言是'auto', 则使用Pot提供的检测语言
    if (from === 'auto') {
        from = detect;
    }
    const body = { from, to, text };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15-second timeout

    try {
        const res = await window.fetch(`${url}/translate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

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
            handleError('服务器返回错误', res.status, errorData);
        }
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            handleError('翻译请求超时', -1, {}); // Using a custom status for timeout
        } else {
            handleError('网络或其他请求错误', -2, { message: error.message });
        }
    }
}

// 健康检查
async function checkHealth(options) {
    const { config } = options;

    try {
        validateConfig(config);
        const url = processUrl(config.apiUrl);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

        const res = await window.fetch(`${url}/health`, {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
            return false;
        }

        const data = await res.json();
        return data.status === 'ok';
    } catch (error) {
        // 任何错误都表示健康检查失败
        console.error("[MTranServer] 健康检查失败:", error);
        return false;
    }
}
