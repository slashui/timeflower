function showEventDetail(button) {
    const display = document.getElementById('event-display');
    if (display) {
        // 显示模式
        document.getElementById('display-headline').textContent = button.dataset.headline || '';
        document.getElementById('display-description').textContent = button.dataset.description || '';
        document.getElementById('display-based').textContent = button.dataset.based || '';
        
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

async function saveEvent() {
    const eventData = {
        date: document.getElementById('edit-date').value,
        headline: document.getElementById('edit-headline').value,
        description: document.getElementById('edit-description').value,
        based: document.getElementById('edit-based').value
    };

    try {
        // 直接请求当前域名的 API
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
            
            // 切换回显示模式
            cancelEdit();
            
            // 更新按钮的数据属性
            const button = document.querySelector(`button[data-date="${eventData.date}"]`);
            if (button) {
                button.dataset.headline = eventData.headline;
                button.dataset.description = eventData.description;
                button.dataset.based = eventData.based;
                button.textContent = eventData.headline;
            }
        } else {
            alert('保存失败，请重试');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('保存失败，请重试');
    }
}