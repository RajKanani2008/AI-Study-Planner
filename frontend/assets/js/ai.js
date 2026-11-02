(() => {
    const { storage, escapeHtml, notify } = window.StudyPlanner;
    const form = document.getElementById('plannerForm');
    if (!form) return;

    const fields = {
        name: document.getElementById('studentName'),
        goal: document.getElementById('goal'),
        subjects: document.getElementById('subjects'),
        hours: document.getElementById('studyHours'),
        exam: document.getElementById('examDate'),
        difficulty: document.getElementById('difficulty'),
        time: document.getElementById('studyTime'),
        breakTime: document.getElementById('breakTime')
    };
    const submit = form.querySelector('[type="submit"]');
    const planHeading = [...document.querySelectorAll('h3')].find(heading => heading.textContent.includes('Weekly Study Schedule'));
    const planCard = planHeading?.closest('.glass-card');
    const table = planCard?.querySelector('tbody');
    const exportButton = planCard?.querySelector('button');
    const saved = storage.read('studyPlannerLegacyPlan', null);
    const timeSlots = ['9:00-10:00', '10:15-11:15', '1:00-2:00', '2:15-3:15'];
    const todayKey = (() => {
        const date = new Date();
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    })();

    const renderStudyData = () => {
        const tasks = storage.read('studyPlannerTasks', []);
        const subjects = storage.read('studyPlannerSubjects', []);
        const sessions = storage.read('studySessions', []);
        const todayTasks = tasks.filter(task => task.dueDate === todayKey);
        const completedToday = todayTasks.filter(task => task.completed).length;
        const completion = todayTasks.length ? Math.round(completedToday / todayTasks.length * 100) : 0;
        const progressBar = document.getElementById('plannerTodayProgressBar');
        const progressLabel = document.getElementById('plannerTodayProgress');
        progressBar.style.width = `${completion}%`;
        progressBar.parentElement.setAttribute('aria-valuenow', String(completion));
        progressLabel.textContent = todayTasks.length
            ? `${completion}% complete · ${completedToday} of ${todayTasks.length} tasks`
            : 'No tasks due today.';

        const todayTaskList = document.getElementById('plannerTodayTasks');
        todayTaskList.innerHTML = todayTasks.length
            ? todayTasks.map(task => `<article class="metric-card"><span class="metric-icon"><i class="fa-solid ${task.completed ? 'fa-circle-check' : 'fa-list-check'}" aria-hidden="true"></i></span><div class="metric-copy"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.subject || 'General')} · ${task.completed ? 'Completed' : escapeHtml(task.priority || 'Normal priority')}</span></div></article>`).join('')
            : '<div class="empty-state"><strong>No tasks due today</strong><span>Add dated tasks on the Tasks page to see them here.</span><a class="btn btn-sm btn-outline-primary mt-2" href="tasks.html">Add a task</a></div>';

        const subjectNames = [...new Set([
            ...subjects.map(subject => subject.name).filter(Boolean),
            ...tasks.map(task => task.subject).filter(Boolean)
        ])];
        const taskProgress = document.getElementById('plannerTaskProgress');
        taskProgress.innerHTML = subjectNames.length
            ? subjectNames.map(name => {
                const matching = tasks.filter(task => task.subject === name);
                const done = matching.filter(task => task.completed).length;
                const percent = matching.length ? Math.round(done / matching.length * 100) : 0;
                return `<div><div class="d-flex justify-content-between gap-3"><strong>${escapeHtml(name)}</strong><span>${done}/${matching.length} complete</span></div><div class="progress mt-2" role="progressbar" aria-label="${escapeHtml(name)} task completion" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar" style="width:${percent}%"></div></div></div>`;
            }).join('')
            : '<div class="empty-state"><strong>No subject activity yet</strong><span>Complete tasks with a subject to track progress.</span></div>';

        document.getElementById('plannerSubjectCount').textContent = String(subjects.length);
        document.getElementById('plannerCompletedCount').textContent = String(tasks.filter(task => task.completed).length);
        const totalMinutes = sessions.reduce((sum, session) => sum + (Number(session.minutes) || 0), 0);
        document.getElementById('plannerFocusHours').textContent = `${Math.round(totalMinutes / 60 * 10) / 10}h`;
        const activeDays = new Set(sessions.map(session => session.completedAt?.slice(0, 10) || session.date).filter(Boolean));
        let streak = 0;
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        if (!activeDays.has(todayKey)) date.setDate(date.getDate() - 1);
        while (activeDays.has(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`)) {
            streak += 1;
            date.setDate(date.getDate() - 1);
        }
        document.getElementById('plannerFocusStreak').textContent = String(streak);

        const dailyGoals = document.getElementById('plannerDailyGoals');
        dailyGoals.innerHTML = todayTasks.length
            ? todayTasks.map(task => `<li class="list-group-item">${task.completed ? 'Completed' : 'Open'} · ${escapeHtml(task.title)}</li>`).join('')
            : '<li class="list-group-item">Add dated tasks to see your study goals here.</li>';
    };

    const createSchedule = data => {
        const topics = data.subjects.split(',').map(subject => subject.trim()).filter(Boolean);
        const subjects = topics.length ? topics : ['Study session'];
        const blocks = Math.max(1, Math.min(4, Math.ceil(data.hours)));
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const rows = days.map((day, dayIndex) => {
            const cells = Array.from({ length: 4 }, (_, blockIndex) => {
                if (blockIndex >= blocks) return '<td class="text-secondary">Open time</td>';
                const topic = subjects[(dayIndex + blockIndex) % subjects.length];
                return `<td><span class="schedule-topic">${escapeHtml(topic)}</span><small class="d-block text-secondary">${timeSlots[blockIndex]}</small></td>`;
            }).join('');
            return `<tr><th scope="row">${day}</th>${cells}</tr>`;
        });
        rows.push('<tr><th scope="row">Sunday</th><td colspan="4" class="text-center text-secondary">Rest, light revision, or weekly review</td></tr>');
        return rows.join('');
    };

    const showPlan = plan => {
        if (!table) return;
        table.innerHTML = createSchedule(plan);
        const notice = document.getElementById('localPlanNotice') || document.createElement('p');
        notice.id = 'localPlanNotice';
        notice.className = 'calendar-subtitle mt-2';
        notice.textContent = 'Built in this browser using simple scheduling rules. No live AI or server request was made.';
        if (!notice.isConnected) planCard.append(notice);
    };

    if (saved) showPlan(saved);
    const user = storage.read('studyPlannerUser', null);
    if (user?.fullName && !fields.name.value) fields.name.value = user.fullName;

    form.addEventListener('submit', event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const data = {
            name: fields.name.value.trim(),
            goal: fields.goal.value,
            subjects: fields.subjects.value.trim(),
            hours: Number(fields.hours.value),
            examDate: fields.exam.value,
            difficulty: fields.difficulty.value,
            time: fields.time.value,
            breakTime: fields.breakTime.value
        };
        if (!data.name || data.hours < 1 || data.hours > 15) {
            notify('Enter your name and choose 1 to 15 study hours.', 'error');
            return;
        }
        submit.disabled = true;
        submit.setAttribute('aria-busy', 'true');
        submit.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Building schedule';
        window.setTimeout(() => {
            storage.write('studyPlannerLegacyPlan', data);
            showPlan(data);
            submit.disabled = false;
            submit.removeAttribute('aria-busy');
            submit.innerHTML = '<i class="fa-solid fa-calendar-check" aria-hidden="true"></i> Build Weekly Schedule';
            planCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            notify('Your browser-based study schedule is ready. No AI service was contacted.');
        }, 220);
    });

    exportButton?.addEventListener('click', () => {
        const plan = storage.read('studyPlannerLegacyPlan', null);
        if (!plan) {
            notify('Build a schedule before exporting it.', 'error');
            return;
        }
        const subjectNames = plan.subjects.split(',').map(subject => subject.trim()).filter(Boolean).join(', ') || 'Study session';
        const contents = [`Study plan for ${plan.name}`, `Goal: ${plan.goal}`, `Subjects: ${subjectNames}`, `Daily study time: ${plan.hours} hours`, `Preferred time: ${plan.time}`, `Difficulty: ${plan.difficulty}`, `Break: ${plan.breakTime}`].join('\n');
        const url = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'study-plan.txt';
        link.click();
        URL.revokeObjectURL(url);
    });

    const quickNote = document.getElementById('plannerQuickNote');
    const quickNoteStatus = document.getElementById('plannerQuickNoteStatus');
    quickNote.value = localStorage.getItem('studyNotes')
        ?? storage.read('studyPlannerNotes', []).find(note => note.id === 'dashboard-quick-note')?.body
        ?? '';
    document.getElementById('plannerQuickNoteSave').addEventListener('click', () => {
        const body = quickNote.value.trim();
        const notes = storage.read('studyPlannerNotes', []);
        const existing = notes.find(note => note.id === 'dashboard-quick-note');
        if (!body) {
            if (existing) {
                storage.write('studyPlannerNotes', notes.filter(note => note.id !== 'dashboard-quick-note'));
            }
            localStorage.removeItem('studyNotes');
            quickNoteStatus.textContent = 'Quick note cleared.';
            notify('Quick note cleared.');
            return;
        }
        const entry = {
            id: 'dashboard-quick-note',
            title: 'Quick notes',
            subject: 'General',
            body,
            pinned: existing?.pinned || false,
            updatedAt: new Date().toISOString()
        };
        storage.write('studyPlannerNotes', existing
            ? notes.map(note => note.id === entry.id ? entry : note)
            : [entry, ...notes]);
        localStorage.setItem('studyNotes', body);
        quickNoteStatus.textContent = 'Quick note saved in this browser.';
        notify('Quick note saved.');
    });

    storage.subscribe('studyPlannerTasks', renderStudyData);
    storage.subscribe('studyPlannerSubjects', renderStudyData);
    storage.subscribe('studySessions', renderStudyData);
    storage.subscribe('studyPlannerNotes', value => {
        if (document.activeElement !== quickNote) {
            quickNote.value = value.find(note => note.id === 'dashboard-quick-note')?.body || '';
        }
    });
    renderStudyData();
})();