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
    const formData = new FormData();
    formData.append('date', document.getElementById('edit-date').value);
    formData.append('headline', document.getElementById('edit-headline').value);
    formData.append('description', document.getElementById('edit-description').value);
    formData.append('based', document.getElementById('edit-based').value);
    
    // Handle image files
    const imageFiles = document.getElementById('edit-images').files;
    for (let i = 0; i < imageFiles.length; i++) {
        formData.append('images', imageFiles[i]);
    }

    try {
        const response = await fetch('/api/update-event', {
            method: 'POST',
            body: formData  // Remove Content-Type header to let browser set it
        });

        if (response.ok) {
            const result = await response.json();
            
            // Update display content
            document.getElementById('display-headline').textContent = formData.get('headline');
            document.getElementById('display-description').textContent = formData.get('description');
            document.getElementById('display-based').textContent = formData.get('based');
            
            // Update image display
            if (result.imageUrls && result.imageUrls.length > 0) {
                const displayImages = document.getElementById('display-images');
                displayImages.innerHTML = result.imageUrls.map(url => `
                    <div class="image-item">
                        <img src="${url}" class="img-thumbnail">
                    </div>
                `).join('');
            }
            
            // Switch back to view mode
            cancelEdit();
            
            // Reload all event data
            await loadEvents();
            
            alert('保存成功！');
        } else {
            const errorData = await response.json();
            console.error('Save failed:', errorData);
            alert(`保存失败：${errorData.error}`);
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