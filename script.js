// 全局变量
let currentImage = null;
let currentImageUrl = null;
let selectedMode = null; // 选中的模式：'angel' 或 'devil'

// 名言警句数组
const quotes = [
    '人生就像一盒巧克力，你永远不知道会得到什么。',
    '愿你出走半生，归来仍是少年。',
    '世界上只有一种真正的英雄主义，那就是认清生活的真相后依然热爱生活。',
    '你要相信，这个世界上总有一个人在等你。',
    '路漫漫其修远兮，吾将上下而求索。',
    '有些路很远，走下去会很累，可是不走会后悔。',
    '生活不止眼前的苟且，还有诗和远方。',
    '梦想还是要有的，万一实现了呢？'
];

// DOM元素
const uploadBox = document.getElementById('uploadBox');
const fileInput = document.getElementById('fileInput');
const previewImg = document.getElementById('previewImg');
const uploadPlus = document.getElementById('uploadPlus');
const deleteBtn = document.getElementById('deleteBtn');
const generateBtn = document.getElementById('generateBtn');
const generatingPage = document.getElementById('generatingPage');
const resultPage = document.getElementById('resultPage');
const loadingText = document.getElementById('loadingText');
const quoteText = document.getElementById('quoteText');
const resultImg = document.getElementById('resultImg');
const tagText = document.getElementById('tagText');
const reviewText = document.getElementById('reviewText');
const regenerateBtn = document.getElementById('regenerateBtn');

// 模式选择元素 - 动态获取
let modeItems = [];

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // 绑定事件
    uploadBox.addEventListener('click', handleUploadClick);
    fileInput.addEventListener('change', handleFileSelect);
    deleteBtn.addEventListener('click', handleDelete);
    generateBtn.addEventListener('click', handleGenerate);
    regenerateBtn.addEventListener('click', handleRegenerate);
    
    // 绑定模式选择事件（首页和结果页面）
    bindModeSelectionEvents();
    
    // 默认选中恶魔模式
    selectedMode = 'devil';
    
    // 初始化按钮状态
    checkGenerateButton();
    
    // 初始化名言显示
    startQuoteRotation();
}

// 绑定模式选择事件
function bindModeSelectionEvents() {
    console.log('开始绑定模式选择事件...');
    
    // 重新获取所有模式选择按钮
    modeItems = document.querySelectorAll('.mode-item');
    
    console.log('找到的模式选择按钮数量:', modeItems.length);
    
    // 移除之前的事件监听器（如果有的话）
    modeItems.forEach(item => {
        item.removeEventListener('click', handleModeSelect);
    });
    
    // 添加新的事件监听器
    modeItems.forEach((item, index) => {
        console.log(`绑定第${index + 1}个模式按钮:`, item.dataset.mode);
        console.log('按钮元素:', item);
        item.addEventListener('click', handleModeSelect);
        
        // 添加调试：检查按钮是否可点击
        console.log(`按钮${index + 1}的样式:`, window.getComputedStyle(item));
        console.log(`按钮${index + 1}的pointer-events:`, window.getComputedStyle(item).pointerEvents);
    });
    
    console.log('模式选择事件绑定完成');
}

// 处理上传点击
function handleUploadClick() {
    fileInput.click();
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }
    
    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
        showToast('图片大小不能超过10MB');
        return;
    }
    
    // 显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        currentImage = file;
        currentImageUrl = e.target.result;
        
        previewImg.src = currentImageUrl;
        previewImg.style.display = 'block';
        uploadPlus.style.display = 'none';
        deleteBtn.style.display = 'flex'; // 显示删除按钮
        
        // 检查是否可以启用生成按钮
        checkGenerateButton();
    };
    reader.readAsDataURL(file);
}

// 处理删除按钮点击
function handleDelete(event) {
    event.stopPropagation(); // 阻止事件冒泡，避免触发上传框的点击事件
    
    // 清除当前图片
    currentImage = null;
    currentImageUrl = null;
    
    // 重置界面
    previewImg.style.display = 'none';
    uploadPlus.style.display = 'block';
    deleteBtn.style.display = 'none';
    fileInput.value = ''; // 清空文件输入框
    
    // 检查是否可以启用生成按钮
    checkGenerateButton();
    
    showToast('图片已删除');
}

// 处理模式选择
function handleModeSelect(event) {
    console.log('模式选择函数被调用');
    const clickedItem = event.currentTarget;
    const mode = clickedItem.dataset.mode;
    
    console.log('模式选择被点击:', mode); // 调试信息
    console.log('点击的元素:', clickedItem);
    
    // 移除所有选中状态
    modeItems.forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加选中状态
    clickedItem.classList.add('selected');
    selectedMode = mode;
    
    console.log('当前选中模式:', selectedMode); // 调试信息
    
    // 显示切换成功的提示
    showToast(`已切换到${mode === 'angel' ? '天使' : '恶魔'}模式`);
    
    // 检查是否可以启用生成按钮
    checkGenerateButton();
}

// 检查是否可以启用生成按钮
function checkGenerateButton() {
    if (currentImage) {
        generateBtn.classList.remove('disabled');
        generateBtn.style.cursor = 'pointer';
        generateBtn.style.opacity = '1'; // 有图片时透明度为100%（完全显示）
    } else {
        generateBtn.classList.add('disabled');
        generateBtn.style.cursor = 'not-allowed';
        generateBtn.style.opacity = '0.3'; // 没有图片时透明度为30%
    }
}

// 处理生成按钮点击
function handleGenerate() {
    if (!currentImage) {
        showToast('请先选择图片');
        return;
    }
    
    // 检查按钮是否被禁用
    if (generateBtn.classList.contains('disabled')) {
        return;
    }
    
    // 显示生成中页面
    showGeneratingPage();
    
    // 开始AI生成
    startAIGeneration();
}

// 显示生成中页面
function showGeneratingPage() {
    generatingPage.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// 隐藏生成中页面
function hideGeneratingPage() {
    generatingPage.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 开始AI生成
async function startAIGeneration() {
    try {
        // 模拟进度
        simulateProgress();
        
        // 上传图片到服务器
        const formData = new FormData();
        formData.append('image', currentImage);
        formData.append('mode', selectedMode); // 添加模式信息
        
        const response = await fetch('/api/ai-review', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('网络请求失败');
        }
        
        const result = await response.json();
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        // 显示结果
        if (result.success && result.result) {
            try {
                // 解析返回的JSON字符串
                const parsedResult = JSON.parse(result.result);
                showResult(parsedResult);
            } catch (e) {
                // 如果解析失败，尝试直接使用结果
                showResult({
                    tag: '未知标签',
                    content: result.result
                });
            }
        } else {
            throw new Error(result.error || '生成失败');
        }
        
    } catch (error) {
        console.error('AI生成失败:', error);
        showToast('生成失败，请重试');
        hideGeneratingPage();
    }
}

// 模拟进度
function simulateProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 90) {
            progress = 90;
            clearInterval(interval);
        }
        
        // 更新加载文本
        const loadingMessages = [
            '正在分析图片内容...',
            '正在生成锐评...',
            '即将完成...'
        ];
        
        const messageIndex = Math.floor(progress / 30);
        if (messageIndex < loadingMessages.length) {
            loadingText.textContent = loadingMessages[messageIndex];
        }
    }, 1000);
}

// 显示结果
function showResult(result) {
    hideGeneratingPage();
    
    // 设置结果数据
    resultImg.src = currentImageUrl;
    tagText.textContent = result.tag || '未知标签';
    
    // 格式化锐评文本，提高可读性
    const formattedContent = formatReviewText(result.content || '生成失败');
    reviewText.textContent = formattedContent;
    
    // 显示结果页面
    resultPage.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // 重新绑定模式选择事件（因为结果页面的按钮现在可见了）
    setTimeout(() => {
        bindModeSelectionEvents();
    }, 100);
}

// 格式化锐评文本，提高可读性
function formatReviewText(text) {
    if (!text) return text;
    
    // 如果文本中已经包含换行符，直接返回
    if (text.includes('\n')) {
        return text;
    }
    
    // 根据标点符号自动分段
    const sentences = text.split(/[。！？；]/).filter(s => s.trim());
    
    if (sentences.length <= 1) {
        return text;
    }
    
    // 重新组合句子，每2-3个句子为一段
    const paragraphs = [];
    let currentParagraph = '';
    
    sentences.forEach((sentence, index) => {
        if (sentence.trim()) {
            currentParagraph += sentence.trim() + '。';
            
            // 每2-3个句子为一段，或者到达末尾
            if ((index + 1) % 2 === 0 || index === sentences.length - 1) {
                paragraphs.push(currentParagraph.trim());
                currentParagraph = '';
            }
        }
    });
    
    return paragraphs.join('\n\n');
}

// 处理保存按钮
function handleSave() {
    // 创建canvas绘制结果图片
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // 设置canvas尺寸
        canvas.width = 400;
        canvas.height = 600;
        
        // 绘制背景
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, 400, 600);
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, 400, 300);
        
        // 绘制标签
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('人设标签：' + tagText.textContent, 20, 330);
        
        // 绘制锐评内容
        ctx.fillStyle = '#333';
        ctx.font = '14px Arial';
        const reviewLines = wrapText(ctx, reviewText.textContent, 360);
        reviewLines.forEach((line, index) => {
            ctx.fillText(line, 20, 360 + (index + 1) * 20);
        });
        
        // 转换为图片并下载
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '锐评结果.png';
            a.click();
            URL.revokeObjectURL(url);
            showToast('图片已保存');
        });
    };
    
    img.src = currentImageUrl;
}

// 文本换行函数
function wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
        const testLine = currentLine + words[i];
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);
    return lines;
}

// 处理重新生成
function handleRegenerate() {
    hideResultPage();
    showGeneratingPage();
    startAIGeneration();
}

// 处理点赞
function handleLike() {
    showToast('感谢您的支持！');
}

// 隐藏结果页面
function hideResultPage() {
    resultPage.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// 开始名言轮播
function startQuoteRotation() {
    let currentIndex = 0;
    
    setInterval(() => {
        quoteText.style.opacity = '0';
        
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % quotes.length;
            quoteText.textContent = quotes[currentIndex];
            quoteText.style.opacity = '1';
        }, 800);
    }, 5000);
}

// 显示提示信息
function showToast(message) {
    // 创建toast元素
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 10000;
        pointer-events: none;
    `;
    
    document.body.appendChild(toast);
    
    // 3秒后移除
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// 模拟API调用（实际项目中需要替换为真实的API）
async function mockAIGeneration() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                tag: '爱炫耀的苦逼研究生',
                content: '这位朋友的朋友圈充满了学术气息，但每一条动态都透露着"看我多努力"的炫耀心理。\n\n头像选择也很讲究，既要有学术范儿，又要显得有格调。\n\n个性签名更是精心设计，既要体现深度，又要显得与众不同。'
            });
        }, 5000);
    });
}

// 如果需要在开发环境中测试，可以取消注释下面的代码
// 并注释掉startAIGeneration函数中的真实API调用
/*
async function startAIGeneration() {
    try {
        simulateProgress();
        
        // 使用模拟数据
        const result = await mockAIGeneration();
        showResult(result);
        
    } catch (error) {
        console.error('AI生成失败:', error);
        showToast('生成失败，请重试');
        hideGeneratingPage();
    }
}
*/ 