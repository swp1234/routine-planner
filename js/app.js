/**
 * Morning Routine Planner - Main Application Logic
 * Features: Routine scheduling, timer, calendar tracking, templates, sharing
 */

class RoutineApp {
    constructor() {
        this.routines = [];
        this.wakeupTime = '06:00';
        this.completedDates = {};
        this.currentTimerRoutine = null;
        this.timerInterval = null;
        this.timerRemaining = 0;
        this.timerRunning = false;

        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupThemeToggle();
        this.updateUI();
        this.displayDailyQuote();
        this.registerServiceWorker();
    }

    /* ============================================================
       DATA MANAGEMENT
       ============================================================ */

    saveData() {
        const data = {
            routines: this.routines,
            wakeupTime: this.wakeupTime,
            completedDates: this.completedDates
        };
        localStorage.setItem('routineData', JSON.stringify(data));
    }

    loadData() {
        try {
            const data = JSON.parse(localStorage.getItem('routineData') || '{}');
            this.routines = data.routines || [];
            this.wakeupTime = data.wakeupTime || '06:00';
            this.completedDates = data.completedDates || {};
        } catch (e) {
            console.error('Error loading data:', e);
        }
    }

    exportData() {
        const data = {
            routines: this.routines,
            wakeupTime: this.wakeupTime,
            completedDates: this.completedDates,
            exportedAt: new Date().toISOString()
        };
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `routine-data-${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    clearAllData() {
        if (confirm(i18n.t('share.title') + ' - ' + i18n.t('button.clear') + '?')) {
            this.routines = [];
            this.wakeupTime = '06:00';
            this.completedDates = {};
            this.saveData();
            this.updateUI();
        }
    }

    /* ============================================================
       EVENT LISTENERS
       ============================================================ */

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Planner tab
        document.getElementById('save-wakeup-btn').addEventListener('click', () => this.saveWakeupTime());
        document.getElementById('add-routine-btn').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('add-routine-cancel').addEventListener('click', () => this.toggleAddForm());
        document.getElementById('add-routine-confirm').addEventListener('click', () => this.addRoutine());

        // Timer tab
        document.getElementById('timer-start-btn').addEventListener('click', () => this.startTimer());
        document.getElementById('timer-pause-btn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('timer-reset-btn').addEventListener('click', () => this.resetTimer());
        document.getElementById('timer-next-btn').addEventListener('click', () => this.nextRoutine());
        document.getElementById('timer-routine-select').addEventListener('change', (e) => this.selectTimerRoutine(e.target.value));

        // Calendar tab
        document.querySelectorAll('.day-check').forEach(check => {
            check.addEventListener('change', (e) => this.toggleDayCompletion(parseInt(e.target.dataset.day), e.target.checked));
        });

        document.getElementById('prev-week').addEventListener('click', () => this.previousWeek());
        document.getElementById('next-week').addEventListener('click', () => this.nextWeek());

        // Templates
        document.querySelectorAll('.btn-template').forEach(btn => {
            btn.addEventListener('click', (e) => this.applyTemplate(e.target.dataset.template));
        });

        // Settings
        document.getElementById('settings-toggle').addEventListener('click', () => this.toggleSettings());
        document.getElementById('close-settings').addEventListener('click', () => this.toggleSettings());
        document.getElementById('notification-toggle').addEventListener('change', (e) => this.toggleNotifications(e.target.checked));
        document.getElementById('share-card-btn').addEventListener('click', () => this.generateShareCard());
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearAllData());

        // Language
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguageMenu());
        document.querySelectorAll('.lang-option').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                await i18n.setLanguage(e.target.dataset.lang);
                this.toggleLanguageMenu();
                this.updateUI();
            });
        });

        // Share modal
        document.getElementById('close-share').addEventListener('click', () => this.closeShareModal());
        document.getElementById('download-card-btn').addEventListener('click', () => this.downloadShareCard());
        document.getElementById('copy-card-btn').addEventListener('click', () => this.copyShareCard());

        // Premium AI
        document.getElementById('premium-ai-btn').addEventListener('click', () => this.showAIPremiumAd());

        // Language change event
        window.addEventListener('languageChanged', () => this.updateUI());
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.documentElement.setAttribute('data-theme', savedTheme);
            themeToggle.textContent = savedTheme === 'light' ? '🌙' : '☀️';
            themeToggle.addEventListener('click', () => {
                const current = document.documentElement.getAttribute('data-theme');
                const next = current === 'light' ? 'dark' : 'light';
                document.documentElement.setAttribute('data-theme', next);
                localStorage.setItem('theme', next);
                themeToggle.textContent = next === 'light' ? '🌙' : '☀️';
            });
        }
    }

    /* ============================================================
       TAB MANAGEMENT
       ============================================================ */

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected tab
        document.getElementById(tabName + '-tab').classList.add('active');
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update calendar when switching to calendar tab
        if (tabName === 'calendar') {
            this.updateCalendar();
        }
    }

    /* ============================================================
       PLANNER TAB
       ============================================================ */

    saveWakeupTime() {
        const timeInput = document.getElementById('wakeup-time');
        this.wakeupTime = timeInput.value;
        this.saveData();
        this.updateRoutineList();
        this.notify(i18n.t('button.save') + '!');
    }

    toggleAddForm() {
        const form = document.getElementById('add-routine-form');
        form.classList.toggle('hidden');
        if (!form.classList.contains('hidden')) {
            document.getElementById('routine-name').focus();
        }
    }

    addRoutine() {
        const name = document.getElementById('routine-name').value.trim();
        const duration = parseInt(document.getElementById('routine-duration').value) || 15;
        const icon = document.getElementById('routine-icon').value;

        if (!name) {
            alert(i18n.t('planner.routineName'));
            return;
        }

        const routine = {
            id: Date.now(),
            name,
            duration,
            icon,
            completed: false
        };

        this.routines.push(routine);
        this.saveData();
        this.updateRoutineList();
        this.toggleAddForm();

        // Reset form
        document.getElementById('routine-name').value = '';
        document.getElementById('routine-duration').value = '15';

        this.notify(i18n.t('button.add') + ' - ' + name);
    }

    deleteRoutine(id) {
        this.routines = this.routines.filter(r => r.id !== id);
        this.saveData();
        this.updateRoutineList();
    }

    toggleRoutineCompletion(id) {
        const routine = this.routines.find(r => r.id === id);
        if (routine) {
            routine.completed = !routine.completed;
            this.saveData();
            this.updateRoutineList();
            this.updateProgress();
        }
    }

    updateRoutineList() {
        const list = document.getElementById('routine-list');
        list.innerHTML = '';

        if (this.routines.length === 0) {
            list.innerHTML = '<li style="text-align: center; color: var(--color-text-secondary); padding: 20px;">' + i18n.t('noRoutines') + '</li>';
            return;
        }

        this.routines.forEach((routine, index) => {
            const li = document.createElement('li');
            li.className = 'routine-item';
            li.draggable = true;
            li.dataset.id = routine.id;
            li.innerHTML = `
                <div class="routine-icon">${routine.icon}</div>
                <div class="routine-info">
                    <div class="routine-name">${routine.name}</div>
                    <div class="routine-duration">${routine.duration}${i18n.t('unit.minute')}</div>
                </div>
                <input type="checkbox" class="routine-checkbox" ${routine.completed ? 'checked' : ''}>
                <button class="routine-delete">🗑️</button>
            `;

            // Checkbox
            li.querySelector('.routine-checkbox').addEventListener('change', () => {
                this.toggleRoutineCompletion(routine.id);
            });

            // Delete button
            li.querySelector('.routine-delete').addEventListener('click', () => {
                this.deleteRoutine(routine.id);
            });

            // Drag events
            li.addEventListener('dragstart', (e) => this.dragStart(e));
            li.addEventListener('dragover', (e) => this.dragOver(e));
            li.addEventListener('drop', (e) => this.drop(e));
            li.addEventListener('dragend', (e) => this.dragEnd(e));

            list.appendChild(li);
        });

        this.updateProgress();
        this.updateTimerSelect();
    }

    dragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.target.style.opacity = '0.5';
    }

    dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        e.target.closest('.routine-item')?.style.borderTop = '2px solid var(--color-primary)';
    }

    drop(e) {
        e.preventDefault();
        const draggedItem = document.querySelector('[draggable="true"][style*="opacity"]');
        const target = e.target.closest('.routine-item');

        if (draggedItem && target && draggedItem !== target) {
            const draggedId = parseInt(draggedItem.dataset.id);
            const targetId = parseInt(target.dataset.id);

            const draggedIndex = this.routines.findIndex(r => r.id === draggedId);
            const targetIndex = this.routines.findIndex(r => r.id === targetId);

            [this.routines[draggedIndex], this.routines[targetIndex]] = [this.routines[targetIndex], this.routines[draggedIndex]];
            this.saveData();
            this.updateRoutineList();
        }
    }

    dragEnd(e) {
        e.target.style.opacity = '1';
        document.querySelectorAll('.routine-item').forEach(item => {
            item.style.borderTop = 'none';
        });
    }

    updateProgress() {
        const total = this.routines.length;
        const completed = this.routines.filter(r => r.completed).length;
        const totalTime = this.routines.reduce((sum, r) => sum + r.duration, 0);

        const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('progress-percent').textContent = percent + '%';
        document.getElementById('progress-fill').style.width = percent + '%';
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('total-count').textContent = total;
        document.getElementById('total-time').textContent = totalTime + i18n.t('unit.minute');
    }

    /* ============================================================
       TIMER TAB
       ============================================================ */

    updateTimerSelect() {
        const select = document.getElementById('timer-routine-select');
        const currentValue = select.value;
        select.innerHTML = '<option value="">-- ' + i18n.t('timer.selectRoutine') + ' --</option>';

        this.routines.forEach(routine => {
            const option = document.createElement('option');
            option.value = routine.id;
            option.textContent = routine.icon + ' ' + routine.name + ' (' + routine.duration + i18n.t('unit.minute') + ')';
            select.appendChild(option);
        });

        select.value = currentValue;
    }

    selectTimerRoutine(routineId) {
        if (!routineId) {
            this.currentTimerRoutine = null;
            document.getElementById('current-routine').textContent = i18n.t('timer.selectRoutine');
            this.resetTimer();
            return;
        }

        const routine = this.routines.find(r => r.id === parseInt(routineId));
        if (routine) {
            this.currentTimerRoutine = routine;
            document.getElementById('current-routine').textContent = routine.icon + ' ' + routine.name;
            this.timerRemaining = routine.duration * 60; // Convert to seconds
            this.updateTimerDisplay();
        }
    }

    startTimer() {
        if (!this.currentTimerRoutine) {
            alert(i18n.t('timer.selectRoutine'));
            return;
        }

        if (this.timerRunning) return;

        this.timerRunning = true;
        document.getElementById('timer-start-btn').classList.add('hidden');
        document.getElementById('timer-pause-btn').classList.remove('hidden');

        this.timerInterval = setInterval(() => {
            if (this.timerRemaining > 0) {
                this.timerRemaining--;
                this.updateTimerDisplay();
            } else {
                this.completeRoutine();
            }
        }, 1000);
    }

    pauseTimer() {
        this.timerRunning = false;
        clearInterval(this.timerInterval);
        document.getElementById('timer-start-btn').classList.remove('hidden');
        document.getElementById('timer-pause-btn').classList.add('hidden');
    }

    resetTimer() {
        this.pauseTimer();
        if (this.currentTimerRoutine) {
            this.timerRemaining = this.currentTimerRoutine.duration * 60;
        } else {
            this.timerRemaining = 0;
        }
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timerRemaining / 60);
        const seconds = this.timerRemaining % 60;
        document.getElementById('timer-display').textContent =
            String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
    }

    completeRoutine() {
        this.pauseTimer();
        if (this.currentTimerRoutine) {
            this.currentTimerRoutine.completed = true;
            this.saveData();
            this.updateRoutineList();
            this.notify(this.currentTimerRoutine.name + ' ' + i18n.t('planner.completed') + '!');
        }
        this.nextRoutine();
    }

    nextRoutine() {
        const nextRoutine = this.routines.find(r => !r.completed);
        if (nextRoutine) {
            document.getElementById('timer-routine-select').value = nextRoutine.id;
            this.selectTimerRoutine(nextRoutine.id);
        } else {
            alert(i18n.t('planner.routines') + ' ' + i18n.t('planner.completed') + '!');
            this.resetTimer();
        }
    }

    /* ============================================================
       CALENDAR TAB
       ============================================================ */

    updateCalendar() {
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay() + 1);

        document.querySelectorAll('.day-check').forEach((check, index) => {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + index);
            const dateKey = this.getDateKey(date);

            check.checked = this.completedDates[dateKey] || false;
            const dayCard = check.closest('.day-card');
            dayCard.querySelector('.day-number').textContent = date.getDate();
        });

        this.updateCalendarStats();
    }

    toggleDayCompletion(dayOffset, checked) {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() - today.getDay() + dayOffset);
        const dateKey = this.getDateKey(targetDate);

        if (checked) {
            this.completedDates[dateKey] = true;
        } else {
            delete this.completedDates[dateKey];
        }

        this.saveData();
        this.updateCalendarStats();
    }

    previousWeek() {
        // This is a simplified implementation
        this.updateCalendar();
    }

    nextWeek() {
        // This is a simplified implementation
        this.updateCalendar();
    }

    updateCalendarStats() {
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay() + 1);

        let weeklyCount = 0;
        let streak = 0;

        // Count weekly completions
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentWeekStart);
            date.setDate(currentWeekStart.getDate() + i);
            const dateKey = this.getDateKey(date);
            if (this.completedDates[dateKey]) {
                weeklyCount++;
            }
        }

        // Calculate streak
        let checkDate = new Date(today);
        while (this.completedDates[this.getDateKey(checkDate)]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        }

        document.getElementById('streak-count').textContent = streak + i18n.t('unit.day');
        document.getElementById('weekly-total').textContent = weeklyCount + i18n.t('unit.day');
    }

    getDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    /* ============================================================
       TEMPLATES
       ============================================================ */

    applyTemplate(templateName) {
        const r = i18n.t('defaultRoutines');
        const templates = {
            health: [
                { name: r.drink, duration: 5, icon: '💧' },
                { name: r.exercise, duration: 30, icon: '🏃' },
                { name: r.shower, duration: 20, icon: '🚿' },
                { name: r.breakfast, duration: 20, icon: '🍳' },
                { name: r.prepare, duration: 15, icon: '👔' }
            ],
            productivity: [
                { name: r.wakeup, duration: 5, icon: '☀️' },
                { name: r.drink, duration: 5, icon: '💧' },
                { name: r.meditation, duration: 10, icon: '🧘' },
                { name: r.breakfast, duration: 20, icon: '🍳' },
                { name: r.checkSchedule, duration: 10, icon: '📅' },
                { name: r.startWork, duration: 10, icon: '💼' }
            ],
            meditation: [
                { name: r.wakeup, duration: 5, icon: '☀️' },
                { name: r.drink, duration: 5, icon: '💧' },
                { name: r.meditation, duration: 20, icon: '🧘' },
                { name: r.journal, duration: 10, icon: '✍️' },
                { name: r.tea, duration: 10, icon: '☕' }
            ],
            sport: [
                { name: r.stretch, duration: 10, icon: '🌱' },
                { name: r.running, duration: 30, icon: '🏃' },
                { name: r.shower, duration: 20, icon: '🚿' },
                { name: r.breakfast, duration: 20, icon: '🍳' },
                { name: r.prepare, duration: 10, icon: '👔' }
            ]
        };

        const template = templates[templateName];
        if (!template) return;

        this.routines = template.map((item, index) => ({
            id: Date.now() + index,
            name: item.name,
            duration: item.duration,
            icon: item.icon,
            completed: false
        }));

        this.saveData();
        this.updateRoutineList();
        this.switchTab('planner');
        this.notify(templateName + ' ' + i18n.t('planner.routines') + ' ' + i18n.t('button.copy') + '!');
    }

    /* ============================================================
       SETTINGS & SHARING
       ============================================================ */

    toggleSettings() {
        document.getElementById('settings-modal').classList.toggle('hidden');
    }

    toggleLanguageMenu() {
        document.getElementById('lang-menu').classList.toggle('hidden');
    }

    toggleNotifications(enabled) {
        localStorage.setItem('notificationsEnabled', enabled);
        if (enabled && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    notify(message) {
        const enabled = localStorage.getItem('notificationsEnabled') === 'true';
        if (enabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Morning Routine', { body: message });
        }
    }

    generateShareCard() {
        const modal = document.getElementById('share-modal');
        const card = document.getElementById('share-card');

        const totalTime = this.routines.reduce((sum, r) => sum + r.duration, 0);
        const routinesHtml = this.routines.map(r => `
            <div class="share-card-routine">
                <span class="share-card-routine-icon">${r.icon}</span>
                <span>${r.name}</span>
                <span style="margin-left: auto; color: var(--color-text-secondary);">${r.duration}${i18n.t('unit.minute')}</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="share-card-title">✨ ${i18n.t('shareCard.title')}</div>
            <div class="share-card-routines">${routinesHtml}</div>
            <div class="share-card-stats">
                <div class="share-card-stat">
                    <span class="share-card-stat-label">${i18n.t('shareCard.wakeupTime')}</span>
                    <span class="share-card-stat-value">${this.wakeupTime}</span>
                </div>
                <div class="share-card-stat">
                    <span class="share-card-stat-label">${i18n.t('shareCard.totalTime')}</span>
                    <span class="share-card-stat-value">${totalTime}${i18n.t('unit.minute')}</span>
                </div>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeShareModal() {
        document.getElementById('share-modal').classList.add('hidden');
    }

    downloadShareCard() {
        const card = document.getElementById('share-card');
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 800;
        const ctx = canvas.getContext('2d');

        // Background
        ctx.fillStyle = '#0f0f23';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Border
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 3;
        ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

        // Title
        ctx.fillStyle = '#f1c40f';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('✨ My Morning Routine', canvas.width / 2, 80);

        // Content
        ctx.fillStyle = '#ffffff';
        ctx.font = '18px Arial';
        ctx.textAlign = 'left';
        let y = 150;

        this.routines.forEach(routine => {
            ctx.fillText(routine.icon + ' ' + routine.name + ' - ' + routine.duration + '분', 60, y);
            y += 50;
        });

        const canvas2Image = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = canvas2Image;
        a.download = 'my-morning-routine.png';
        a.click();
    }

    copyShareCard() {
        const text = this.routines.map(r => r.icon + ' ' + r.name + ' (' + r.duration + i18n.t('unit.minute') + ')').join('\n');
        navigator.clipboard.writeText(i18n.t('shareCard.headerText') + ':\n\n' + text + '\n\n' + i18n.t('shareCard.wakeupLabel') + ': ' + this.wakeupTime);
        this.notify(i18n.t('shareCard.copied') + '!');
    }

    /* ============================================================
       PREMIUM FEATURES
       ============================================================ */

    showAIPremiumAd() {
        // Show ad or premium purchase dialog
        alert('AI 루틴 최적화 제안:\n\n' +
            '당신의 루틴을 분석한 결과:\n' +
            '- 아침 7시 기상이 최적입니다\n' +
            '- 총 소요시간을 15분 단축할 수 있습니다\n' +
            '- 운동 후 샤워 순서를 권장합니다');
    }

    /* ============================================================
       MISC
       ============================================================ */

    displayDailyQuote() {
        const quotes = i18n.t('quotes') || [];
        if (quotes.length === 0) return;

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('daily-quote').textContent = randomQuote;
    }

    updateUI() {
        this.updateRoutineList();
        this.updateProgress();
        this.updateTimerSelect();
        this.displayDailyQuote();
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js', { scope: '/routine-planner/' }).catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
        }
    }
}

// Initialize app
let app;
try {
    app = new RoutineApp();
} catch(e) {
    console.error('Init error:', e);
} finally {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('hidden');
        setTimeout(() => loader.remove(), 300);
    }
}

// Failsafe: ensure loader is hidden even if everything above fails
setTimeout(() => { const l = document.getElementById('app-loader'); if (l) { l.classList.add('hidden'); setTimeout(() => l.remove(), 300); } }, 3000);
