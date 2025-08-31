/**
 * Step Counter - Simulates step counting with realistic patterns
 */
class StepCounter {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.isActive = false;
        this.baseStepsPerMinute = 0;
        this.currentActivity = 'idle';
        this.stepInterval = null;
        this.lastUpdate = Date.now();
        
        // Activity patterns (steps per minute)
        this.activityPatterns = {
            idle: { min: 0, max: 2, variance: 0.1 },
            walking: { min: 80, max: 120, variance: 0.3 },
            jogging: { min: 140, max: 180, variance: 0.4 },
            running: { min: 180, max: 220, variance: 0.5 },
            workout: { min: 60, max: 100, variance: 0.6 }
        };
        
        this.initializeStepCounter();
    }
    
    // Initialize step counter
    initializeStepCounter() {
        // Check if device supports motion sensors
        if (this.isMotionSupported()) {
            this.initializeDeviceMotion();
        } else {
            // Fallback to simulation
            this.initializeSimulation();
        }
        
        // Start background step counting
        this.startStepCounting();
        
        // Add activity detection
        this.initializeActivityDetection();
    }
    
    // Check if motion sensors are supported
    isMotionSupported() {
        return 'DeviceMotionEvent' in window && 
               typeof DeviceMotionEvent.requestPermission === 'function';
    }
    
    // Initialize device motion (for iOS/Android)
    async initializeDeviceMotion() {
        try {
            if (typeof DeviceMotionEvent.requestPermission === 'function') {
                const permission = await DeviceMotionEvent.requestPermission();
                if (permission === 'granted') {
                    this.setupMotionListeners();
                    return true;
                }
            } else {
                // Android or older iOS
                this.setupMotionListeners();
                return true;
            }
        } catch (error) {
            console.log('Motion sensors not available, using simulation');
        }
        
        return false;
    }
    
    // Setup motion event listeners
    setupMotionListeners() {
        let lastAcceleration = { x: 0, y: 0, z: 0 };
        let stepThreshold = 1.2;
        let stepCooldown = false;
        
        window.addEventListener('devicemotion', (event) => {
            if (!this.isActive) return;
            
            const acceleration = event.accelerationIncludingGravity;
            if (!acceleration) return;
            
            // Calculate motion magnitude
            const magnitude = Math.sqrt(
                Math.pow(acceleration.x - lastAcceleration.x, 2) +
                Math.pow(acceleration.y - lastAcceleration.y, 2) +
                Math.pow(acceleration.z - lastAcceleration.z, 2)
            );
            
            // Detect step if magnitude exceeds threshold
            if (magnitude > stepThreshold && !stepCooldown) {
                this.recordStep();
                
                // Prevent duplicate steps
                stepCooldown = true;
                setTimeout(() => stepCooldown = false, 300);
            }
            
            lastAcceleration = { ...acceleration };
        });
    }
    
    // Initialize simulation mode
    initializeSimulation() {
        console.log('Using step counter simulation mode');
        
        // Simulate realistic daily step patterns
        this.simulateRealisticSteps();
    }
    
    // Start step counting
    startStepCounting() {
        this.isActive = true;
        
        // Update steps every minute
        this.stepInterval = setInterval(() => {
            this.updateStepCount();
        }, 60000); // 1 minute
        
        // More frequent updates during active periods
        setInterval(() => {
            if (this.currentActivity !== 'idle') {
                this.updateStepCount();
            }
        }, 10000); // 10 seconds during activity
    }
    
    // Stop step counting
    stopStepCounting() {
        this.isActive = false;
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
    }
    
    // Update step count
    updateStepCount() {
        if (!this.isActive) return;
        
        const now = Date.now();
        const timeDiff = (now - this.lastUpdate) / 60000; // minutes
        
        const pattern = this.activityPatterns[this.currentActivity];
        const baseSteps = (pattern.min + pattern.max) / 2;
        const variance = pattern.variance;
        
        // Add randomness
        const randomFactor = 1 + (Math.random() - 0.5) * variance;
        const stepsToAdd = Math.round(baseSteps * timeDiff * randomFactor);
        
        if (stepsToAdd > 0) {
            this.addSteps(stepsToAdd);
        }
        
        this.lastUpdate = now;
    }
    
    // Record a single step
    recordStep() {
        this.addSteps(1);
        
        // Estimate calories burned (rough calculation)
        const profile = this.dataManager.getUserProfile();
        const caloriesPerStep = this.calculateCaloriesPerStep(profile);
        
        if (caloriesPerStep > 0) {
            this.dataManager.incrementDailyActivity('calories', caloriesPerStep);
        }
        
        // Update distance
        const distancePerStep = this.calculateDistancePerStep(profile);
        if (distancePerStep > 0) {
            this.dataManager.incrementDailyActivity('distance', distancePerStep);
        }
    }
    
    // Add multiple steps
    addSteps(count) {
        const today = new Date().toISOString().split('T')[0];
        this.dataManager.incrementDailyActivity('steps', count, today);
        
        // Trigger UI update
        this.dispatchStepUpdate(count);
        
        // Check for step-based achievements
        this.checkStepAchievements();
    }
    
    // Calculate calories per step
    calculateCaloriesPerStep(profile) {
        if (!profile.weight) return 0.04; // Default value
        
        // Rough calculation: weight in kg * 0.0005
        return profile.weight * 0.0005;
    }
    
    // Calculate distance per step
    calculateDistancePerStep(profile) {
        if (!profile.height) return 0.0008; // Default 80cm step
        
        // Estimate step length as 0.4 * height in meters
        const stepLengthMeters = (profile.height * 0.4) / 100;
        return stepLengthMeters / 1000; // Convert to km
    }
    
    // Simulate realistic daily steps
    simulateRealisticSteps() {
        const now = new Date();
        const hour = now.getHours();
        
        // Set activity based on time of day
        if (hour >= 6 && hour <= 9) {
            this.setActivity('walking'); // Morning routine
        } else if (hour >= 12 && hour <= 13) {
            this.setActivity('walking'); // Lunch break
        } else if (hour >= 17 && hour <= 19) {
            this.setActivity('walking'); // Evening activity
        } else if (hour >= 22 || hour <= 5) {
            this.setActivity('idle'); // Sleep time
        } else {
            // Random activity during day
            const activities = ['idle', 'walking', 'workout'];
            const weights = [0.7, 0.25, 0.05]; // Probability weights
            this.setActivity(this.weightedRandomChoice(activities, weights));
        }
        
        // Change activity periodically
        setInterval(() => {
            this.simulateActivityChange();
        }, 300000); // 5 minutes
    }
    
    // Simulate activity changes
    simulateActivityChange() {
        const currentHour = new Date().getHours();
        
        // Higher chance of activity during active hours
        if (currentHour >= 6 && currentHour <= 22) {
            const activities = ['idle', 'walking', 'jogging', 'workout'];
            const weights = [0.6, 0.3, 0.05, 0.05];
            const newActivity = this.weightedRandomChoice(activities, weights);
            
            if (newActivity !== this.currentActivity) {
                this.setActivity(newActivity);
            }
        } else {
            this.setActivity('idle');
        }
    }
    
    // Weighted random choice
    weightedRandomChoice(items, weights) {
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < items.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return items[i];
            }
        }
        
        return items[items.length - 1];
    }
    
    // Set current activity
    setActivity(activity) {
        if (this.currentActivity !== activity) {
            this.currentActivity = activity;
            console.log(`Activity changed to: ${activity}`);
            
            // Dispatch activity change event
            document.dispatchEvent(new CustomEvent('activityChange', {
                detail: { activity, timestamp: Date.now() }
            }));
        }
    }
    
    // Initialize activity detection
    initializeActivityDetection() {
        // Listen for user interactions that might indicate activity
        let interactionCount = 0;
        let lastInteraction = Date.now();
        
        const trackInteraction = () => {
            const now = Date.now();
            if (now - lastInteraction < 5000) { // Within 5 seconds
                interactionCount++;
            } else {
                interactionCount = 1;
            }
            lastInteraction = now;
            
            // High interaction rate might indicate walking/activity
            if (interactionCount > 10) {
                this.setActivity('walking');
                interactionCount = 0;
            }
        };
        
        // Track various user interactions
        ['click', 'touchstart', 'scroll'].forEach(event => {
            document.addEventListener(event, trackInteraction, { passive: true });
        });
        
        // Detect when app comes to foreground (might indicate user is active)
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // App became visible, user might be active
                if (this.currentActivity === 'idle') {
                    const hour = new Date().getHours();
                    if (hour >= 6 && hour <= 22) {
                        this.setActivity('walking');
                    }
                }
            }
        });
    }
    
    // Manual step addition (for testing or manual input)
    addManualSteps(count, timestamp = null) {
        const date = timestamp ? new Date(timestamp).toISOString().split('T')[0] : 
                     new Date().toISOString().split('T')[0];
        
        this.dataManager.incrementDailyActivity('steps', count, date);
        this.dispatchStepUpdate(count);
        
        return true;
    }
    
    // Get current step count for today
    getCurrentSteps() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        return activities ? activities.steps || 0 : 0;
    }
    
    // Get step goal progress
    getStepProgress() {
        const currentSteps = this.getCurrentSteps();
        const goals = this.dataManager.getGoals();
        const stepGoal = goals.daily.steps;
        
        return {
            current: currentSteps,
            goal: stepGoal,
            percentage: Math.min((currentSteps / stepGoal) * 100, 100),
            remaining: Math.max(stepGoal - currentSteps, 0)
        };
    }
    
    // Get weekly step statistics
    getWeeklyStepStats() {
        const stats = this.dataManager.getWeeklyStats();
        return {
            totalSteps: stats.totalSteps,
            dailySteps: stats.steps,
            averageSteps: Math.round(stats.totalSteps / 7),
            bestDay: Math.max(...stats.steps),
            activeDays: stats.steps.filter(steps => steps > 1000).length
        };
    }
    
    // Check for step-based achievements
    checkStepAchievements() {
        const currentSteps = this.getCurrentSteps();
        const goals = this.dataManager.getGoals();
        const achievements = [];
        
        // Daily step milestones
        const milestones = [1000, 5000, 10000, 15000, 20000];
        milestones.forEach(milestone => {
            if (currentSteps >= milestone) {
                const existingAchievements = this.dataManager.getAchievements();
                const alreadyEarned = existingAchievements.some(a => 
                    a.id === `steps_${milestone}` && 
                    a.timestamp.startsWith(new Date().toISOString().split('T')[0])
                );
                
                if (!alreadyEarned) {
                    achievements.push({
                        id: `steps_${milestone}`,
                        title: `${milestone.toLocaleString()} Steps`,
                        description: `Reached ${milestone.toLocaleString()} steps in a day`,
                        icon: 'footprints',
                        category: 'steps'
                    });
                }
            }
        });
        
        // Goal achievement
        if (currentSteps >= goals.daily.steps) {
            const existingAchievements = this.dataManager.getAchievements();
            const alreadyEarned = existingAchievements.some(a => 
                a.id === 'daily_step_goal' && 
                a.timestamp.startsWith(new Date().toISOString().split('T')[0])
            );
            
            if (!alreadyEarned) {
                achievements.push({
                    id: 'daily_step_goal',
                    title: 'Step Goal Reached',
                    description: `Completed your daily step goal of ${goals.daily.steps.toLocaleString()}`,
                    icon: 'target',
                    category: 'goal'
                });
            }
        }
        
        // Add achievements
        achievements.forEach(achievement => {
            this.dataManager.addAchievement(achievement);
        });
        
        return achievements;
    }
    
    // Dispatch step update event
    dispatchStepUpdate(stepsAdded) {
        const event = new CustomEvent('stepUpdate', {
            detail: {
                stepsAdded,
                currentSteps: this.getCurrentSteps(),
                progress: this.getStepProgress(),
                activity: this.currentActivity,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Get step history for a date range
    getStepHistory(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const history = [];
        
        for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            const activities = this.dataManager.getDailyActivities(dateStr);
            
            history.push({
                date: dateStr,
                steps: activities ? activities.steps || 0 : 0,
                goal: this.dataManager.getGoals().daily.steps
            });
        }
        
        return history;
    }
    
    // Calibrate step counter based on user input
    calibrateStepCounter(actualSteps, measuredSteps) {
        if (measuredSteps > 0) {
            const calibrationFactor = actualSteps / measuredSteps;
            localStorage.setItem('stepCounterCalibration', calibrationFactor.toString());
            
            return {
                success: true,
                calibrationFactor,
                message: 'Step counter calibrated successfully'
            };
        }
        
        return {
            success: false,
            message: 'Invalid calibration data'
        };
    }
    
    // Get calibration factor
    getCalibrationFactor() {
        const stored = localStorage.getItem('stepCounterCalibration');
        return stored ? parseFloat(stored) : 1.0;
    }
    
    // Reset step counter
    reset() {
        this.stopStepCounting();
        this.currentActivity = 'idle';
        this.lastUpdate = Date.now();
        this.startStepCounting();
    }
    
    // Get current activity
    getCurrentActivity() {
        return this.currentActivity;
    }
    
    // Force activity for testing
    forceActivity(activity, duration = 60000) {
        this.setActivity(activity);
        
        setTimeout(() => {
            this.simulateActivityChange();
        }, duration);
    }
}

// Export for use in other modules
window.StepCounter = StepCounter;
