(() => {
    const { storage, escapeHtml, notify } = window.StudyPlanner;
    const taskList = storage.read('studyPlannerTasks', []);
    const preferenceDefaults = { due: true, completed: true };
    const preferences = { ...preferenceDefaults, ...storage.read('studyPlannerNotificationPreferences', {}) };
    let readIds = storage.read('studyPlannerReadNotifications', []);
    const list = document.getElementById('notificationList');
    const count = document.getElementById('unreadCount');
    const duePreference = document.getElementById('duePreference');
    const completedPreference = document.getElementById('completedPreference');
    duePreference.checked = preferences.due;
    completedPreference.checked = preferences.completed;

    const localDate = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const today = localDate(new Date());
    const updates = [];
    taskList.forEach(task => {
        if (preferences.due && !task.completed && task.dueDate) {
            const overdue = task.dueDate < today;
            const dueToday = task.dueDate === today;
            if (overdue || dueToday) updates.push({ id: `due-${task.id}`, task, kind: overdue ? 'overdue' : 'due', date: task.dueDate });
        }
        if (preferences.completed && task.completed) updates.push({ id: `done-${task.id}`, task, kind: 'completed', date: task.dueDate });
    });
    updates.sort((first, second) => (second.date || '').localeCompare(first.date || ''));

    const render = () => {
        const unread = updates.filter(update => !readIds.includes(update.id)).length;
        count.textContent = `${unread} unread`;
        if (!updates.length) {
            list.innerHTML = '<div class="empty-state"><i class="fa-regular fa-bell-slash" aria-hidden="true"></i><strong>You are all caught up</strong><span>New task reminders will appear here.</span></div>';
            return;
        }
        list.innerHTML = updates.map(update => {
            const message = update.kind === 'overdue' ? 'Past due' : update.kind === 'due' ? 'Due today' : 'Task completed';
            const date = update.date ? new Date(`${update.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
            return `<article class="notification-item ${readIds.includes(update.id) ? 'is-read' : 'is-unread'}" data-notification-id="${escapeHtml(update.id)}"><span class="metric-icon"><i class="fa-solid ${update.kind === 'completed' ? 'fa-circle-check' : 'fa-calendar-day'}" aria-hidden="true"></i></span><div class="metric-copy"><strong>${escapeHtml(update.task.title)}</strong><span>${escapeHtml(message)}${date ? ` · ${escapeHtml(date)}` : ''} · ${escapeHtml(update.task.subject || 'General')}</span></div><a class="btn btn-sm btn-outline-secondary" href="tasks.html">Open tasks</a><button class="icon-btn mark-read" type="button" aria-label="Mark ${escapeHtml(update.task.title)} as read" aria-pressed="${readIds.includes(update.id)}"><i class="fa-solid ${readIds.includes(update.id) ? 'fa-check' : 'fa-envelope-open'}" aria-hidden="true"></i></button></article>`;
        }).join('');
    };

    document.getElementById('saveNotificationPrefs').addEventListener('click', () => {
        storage.write('studyPlannerNotificationPreferences', { due: duePreference.checked, completed: completedPreference.checked });
        location.reload();
    });
    document.getElementById('markAllRead').addEventListener('click', () => {
        readIds = [...new Set([...readIds, ...updates.map(update => update.id)])];
        storage.write('studyPlannerReadNotifications', readIds);
        render();
        notify('All updates marked as read.');
    });
    list.addEventListener('click', event => {
        const button = event.target.closest('.mark-read');
        if (!button) return;
        const id = button.closest('[data-notification-id]').dataset.notificationId;
        if (!readIds.includes(id)) readIds.push(id);
        storage.write('studyPlannerReadNotifications', readIds);
        render();
    });
    render();
})();