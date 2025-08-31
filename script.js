// Initialize Lucide icons
lucide.createIcons();

// Global App Instance
class FitnessTrackerApp {
    constructor() {
        this.dataManager = null;
        this.workoutManager = null;
        this.stepCounter = null;
        this.uiManager = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize core managers
            this.dataManager = new DataManager();
            this.workoutManager = new WorkoutManager(this.dataManager);
            this.stepCounter = new StepCounter(this.dataManager);
            this.healthManager = new HealthManager(this.dataManager);
            this.achievementManager = new AchievementManager(this.dataManager);
            this.uiManager = new UIManager(this.dataManager, this.workoutManager);
            
            // Set current date
            this.setCurrentDate();
            
            // Initialize with real data
            this.initializeWithData();
            
            // Start step counter simulation
            this.startStepCounterSimulation();
            
            // Setup periodic updates
            this.setupPeriodicUpdates();
            
            // Setup event listeners
            this.setupDataEventListeners();
            
            // Show onboarding if first time user
            this.checkOnboarding();
            
            this.isInitialized = true;
            console.log('Fitness Tracker App initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize app:', error);
        }
    }
    
    setCurrentDate() {
        const currentDateElement = document.getElementById('current-date');
        if (currentDateElement) {
            const now = new Date();
            const options = { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            };
            currentDateElement.textContent = now.toLocaleDateString('en-US', options);
        }
    }
    
    initializeWithData() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        const goals = this.dataManager.getGoals();
        
        if (!activities || !goals) return;
        
        // Initialize progress rings and counters
        this.updateDashboardData(activities, goals);
    }
    
    updateDashboardData(activities, goals) {
        const mappings = [
            { 
                card: '.steps-card', 
                current: activities.steps || 0, 
                goal: goals.daily.steps,
                format: 'number'
            },
            { 
                card: '.calories-card', 
                current: activities.calories || 0, 
                goal: goals.daily.calories,
                format: 'number'
            },
            { 
                card: '.distance-card', 
                current: activities.distance || 0, 
                goal: goals.daily.distance,
                format: 'decimal'
            },
            { 
                card: '.active-card', 
                current: activities.activeMinutes || 0, 
                goal: goals.daily.activeMinutes,
                format: 'number'
            }
        ];
        
        mappings.forEach(({ card, current, goal, format }) => {
            const cardEl = document.querySelector(card);
            if (!cardEl) return;
            
            const counter = cardEl.querySelector('.counter');
            const ring = cardEl.querySelector('.ring-progress');
            const percentage = cardEl.querySelector('.ring-percentage');
            
            if (counter) {
                this.animateCounter(counter, current, format);
            }
            
            if (ring && percentage) {
                const progress = Math.min((current / goal) * 100, 100);
                this.animateProgressRing(ring, progress);
                percentage.textContent = `${Math.round(progress)}%`;
            }
        });
    }
    
    startStepCounterSimulation() {
        const currentSteps = this.stepCounter.getCurrentSteps();
        if (currentSteps < 100) {
            this.stepCounter.addManualSteps(Math.floor(Math.random() * 2000) + 500);
        }
        
        // Simulate step increases
        setInterval(() => {
            if (this.stepCounter.getCurrentActivity() !== 'idle') {
                const stepsToAdd = Math.floor(Math.random() * 5) + 1;
                this.stepCounter.addSteps(stepsToAdd);
            }
        }, 10000);
    }
    
    setupPeriodicUpdates() {
        setInterval(() => {
            if (this.uiManager && this.uiManager.currentScreen === 'dashboard') {
                this.uiManager.updateDashboard();
            }
        }, 60000);
    }
    
    setupDataEventListeners() {
        document.addEventListener('stepUpdate', (e) => {
            this.handleStepUpdate(e.detail);
        });
        
        document.addEventListener('activityChange', (e) => {
            console.log(`Activity changed to: ${e.detail.activity}`);
        });
    }
    
    handleStepUpdate(detail) {
        const stepsCard = document.querySelector('.steps-card');
        if (stepsCard) {
            const counter = stepsCard.querySelector('.counter');
            const ring = stepsCard.querySelector('.ring-progress');
            const percentage = stepsCard.querySelector('.ring-percentage');
            
            if (counter) {
                this.animateCounter(counter, detail.currentSteps, 'number');
            }
            
            if (ring && percentage) {
                this.animateProgressRing(ring, detail.progress.percentage);
                percentage.textContent = `${Math.round(detail.progress.percentage)}%`;
            }
        }
        
        if (detail.progress.percentage >= 100) {
            this.showAchievementNotification('Step Goal Completed! 🎉');
        }
    }
    
    checkOnboarding() {
        const hasCompleted = localStorage.getItem('onboarding_completed');
        if (!hasCompleted) {
            setTimeout(() => this.showOnboardingModal(), 1000);
        }
    }
    
    showOnboardingModal() {
        const modal = document.createElement('div');
        modal.className = 'modal onboarding-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Welcome to FitTracker!</h2>
                </div>
                <div class="modal-body">
                    <div class="onboarding-step active">
                        <div class="step-icon">
                            <i data-lucide="target"></i>
                        </div>
                        <h3>Ready to Track Your Fitness?</h3>
                        <p>Start your journey with personalized goals and real-time tracking.</p>
                        <div class="features">
                            <div class="feature">
                                <i data-lucide="activity"></i>
                                <span>Real-time step tracking</span>
                            </div>
                            <div class="feature">
                                <i data-lucide="dumbbell"></i>
                                <span>Workout library</span>
                            </div>
                            <div class="feature">
                                <i data-lucide="trending-up"></i>
                                <span>Progress analytics</span>
                            </div>
                        </div>
                    </div>
                    <div class="onboarding-actions">
                        <button class="btn-primary get-started-btn">Get Started</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);
        
        const getStartedBtn = modal.querySelector('.get-started-btn');
        getStartedBtn.addEventListener('click', () => {
            localStorage.setItem('onboarding_completed', 'true');
            modal.remove();
            this.showWelcomeMessage();
        });
        
        lucide.createIcons();
    }
    
    showWelcomeMessage() {
        this.showAchievementNotification('Welcome to FitTracker! Your fitness journey starts now! 🚀');
    }
    
    showAchievementNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">
                    <i data-lucide="trophy"></i>
                </div>
                <div class="achievement-text">
                    <h4>Achievement!</h4>
                    <p>${message}</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        lucide.createIcons();
        
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
    
    animateCounter(element, target, format = 'number') {
        const start = parseFloat(element.textContent.replace(/,/g, '')) || 0;
        const duration = 1500;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = start + (target - start) * this.easeOutCubic(progress);
            
            if (format === 'decimal') {
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
    
    animateProgressRing(ring, targetProgress) {
        const circumference = 2 * Math.PI * 25;
        const targetOffset = circumference - (targetProgress / 100) * circumference;
        
        ring.style.strokeDashoffset = circumference;
        
        setTimeout(() => {
            ring.style.transition = 'stroke-dashoffset 1s ease-out';
            ring.style.strokeDashoffset = targetOffset;
        }, 500);
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new FitnessTrackerApp();
});

// Export for global access
window.fitnessApp = app;
