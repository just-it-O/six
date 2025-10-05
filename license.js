// 卡密验证系统
// 从localStorage加载有效的卡密或使用默认数据
function getValidLicenseKeys() {
    let licenseKeys = localStorage.getItem('VALID_LICENSE_KEYS');
    
    if (licenseKeys) {
        return JSON.parse(licenseKeys);
    } else {
        // 默认卡密数据
        const defaultKeys = {
            "VIP2023-0001": { created: Date.now(), used: false },
            "VIP2023-0002": { created: Date.now(), used: false },
            "VIP2023-0003": { created: Date.now(), used: false },
            "VIP2023-0004": { created: Date.now(), used: false },
            "VIP2023-0005": { created: Date.now(), used: false }
        };
        // 保存默认数据到localStorage
        localStorage.setItem('VALID_LICENSE_KEYS', JSON.stringify(defaultKeys));
        return defaultKeys;
    }
}

// 保存卡密数据到localStorage
function saveLicenseKeys(licenseKeys) {
    localStorage.setItem('VALID_LICENSE_KEYS', JSON.stringify(licenseKeys));
}

// 获取当前有效的卡密
let VALID_LICENSE_KEYS = getValidLicenseKeys();

// 开源者特权密钥
const DEVELOPER_KEY = "DEVELOPER_UNLIMITED_ACCESS_2024";

// 有效期 (24小时，单位毫秒)
const VALIDITY_PERIOD = 24 * 60 * 60 * 1000;

// 检查用户是否已登录
function checkUserAccess() {
    const userData = localStorage.getItem('userLicenseData');
    if (userData) {
        try {
            const { licenseKey, expireTime, isDeveloper } = JSON.parse(userData);
            
            // 开源者拥有永久访问权
            if (isDeveloper) {
                showSuccessMessage("欢迎回来，开发者！");
                setTimeout(() => {
                    redirectToMainPage();
                }, 1000);
                return;
            }
            
            const now = Date.now();
            
            // 检查卡密是否已过期
            if (now < expireTime) {
                // 显示倒计时
                showCountdown(expireTime);
                
                // 延迟重定向，让用户看到倒计时
                setTimeout(() => {
                    redirectToMainPage();
                }, 1000);
            } else {
                // 卡密已过期，清除本地存储
                localStorage.removeItem('userLicenseData');
                showExpiredMessage();
            }
        } catch (e) {
            console.error('解析用户数据失败:', e);
            localStorage.removeItem('userLicenseData');
        }
    }
}

// 处理卡密表单提交
function handleLicenseSubmission(event) {
    event.preventDefault();
    
    const licenseKey = document.getElementById('licenseKey').value.trim();
    
    // 检查是否为开发者密钥
    if (licenseKey === DEVELOPER_KEY) {
        // 存储开发者身份
        localStorage.setItem('userLicenseData', JSON.stringify({
            licenseKey: licenseKey,
            isDeveloper: true
        }));
        
        showSuccessMessage("开发者验证成功！");
        setTimeout(() => {
            redirectToMainPage();
        }, 1000);
        return;
    }
    
    // 检查卡密是否有效
    if (VALID_LICENSE_KEYS[licenseKey]) {
        const licenseData = VALID_LICENSE_KEYS[licenseKey];
        
        // 检查卡密是否已被使用
        if (licenseData.used) {
            showErrorMessage("卡密已被使用，请使用新的卡密。");
            return;
        }
        
        // 标记卡密为已使用
        VALID_LICENSE_KEYS[licenseKey].used = true;
        
        // 保存更新后的卡密数据到localStorage
        saveLicenseKeys(VALID_LICENSE_KEYS);
        
        // 计算过期时间
        const expireTime = Date.now() + VALIDITY_PERIOD;
        
        // 存储用户授权信息
        localStorage.setItem('userLicenseData', JSON.stringify({
            licenseKey: licenseKey,
            expireTime: expireTime,
            isDeveloper: false
        }));
        
        showSuccessMessage("卡密验证成功！");
        setTimeout(() => {
            redirectToMainPage();
        }, 1000);
    } else {
        showErrorMessage("无效的卡密，请重新输入。");
    }
}

// 显示倒计时
function showCountdown(expireTime) {
    const countdownContainer = document.getElementById('countdownContainer');
    const countdownElement = document.getElementById('countdown');
    
    countdownContainer.classList.remove('hidden');
    
    function updateCountdown() {
        const now = Date.now();
        const diff = expireTime - now;
        
        if (diff <= 0) {
            clearInterval(interval);
            countdownElement.textContent = "已过期";
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `${hours}小时 ${minutes}分钟 ${seconds}秒`;
    }
    
    // 立即更新一次
    updateCountdown();
    
    // 每秒更新一次
    const interval = setInterval(updateCountdown, 1000);
}

// 重定向到主页面
function redirectToMainPage() {
    // 检查是否存在yiban前端.html页面
    window.location.href = 'yiban/yiban前端.html';
}

// 显示成功消息
function showSuccessMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'text-center mb-6 text-green-600 font-medium';
    statusMessage.classList.remove('hidden');
}

// 显示错误消息
function showErrorMessage(message) {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = message;
    statusMessage.className = 'text-center mb-6 text-red-600 font-medium';
    statusMessage.classList.remove('hidden');
    
    // 3秒后清除错误消息
    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 3000);
}

// 显示过期消息
function showExpiredMessage() {
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.textContent = "您的使用期限已过，请输入新的卡密。";
    statusMessage.className = 'text-center mb-6 text-amber-600 font-medium';
    statusMessage.classList.remove('hidden');
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户访问权限
    checkUserAccess();
    
    // 绑定表单提交事件
    document.getElementById('licenseForm').addEventListener('submit', handleLicenseSubmission);
});

// 导出函数供管理页面使用 (如果需要)
if (typeof window !== 'undefined') {
    window.checkUserAccess = checkUserAccess;
}