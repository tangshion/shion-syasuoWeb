/**
 * 图片压缩工具的主要功能实现
 */
document.addEventListener('DOMContentLoaded', () => {
    // 图片压缩相关变量
    const imageUploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const imageQuality = document.getElementById('imageQuality');
    const imageQualityValue = document.getElementById('imageQualityValue');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const originalInfo = document.getElementById('originalInfo');
    const compressedInfo = document.getElementById('compressedInfo');
    const imageDownloadBtn = document.getElementById('imageDownloadBtn');
    const imageList = document.querySelector('.image-list');

    const MAX_IMAGES = 10;
    let selectedFiles = [];
    let originalImage = null;
    let compressedImage = null;

    // 图片上传区域点击事件
    imageUploadArea.addEventListener('click', () => {
        imageInput.click();
    });

    // 图片拖拽上传
    imageUploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUploadArea.style.borderColor = 'var(--primary-color)';
    });

    imageUploadArea.addEventListener('dragleave', () => {
        imageUploadArea.style.borderColor = 'var(--border-color)';
    });

    imageUploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUploadArea.style.borderColor = 'var(--border-color)';
        const files = Array.from(e.dataTransfer.files);
        handleMultipleFiles(files);
    });

    // 图片文件选择处理
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        handleMultipleFiles(files);
    });

    // 处理多个文件上传
    function handleMultipleFiles(files) {
        // 过滤出图片文件
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        // 检查是否超过最大数量限制
        if (selectedFiles.length + imageFiles.length > MAX_IMAGES) {
            alert(`最多只能同时处理${MAX_IMAGES}张图片`);
            return;
        }

        // 添加新文件到选择列表
        imageFiles.forEach(file => {
            if (!selectedFiles.find(f => f.name === file.name)) {
                selectedFiles.push(file);
                addImageToList(file);
            }
        });

        // 如果有文件被选择，处理第一个文件
        if (selectedFiles.length > 0) {
            handleImageUpload(selectedFiles[0]);
        }
    }

    // 添加图片到列表
    function addImageToList(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button class="remove-btn" title="移除">×</button>
            `;

            // 点击图片切换预览
            div.querySelector('img').addEventListener('click', () => {
                handleImageUpload(file);
            });

            // 移除图片
            div.querySelector('.remove-btn').addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发图片点击事件
                selectedFiles = selectedFiles.filter(f => f !== file);
                div.remove();
                
                // 如果还有其他图片，显示第一个
                if (selectedFiles.length > 0) {
                    handleImageUpload(selectedFiles[0]);
                } else {
                    // 清空预览
                    originalPreview.innerHTML = '';
                    compressedPreview.innerHTML = '';
                    originalInfo.textContent = '';
                    compressedInfo.textContent = '';
                    imageDownloadBtn.disabled = true;
                }
            });

            imageList.appendChild(div);
        };
        reader.readAsDataURL(file);
    }

    // 图片质量滑块变化事件
    imageQuality.addEventListener('input', (e) => {
        imageQualityValue.textContent = `${e.target.value}%`;
        if (originalImage) {
            compressImage(originalImage, e.target.value / 100);
        }
    });

    // 处理图片上传
    function handleImageUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage = new Image();
            originalImage.src = e.target.result;
            originalImage.onload = () => {
                displayOriginalImage(originalImage, file);
                compressImage(originalImage, imageQuality.value / 100);
            };
        };
        reader.readAsDataURL(file);
    }

    // 显示原始图片
    function displayOriginalImage(image, file) {
        originalPreview.innerHTML = '';
        const img = image.cloneNode();
        originalPreview.appendChild(img);
        originalInfo.textContent = `文件大小: ${formatFileSize(file.size)}`;
    }

    // 压缩图片
    function compressImage(image, quality) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = image.width;
        canvas.height = image.height;
        
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0);
        
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        compressedPreview.innerHTML = '';
        compressedImage = new Image();
        compressedImage.src = compressedDataUrl;
        compressedPreview.appendChild(compressedImage);
        
        // 计算压缩后的文件大小
        const compressedSize = Math.round((compressedDataUrl.length - 22) * 3 / 4);
        compressedInfo.textContent = `文件大小: ${formatFileSize(compressedSize)}`;
        
        imageDownloadBtn.disabled = false;
    }

    // 图片下载按钮点击事件
    imageDownloadBtn.addEventListener('click', () => {
        if (compressedImage) {
            const link = document.createElement('a');
            const fileName = selectedFiles.find(f => f.name)?.name || 'compressed-image';
            link.download = `compressed-${fileName}`;
            link.href = compressedImage.src;
            link.click();
        }
    });

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 