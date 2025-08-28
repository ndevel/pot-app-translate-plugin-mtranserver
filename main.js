/**
 * 处理并标准化URL
 * @param {string} url - 原始URL
 * @returns {string} 标准化后的URL
 */
function processUrl(url) {
    // 设置默认URL
    const DEFAULT_URL = "http://localhost:8989";

    // 如果URL为空则返回默认值
    if (!url || typeof url !== 'string' || !url.trim()) {
        return DEFAULT_URL;
    }

    // 去除URL末尾的所有斜杠
    let trimmedUrl = url.trim();
    while (trimmedUrl.endsWith("/")) {
        trimmedUrl = trimmedUrl.slice(0, -1);
    }

    // 确保有http(s)前缀
    if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
        return trimmedUrl;
    }

    // 默认使用http协议，但如果端口是443，使用https
    if (trimmedUrl.includes(":443")) {
        return `https://${trimmedUrl}`;
    }
    
    return `http://${trimmedUrl}`;
}

/**
 * 统一的错误处理函数
 * @param {string} message - 错误消息
 * @param {number} status - 状态码
 * @param {Object} data - 错误数据
 * @throws {Error} 包含详细信息的错误对象
 */
function handleError(message, status, data) {
    let errorMessage = `[MTranServer] ${message}`;

    if (status !== undefined && status !== null) {
        if (status < 0) {
            errorMessage += `
错误码: ${status}`;
        } else {
            errorMessage += `
HTTP状态码: ${status}`;
        }
    }

    if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        if (data.message && typeof data.message === 'string') {
            errorMessage += `
详细信息: ${data.message}`;
        } else {
            try {
                errorMessage += `
详细信息: ${JSON.stringify(data, null, 2)}`;
            } catch (e) {
                errorMessage += `
详细信息: [无法序列化错误数据]`;
            }
        }
    }

    const error = new Error(errorMessage);
    error.status = status;
    error.data = data;
    throw error;
}

/**
 * 验证配置对象
 * @param {Object} config - 配置对象
 * @throws {Error} 配置错误
 */
function validateConfig(config) {
    if (!config) {
        throw new Error('配置对象不能为空');
    }
    if (!config.apiUrl) {
        throw new Error('API URL不能为空');
    }
}

/**
 * 通用fetch函数，支持超时处理
 * @param {string} url - 请求URL
 * @param {Object} options - fetch选项
 * @param {number} timeout - 超时时间（毫秒）
 * @returns {Promise<Response>} fetch响应
 */
async function fetchWithTimeout(url, options = {}, timeout = 15000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await window.fetch(url, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * 执行文本翻译
 * @param {string} text - 待翻译文本
 * @param {string} from - 源语言代码
 * @param {string} to - 目标语言代码
 * @param {Object} options - 翻译选项
 * @param {Object} options.config - 插件配置
 * @param {string} options.detect - 检测到的语言代码
 * @returns {Promise<string>} 翻译结果
 */
async function translate(text, from, to, options) {
    const { config, detect } = options;

    // 验证配置
    validateConfig(config);
    
    // 获取配置参数
    const { token } = config;
    const baseUrl = processUrl(config.apiUrl);

    // 验证输入参数
    if (typeof text !== 'string') {
        handleError('输入文本必须是字符串', -1, { type: typeof text, value: text });
    }
    
    // 对于空文本或只包含空白字符的文本，直接返回空字符串
    if (!text.trim()) {
        return '';
    }

    // 构建请求头
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token })
    };

    // 处理源语言
    const sourceLang = from === 'auto' ? (detect === 'zh_cn' ? 'zh' : detect) : from;
    
    // 构建请求体
    const body = { from: sourceLang, to, text };

    try {
        // 发送翻译请求
        const response = await fetchWithTimeout(`${baseUrl}/translate`, {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        }, 15000); // 15秒超时

        if (response.ok) {
            const result = await response.json();
            // 检查结果格式
            if (result && typeof result.result !== 'undefined') {
                return result.result;
            } else {
                handleError('服务器返回数据格式错误', response.status, result);
            }
        } else {
            const errorData = await response.json();
            handleError('服务器返回错误', response.status, errorData);
        }
    } catch (error) {
        if (error.name === 'AbortError') {
            handleError('翻译请求超时', -1, {}); // Using a custom status for timeout
        } else {
            handleError('网络或其他请求错误', -2, { message: error.message });
        }
    }
}

/**
 * 检查翻译服务健康状态
 * @param {Object} options - 选项
 * @param {Object} options.config - 插件配置
 * @returns {Promise<boolean>} 服务是否健康
 */
async function checkHealth(options) {
    const { config } = options;

    try {
        // 验证配置
        validateConfig(config);
        
        // 处理URL
        const baseUrl = processUrl(config.apiUrl);

        // 发送健康检查请求
        const response = await fetchWithTimeout(`${baseUrl}/health`, {}, 5000); // 5秒超时

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        return data.status === 'ok';
    } catch (error) {
        // 任何错误都表示健康检查失败
        console.error("[MTranServer] 健康检查失败:", error);
        return false;
    }
}
