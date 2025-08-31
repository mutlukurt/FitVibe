/**
 * UI Manager - Handles all user interface interactions and updates
 */
class UIManager {
    constructor(dataManager, workoutManager) {
        this.dataManager = dataManager;
        this.workoutManager = workoutManager;
        this.currentScreen = 'dashboard';
        this.swipeStartX = 0;
        this.swipeStartY = 0;
        this.isRefreshing = false;
        
        this.initializeEventListeners();
        this.initializeSwipeGestures();
        this.initializePullToRefresh();
        this.initializeModals();
        this.makeCardsInteractive();
    }
    
    // Initialize all event listeners
    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Period selector
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handlePeriodChange(e));
        });
        
        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleActionButton(e));
        });
        
        // Workout cards
        document.querySelectorAll('.category-card, .workout-item').forEach(card => {
            card.addEventListener('click', (e) => this.handleWorkoutSelection(e));
        });
        
        // Menu items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleMenuClick(e));
        });
        
        // Track Walk Button
        const trackWalkBtn = document.getElementById('trackWalkBtn');
        if (trackWalkBtn) {
            trackWalkBtn.addEventListener('click', (e) => this.handleTrackWalkClick(e));
        }
        
        // Profile Menu Button
        const profileMenuBtn = document.getElementById('profileMenuBtn');
        if (profileMenuBtn) {
            profileMenuBtn.addEventListener('click', (e) => this.handleProfileMenuClick(e));
        }
        
        // Dashboard cards (make clickable)
        document.querySelectorAll('.stat-card, .achievement-card, .streak-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleDashboardCardClick(e));
        });
        
        // FAB
        const fab = document.getElementById('fab');
        if (fab) {
            fab.addEventListener('click', (e) => this.handleFABClick(e));
        }
        
        // Activity cards for manual input and detailed view
        document.querySelectorAll('.activity-card').forEach(card => {
            card.addEventListener('click', (e) => this.handleActivityCardClick(e));
            card.addEventListener('dblclick', (e) => this.handleActivityCardDoubleClick(e));
        });
        
        // Listen for workout updates
        document.addEventListener('workoutUpdate', (e) => this.handleWorkoutUpdate(e));
        
        // Listen for data changes
        document.addEventListener('dataUpdate', (e) => this.handleDataUpdate(e));
        
        // Form submissions
        document.addEventListener('submit', (e) => this.handleFormSubmit(e));
        
        // Notification permissions
        this.requestNotificationPermission();
    }
    
    // Initialize swipe gestures
    initializeSwipeGestures() {
        let startX = 0;
        let startY = 0;
        
        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            // Horizontal swipe detection
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    this.navigateScreen('next');
                } else {
                    this.navigateScreen('prev');
                }
            }
            
            startX = 0;
            startY = 0;
        }, { passive: true });
    }
    
    // Initialize pull-to-refresh
    initializePullToRefresh() {
        let startY = 0;
        let isPulling = false;
        
        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        }, { passive: true });
        
        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;
            
            const currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;
            
            if (pullDistance > 100 && !this.isRefreshing) {
                this.triggerRefresh();
            }
        }, { passive: true });
        
        document.addEventListener('touchend', () => {
            isPulling = false;
            startY = 0;
        }, { passive: true });
    }
    
    // Initialize modal system
    initializeModals() {
        // Close modals when clicking backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-backdrop')) {
                this.closeAllModals();
            }
        });
        
        // Close modals with escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // Handle navigation
    handleNavigation(e) {
        const screenName = e.currentTarget.dataset.screen;
        this.showScreen(screenName);
        this.setActiveNavItem(e.currentTarget);
        this.currentScreen = screenName;
    }
    
    // Handle period change
    handlePeriodChange(e) {
        const period = e.currentTarget.dataset.period;
        document.querySelectorAll('.period-btn').forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.updateProgressData(period);
    }
    
    // Handle action buttons
    handleActionButton(e) {
        this.addRippleEffect(e.currentTarget);
        const buttonText = e.currentTarget.querySelector('span').textContent;
        
        switch (buttonText) {
            case 'Start Workout':
                this.showWorkoutSelection();
                break;
            case 'Track Walk':
                this.startWalkTracking();
                break;
            default:
                this.showNotification(`${buttonText} clicked!`);
        }
    }
    
    // Handle workout selection
    handleWorkoutSelection(e) {
        this.addRippleEffect(e.currentTarget);
        const workoutName = e.currentTarget.querySelector('h3').textContent;
        
        if (e.currentTarget.classList.contains('category-card')) {
            this.showWorkoutsByCategory(workoutName);
        } else {
            this.startWorkout(workoutName);
        }
    }
    
    // Handle menu clicks - Instant Response
    handleMenuClick(e) {
        this.addRippleEffect(e.currentTarget);
        const menuText = e.currentTarget.querySelector('.menu-content span').textContent;
        
        switch (menuText) {
            case 'Goals & Targets':
                this.showGoalsModal();
                break;
            case 'Health Data':
                this.showHealthProfileForm();
                break;
            case 'Activity History':
                this.showActivityHistoryScreen();
                break;
            case 'Friends':
                this.showFriendsScreen();
                break;
            case 'Challenges':
                this.showChallengesScreen();
                break;
            case 'Notifications':
                this.showNotificationSettingsScreen();
                break;
            case 'Privacy':
                this.showPrivacySettingsScreen();
                break;
            case 'Help & Support':
                this.showHelpSupportScreen();
                break;
            default:
                this.showNotification(`Opening ${menuText}...`);
        }
    }
    
    // Show Health Data Screen
    showHealthDataScreen() {
        const modal = this.createModal('health-data', 'Health Data', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const profile = this.dataManager.getUserProfile();
        const bmiData = this.dataManager.calculateBMI();
        const bmrData = this.dataManager.calculateBMR();
        
        content.innerHTML = `
            <div class="health-data-screen">
                <div class="health-metrics">
                    <div class="metric-card">
                        <div class="metric-header">
                            <i data-lucide="user"></i>
                            <h3>Body Metrics</h3>
                        </div>
                        <div class="metric-values">
                            <div class="metric-item">
                                <span class="metric-label">Height</span>
                                <span class="metric-value">${profile.height} cm</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Weight</span>
                                <span class="metric-value">${profile.weight} kg</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Age</span>
                                <span class="metric-value">${profile.age} years</span>
                            </div>
                        </div>
                        <button class="btn-secondary btn-small edit-profile-btn">
                            <i data-lucide="edit"></i>
                            Edit Profile
                        </button>
                    </div>
                    
                    ${bmiData ? `
                    <div class="metric-card">
                        <div class="metric-header">
                            <i data-lucide="activity"></i>
                            <h3>BMI Analysis</h3>
                        </div>
                        <div class="bmi-display">
                            <div class="bmi-value">
                                <span class="large-number">${bmiData.value}</span>
                                <span class="bmi-category ${bmiData.category.color}">${bmiData.category.name}</span>
                            </div>
                            <div class="bmi-range">
                                <span>Healthy range: ${bmiData.healthyRange.min}-${bmiData.healthyRange.max} kg</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    
                    ${bmrData ? `
                    <div class="metric-card">
                        <div class="metric-header">
                            <i data-lucide="flame"></i>
                            <h3>Metabolism</h3>
                        </div>
                        <div class="metabolism-data">
                            <div class="metric-item">
                                <span class="metric-label">BMR (Basal Metabolic Rate)</span>
                                <span class="metric-value">${bmrData.bmr} cal/day</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">TDEE (Total Daily Energy)</span>
                                <span class="metric-value">${bmrData.tdee} cal/day</span>
                            </div>
                            <div class="activity-level">
                                <span class="metric-label">Activity Level</span>
                                <span class="metric-value">${bmrData.activityLevel}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="health-actions">
                    <button class="btn-primary health-action-btn" data-action="body-measurements">
                        <i data-lucide="ruler"></i>
                        Body Measurements
                    </button>
                    <button class="btn-primary health-action-btn" data-action="medical-info">
                        <i data-lucide="heart"></i>
                        Medical Info
                    </button>
                    <button class="btn-primary health-action-btn" data-action="export-data">
                        <i data-lucide="download"></i>
                        Export Data
                    </button>
                </div>
            </div>
        `;
        
        this.setupHealthDataListeners(content, modal);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Setup Health Data Listeners
    setupHealthDataListeners(content, modal) {
        const editProfileBtn = content.querySelector('.edit-profile-btn');
        const healthActionBtns = content.querySelectorAll('.health-action-btn');
        
        editProfileBtn.addEventListener('click', () => {
            modal.remove();
            this.showEditProfileModal();
        });
        
        healthActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleHealthAction(action, modal);
            });
        });
    }
    
    // Handle Health Actions
    handleHealthAction(action, parentModal) {
        switch (action) {
            case 'body-measurements':
                this.showBodyMeasurementsModal();
                break;
            case 'medical-info':
                this.showMedicalInfoModal();
                break;
            case 'export-data':
                this.exportHealthData();
                break;
        }
    }
    
    // Show Activity History Screen
    showActivityHistoryScreen() {
        const modal = this.createModal('activity-history', 'Activity History', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="activity-history-screen">
                <div class="history-filters">
                    <div class="filter-tabs">
                        <button class="filter-tab active" data-filter="all">All</button>
                        <button class="filter-tab" data-filter="workouts">Workouts</button>
                        <button class="filter-tab" data-filter="activities">Activities</button>
                        <button class="filter-tab" data-filter="achievements">Achievements</button>
                    </div>
                    <div class="date-range">
                        <input type="date" class="date-input" id="start-date" value="${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
                        <span>to</span>
                        <input type="date" class="date-input" id="end-date" value="${new Date().toISOString().split('T')[0]}">
                    </div>
                </div>
                
                <div class="history-content">
                    <div class="history-stats">
                        <div class="stat-item">
                            <span class="stat-number">${this.getActivityCount('workouts')}</span>
                            <span class="stat-label">Workouts</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getActivityCount('activities')}</span>
                            <span class="stat-label">Activities</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-number">${this.getActivityCount('achievements')}</span>
                            <span class="stat-label">Achievements</span>
                        </div>
                    </div>
                    
                    <div class="history-list">
                        ${this.generateHistoryList('all')}
                    </div>
                </div>
            </div>
        `;
        
        this.setupActivityHistoryListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Generate History List
    generateHistoryList(filter) {
        const workouts = this.dataManager.getWorkoutHistory().slice(0, 10);
        const achievements = this.dataManager.getAchievements().slice(0, 10);
        
        let items = [];
        
        if (filter === 'all' || filter === 'workouts') {
            items = items.concat(workouts.map(workout => ({
                type: 'workout',
                date: workout.startTime,
                title: workout.name,
                subtitle: `${workout.duration} min • ${workout.caloriesBurned} cal`,
                icon: 'dumbbell',
                data: workout
            })));
        }
        
        if (filter === 'all' || filter === 'achievements') {
            items = items.concat(achievements.map(achievement => ({
                type: 'achievement',
                date: achievement.timestamp,
                title: achievement.title,
                subtitle: achievement.description,
                icon: achievement.icon,
                data: achievement
            })));
        }
        
        // Sort by date
        items.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        if (items.length === 0) {
            return '<div class="empty-history">No activities found for the selected filter.</div>';
        }
        
        return items.map(item => `
            <div class="history-item" data-type="${item.type}">
                <div class="history-icon">
                    <i data-lucide="${item.icon}"></i>
                </div>
                <div class="history-details">
                    <h4>${item.title}</h4>
                    <p>${item.subtitle}</p>
                    <span class="history-date">${this.formatHistoryDate(item.date)}</span>
                </div>
                <button class="history-action" data-id="${item.data.id || item.data.timestamp}">
                    <i data-lucide="chevron-right"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Show Friends Screen
    showFriendsScreen() {
        const modal = this.createModal('friends', 'Friends', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="friends-screen">
                <div class="friends-header">
                    <div class="search-bar">
                        <i data-lucide="search"></i>
                        <input type="text" placeholder="Search friends..." class="search-input">
                    </div>
                    <button class="btn-primary add-friend-btn">
                        <i data-lucide="user-plus"></i>
                        Add Friend
                    </button>
                </div>
                
                <div class="friends-tabs">
                    <button class="friends-tab active" data-tab="friends">Friends (12)</button>
                    <button class="friends-tab" data-tab="requests">Requests (2)</button>
                    <button class="friends-tab" data-tab="suggestions">Suggestions</button>
                </div>
                
                <div class="friends-content">
                    <div class="friends-list">
                        ${this.generateFriendsList()}
                    </div>
                </div>
            </div>
        `;
        
        this.setupFriendsListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Generate Friends List
    generateFriendsList() {
        const friends = [
            { id: 1, name: 'Sarah Johnson', status: 'online', streak: 15, avatar: '👩‍🦰', lastActivity: 'Completed 5K run' },
            { id: 2, name: 'Mike Chen', status: 'offline', streak: 8, avatar: '👨‍💼', lastActivity: 'Strength training session' },
            { id: 3, name: 'Emma Wilson', status: 'online', streak: 22, avatar: '👩‍🎓', lastActivity: 'Yoga class completed' },
            { id: 4, name: 'David Kim', status: 'online', streak: 5, avatar: '👨‍💻', lastActivity: 'Morning walk' }
        ];
        
        return friends.map(friend => `
            <div class="friend-item">
                <div class="friend-avatar ${friend.status}">
                    <span class="avatar-emoji">${friend.avatar}</span>
                    <div class="status-indicator"></div>
                </div>
                <div class="friend-info">
                    <h4>${friend.name}</h4>
                    <p class="friend-activity">${friend.lastActivity}</p>
                    <div class="friend-streak">
                        <i data-lucide="flame"></i>
                        <span>${friend.streak} day streak</span>
                    </div>
                </div>
                <div class="friend-actions">
                    <button class="btn-icon-only btn-small" title="Message">
                        <i data-lucide="message-circle"></i>
                    </button>
                    <button class="btn-icon-only btn-small" title="Challenge">
                        <i data-lucide="zap"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Show Challenges Screen
    showChallengesScreen() {
        const modal = this.createModal('challenges', 'Challenges', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="challenges-screen">
                <div class="challenges-header">
                    <div class="challenge-stats">
                        <div class="stat-card">
                            <span class="stat-number">3</span>
                            <span class="stat-label">Active</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">12</span>
                            <span class="stat-label">Completed</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number">1</span>
                            <span class="stat-label">Won</span>
                        </div>
                    </div>
                    <button class="btn-primary create-challenge-btn">
                        <i data-lucide="plus"></i>
                        Create Challenge
                    </button>
                </div>
                
                <div class="challenges-tabs">
                    <button class="challenge-tab active" data-tab="active">Active</button>
                    <button class="challenge-tab" data-tab="available">Available</button>
                    <button class="challenge-tab" data-tab="completed">Completed</button>
                </div>
                
                <div class="challenges-content">
                    ${this.generateChallengesList('active')}
                </div>
            </div>
        `;
        
        this.setupChallengesListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Generate Challenges List
    generateChallengesList(type) {
        const challenges = {
            active: [
                { id: 1, title: '10K Steps Challenge', participants: 5, progress: 75, timeLeft: '2 days', prize: '🏆 Gold Badge' },
                { id: 2, title: 'Weekly Workout Warrior', participants: 12, progress: 60, timeLeft: '4 days', prize: '💎 Premium Features' },
                { id: 3, title: 'Hydration Hero', participants: 8, progress: 90, timeLeft: '1 day', prize: '🎖️ Achievement Badge' }
            ],
            available: [
                { id: 4, title: 'Marathon Month', participants: 0, difficulty: 'Hard', duration: '30 days', prize: '🏅 Special Badge' },
                { id: 5, title: 'Strength Builder', participants: 3, difficulty: 'Medium', duration: '14 days', prize: '💪 Strength Badge' }
            ]
        };
        
        const list = challenges[type] || [];
        
        if (list.length === 0) {
            return '<div class="empty-challenges">No challenges available.</div>';
        }
        
        return `
            <div class="challenges-list">
                ${list.map(challenge => `
                    <div class="challenge-card">
                        <div class="challenge-header">
                            <h3>${challenge.title}</h3>
                            <div class="challenge-participants">
                                <i data-lucide="users"></i>
                                <span>${challenge.participants} participants</span>
                            </div>
                        </div>
                        
                        ${type === 'active' ? `
                            <div class="challenge-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${challenge.progress}%"></div>
                                </div>
                                <div class="progress-info">
                                    <span>${challenge.progress}% complete</span>
                                    <span class="time-left">${challenge.timeLeft} left</span>
                                </div>
                            </div>
                        ` : `
                            <div class="challenge-info">
                                <div class="challenge-difficulty ${challenge.difficulty.toLowerCase()}">${challenge.difficulty}</div>
                                <div class="challenge-duration">${challenge.duration}</div>
                            </div>
                        `}
                        
                        <div class="challenge-footer">
                            <div class="challenge-prize">${challenge.prize}</div>
                            <button class="btn-primary btn-small ${type === 'active' ? 'view-btn' : 'join-btn'}" data-id="${challenge.id}">
                                ${type === 'active' ? 'View Details' : 'Join Challenge'}
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    // Show Notification Settings Screen
    showNotificationSettingsScreen() {
        const modal = this.createModal('notification-settings', 'Notification Settings', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const settings = this.dataManager.getSettings();
        
        content.innerHTML = `
            <div class="settings-screen">
                <div class="settings-section">
                    <h3>Workout Reminders</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Daily Workout Reminder</span>
                            <span class="setting-description">Get reminded to work out every day</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.notifications.workoutReminders ? 'checked' : ''} data-setting="workoutReminders">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Rest Day Reminder</span>
                            <span class="setting-description">Reminder to take rest days</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" data-setting="restDayReminders">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Health Reminders</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Water Intake Reminder</span>
                            <span class="setting-description">Stay hydrated throughout the day</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.notifications.waterReminders ? 'checked' : ''} data-setting="waterReminders">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Sleep Reminder</span>
                            <span class="setting-description">Get reminded about bedtime</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.notifications.sleepReminders ? 'checked' : ''} data-setting="sleepReminders">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Achievement Notifications</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Achievement Alerts</span>
                            <span class="setting-description">Get notified when you earn achievements</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.notifications.achievementAlerts ? 'checked' : ''} data-setting="achievementAlerts">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Goal Completion</span>
                            <span class="setting-description">Celebrate when you reach your goals</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked data-setting="goalCompletion">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-actions">
                    <button class="btn-secondary test-notification-btn">
                        <i data-lucide="bell"></i>
                        Test Notification
                    </button>
                    <button class="btn-primary save-settings-btn">
                        <i data-lucide="save"></i>
                        Save Settings
                    </button>
                </div>
            </div>
        `;
        
        this.setupNotificationSettingsListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Show Privacy Settings Screen
    showPrivacySettingsScreen() {
        const modal = this.createModal('privacy-settings', 'Privacy Settings', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const settings = this.dataManager.getSettings();
        
        content.innerHTML = `
            <div class="settings-screen">
                <div class="settings-section">
                    <h3>Profile Visibility</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Public Profile</span>
                            <span class="setting-description">Make your profile visible to other users</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.privacy.publicProfile ? 'checked' : ''} data-setting="publicProfile">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Show Activity Status</span>
                            <span class="setting-description">Let friends see when you're active</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" checked data-setting="showActivityStatus">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Sharing</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Share Achievements</span>
                            <span class="setting-description">Allow sharing achievements on social media</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" ${settings.privacy.shareAchievements ? 'checked' : ''} data-setting="shareAchievements">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Workout Data</span>
                            <span class="setting-description">Share workout data with fitness partners</span>
                        </div>
                        <label class="toggle-switch">
                            <input type="checkbox" data-setting="shareWorkoutData">
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                </div>
                
                <div class="settings-section">
                    <h3>Data Management</h3>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Data Export</span>
                            <span class="setting-description">Download all your fitness data</span>
                        </div>
                        <button class="btn-secondary export-data-btn">
                            <i data-lucide="download"></i>
                            Export Data
                        </button>
                    </div>
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-title">Clear Data</span>
                            <span class="setting-description">Permanently delete all your data</span>
                        </div>
                        <button class="btn-secondary clear-data-btn danger">
                            <i data-lucide="trash-2"></i>
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupPrivacySettingsListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Show Help & Support Screen
    showHelpSupportScreen() {
        const modal = this.createModal('help-support', 'Help & Support', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="help-screen">
                <div class="help-search">
                    <div class="search-bar">
                        <i data-lucide="search"></i>
                        <input type="text" placeholder="Search for help..." class="search-input">
                    </div>
                </div>
                
                <div class="help-categories">
                    <div class="help-category">
                        <div class="category-header">
                            <i data-lucide="help-circle"></i>
                            <h3>Getting Started</h3>
                        </div>
                        <div class="help-items">
                            <div class="help-item">
                                <span>How to set up your profile</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Setting fitness goals</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Understanding the dashboard</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-category">
                        <div class="category-header">
                            <i data-lucide="activity"></i>
                            <h3>Tracking Activities</h3>
                        </div>
                        <div class="help-items">
                            <div class="help-item">
                                <span>Logging workouts</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Step tracking accuracy</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Manual data entry</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="help-category">
                        <div class="category-header">
                            <i data-lucide="users"></i>
                            <h3>Social Features</h3>
                        </div>
                        <div class="help-items">
                            <div class="help-item">
                                <span>Adding friends</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Joining challenges</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                            <div class="help-item">
                                <span>Sharing achievements</span>
                                <i data-lucide="chevron-right"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="help-contact">
                    <h3>Still need help?</h3>
                    <div class="contact-options">
                        <button class="btn-primary contact-btn" data-type="email">
                            <i data-lucide="mail"></i>
                            Email Support
                        </button>
                        <button class="btn-primary contact-btn" data-type="chat">
                            <i data-lucide="message-circle"></i>
                            Live Chat
                        </button>
                        <button class="btn-secondary contact-btn" data-type="faq">
                            <i data-lucide="book-open"></i>
                            View FAQ
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.setupHelpSupportListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Handle workout category clicks
    handleWorkoutCategoryClick(e) {
        this.addRippleEffect(e.currentTarget);
        const categoryName = e.currentTarget.querySelector('h3').textContent;
        this.showWorkoutCategoryScreen(categoryName);
    }
    
    // Show Workout Category Screen
    showWorkoutCategoryScreen(categoryName) {
        const modal = this.createModal('workout-category', categoryName, true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const categoryWorkouts = this.getWorkoutsByCategory(categoryName.toLowerCase());
        
        content.innerHTML = `
            <div class="workout-category-screen">
                <div class="category-header">
                    <div class="category-info">
                        <h2>${categoryName}</h2>
                        <p>${this.getCategoryDescription(categoryName)}</p>
                    </div>
                    <div class="category-stats">
                        <div class="stat">
                            <span class="stat-number">${categoryWorkouts.length}</span>
                            <span class="stat-label">Workouts</span>
                        </div>
                        <div class="stat">
                            <span class="stat-number">${this.getCategoryDifficulty(categoryName)}</span>
                            <span class="stat-label">Difficulty</span>
                        </div>
                    </div>
                </div>
                
                <div class="workout-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="beginner">Beginner</button>
                    <button class="filter-btn" data-filter="intermediate">Intermediate</button>
                    <button class="filter-btn" data-filter="advanced">Advanced</button>
                </div>
                
                <div class="workouts-grid">
                    ${categoryWorkouts.map(workout => `
                        <div class="workout-card" data-workout-id="${workout.id}">
                            <div class="workout-image">
                                <div class="workout-difficulty ${workout.difficulty}">${workout.difficulty}</div>
                                <div class="workout-duration">
                                    <i data-lucide="clock"></i>
                                    <span>${workout.estimatedDuration || '30'} min</span>
                                </div>
                            </div>
                            <div class="workout-info">
                                <h3>${workout.name}</h3>
                                <p>${workout.description || workout.instructions}</p>
                                <div class="workout-stats">
                                    <div class="stat">
                                        <i data-lucide="flame"></i>
                                        <span>${workout.caloriesPerMinute * (workout.estimatedDuration || 30)} cal</span>
                                    </div>
                                    <div class="stat">
                                        <i data-lucide="target"></i>
                                        <span>${workout.muscleGroups.join(', ')}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="workout-actions">
                                <button class="btn-secondary btn-small preview-btn" data-workout="${workout.id}">
                                    <i data-lucide="eye"></i>
                                    Preview
                                </button>
                                <button class="btn-primary btn-small start-btn" data-workout="${workout.id}">
                                    <i data-lucide="play"></i>
                                    Start
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        this.setupWorkoutCategoryListeners(content);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Utility functions for the new screens
    getActivityCount(type) {
        switch (type) {
            case 'workouts':
                return this.dataManager.getWorkoutHistory().length;
            case 'activities':
                return Object.keys(this.dataManager.getFromStorage('fittracker_daily_activities') || {}).length;
            case 'achievements':
                return this.dataManager.getAchievements().length;
            default:
                return 0;
        }
    }
    
    formatHistoryDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;
        return date.toLocaleDateString();
    }
    
    getWorkoutsByCategory(category) {
        const exercises = this.workoutManager.getExercisesByCategory(category);
        return exercises.map(exercise => ({
            ...exercise,
            estimatedDuration: 30,
            description: exercise.instructions
        }));
    }
    
    getCategoryDescription(category) {
        const descriptions = {
            'Strength': 'Build muscle and increase power with resistance training',
            'Cardio': 'Improve cardiovascular health and endurance',
            'Yoga': 'Enhance flexibility, balance, and mindfulness',
            'HIIT': 'High-intensity workouts for maximum calorie burn'
        };
        return descriptions[category] || 'Effective workouts to reach your fitness goals';
    }
    
    getCategoryDifficulty(category) {
        const difficulties = {
            'Strength': 'Medium',
            'Cardio': 'Easy',
            'Yoga': 'Easy',
            'HIIT': 'Hard'
        };
        return difficulties[category] || 'Medium';
    }
    
    // Handle FAB click
    handleFABClick(e) {
        this.addRippleEffect(e.currentTarget);
        this.showQuickActionModal();
    }
    
    // Show quick action modal
    showQuickActionModal() {
        const modal = this.createModal('quick-actions', 'Quick Add');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="quick-actions-grid">
                <button class="quick-action-card" data-action="workout">
                    <div class="quick-action-icon">
                        <i data-lucide="dumbbell"></i>
                    </div>
                    <h3>Start Workout</h3>
                    <p>Begin a new workout session</p>
                </button>
                
                <button class="quick-action-card" data-action="steps">
                    <div class="quick-action-icon">
                        <i data-lucide="footprints"></i>
                    </div>
                    <h3>Log Steps</h3>
                    <p>Manually add step count</p>
                </button>
                
                <button class="quick-action-card" data-action="water">
                    <div class="quick-action-icon">
                        <i data-lucide="droplets"></i>
                    </div>
                    <h3>Add Water</h3>
                    <p>Log water intake</p>
                </button>
                
                <button class="quick-action-card" data-action="exercise">
                    <div class="quick-action-icon">
                        <i data-lucide="zap"></i>
                    </div>
                    <h3>Quick Exercise</h3>
                    <p>Log a quick activity</p>
                </button>
            </div>
        `;
        
        // Add event listeners for quick actions
        content.querySelectorAll('.quick-action-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                modal.remove();
                this.handleQuickAction(action);
            });
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Handle quick actions
    handleQuickAction(action) {
        switch (action) {
            case 'workout':
                this.showWorkoutSelection();
                break;
            case 'steps':
                this.showStepsLogModal();
                break;
            case 'water':
                this.showWaterLogModal();
                break;
            case 'exercise':
                this.showQuickExerciseModal();
                break;
        }
    }
    
    // Show steps logging modal
    showStepsLogModal() {
        const modal = this.createModal('log-steps', 'Log Steps');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <form data-type="log-steps" class="log-form">
                <div class="form-group">
                    <label for="steps-count">Number of Steps:</label>
                    <input type="number" id="steps-count" name="steps" required min="1" max="50000" placeholder="Enter steps...">
                </div>
                <div class="form-group">
                    <label for="steps-date">Date:</label>
                    <input type="date" id="steps-date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Log Steps</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Show water logging modal
    showWaterLogModal() {
        const modal = this.createModal('log-water', 'Add Water');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <form data-type="log-water" class="log-form">
                <div class="form-group">
                    <label for="water-amount">Glasses of Water:</label>
                    <input type="number" id="water-amount" name="glasses" required min="0.5" max="20" step="0.5" value="1" placeholder="Enter glasses...">
                </div>
                <div class="form-group">
                    <label for="water-date">Date:</label>
                    <input type="date" id="water-date" name="date" value="${new Date().toISOString().split('T')[0]}" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Add Water</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Show quick exercise modal
    showQuickExerciseModal() {
        const modal = this.createModal('quick-exercise', 'Quick Exercise');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <form data-type="quick-exercise" class="log-form">
                <div class="form-group">
                    <label for="exercise-type">Exercise Type:</label>
                    <select id="exercise-type" name="exerciseType" required>
                        <option value="">Select exercise...</option>
                        <option value="walking">Walking</option>
                        <option value="running">Running</option>
                        <option value="cycling">Cycling</option>
                        <option value="swimming">Swimming</option>
                        <option value="yoga">Yoga</option>
                        <option value="strength">Strength Training</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="exercise-duration">Duration (minutes):</label>
                    <input type="number" id="exercise-duration" name="duration" required min="1" max="480" placeholder="Enter minutes...">
                </div>
                <div class="form-group">
                    <label for="exercise-calories">Calories Burned (optional):</label>
                    <input type="number" id="exercise-calories" name="calories" min="1" max="2000" placeholder="Auto-calculated if empty">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Log Exercise</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Handle activity card click for detailed view
    handleActivityCardClick(e) {
        e.preventDefault();
        const cardTitle = e.currentTarget.querySelector('.card-title').textContent;
        this.showActivityDetailModal(cardTitle);
    }
    
    // Handle activity card double click for manual input
    handleActivityCardDoubleClick(e) {
        e.preventDefault();
        const cardTitle = e.currentTarget.querySelector('.card-title').textContent;
        this.showManualInputModal(cardTitle);
    }
    
    // Show activity detail modal
    showActivityDetailModal(activityType) {
        const modal = this.createModal('activity-detail', `${activityType} Details`);
        const content = modal.querySelector('.modal-body');
        
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        const goals = this.dataManager.getGoals();
        
        let current, goal, unit, percentage;
        
        switch (activityType.toLowerCase()) {
            case 'steps':
                current = activities?.steps || 0;
                goal = goals.daily.steps;
                unit = 'steps';
                break;
            case 'calories':
                current = activities?.calories || 0;
                goal = goals.daily.calories;
                unit = 'calories';
                break;
            case 'distance':
                current = activities?.distance || 0;
                goal = goals.daily.distance;
                unit = 'km';
                break;
            case 'active time':
                current = activities?.activeMinutes || 0;
                goal = goals.daily.activeMinutes;
                unit = 'minutes';
                break;
            default:
                current = 0;
                goal = 100;
                unit = 'units';
        }
        
        percentage = Math.round((current / goal) * 100);
        
        content.innerHTML = `
            <div class="activity-detail-content">
                <div class="detail-stats">
                    <div class="detail-current">
                        <span class="detail-number">${current.toLocaleString()}</span>
                        <span class="detail-unit">${unit}</span>
                    </div>
                    <div class="detail-progress">
                        <div class="circular-progress">
                            <svg class="progress-ring" width="120" height="120">
                                <circle class="ring-bg" cx="60" cy="60" r="50"></circle>
                                <circle class="ring-fill" cx="60" cy="60" r="50" 
                                        style="stroke-dasharray: ${2 * Math.PI * 50}; 
                                               stroke-dashoffset: ${2 * Math.PI * 50 * (1 - percentage / 100)};"></circle>
                            </svg>
                            <div class="progress-text">
                                <span class="progress-percentage">${percentage}%</span>
                                <span class="progress-label">of goal</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-goal">
                        <span class="goal-label">Goal:</span>
                        <span class="goal-value">${goal.toLocaleString()} ${unit}</span>
                    </div>
                </div>
                
                <div class="detail-actions">
                    <button class="btn-secondary edit-goal-btn" data-activity="${activityType.toLowerCase()}">
                        <i data-lucide="edit"></i>
                        Edit Goal
                    </button>
                    <button class="btn-primary log-activity-btn" data-activity="${activityType.toLowerCase()}">
                        <i data-lucide="plus"></i>
                        Log ${activityType}
                    </button>
                </div>
                
                <div class="recent-logs">
                    <h3>Recent Entries</h3>
                    <div class="logs-list">
                        ${this.getRecentActivityLogs(activityType.toLowerCase())}
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        const editGoalBtn = content.querySelector('.edit-goal-btn');
        const logActivityBtn = content.querySelector('.log-activity-btn');
        
        editGoalBtn.addEventListener('click', () => {
            modal.remove();
            this.showGoalEditModal(activityType.toLowerCase());
        });
        
        logActivityBtn.addEventListener('click', () => {
            modal.remove();
            this.showManualInputModal(activityType);
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Get recent activity logs
    getRecentActivityLogs(activityType) {
        const logs = [];
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const activities = this.dataManager.getDailyActivities(dateStr);
            
            if (activities) {
                let value = 0;
                switch (activityType) {
                    case 'steps':
                        value = activities.steps || 0;
                        break;
                    case 'calories':
                        value = activities.calories || 0;
                        break;
                    case 'distance':
                        value = activities.distance || 0;
                        break;
                    case 'active time':
                        value = activities.activeMinutes || 0;
                        break;
                }
                
                if (value > 0) {
                    logs.push({
                        date: dateStr,
                        value: value,
                        displayDate: i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    });
                }
            }
        }
        
        if (logs.length === 0) {
            return '<p class="no-logs">No recent entries found</p>';
        }
        
        return logs.map(log => `
            <div class="log-entry">
                <span class="log-date">${log.displayDate}</span>
                <span class="log-value">${log.value.toLocaleString()}</span>
                <button class="log-delete-btn" data-date="${log.date}" data-activity="${activityType}">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `).join('');
    }
    
    // Show goal edit modal
    showGoalEditModal(activityType) {
        const modal = this.createModal('edit-goal', 'Edit Goal');
        const content = modal.querySelector('.modal-body');
        
        const goals = this.dataManager.getGoals();
        let currentGoal, unit, label;
        
        switch (activityType) {
            case 'steps':
                currentGoal = goals.daily.steps;
                unit = 'steps';
                label = 'Daily Steps Goal';
                break;
            case 'calories':
                currentGoal = goals.daily.calories;
                unit = 'calories';
                label = 'Daily Calories Goal';
                break;
            case 'distance':
                currentGoal = goals.daily.distance;
                unit = 'km';
                label = 'Daily Distance Goal';
                break;
            case 'active time':
                currentGoal = goals.daily.activeMinutes;
                unit = 'minutes';
                label = 'Daily Active Minutes Goal';
                break;
        }
        
        content.innerHTML = `
            <form data-type="edit-goal" class="goal-edit-form">
                <input type="hidden" name="activityType" value="${activityType}">
                <div class="form-group">
                    <label for="goal-value">${label}:</label>
                    <input type="number" id="goal-value" name="goalValue" value="${currentGoal}" 
                           required min="1" step="${unit === 'km' ? '0.1' : '1'}">
                    <span class="input-unit">${unit}</span>
                </div>
                <div class="goal-suggestions">
                    <h4>Quick Select:</h4>
                    <div class="suggestion-buttons">
                        ${this.getGoalSuggestions(activityType, currentGoal)}
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Goal</button>
                </div>
            </form>
        `;
        
        // Add event listeners for suggestion buttons
        content.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const goalInput = content.querySelector('#goal-value');
                goalInput.value = btn.dataset.value;
                
                // Update visual feedback
                content.querySelectorAll('.suggestion-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Get goal suggestions
    getGoalSuggestions(activityType, currentGoal) {
        let suggestions = [];
        
        switch (activityType) {
            case 'steps':
                suggestions = [5000, 8000, 10000, 12000, 15000];
                break;
            case 'calories':
                suggestions = [1500, 2000, 2500, 3000, 3500];
                break;
            case 'distance':
                suggestions = [3, 5, 8, 10, 15];
                break;
            case 'active time':
                suggestions = [30, 45, 60, 90, 120];
                break;
        }
        
        return suggestions.map(value => `
            <button type="button" class="suggestion-btn ${value === currentGoal ? 'active' : ''}" 
                    data-value="${value}">
                ${value.toLocaleString()}
            </button>
        `).join('');
    }
    
    // Handle workout updates
    handleWorkoutUpdate(e) {
        const { workout, elapsedTime, formattedTime, isPaused } = e.detail;
        this.updateWorkoutUI(workout, formattedTime, isPaused);
    }
    
    // Handle data updates
    handleDataUpdate(e) {
        const { type, data } = e.detail;
        
        switch (type) {
            case 'dailyActivity':
                this.updateDashboard();
                break;
            case 'goal':
                this.updateProgressRings();
                break;
            case 'workout':
                this.updateWorkoutHistory();
                break;
        }
    }
    
    // Handle form submissions
    handleFormSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Validate form data
        const validation = this.validateForm(form, data);
        if (!validation.isValid) {
            this.showFormErrors(form, validation.errors);
            return;
        }
        
        // Process form based on type
        const formType = form.dataset.type;
        this.processForm(formType, data);
    }
    
    // Show screen with animation
    showScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen with delay for animation
        setTimeout(() => {
            const targetScreen = document.getElementById(screenName);
            if (targetScreen) {
                targetScreen.classList.add('active');
                this.currentScreen = screenName;
                this.triggerScreenAnimations(screenName);
            }
        }, 100);
    }
    
    // Set active navigation item
    setActiveNavItem(activeItem) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        activeItem.classList.add('active');
    }
    
    // Navigate between screens
    navigateScreen(direction) {
        const screens = ['dashboard', 'workout', 'progress', 'profile'];
        const currentIndex = screens.indexOf(this.currentScreen);
        let newIndex;
        
        if (direction === 'next') {
            newIndex = (currentIndex + 1) % screens.length;
        } else {
            newIndex = (currentIndex - 1 + screens.length) % screens.length;
        }
        
        const newScreen = screens[newIndex];
        this.showScreen(newScreen);
        this.setActiveNavItem(document.querySelector(`[data-screen="${newScreen}"]`));
    }
    
    // Trigger screen-specific animations
    triggerScreenAnimations(screenName) {
        switch (screenName) {
            case 'dashboard':
                this.animateDashboard();
                break;
            case 'workout':
                this.animateWorkoutScreen();
                break;
            case 'progress':
                this.animateProgressScreen();
                break;
            case 'profile':
                this.animateProfileScreen();
                break;
        }
    }
    
    // Update dashboard with real data
    updateDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        const goals = this.dataManager.getGoals();
        
        if (!activities || !goals) return;
        
        // Update activity cards
        this.updateActivityCard('steps', activities.steps, goals.daily.steps);
        this.updateActivityCard('calories', activities.calories, goals.daily.calories);
        this.updateActivityCard('distance', activities.distance, goals.daily.distance);
        this.updateActivityCard('activeMinutes', activities.activeMinutes, goals.daily.activeMinutes);
        
        // Update recent activity
        this.updateRecentActivity();
    }
    
    // Update individual activity card
    updateActivityCard(type, current, goal) {
        const card = document.querySelector(`.${type}-card, .activity-card:has(.card-title:contains("${type}"))`);
        if (!card) return;
        
        const counter = card.querySelector('.counter');
        const progressRing = card.querySelector('.ring-progress');
        const percentage = card.querySelector('.ring-percentage');
        
        if (counter) {
            this.animateCounter(counter, current);
        }
        
        if (progressRing && percentage) {
            const progress = Math.min((current / goal) * 100, 100);
            this.animateProgressRing(progressRing, progress);
            percentage.textContent = `${Math.round(progress)}%`;
        }
    }
    
    // Animate counter
    animateCounter(element, target) {
        const start = parseFloat(element.textContent.replace(/,/g, '')) || 0;
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (target - start) * this.easeOutCubic(progress);
            
            if (target < 100) {
                element.textContent = current.toFixed(1);
            } else {
                element.textContent = Math.floor(current).toLocaleString();
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Animate progress ring
    animateProgressRing(ring, targetProgress) {
        const circumference = 2 * Math.PI * 25;
        const currentOffset = parseFloat(ring.style.strokeDashoffset) || circumference;
        const targetOffset = circumference - (targetProgress / 100) * circumference;
        
        const duration = 1000;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const offset = currentOffset + (targetOffset - currentOffset) * this.easeOutCubic(progress);
            ring.style.strokeDashoffset = offset;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    // Easing function
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Update progress data based on period
    updateProgressData(period) {
        // Show loading state
        this.showProgressLoading(true);
        
        setTimeout(() => {
            let stats;
            
            switch (period) {
                case 'week':
                    stats = this.dataManager.getWeeklyStats();
                    break;
                case 'month':
                    stats = this.dataManager.getMonthlyStats();
                    break;
                case 'year':
                    stats = this.dataManager.getMonthlyStats(new Date().getFullYear());
                    break;
                default:
                    stats = this.dataManager.getWeeklyStats();
            }
            
            // Update counters in progress screen
            const counters = document.querySelectorAll('#progress .counter');
            const values = [stats.totalSteps, stats.totalCalories, stats.totalActiveMinutes, stats.totalDistance];
            
            counters.forEach((counter, index) => {
                if (values[index] !== undefined) {
                    this.animateCounter(counter, values[index]);
                }
            });
            
            // Update chart
            this.updateChart(stats, period);
            
            // Update progress overview
            this.updateProgressOverview(stats, period);
            
            // Hide loading state
            this.showProgressLoading(false);
        }, 500); // Simulate loading time
    }
    
    // Show/hide progress loading
    showProgressLoading(show) {
        const progressScreen = document.getElementById('progress');
        if (!progressScreen) return;
        
        if (show) {
            progressScreen.classList.add('loading');
            
            // Add loading overlay if it doesn't exist
            if (!progressScreen.querySelector('.loading-overlay')) {
                const overlay = document.createElement('div');
                overlay.className = 'loading-overlay';
                overlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Updating data...</p>
                    </div>
                `;
                progressScreen.appendChild(overlay);
            }
        } else {
            progressScreen.classList.remove('loading');
            const overlay = progressScreen.querySelector('.loading-overlay');
            if (overlay) {
                overlay.remove();
            }
        }
    }
    
    // Update progress overview
    updateProgressOverview(stats, period) {
        const progressCard = document.querySelector('.progress-card');
        if (!progressCard) return;
        
        const progressValue = progressCard.querySelector('.progress-value');
        const progressFill = progressCard.querySelector('.progress-fill');
        
        if (progressValue && progressFill) {
            let current, goal, unit;
            
            switch (period) {
                case 'week':
                    current = Math.min(stats.workouts || 0, 7);
                    goal = 5;
                    unit = 'workouts';
                    break;
                case 'month':
                    current = Math.min(stats.workouts || 0, 30);
                    goal = 20;
                    unit = 'workouts';
                    break;
                case 'year':
                    current = Math.min(stats.workouts || 0, 365);
                    goal = 200;
                    unit = 'workouts';
                    break;
                default:
                    current = Math.min(stats.workouts || 0, 7);
                    goal = 5;
                    unit = 'workouts';
            }
            
            const percentage = (current / goal) * 100;
            
            progressValue.innerHTML = `
                <span class="large-number">${current}</span>
                <span class="progress-unit">/ ${goal} ${unit}</span>
            `;
            
            progressFill.style.width = `${Math.min(percentage, 100)}%`;
        }
    }
    
    // Update chart
    updateChart(stats, period = 'week') {
        const bars = document.querySelectorAll('.chart-bars .bar');
        const labels = document.querySelectorAll('.chart-labels span');
        
        let data, labelData;
        
        switch (period) {
            case 'week':
                data = stats.steps || [];
                labelData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                break;
            case 'month':
                // Show weekly averages for the month
                data = this.getWeeklyAveragesForMonth(stats);
                labelData = ['W1', 'W2', 'W3', 'W4'];
                break;
            case 'year':
                // Show monthly averages for the year
                data = this.getMonthlyAveragesForYear(stats);
                labelData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                break;
            default:
                data = stats.steps || [];
                labelData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        }
        
        // Update labels
        labels.forEach((label, index) => {
            if (labelData[index]) {
                label.textContent = labelData[index];
            }
        });
        
        // Update bars
        const maxValue = Math.max(...data, 1); // Prevent division by zero
        
        bars.forEach((bar, index) => {
            const value = data[index] || 0;
            const height = (value / maxValue) * 100;
            
            // Reset bar height first
            bar.style.height = '0%';
            
            setTimeout(() => {
                bar.style.height = `${height}%`;
                bar.style.transition = 'height 0.5s ease';
            }, index * 100);
        });
    }
    
    // Get weekly averages for month view
    getWeeklyAveragesForMonth(stats) {
        const data = stats.steps || [];
        const weeklyAverages = [];
        
        for (let week = 0; week < 4; week++) {
            const weekStart = week * 7;
            const weekEnd = Math.min(weekStart + 7, data.length);
            const weekData = data.slice(weekStart, weekEnd);
            const average = weekData.length > 0 ? weekData.reduce((sum, val) => sum + val, 0) / weekData.length : 0;
            weeklyAverages.push(Math.round(average));
        }
        
        return weeklyAverages;
    }
    
    // Get monthly averages for year view
    getMonthlyAveragesForYear(stats) {
        // Simulate monthly data - in a real app this would come from the data manager
        const monthlyData = [];
        const baseValue = (stats.totalSteps || 0) / 12;
        
        for (let month = 0; month < 12; month++) {
            // Add some variation to make it more realistic
            const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
            const value = Math.round(baseValue * (1 + variation));
            monthlyData.push(Math.max(value, 0));
        }
        
        return monthlyData;
    }
    
    // Add ripple effect
    addRippleEffect(element) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = (event?.clientX || rect.left + rect.width / 2) - rect.left - size / 2;
        const y = (event?.clientY || rect.top + rect.height / 2) - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Show notification
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    // Show manual input modal
    showManualInputModal(activityType) {
        const modal = this.createModal('manual-input', 'Manual Input');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <form data-type="manual-input" class="manual-input-form">
                <input type="hidden" name="activityType" value="${activityType.toLowerCase()}">
                <div class="form-group">
                    <label for="value">Enter ${activityType}:</label>
                    <input type="number" id="value" name="value" required min="0" step="0.1">
                    <span class="form-unit">${this.getUnitForActivity(activityType)}</span>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Update</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Get unit for activity type
    getUnitForActivity(activityType) {
        const units = {
            'Steps': 'steps',
            'Calories': 'cal',
            'Distance': 'km',
            'Active Time': 'min'
        };
        return units[activityType] || '';
    }
    
    // Show goals modal
    showGoalsModal() {
        const modal = this.createModal('goals', 'Goals & Targets');
        const content = modal.querySelector('.modal-body');
        const goals = this.dataManager.getGoals();
        
        content.innerHTML = `
            <form data-type="goals" class="goals-form">
                <div class="goals-section">
                    <h3>Daily Goals</h3>
                    <div class="form-group">
                        <label for="steps-goal">Steps:</label>
                        <input type="number" id="steps-goal" name="daily.steps" value="${goals.daily.steps}" min="1000" step="100">
                    </div>
                    <div class="form-group">
                        <label for="calories-goal">Calories:</label>
                        <input type="number" id="calories-goal" name="daily.calories" value="${goals.daily.calories}" min="1000" step="50">
                    </div>
                    <div class="form-group">
                        <label for="distance-goal">Distance (km):</label>
                        <input type="number" id="distance-goal" name="daily.distance" value="${goals.daily.distance}" min="1" step="0.5">
                    </div>
                    <div class="form-group">
                        <label for="active-goal">Active Minutes:</label>
                        <input type="number" id="active-goal" name="daily.activeMinutes" value="${goals.daily.activeMinutes}" min="10" step="5">
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn-primary">Save Goals</button>
                </div>
            </form>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Show workout selection modal
    showWorkoutSelection() {
        const modal = this.createModal('workout-selection', 'Choose Workout');
        const content = modal.querySelector('.modal-body');
        const templates = this.workoutManager.getWorkoutTemplates();
        
        let templatesHTML = '';
        Object.entries(templates).forEach(([id, template]) => {
            templatesHTML += `
                <div class="workout-template" data-template="${id}">
                    <div class="template-info">
                        <h3>${template.name}</h3>
                        <p>${template.category} • ${template.duration} min • ${template.difficulty}</p>
                    </div>
                    <button class="btn-primary start-template" data-template="${id}">Start</button>
                </div>
            `;
        });
        
        content.innerHTML = `
            <div class="workout-templates">
                ${templatesHTML}
            </div>
            <div class="custom-workout">
                <button class="btn-secondary create-custom">Create Custom Workout</button>
            </div>
        `;
        
        // Add event listeners
        content.querySelectorAll('.start-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const templateId = e.target.dataset.template;
                this.startWorkoutFromTemplate(templateId);
                modal.remove();
            });
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
    }
    
    // Start workout from template
    startWorkoutFromTemplate(templateId) {
        const template = this.workoutManager.getWorkoutTemplate(templateId);
        if (!template) return;
        
        try {
            const workout = this.workoutManager.startWorkout(template);
            this.showWorkoutInterface(workout);
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }
    
    // Show workout interface
    showWorkoutInterface(workout) {
        const modal = this.createModal('workout-interface', workout.name, false);
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="workout-header">
                <div class="workout-timer">
                    <span class="timer-display">00:00</span>
                    <span class="workout-status">In Progress</span>
                </div>
                <div class="workout-controls">
                    <button class="btn-control pause-btn">
                        <i data-lucide="pause"></i>
                        Pause
                    </button>
                    <button class="btn-control stop-btn">
                        <i data-lucide="square"></i>
                        Stop
                    </button>
                </div>
            </div>
            <div class="current-exercise">
                <h3>Current Exercise</h3>
                <div class="exercise-info">
                    <p>Get ready to start!</p>
                </div>
            </div>
            <div class="workout-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span class="progress-text">0 / ${workout.exercises.length} exercises</span>
            </div>
        `;
        
        // Add event listeners
        const pauseBtn = content.querySelector('.pause-btn');
        const stopBtn = content.querySelector('.stop-btn');
        
        pauseBtn.addEventListener('click', () => {
            const isPaused = this.workoutManager.pauseWorkout();
            pauseBtn.innerHTML = isPaused ? 
                '<i data-lucide="play"></i> Resume' : 
                '<i data-lucide="pause"></i> Pause';
            lucide.createIcons();
        });
        
        stopBtn.addEventListener('click', () => {
            this.endWorkout(modal);
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Update workout UI
    updateWorkoutUI(workout, formattedTime, isPaused) {
        const workoutModal = document.querySelector('.modal[data-modal="workout-interface"]');
        if (!workoutModal) return;
        
        const timerDisplay = workoutModal.querySelector('.timer-display');
        const workoutStatus = workoutModal.querySelector('.workout-status');
        const progressFill = workoutModal.querySelector('.progress-fill');
        const progressText = workoutModal.querySelector('.progress-text');
        
        if (timerDisplay) timerDisplay.textContent = formattedTime;
        if (workoutStatus) workoutStatus.textContent = isPaused ? 'Paused' : 'In Progress';
        
        if (progressFill && progressText) {
            const progress = (workout.completedExercises.length / workout.exercises.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${workout.completedExercises.length} / ${workout.exercises.length} exercises`;
        }
    }
    
    // End workout
    endWorkout(modal) {
        const notes = prompt('Any notes about this workout?') || '';
        const workout = this.workoutManager.endWorkout(notes);
        
        if (workout) {
            modal.remove();
            this.showWorkoutSummary(workout);
            this.updateDashboard();
        }
    }
    
    // Show workout summary
    showWorkoutSummary(workout) {
        const modal = this.createModal('workout-summary', 'Workout Complete!');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="workout-summary">
                <div class="summary-stats">
                    <div class="stat">
                        <i data-lucide="clock"></i>
                        <span class="stat-value">${workout.duration}</span>
                        <span class="stat-label">minutes</span>
                    </div>
                    <div class="stat">
                        <i data-lucide="flame"></i>
                        <span class="stat-value">${workout.caloriesBurned}</span>
                        <span class="stat-label">calories</span>
                    </div>
                    <div class="stat">
                        <i data-lucide="activity"></i>
                        <span class="stat-value">${workout.completedExercises.length}</span>
                        <span class="stat-label">exercises</span>
                    </div>
                </div>
                <div class="summary-message">
                    <h3>Great job!</h3>
                    <p>You've completed your ${workout.name} workout.</p>
                </div>
                <div class="summary-actions">
                    <button class="btn-primary" onclick="this.closest('.modal').remove()">Done</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Create modal
    createModal(id, title, closeable = true) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.dataset.modal = id;
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    ${closeable ? '<button class="modal-close">&times;</button>' : ''}
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        
        if (closeable) {
            const closeBtn = modal.querySelector('.modal-close');
            closeBtn.addEventListener('click', () => modal.remove());
        }
        
        return modal;
    }
    
    // Close all modals
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => modal.remove());
    }
    
    // Trigger refresh
    triggerRefresh() {
        if (this.isRefreshing) return;
        
        this.isRefreshing = true;
        this.showNotification('Refreshing data...', 'info', 1000);
        
        // Simulate refresh delay
        setTimeout(() => {
            this.updateDashboard();
            this.isRefreshing = false;
        }, 1000);
    }
    
    // Process form submissions
    processForm(formType, data) {
        switch (formType) {
            case 'manual-input':
                this.processManualInput(data);
                break;
            case 'goals':
                this.processGoals(data);
                break;
            case 'profile':
                this.processProfile(data);
                break;
            case 'log-steps':
                this.processStepsLog(data);
                break;
            case 'log-water':
                this.processWaterLog(data);
                break;
            case 'quick-exercise':
                this.processQuickExercise(data);
                break;
            case 'edit-goal':
                this.processGoalEdit(data);
                break;
        }
    }
    
    // Process steps logging
    processStepsLog(data) {
        const { steps, date } = data;
        const numSteps = parseInt(steps);
        
        if (isNaN(numSteps) || numSteps < 1) {
            this.showNotification('Please enter a valid number of steps', 'error');
            return;
        }
        
        this.dataManager.updateDailyActivity('steps', numSteps, date);
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification(`${numSteps.toLocaleString()} steps logged successfully!`, 'success');
    }
    
    // Process water logging
    processWaterLog(data) {
        const { glasses, date } = data;
        const numGlasses = parseFloat(glasses);
        
        if (isNaN(numGlasses) || numGlasses < 0.5) {
            this.showNotification('Please enter a valid amount of water', 'error');
            return;
        }
        
        // Add to existing water intake
        const currentWater = this.dataManager.getWaterIntake(date);
        const newTotal = (currentWater.glasses || 0) + numGlasses;
        
        this.dataManager.addWaterIntake(numGlasses, date);
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification(`${numGlasses} glasses of water added!`, 'success');
    }
    
    // Process quick exercise
    processQuickExercise(data) {
        const { exerciseType, duration, calories } = data;
        const numDuration = parseInt(duration);
        let numCalories = calories ? parseInt(calories) : null;
        
        if (isNaN(numDuration) || numDuration < 1) {
            this.showNotification('Please enter a valid duration', 'error');
            return;
        }
        
        // Auto-calculate calories if not provided
        if (!numCalories) {
            const caloriesPerMinute = {
                walking: 4,
                running: 12,
                cycling: 8,
                swimming: 10,
                yoga: 3,
                strength: 6,
                other: 5
            };
            numCalories = Math.round(numDuration * (caloriesPerMinute[exerciseType] || 5));
        }
        
        // Create workout entry
        const workout = {
            name: exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1),
            category: exerciseType === 'strength' ? 'strength' : 'cardio',
            duration: numDuration,
            caloriesBurned: numCalories,
            exercises: [{
                exerciseId: exerciseType,
                duration: numDuration
            }]
        };
        
        this.workoutManager.addWorkout(workout);
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification(`${workout.name} logged successfully!`, 'success');
    }
    
    // Process goal edit
    processGoalEdit(data) {
        const { activityType, goalValue } = data;
        const numValue = parseFloat(goalValue);
        
        if (isNaN(numValue) || numValue < 1) {
            this.showNotification('Please enter a valid goal value', 'error');
            return;
        }
        
        const goals = this.dataManager.getGoals();
        
        switch (activityType) {
            case 'steps':
                goals.daily.steps = parseInt(numValue);
                break;
            case 'calories':
                goals.daily.calories = parseInt(numValue);
                break;
            case 'distance':
                goals.daily.distance = numValue;
                break;
            case 'active time':
                goals.daily.activeMinutes = parseInt(numValue);
                break;
        }
        
        this.dataManager.setGoals(goals);
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification(`${activityType.charAt(0).toUpperCase() + activityType.slice(1)} goal updated!`, 'success');
    }
    
    // Process manual input
    processManualInput(data) {
        const { activityType, value } = data;
        const numValue = parseFloat(value);
        
        if (isNaN(numValue) || numValue < 0) {
            this.showNotification('Please enter a valid number', 'error');
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        this.dataManager.updateDailyActivity(activityType, numValue, today);
        
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification(`${activityType} updated successfully!`, 'success');
    }
    
    // Process goals
    processGoals(data) {
        const goals = this.dataManager.getGoals();
        
        // Update nested goals structure
        Object.entries(data).forEach(([key, value]) => {
            const keys = key.split('.');
            let current = goals;
            
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = parseFloat(value);
        });
        
        this.dataManager.setGoals(goals);
        this.updateDashboard();
        this.closeAllModals();
        this.showNotification('Goals updated successfully!', 'success');
    }
    
    // Validate form
    validateForm(form, data) {
        const errors = [];
        
        // Check required fields
        form.querySelectorAll('[required]').forEach(field => {
            if (!data[field.name] || data[field.name].trim() === '') {
                errors.push(`${field.labels[0]?.textContent || field.name} is required`);
            }
        });
        
        // Check number fields
        form.querySelectorAll('input[type="number"]').forEach(field => {
            const value = parseFloat(data[field.name]);
            const min = parseFloat(field.min);
            const max = parseFloat(field.max);
            
            if (!isNaN(value)) {
                if (!isNaN(min) && value < min) {
                    errors.push(`${field.labels[0]?.textContent || field.name} must be at least ${min}`);
                }
                if (!isNaN(max) && value > max) {
                    errors.push(`${field.labels[0]?.textContent || field.name} must be no more than ${max}`);
                }
            }
        });
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Show form errors
    showFormErrors(form, errors) {
        // Remove existing error messages
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        
        // Show new errors
        errors.forEach(error => {
            this.showNotification(error, 'error');
        });
    }
    
    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
        }
    }
    
    // Show browser notification
    showBrowserNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                ...options
            });
        }
    }
    
    // Animate dashboard elements
    animateDashboard() {
        const cards = document.querySelectorAll('#dashboard .activity-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // Update with real data
        setTimeout(() => this.updateDashboard(), 500);
    }
    
    // Animate workout screen
    animateWorkoutScreen() {
        const categories = document.querySelectorAll('#workout .category-card');
        categories.forEach((category, index) => {
            category.style.opacity = '0';
            category.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                category.style.transition = 'all 0.4s ease';
                category.style.opacity = '1';
                category.style.transform = 'scale(1)';
            }, index * 150);
        });
    }
    
    // Animate progress screen
    animateProgressScreen() {
        this.updateProgressData('week');
        
        const stats = document.querySelectorAll('#progress .stat-card');
        stats.forEach((stat, index) => {
            stat.style.opacity = '0';
            stat.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                stat.style.transition = 'all 0.4s ease';
                stat.style.opacity = '1';
                stat.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    // Animate profile screen
    animateProfileScreen() {
        const menuSections = document.querySelectorAll('#profile .menu-section');
        menuSections.forEach((section, index) => {
            section.style.opacity = '0';
            section.style.transform = 'translateX(-20px)';
            
            setTimeout(() => {
                section.style.transition = 'all 0.4s ease';
                section.style.opacity = '1';
                section.style.transform = 'translateX(0)';
            }, index * 150);
        });
    }
    
    // Update recent activity
    updateRecentActivity() {
        const workoutHistory = this.dataManager.getWorkoutHistory().slice(0, 3);
        const activityList = document.querySelector('.activity-list');
        
        if (!activityList || workoutHistory.length === 0) return;
        
        activityList.innerHTML = workoutHistory.map(workout => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i data-lucide="${this.getWorkoutIcon(workout.category)}"></i>
                </div>
                <div class="activity-details">
                    <h3>${workout.name}</h3>
                    <p>${workout.duration} min • ${workout.caloriesBurned} cal burned</p>
                </div>
                <div class="activity-time">${this.getRelativeTime(workout.startTime)}</div>
            </div>
        `).join('');
        
        lucide.createIcons();
    }
    
    // Get workout icon
    getWorkoutIcon(category) {
        const icons = {
            strength: 'dumbbell',
            cardio: 'heart',
            yoga: 'leaf',
            hiit: 'zap',
            custom: 'activity'
        };
        return icons[category] || 'activity';
    }
    
    // Get relative time
    getRelativeTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return time.toLocaleDateString();
    }
    
    // Handle dashboard card clicks
    handleDashboardCardClick(e) {
        const card = e.currentTarget;
        this.addRippleEffect(card);
        
        if (card.classList.contains('stat-card')) {
            const statType = card.querySelector('.stat-label')?.textContent.toLowerCase();
            this.showStatDetailModal(statType);
        } else if (card.classList.contains('achievement-card')) {
            this.showAchievementDetailModal();
        } else if (card.classList.contains('streak-card')) {
            this.showStreakDetailModal();
        }
    }
    
    // Setup event listeners for new screens
    setupActivityHistoryListeners(content) {
        const filterTabs = content.querySelectorAll('.filter-tab');
        const historyItems = content.querySelectorAll('.history-item');
        const dateInputs = content.querySelectorAll('.date-input');
        
        filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const filter = tab.dataset.filter;
                const historyList = content.querySelector('.history-list');
                historyList.innerHTML = this.generateHistoryList(filter);
                lucide.createIcons();
            });
        });
        
        historyItems.forEach(item => {
            item.addEventListener('click', () => {
                const type = item.dataset.type;
                const id = item.querySelector('.history-action').dataset.id;
                this.showHistoryItemDetail(type, id);
            });
        });
        
        dateInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.filterHistoryByDate();
            });
        });
    }
    
    // Setup Friends Listeners
    setupFriendsListeners(content) {
        const addFriendBtn = content.querySelector('.add-friend-btn');
        const friendTabs = content.querySelectorAll('.friends-tab');
        const searchInput = content.querySelector('.search-input');
        
        addFriendBtn.addEventListener('click', () => {
            this.showAddFriendModal();
        });
        
        friendTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                friendTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.updateFriendsContent(tab.dataset.tab);
            });
        });
        
        searchInput.addEventListener('input', (e) => {
            this.filterFriends(e.target.value);
        });
    }
    
    // Setup Challenges Listeners
    setupChallengesListeners(content) {
        const createChallengeBtn = content.querySelector('.create-challenge-btn');
        const challengeTabs = content.querySelectorAll('.challenge-tab');
        const challengeBtns = content.querySelectorAll('.view-btn, .join-btn');
        
        createChallengeBtn.addEventListener('click', () => {
            this.showCreateChallengeModal();
        });
        
        challengeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                challengeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                const challengesContent = content.querySelector('.challenges-content');
                challengesContent.innerHTML = this.generateChallengesList(tab.dataset.tab);
                lucide.createIcons();
            });
        });
        
        challengeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const challengeId = btn.dataset.id;
                if (btn.classList.contains('view-btn')) {
                    this.showChallengeDetail(challengeId);
                } else {
                    this.joinChallenge(challengeId);
                }
            });
        });
    }
    
    // Setup Notification Settings Listeners
    setupNotificationSettingsListeners(content) {
        const toggleSwitches = content.querySelectorAll('.toggle-switch input');
        const testNotificationBtn = content.querySelector('.test-notification-btn');
        const saveSettingsBtn = content.querySelector('.save-settings-btn');
        
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const setting = toggle.dataset.setting;
                this.updateNotificationSetting(setting, toggle.checked);
            });
        });
        
        testNotificationBtn.addEventListener('click', () => {
            this.testNotification();
        });
        
        saveSettingsBtn.addEventListener('click', () => {
            this.saveNotificationSettings();
        });
    }
    
    // Setup Privacy Settings Listeners
    setupPrivacySettingsListeners(content) {
        const toggleSwitches = content.querySelectorAll('.toggle-switch input');
        const exportDataBtn = content.querySelector('.export-data-btn');
        const clearDataBtn = content.querySelector('.clear-data-btn');
        
        toggleSwitches.forEach(toggle => {
            toggle.addEventListener('change', () => {
                const setting = toggle.dataset.setting;
                this.updatePrivacySetting(setting, toggle.checked);
            });
        });
        
        exportDataBtn.addEventListener('click', () => {
            this.exportUserData();
        });
        
        clearDataBtn.addEventListener('click', () => {
            this.showClearDataConfirmation();
        });
    }
    
    // Setup Help Support Listeners
    setupHelpSupportListeners(content) {
        const helpItems = content.querySelectorAll('.help-item');
        const contactBtns = content.querySelectorAll('.contact-btn');
        const searchInput = content.querySelector('.search-input');
        
        helpItems.forEach(item => {
            item.addEventListener('click', () => {
                const topic = item.querySelector('span').textContent;
                this.showHelpArticle(topic);
            });
        });
        
        contactBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.handleContactSupport(type);
            });
        });
        
        searchInput.addEventListener('input', (e) => {
            this.searchHelp(e.target.value);
        });
    }
    
    // Setup Workout Category Listeners
    setupWorkoutCategoryListeners(content) {
        const filterBtns = content.querySelectorAll('.filter-btn');
        const previewBtns = content.querySelectorAll('.preview-btn');
        const startBtns = content.querySelectorAll('.start-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterWorkouts(btn.dataset.filter);
            });
        });
        
        previewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const workoutId = btn.dataset.workout;
                this.showWorkoutPreview(workoutId);
            });
        });
        
        startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const workoutId = btn.dataset.workout;
                this.startWorkout(workoutId);
            });
        });
    }
    
    // Placeholder methods for new functionality
    showStatDetailModal(statType) {
        this.showNotification(`Opening ${statType} details...`);
    }
    
    showAchievementDetailModal() {
        this.showNotification('Opening achievement details...');
    }
    
    showStreakDetailModal() {
        this.showNotification('Opening streak details...');
    }
    
    showHistoryItemDetail(type, id) {
        this.showNotification(`Opening ${type} details...`);
    }
    
    filterHistoryByDate() {
        this.showNotification('Filtering history by date range...');
    }
    
    showAddFriendModal() {
        this.showNotification('Opening add friend modal...');
    }
    
    updateFriendsContent(tab) {
        this.showNotification(`Switching to ${tab} tab...`);
    }
    
    filterFriends(query) {
        this.showNotification(`Searching friends: ${query}`);
    }
    
    showCreateChallengeModal() {
        this.showNotification('Opening create challenge modal...');
    }
    
    showChallengeDetail(id) {
        this.showNotification(`Opening challenge ${id} details...`);
    }
    
    joinChallenge(id) {
        this.showNotification(`Joining challenge ${id}...`);
    }
    
    updateNotificationSetting(setting, value) {
        const settings = this.dataManager.getSettings();
        settings.notifications[setting] = value;
        this.dataManager.saveSettings(settings);
        this.showNotification(`${setting} ${value ? 'enabled' : 'disabled'}`);
    }
    
    testNotification() {
        this.showBrowserNotification('Test Notification', {
            body: 'This is a test notification from your fitness tracker!',
            icon: '/icon-192.png'
        });
    }
    
    saveNotificationSettings() {
        this.showNotification('Notification settings saved!');
    }
    
    updatePrivacySetting(setting, value) {
        const settings = this.dataManager.getSettings();
        settings.privacy[setting] = value;
        this.dataManager.saveSettings(settings);
        this.showNotification(`Privacy setting updated: ${setting}`);
    }
    
    exportUserData() {
        const data = this.dataManager.exportAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fitness-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Data exported successfully!');
    }
    
    showClearDataConfirmation() {
        const modal = this.createModal('clear-data-confirm', 'Clear All Data', false);
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="confirmation-content">
                <div class="warning-icon">
                    <i data-lucide="alert-triangle"></i>
                </div>
                <h3>Are you sure?</h3>
                <p>This will permanently delete all your fitness data including workouts, achievements, and settings. This action cannot be undone.</p>
                <div class="confirmation-actions">
                    <button class="btn-secondary cancel-btn">Cancel</button>
                    <button class="btn-primary danger confirm-btn">Delete All Data</button>
                </div>
            </div>
        `;
        
        content.querySelector('.cancel-btn').addEventListener('click', () => modal.remove());
        content.querySelector('.confirm-btn').addEventListener('click', () => {
            this.dataManager.clearAllData();
            modal.remove();
            this.showNotification('All data cleared successfully!');
            setTimeout(() => location.reload(), 1000);
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    showHelpArticle(topic) {
        this.showNotification(`Opening help article: ${topic}`);
    }
    
    handleContactSupport(type) {
        switch (type) {
            case 'email':
                window.open('mailto:support@fitnesstracker.com?subject=Support Request');
                break;
            case 'chat':
                this.showNotification('Live chat feature coming soon!');
                break;
            case 'faq':
                this.showNotification('Opening FAQ...');
                break;
        }
    }
    
    searchHelp(query) {
        this.showNotification(`Searching help: ${query}`);
    }
    
    filterWorkouts(filter) {
        this.showNotification(`Filtering workouts by: ${filter}`);
    }
    
    showWorkoutPreview(workoutId) {
        this.showNotification(`Previewing workout ${workoutId}...`);
    }
    
    // Handle Track Walk Button Click
    handleTrackWalkClick(e) {
        this.addRippleEffect(e.currentTarget);
        this.showWalkTimerModal();
    }
    
    // Show Walking Timer Modal
    showWalkTimerModal() {
        const modal = this.createModal('walk-timer', 'Walking Session', true);
        modal.classList.add('walk-timer-modal');
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="walk-timer-content">
                <div class="walk-timer-display">
                    <div class="timer-circle">
                        <div class="timer-progress"></div>
                        <div class="timer-text">00:00</div>
                    </div>
                </div>
                
                <div class="walk-stats">
                    <div class="walk-stat">
                        <span class="walk-stat-value" id="walkSteps">0</span>
                        <span class="walk-stat-label">Steps</span>
                    </div>
                    <div class="walk-stat">
                        <span class="walk-stat-value" id="walkDistance">0.0</span>
                        <span class="walk-stat-label">km</span>
                    </div>
                    <div class="walk-stat">
                        <span class="walk-stat-value" id="walkCalories">0</span>
                        <span class="walk-stat-label">kcal</span>
                    </div>
                </div>
                
                <div class="gps-section">
                    <div class="gps-toggle">
                        <span>GPS Tracking</span>
                        <label class="toggle-switch">
                            <input type="checkbox" id="gpsToggle" checked>
                            <span class="toggle-slider"></span>
                        </label>
                    </div>
                    <div class="gps-status">
                        <div class="gps-indicator" id="gpsIndicator"></div>
                        <span id="gpsStatus">GPS Ready</span>
                    </div>
                    <div class="distance-input-group" id="manualDistanceGroup" style="display: none;">
                        <label class="form-label">Manual Distance Entry</label>
                        <div class="input-with-unit">
                            <input type="number" class="form-input" id="manualDistance" placeholder="0.0" step="0.1" min="0">
                            <span class="input-unit">km</span>
                        </div>
                    </div>
                </div>
                
                <div class="walk-controls">
                    <button class="walk-control-btn play" id="walkPlayBtn" title="Start">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="walk-control-btn pause" id="walkPauseBtn" title="Pause" style="display: none;">
                        <i data-lucide="pause"></i>
                    </button>
                    <button class="walk-control-btn stop" id="walkStopBtn" title="Stop">
                        <i data-lucide="square"></i>
                    </button>
                </div>
            </div>
        `;
        
        this.setupWalkTimerListeners(content, modal);
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));
        lucide.createIcons();
    }
    
    // Setup Walk Timer Listeners
    setupWalkTimerListeners(content, modal) {
        const playBtn = content.querySelector('#walkPlayBtn');
        const pauseBtn = content.querySelector('#walkPauseBtn');
        const stopBtn = content.querySelector('#walkStopBtn');
        const gpsToggle = content.querySelector('#gpsToggle');
        const manualDistanceGroup = content.querySelector('#manualDistanceGroup');
        const gpsIndicator = content.querySelector('#gpsIndicator');
        const gpsStatus = content.querySelector('#gpsStatus');
        
        let walkState = {
            isRunning: false,
            isPaused: false,
            startTime: null,
            pausedTime: 0,
            steps: 0,
            distance: 0,
            calories: 0,
            timer: null,
            gpsEnabled: true
        };
        
        // GPS Toggle
        gpsToggle.addEventListener('change', () => {
            walkState.gpsEnabled = gpsToggle.checked;
            if (walkState.gpsEnabled) {
                manualDistanceGroup.style.display = 'none';
                gpsIndicator.className = 'gps-indicator';
                gpsStatus.textContent = 'GPS Ready';
            } else {
                manualDistanceGroup.style.display = 'block';
                gpsIndicator.className = 'gps-indicator disabled';
                gpsStatus.textContent = 'GPS Disabled';
            }
        });
        
        // Play Button
        playBtn.addEventListener('click', () => {
            if (!walkState.isRunning) {
                this.startWalkSession(walkState, content);
                playBtn.style.display = 'none';
                pauseBtn.style.display = 'flex';
            }
        });
        
        // Pause Button
        pauseBtn.addEventListener('click', () => {
            this.pauseWalkSession(walkState);
            pauseBtn.style.display = 'none';
            playBtn.style.display = 'flex';
        });
        
        // Stop Button
        stopBtn.addEventListener('click', () => {
            this.stopWalkSession(walkState, modal);
        });
    }
    
    // Start Walk Session
    startWalkSession(walkState, content) {
        walkState.isRunning = true;
        walkState.isPaused = false;
        walkState.startTime = walkState.startTime || Date.now();
        
        const gpsIndicator = content.querySelector('#gpsIndicator');
        const gpsStatus = content.querySelector('#gpsStatus');
        
        if (walkState.gpsEnabled) {
            gpsIndicator.className = 'gps-indicator searching';
            gpsStatus.textContent = 'Searching GPS...';
            
            // Simulate GPS lock
            setTimeout(() => {
                gpsIndicator.className = 'gps-indicator';
                gpsStatus.textContent = 'GPS Locked';
            }, 2000);
        }
        
        walkState.timer = setInterval(() => {
            this.updateWalkStats(walkState, content);
        }, 1000);
        
        this.showNotification('Walking session started!');
    }
    
    // Pause Walk Session
    pauseWalkSession(walkState) {
        walkState.isRunning = false;
        walkState.isPaused = true;
        walkState.pausedTime += Date.now() - walkState.startTime;
        clearInterval(walkState.timer);
        
        this.showNotification('Walking session paused');
    }
    
    // Stop Walk Session
    stopWalkSession(walkState, modal) {
        walkState.isRunning = false;
        clearInterval(walkState.timer);
        
        // Save walk data
        const walkData = {
            id: `walk_${Date.now()}`,
            type: 'walk',
            startTime: walkState.startTime,
            endTime: Date.now(),
            duration: this.calculateWalkDuration(walkState),
            steps: walkState.steps,
            distance: walkState.distance,
            calories: walkState.calories,
            gpsEnabled: walkState.gpsEnabled
        };
        
        this.dataManager.saveWalkSession(walkData);
        modal.remove();
        this.showNotification(`Walk saved! ${walkState.steps} steps, ${walkState.distance.toFixed(1)}km`);
        this.updateDashboard();
    }
    
    // Update Walk Stats
    updateWalkStats(walkState, content) {
        const duration = this.calculateWalkDuration(walkState);
        const minutes = Math.floor(duration / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
        
        // Update timer display
        const timerText = content.querySelector('.timer-text');
        timerText.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Simulate step counting (1-3 steps per second)
        walkState.steps += Math.floor(Math.random() * 3) + 1;
        
        // Calculate distance (average step length: 0.762 meters)
        if (walkState.gpsEnabled) {
            walkState.distance = (walkState.steps * 0.762) / 1000;
        } else {
            const manualDistance = parseFloat(content.querySelector('#manualDistance').value) || 0;
            walkState.distance = manualDistance;
        }
        
        // Calculate calories (rough estimate: 0.04 cal per step)
        walkState.calories = Math.floor(walkState.steps * 0.04);
        
        // Update display
        content.querySelector('#walkSteps').textContent = walkState.steps;
        content.querySelector('#walkDistance').textContent = walkState.distance.toFixed(1);
        content.querySelector('#walkCalories').textContent = walkState.calories;
    }
    
    // Calculate Walk Duration
    calculateWalkDuration(walkState) {
        if (walkState.isRunning) {
            return Date.now() - walkState.startTime + walkState.pausedTime;
        }
        return walkState.pausedTime;
    }
    
    // Handle Profile Menu Click
    handleProfileMenuClick(e) {
        this.addRippleEffect(e.currentTarget);
        this.showProfileMenuModal();
    }
    
    // Show Profile Menu Modal
    showProfileMenuModal() {
        const modal = this.createModal('profile-menu', 'Profile Settings', false);
        const content = modal.querySelector('.modal-body');
        
        content.innerHTML = `
            <div class="profile-menu-content">
                <div class="menu-item" data-action="edit-profile">
                    <div class="menu-icon">
                        <i data-lucide="user"></i>
                    </div>
                    <div class="menu-content">
                        <span>Edit Profile</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
                <div class="menu-item" data-action="health-data">
                    <div class="menu-icon">
                        <i data-lucide="heart"></i>
                    </div>
                    <div class="menu-content">
                        <span>Health Data</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
                <div class="menu-item" data-action="notifications">
                    <div class="menu-icon">
                        <i data-lucide="bell"></i>
                    </div>
                    <div class="menu-content">
                        <span>Notifications</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
                <div class="menu-item" data-action="privacy">
                    <div class="menu-icon">
                        <i data-lucide="shield"></i>
                    </div>
                    <div class="menu-content">
                        <span>Privacy</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
                <div class="menu-item" data-action="help">
                    <div class="menu-icon">
                        <i data-lucide="help-circle"></i>
                    </div>
                    <div class="menu-content">
                        <span>Help & Support</span>
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listeners
        content.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.dataset.action;
                modal.remove();
                this.handleProfileMenuAction(action);
            });
        });
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
    }
    
    // Handle Profile Menu Actions
    handleProfileMenuAction(action) {
        switch (action) {
            case 'edit-profile':
                this.showEditProfileForm();
                break;
            case 'health-data':
                this.showHealthDataScreen();
                break;
            case 'notifications':
                this.showNotificationSettingsScreen();
                break;
            case 'privacy':
                this.showPrivacySettingsScreen();
                break;
            case 'help':
                this.showHelpSupportScreen();
                break;
        }
    }
    
    // Show Health Profile Form (Main Entry Point)
    showHealthProfileForm() {
        const modal = this.createModal('health-profile', 'Health Profile', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const profile = this.dataManager.getUserProfile();
        
        content.innerHTML = `
            <div class="health-profile-form">
                <form id="healthProfileForm">
                    <div class="form-section">
                        <h3><i data-lucide="user"></i> Personal Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Age</label>
                                <input type="number" class="form-input" name="age" value="${profile.age || ''}" min="13" max="120" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gender</label>
                                <select class="form-select" name="gender" required>
                                    <option value="">Select gender</option>
                                    <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i data-lucide="activity"></i> Physical Data</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Height (cm)</label>
                                <input type="number" class="form-input" name="height" value="${profile.height || ''}" min="100" max="250" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Weight (kg)</label>
                                <input type="number" class="form-input" name="weight" value="${profile.weight || ''}" min="30" max="300" step="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Activity Level</label>
                            <select class="form-select" name="activityLevel" required>
                                <option value="">Select activity level</option>
                                <option value="sedentary" ${profile.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary</option>
                                <option value="light" ${profile.activityLevel === 'light' ? 'selected' : ''}>Lightly active</option>
                                <option value="moderate" ${profile.activityLevel === 'moderate' ? 'selected' : ''}>Moderately active</option>
                                <option value="active" ${profile.activityLevel === 'active' ? 'selected' : ''}>Very active</option>
                                <option value="extra" ${profile.activityLevel === 'extra' ? 'selected' : ''}>Extra active</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3><i data-lucide="target"></i> Health Goals</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Daily Step Goal</label>
                                <input type="number" class="form-input" name="stepGoal" value="${profile.stepGoal || 10000}" min="1000" max="50000" step="500" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Daily Calorie Goal</label>
                                <input type="number" class="form-input" name="calorieGoal" value="${profile.calorieGoal || 2000}" min="1000" max="5000" step="50" required>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bmi-display" id="bmiDisplay">
                        <div class="bmi-value" id="bmiValue">--</div>
                        <div class="bmi-category" id="bmiCategory">Enter height and weight to calculate BMI</div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        `;
        
        this.setupHealthProfileListeners(content, modal);
        document.body.appendChild(modal);
        requestAnimationFrame(() => modal.classList.add('show'));
        lucide.createIcons();
        this.updateBMIDisplay(content);
    }
    
    // Setup Health Profile Listeners
    setupHealthProfileListeners(content, modal) {
        const form = content.querySelector('#healthProfileForm');
        const heightInput = content.querySelector('input[name="height"]');
        const weightInput = content.querySelector('input[name="weight"]');
        
        // Real-time BMI calculation
        [heightInput, weightInput].forEach(input => {
            input.addEventListener('input', () => this.updateBMIDisplay(content));
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveHealthProfile(form, modal);
        });
    }
    
    // Save Health Profile
    saveHealthProfile(form, modal) {
        const saveBtn = form.querySelector('button[type="submit"]');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        setTimeout(() => {
            const formData = new FormData(form);
            const profileData = {};
            
            for (let [key, value] of formData.entries()) {
                profileData[key] = value;
            }
            
            // Convert numeric fields
            ['age', 'height', 'weight', 'stepGoal', 'calorieGoal'].forEach(field => {
                if (profileData[field]) {
                    profileData[field] = parseFloat(profileData[field]);
                }
            });
            
            this.dataManager.updateUserProfile(profileData);
            modal.remove();
            this.showNotification('Health profile saved successfully!', 'success');
            this.updateDashboard();
        }, 300);
    }
    
    // Show Edit Profile Form (Alias)
    showEditProfileForm() {
        const modal = this.createModal('edit-profile', 'Edit Profile', true);
        modal.classList.add('fullscreen-modal');
        const content = modal.querySelector('.modal-body');
        
        const profile = this.dataManager.getUserProfile();
        
        content.innerHTML = `
            <div class="health-profile-form">
                <form id="profileForm">
                    <div class="form-section">
                        <h3>
                            <i data-lucide="user"></i>
                            Personal Information
                        </h3>
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" class="form-input" name="name" value="${profile.name || 'Mutlu Kurt'}" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Age</label>
                                <input type="number" class="form-input" name="age" value="${profile.age || 25}" min="13" max="120" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Gender</label>
                                <select class="form-select" name="gender" required>
                                    <option value="male" ${profile.gender === 'male' ? 'selected' : ''}>Male</option>
                                    <option value="female" ${profile.gender === 'female' ? 'selected' : ''}>Female</option>
                                    <option value="other" ${profile.gender === 'other' ? 'selected' : ''}>Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>
                            <i data-lucide="activity"></i>
                            Physical Data
                        </h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label class="form-label">Height (cm)</label>
                                <input type="number" class="form-input" name="height" value="${profile.height || 175}" min="100" max="250" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Weight (kg)</label>
                                <input type="number" class="form-input" name="weight" value="${profile.weight || 70}" min="30" max="300" step="0.1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Activity Level</label>
                            <select class="form-select" name="activityLevel" required>
                                <option value="sedentary" ${profile.activityLevel === 'sedentary' ? 'selected' : ''}>Sedentary (little/no exercise)</option>
                                <option value="light" ${profile.activityLevel === 'light' ? 'selected' : ''}>Lightly active (light exercise 1-3 days/week)</option>
                                <option value="moderate" ${profile.activityLevel === 'moderate' ? 'selected' : ''}>Moderately active (moderate exercise 3-5 days/week)</option>
                                <option value="active" ${profile.activityLevel === 'active' ? 'selected' : ''}>Very active (hard exercise 6-7 days/week)</option>
                                <option value="extra" ${profile.activityLevel === 'extra' ? 'selected' : ''}>Extra active (very hard exercise, physical job)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-section">
                        <h3>
                            <i data-lucide="target"></i>
                            Fitness Goals
                        </h3>
                        <div class="form-group">
                            <label class="form-label">Daily Step Goal</label>
                            <input type="number" class="form-input" name="stepGoal" value="${profile.stepGoal || 10000}" min="1000" max="50000" step="500" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Weekly Workout Goal</label>
                            <input type="number" class="form-input" name="workoutGoal" value="${profile.workoutGoal || 3}" min="1" max="14" required>
                        </div>
                    </div>
                    
                    <div class="bmi-display" id="bmiDisplay">
                        <div class="bmi-value" id="bmiValue">--</div>
                        <div class="bmi-category" id="bmiCategory">Calculate BMI</div>
                        <div class="bmi-description" id="bmiDescription">Enter height and weight to calculate BMI</div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                        <button type="submit" class="btn-primary">Save Profile</button>
                    </div>
                </form>
            </div>
        `;
        
        this.setupProfileFormListeners(content, modal);
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        lucide.createIcons();
        
        // Calculate initial BMI
        this.updateBMIDisplay(content);
    }
    
    // Setup Profile Form Listeners
    setupProfileFormListeners(content, modal) {
        const form = content.querySelector('#profileForm');
        const heightInput = content.querySelector('input[name="height"]');
        const weightInput = content.querySelector('input[name="weight"]');
        
        // Update BMI on height/weight change
        [heightInput, weightInput].forEach(input => {
            input.addEventListener('input', () => this.updateBMIDisplay(content));
        });
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveProfileData(form, modal);
        });
    }
    
    // Update BMI Display
    updateBMIDisplay(content) {
        const height = parseFloat(content.querySelector('input[name="height"]').value);
        const weight = parseFloat(content.querySelector('input[name="weight"]').value);
        
        if (height && weight) {
            const bmi = weight / Math.pow(height / 100, 2);
            const bmiValue = content.querySelector('#bmiValue');
            const bmiCategory = content.querySelector('#bmiCategory');
            const bmiDescription = content.querySelector('#bmiDescription');
            
            bmiValue.textContent = bmi.toFixed(1);
            
            let category, description, categoryClass;
            if (bmi < 18.5) {
                category = 'Underweight';
                description = 'Consider consulting a healthcare provider';
                categoryClass = 'underweight';
            } else if (bmi < 25) {
                category = 'Normal weight';
                description = 'You have a healthy body weight';
                categoryClass = 'normal';
            } else if (bmi < 30) {
                category = 'Overweight';
                description = 'Consider a balanced diet and regular exercise';
                categoryClass = 'overweight';
            } else {
                category = 'Obese';
                description = 'Consider consulting a healthcare provider';
                categoryClass = 'obese';
            }
            
            bmiCategory.textContent = category;
            bmiCategory.className = `bmi-category ${categoryClass}`;
            bmiDescription.textContent = description;
        }
    }
    
    // Save Profile Data
    saveProfileData(form, modal) {
        const formData = new FormData(form);
        const profileData = {};
        
        for (let [key, value] of formData.entries()) {
            profileData[key] = value;
        }
        
        // Convert numeric fields
        ['age', 'height', 'weight', 'stepGoal', 'workoutGoal'].forEach(field => {
            if (profileData[field]) {
                profileData[field] = parseFloat(profileData[field]);
            }
        });
        
        // Save to data manager
        this.dataManager.updateUserProfile(profileData);
        
        modal.remove();
        this.showNotification('Profile updated successfully!', 'success');
        this.updateDashboard();
    }
    
    // Show Loading Screen
    showLoadingScreen(text = 'Loading...', subtext = 'Please wait') {
        const existingLoader = document.querySelector('.loading-screen');
        if (existingLoader) {
            existingLoader.remove();
        }
        
        const loader = document.createElement('div');
        loader.className = 'loading-screen';
        loader.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">${text}</div>
                <div class="loading-subtext">${subtext}</div>
            </div>
        `;
        
        document.body.appendChild(loader);
        setTimeout(() => loader.classList.add('show'), 100);
        
        return loader;
    }
    
    // Hide Loading Screen
    hideLoadingScreen() {
        const loader = document.querySelector('.loading-screen');
        if (loader) {
            loader.classList.remove('show');
            setTimeout(() => loader.remove(), 300);
        }
    }
    
    // Instant Navigation
    handleNavigation(e) {
        const targetScreen = e.currentTarget.dataset.screen;
        if (!targetScreen) return;
        
        this.addRippleEffect(e.currentTarget);
        this.switchToScreen(targetScreen);
        
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        e.currentTarget.classList.add('active');
    }
    
    // Instant Screen Switching with Smooth Transitions
    switchToScreen(targetScreen) {
        const currentScreen = document.querySelector('.screen.active');
        const newScreen = document.getElementById(targetScreen);
        
        if (!newScreen || newScreen === currentScreen) return;
        
        // Use requestAnimationFrame for smooth transitions
        requestAnimationFrame(() => {
            // Hide current screen instantly
            if (currentScreen) {
                currentScreen.classList.remove('active');
            }
            
            // Show new screen instantly
            newScreen.classList.add('active');
            
            // Trigger screen-specific updates
            this.updateScreenContent(targetScreen);
        });
    }
    
    // Update Screen Content Instantly
    updateScreenContent(screenName) {
        switch (screenName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'workout':
                this.updateWorkoutScreen();
                break;
            case 'progress':
                this.updateProgressData('week');
                break;
            case 'profile':
                this.updateProfileScreen();
                break;
        }
    }
    
    // Update Workout Screen
    updateWorkoutScreen() {
        // Refresh workout categories if needed
        const categories = document.querySelectorAll('.workout-category');
        categories.forEach(category => {
            category.style.opacity = '1';
            category.style.transform = 'scale(1)';
        });
    }
    
    // Update Profile Screen
    updateProfileScreen() {
        const profile = this.dataManager.getUserProfile();
        const userNameEl = document.querySelector('.profile-header h2');
        if (userNameEl && profile.name) {
            userNameEl.textContent = profile.name;
        }
    }
    
    // Enhanced Notification System
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = this.getNotificationIcon(type);
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i data-lucide="${icon}"></i>
                </div>
                <div class="notification-text">${message}</div>
                <button class="notification-close">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('show'));
        
        // Auto hide
        setTimeout(() => {
            this.hideNotification(notification);
        }, duration);
        
        // Recreate lucide icons
        lucide.createIcons();
    }
    
    // Get Notification Icon
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'x-circle',
            warning: 'alert-triangle',
            info: 'info'
        };
        return icons[type] || 'info';
    }
    
    // Hide Notification
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }
    
    // Enhanced Ripple Effect
    addRippleEffect(element) {
        const rect = element.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'ripple';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    // Fast Modal Creation
    createModal(id, title, hasBackButton = false) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = `modal-${id}`;
        
        const backButtonHtml = hasBackButton ? `
            <button class="back-button" onclick="this.closest('.modal').remove()">
                <i data-lucide="arrow-left"></i>
            </button>
        ` : '';
        
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title-container">
                        ${backButtonHtml}
                        <h2 class="modal-title">${title}</h2>
                    </div>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="modal-body"></div>
            </div>
        `;
        
        // Close on backdrop click
        modal.querySelector('.modal-backdrop').addEventListener('click', () => {
            modal.remove();
        });
        
        return modal;
    }
    
    // Make All Cards Interactive
    makeCardsInteractive() {
        // Activity cards
        document.querySelectorAll('.activity-card').forEach(card => {
            if (!card.hasAttribute('data-interactive')) {
                card.setAttribute('data-interactive', 'true');
                card.addEventListener('click', (e) => {
                    this.addRippleEffect(card);
                    this.handleActivityCardClick(e);
                });
            }
        });
        
        // Stat cards
        document.querySelectorAll('.stat-card').forEach(card => {
            if (!card.hasAttribute('data-interactive')) {
                card.setAttribute('data-interactive', 'true');
                card.addEventListener('click', (e) => {
                    this.addRippleEffect(card);
                    this.handleStatCardClick(e);
                });
            }
        });
        
        // Achievement cards
        document.querySelectorAll('.achievement-card').forEach(card => {
            if (!card.hasAttribute('data-interactive')) {
                card.setAttribute('data-interactive', 'true');
                card.addEventListener('click', (e) => {
                    this.addRippleEffect(card);
                    this.handleAchievementCardClick(e);
                });
            }
        });
    }
    
    // Handle Stat Card Click - Instant Response
    handleStatCardClick(e) {
        const card = e.currentTarget;
        const statType = card.querySelector('.stat-label')?.textContent?.toLowerCase();
        
        if (statType) {
            this.showStatDetailModal(statType);
        }
    }
    
    // Handle Achievement Card Click - Instant Response
    handleAchievementCardClick(e) {
        this.showAchievementDetailModal();
    }
}

// Export for use in other modules
window.UIManager = UIManager;
