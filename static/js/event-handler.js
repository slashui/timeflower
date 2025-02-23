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
        const imageUrls = [];
        const imageFiles = document.getElementById('edit-images').files;
        
        // 先上传所有图片
        for (let i = 0; i < imageFiles.length; i++) {
            const formData = new FormData();
            formData.append('image', imageFiles[i]);
            
            const uploadResponse = await fetch('/api/upload-image', {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                if (result.url) {
                    imageUrls.push(result.url);
                }
            } else {
                throw new Error('图片上传失败');
            }
        }
        
        // 保存事件数据
        const eventData = {
            date: document.getElementById('edit-date').value,
            headline: document.getElementById('edit-headline').value,
            description: document.getElementById('edit-description').value,
            based: document.getElementById('edit-based').value,
            imageUrls: imageUrls
        };

        const response = await fetch('/api/update-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });

        if (response.ok) {
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
            
            // 重新加载所有事件数据
            await loadEvents();
            
            alert('保存成功！');
        } else {
            const errorData = await response.json();
            alert(`保存失败：${errorData.error || '未知错误'}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('保存失败，请重试');
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