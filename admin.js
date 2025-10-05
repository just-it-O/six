// 卡密管理系统后端逻辑

// 从localStorage中加载卡密数据
function loadLicenseKeys() {
    let licenseKeys = localStorage.getItem('VALID_LICENSE_KEYS');
    
    if (!licenseKeys) {
        // 如果localStorage中没有数据，使用默认数据
        licenseKeys = {
            "VIP2023-0001": { created: Date.now(), used: false },
            "VIP2023-0002": { created: Date.now(), used: false },
            "VIP2023-0003": { created: Date.now(), used: false },
            "VIP2023-0004": { created: Date.now(), used: false },
            "VIP2023-0005": { created: Date.now(), used: false }
        };
        // 保存到localStorage
        saveLicenseKeys(licenseKeys);
    } else {
        licenseKeys = JSON.parse(licenseKeys);
    }
    
    return licenseKeys;
}

// 保存卡密数据到localStorage
function saveLicenseKeys(licenseKeys) {
    localStorage.setItem('VALID_LICENSE_KEYS', JSON.stringify(licenseKeys));
}

// 生成随机卡密
function generateRandomKey(prefix = "VIP", length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = prefix;
    
    // 添加年份
    const year = new Date().getFullYear().toString().substr(-2);
    result += year + "-";
    
    // 生成随机字符串
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
}

// 生成多个卡密
function generateLicenseKeys(count) {
    const licenseKeys = loadLicenseKeys();
    const newKeys = [];
    
    for (let i = 0; i < count; i++) {
        // 确保生成的卡密唯一
        let key;
        do {
            key = generateRandomKey();
        } while (licenseKeys[key]);
        
        // 添加新卡密到列表
        licenseKeys[key] = {
            created: Date.now(),
            used: false
        };
        
        newKeys.push(key);
    }
    
    // 保存更新后的卡密列表
    saveLicenseKeys(licenseKeys);
    
    return newKeys;
}

// 显示生成的卡密
function displayGeneratedKeys(keys) {
    const container = document.getElementById('generatedKeysContainer');
    container.innerHTML = '';
    
    keys.forEach(key => {
        const keyItem = document.createElement('div');
        keyItem.className = 'key-item';
        
        const keyText = document.createElement('span');
        keyText.textContent = key;
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-btn';
        copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
        copyBtn.title = '复制卡密';
        copyBtn.addEventListener('click', () => {
            copyToClipboard(key);
            copyBtn.innerHTML = '<i class="fa fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa fa-copy"></i>';
            }, 2000);
        });
        
        keyItem.appendChild(keyText);
        keyItem.appendChild(copyBtn);
        container.appendChild(keyItem);
    });
    
    // 显示成功消息
    showNotification(`成功生成 ${keys.length} 个卡密`);
}

// 复制文本到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('卡密已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
}

// 格式化日期
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 渲染卡密列表
function renderLicenseTable() {
    const licenseKeys = loadLicenseKeys();
    const tableBody = document.getElementById('licenseTableBody');
    tableBody.innerHTML = '';
    
    // 添加开发者密钥（特殊显示）
    const devKeyRow = document.createElement('tr');
    devKeyRow.innerHTML = `
        <td>DEVELOPER_UNLIMITED_ACCESS_2024</td>
        <td><span class="badge badge-developer">开发者密钥</span></td>
        <td>-</td>
        <td><button class="btn-secondary text-white font-medium py-1 px-3 rounded transition-colors duration-300 ease-in-out copy-dev-key">复制</button></td>
    `;
    tableBody.appendChild(devKeyRow);
    
    // 为开发者密钥的复制按钮添加事件
    devKeyRow.querySelector('.copy-dev-key').addEventListener('click', () => {
        copyToClipboard('DEVELOPER_UNLIMITED_ACCESS_2024');
    });
    
    // 如果没有其他卡密
    if (Object.keys(licenseKeys).length === 0) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="4" class="text-center text-gray-500 py-6">暂无卡密数据</td>
        `;
        tableBody.appendChild(emptyRow);
        return;
    }
    
    // 渲染普通卡密
    Object.entries(licenseKeys).forEach(([key, data]) => {
        const row = document.createElement('tr');
        const statusClass = data.used ? 'badge-used' : 'badge-unused';
        const statusText = data.used ? '已使用' : '未使用';
        
        row.innerHTML = `
            <td>${key}</td>
            <td><span class="badge ${statusClass}">${statusText}</span></td>
            <td>${formatDate(data.created)}</td>
            <td>
                <button class="btn-secondary text-white font-medium py-1 px-3 rounded transition-colors duration-300 ease-in-out mr-2 copy-key" data-key="${key}">复制</button>
                <button class="btn-danger text-white font-medium py-1 px-3 rounded transition-colors duration-300 ease-in-out delete-key" data-key="${key}">删除</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // 添加复制和删除事件
    document.querySelectorAll('.copy-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.currentTarget.getAttribute('data-key');
            copyToClipboard(key);
        });
    });
    
    document.querySelectorAll('.delete-key').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const key = e.currentTarget.getAttribute('data-key');
            if (confirm(`确定要删除卡密 ${key} 吗？`)) {
                deleteLicenseKey(key);
            }
        });
    });
}

// 删除卡密
function deleteLicenseKey(key) {
    const licenseKeys = loadLicenseKeys();
    
    if (licenseKeys[key]) {
        delete licenseKeys[key];
        saveLicenseKeys(licenseKeys);
        renderLicenseTable();
        showNotification(`卡密 ${key} 已删除`);
    }
}

// 显示通知
function showNotification(message) {
    // 检查是否已有通知元素
    let notification = document.getElementById('notification');
    
    if (!notification) {
        // 创建通知元素
        notification = document.createElement('div');
        notification.id = 'notification';
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.backgroundColor = '#28a745';
        notification.style.color = 'white';
        notification.style.borderRadius = '8px';
        notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        document.body.appendChild(notification);
    }
    
    // 设置消息并显示
    notification.textContent = message;
    notification.style.opacity = '1';
    
    // 3秒后隐藏
    setTimeout(() => {
        notification.style.opacity = '0';
    }, 3000);
}

// 返回主页面
function backToMainPage() {
    window.location.href = 'license.html';
}

// 初始化
function init() {
    // 渲染卡密列表
    renderLicenseTable();
    
    // 绑定生成卡密按钮事件
    document.getElementById('generateKeysBtn').addEventListener('click', () => {
        const count = parseInt(document.getElementById('keyCount').value);
        if (count < 1 || count > 100) {
            alert('请输入1-100之间的数字');
            return;
        }
        
        const newKeys = generateLicenseKeys(count);
        displayGeneratedKeys(newKeys);
        renderLicenseTable();
    });
    
    // 绑定刷新按钮事件
    document.getElementById('refreshBtn').addEventListener('click', renderLicenseTable);
    
    // 绑定返回主页面按钮事件
    document.getElementById('backToMainBtn').addEventListener('click', backToMainPage);
    
    // 更新license.js中的卡密数据（如果在同一个窗口中运行）
    if (typeof window !== 'undefined') {
        window.VALID_LICENSE_KEYS = loadLicenseKeys();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);