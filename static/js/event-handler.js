function showEventDetail(button) {
    const display = document.getElementById('event-display');
    if (display) {
        // 显示模式
        document.getElementById('display-headline').textContent = button.dataset.headline || '';
        document.getElementById('display-description').textContent = button.dataset.description || '';
        document.getElementById('display-based').textContent = button.dataset.based || '';
        
        // 显示图片
        const displayImages = document.getElementById('display-images');
        const imageUrls = button.dataset.imageUrls ? JSON.parse(button.dataset.imageUrls) : [];
        displayImages.innerHTML = imageUrls.map(url => `
            <div class="image-item">
                <img src="${url}" class="img-thumbnail">
            </div>
        `).join('');
        
        // 同时更新编辑表单的值
        document.getElementById('edit-date').value = button.dataset.date;
        document.getElementById('edit-headline').value = button.dataset.headline || '';
        document.getElementById('edit-description').value = button.dataset.description || '';
        document.getElementById('edit-based').value = button.dataset.based || '';
        
        display.classList.remove('d-none');
        document.getElementById('view-mode').classList.remove('d-none');
        document.getElementById('edit-mode').classList.add('d-none');
    }
}

function switchToEdit() {
    document.getElementById('view-mode').classList.add('d-none');
    document.getElementById('edit-mode').classList.remove('d-none');
}

function cancelEdit() {
    document.getElementById('edit-mode').classList.add('d-none');
    document.getElementById('view-mode').classList.remove('d-none');
}


document.getElementById('edit-images').addEventListener('change', function(e) {
    const files = e.target.files;
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';
    
    for (const file of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML += `
                <div class="image-item">
                    <img src="${e.target.result}" class="img-thumbnail">
                </div>
            `;
        }
        reader.readAsDataURL(file);
    }
});

async function saveEvent() {
    try {
        console.group('保存事件流程开始');
        const imageUrls = [];
        const imageFiles = document.getElementById('edit-images').files;
        console.log('📸 准备上传图片:', {
            图片数量: imageFiles.length,
            图片列表: Array.from(imageFiles).map(f => ({
                名称: f.name,
                类型: f.type,
                大小: `${(f.size/1024).toFixed(2)}KB`
            }))
        });
        
        // 先上传所有图片
        for (let i = 0; i < imageFiles.length; i++) {
            console.group(`上传第 ${i + 1} 张图片`);
            const file = imageFiles[i];
            console.log('🔄 开始上传:', {
                文件名: file.name,
                类型: file.type,
                大小: `${(file.size/1024).toFixed(2)}KB`
            });
            
            const formData = new FormData();
            formData.append('image', file);
            
            try {
                console.log('⬆️ 发送上传请求...');
                const uploadResponse = await fetch('https://yoyo.timeflower.live/api/upload-image', {
                    method: 'POST',
                    body: formData
                });
                
                console.log('📥 收到响应:', {
                    状态: uploadResponse.status,
                    状态文本: uploadResponse.statusText
                });
                
                if (uploadResponse.ok) {
                    const result = await uploadResponse.json();
                    console.log('✅ 上传成功:', result);
                    if (result.url) {
                        imageUrls.push(result.url);
                        console.log('📝 已添加URL:', result.url);
                    }
                } else {
                    const errorData = await uploadResponse.json();
                    console.error('❌ 上传失败:', errorData);
                    throw new Error(`图片上传失败: ${errorData.error || '未知错误'}`);
                }
            } catch (uploadError) {
                console.error('❌ 上传过程错误:', uploadError);
                throw new Error(`图片 ${file.name} 上传失败: ${uploadError.message}`);
            } finally {
                console.groupEnd();
            }
        }
        
        console.log('📸 所有图片上传完成，URLs:', imageUrls);
        
        // 保存事件数据
        const eventData = {
            date: document.getElementById('edit-date').value,
            headline: document.getElementById('edit-headline').value,
            description: document.getElementById('edit-description').value,
            based: document.getElementById('edit-based').value,
            imageUrls: imageUrls
        };

        console.log('📦 准备保存事件数据:', eventData);

        try {
            console.log('⬆️ 发送保存请求...');
            const response = await fetch('https://yoyo.timeflower.live/api/update-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(eventData)
            });

            console.log('📥 收到保存响应:', {
                状态: response.status,
                状态文本: response.statusText
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 保存成功:', result);

                console.log('🔄 更新界面显示...');
                // 更新显示内容
                document.getElementById('display-headline').textContent = eventData.headline;
                document.getElementById('display-description').textContent = eventData.description;
                document.getElementById('display-based').textContent = eventData.based;
                
                // 更新图片显示
                const displayImages = document.getElementById('display-images');
                displayImages.innerHTML = imageUrls.map(url => `
                    <div class="image-item">
                        <img src="${url}" class="img-thumbnail">
                    </div>
                `).join('');
                
                // 切换回显示模式
                cancelEdit();
                
                console.log('🔄 重新加载事件数据...');
                await loadEvents();
                
                console.log('✨ 全部完成！');
                alert('保存成功！');
            } else {
                const errorData = await response.json();
                console.error('❌ 保存失败:', errorData);
                throw new Error(errorData.error || '保存失败');
            }
        } catch (saveError) {
            console.error('❌ 保存事件数据错误:', saveError);
            throw new Error(`保存失败: ${saveError.message}`);
        }
    } catch (error) {
        console.error('❌ 整体错误:', error);
        alert(`操作失败: ${error.message}`);
    } finally {
        console.groupEnd();
    }
}

async function loadEvents() {
  try {
    const response = await fetch('/api/get-events');
    const events = await response.json();
    updateEventButtons(events);
  } catch (error) {
    console.error('Failed to load events:', error);
  }
}

function updateEventButtons(events) {
    Object.entries(events).forEach(([date, eventArray]) => {
        const event = eventArray[0];
        const button = document.querySelector(`button[data-date="${date}"]`);
        if (button) {
            button.dataset.headline = event.headline;
            button.dataset.description = event.description;
            button.dataset.based = event.based;
            button.dataset.imageUrls = JSON.stringify(event.imageUrls || []);
            button.textContent = event.headline;
        }
    });
}



// 页面加载时获取事件数据
document.addEventListener('DOMContentLoaded', loadEvents);