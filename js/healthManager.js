/**
 * Health Manager - Handles health calculations, water tracking, sleep monitoring
 */
class HealthManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.waterReminders = [];
        this.sleepReminders = [];
        this.notificationPermission = false;
        
        this.initializeHealthTracking();
    }
    
    // Initialize health tracking features
    initializeHealthTracking() {
        this.requestNotificationPermission();
        this.setupWaterReminders();
        this.setupSleepReminders();
        this.initializeDailyHealthData();
    }
    
    // Request notification permission
    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                this.notificationPermission = permission === 'granted';
            } catch (error) {
                console.log('Notification permission request failed:', error);
            }
        }
    }
    
    // Initialize daily health data if not exists
    initializeDailyHealthData() {
        const today = new Date().toISOString().split('T')[0];
        const waterData = this.dataManager.getWaterIntake(today);
        
        if (!waterData.logs || waterData.logs.length === 0) {
            // Add some sample water intake for demo
            this.addWaterIntake(2, today); // 2 glasses to start
        }
    }
    
    // Water Intake Management
    addWaterIntake(glasses = 1, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const waterData = this.dataManager.addWaterIntake(glasses, targetDate);
        
        // Check for achievements
        this.checkWaterAchievements(waterData.glasses);
        
        // Dispatch water update event
        document.dispatchEvent(new CustomEvent('waterUpdate', {
            detail: {
                glasses: waterData.glasses,
                date: targetDate,
                logs: waterData.logs
            }
        }));
        
        return waterData;
    }
    
    // Get water intake progress
    getWaterProgress(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const waterData = this.dataManager.getWaterIntake(targetDate);
        const goals = this.dataManager.getGoals();
        const dailyGoal = goals.daily.water || 8;
        
        return {
            current: waterData.glasses || 0,
            goal: dailyGoal,
            percentage: Math.min(((waterData.glasses || 0) / dailyGoal) * 100, 100),
            remaining: Math.max(dailyGoal - (waterData.glasses || 0), 0),
            logs: waterData.logs || []
        };
    }
    
    // Setup water reminders
    setupWaterReminders() {
        const settings = this.dataManager.getSettings();
        if (!settings.notifications.waterReminders) return;
        
        // Set reminders every 2 hours during waking hours (8 AM to 10 PM)
        const reminderTimes = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
        
        reminderTimes.forEach(time => {
            const [hours, minutes] = time.split(':');
            const now = new Date();
            const reminderTime = new Date();
            reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            // If time has passed today, set for tomorrow
            if (reminderTime <= now) {
                reminderTime.setDate(reminderTime.getDate() + 1);
            }
            
            const timeUntilReminder = reminderTime.getTime() - now.getTime();
            
            const reminderId = setTimeout(() => {
                this.sendWaterReminder();
                // Set up recurring reminder
                setInterval(() => this.sendWaterReminder(), 24 * 60 * 60 * 1000); // Daily
            }, timeUntilReminder);
            
            this.waterReminders.push(reminderId);
        });
    }
    
    // Send water reminder notification
    sendWaterReminder() {
        const progress = this.getWaterProgress();
        
        if (progress.remaining > 0) {
            this.showNotification(
                'Hydration Reminder 💧',
                `You need ${progress.remaining} more glasses of water today!`,
                'water-reminder'
            );
        }
    }
    
    // Check water achievements
    checkWaterAchievements(totalGlasses) {
        const achievements = [];
        
        // Daily goal achievement
        const goals = this.dataManager.getGoals();
        if (totalGlasses >= goals.daily.water) {
            achievements.push({
                id: 'daily_water_goal',
                title: 'Hydration Hero',
                description: `Reached your daily water goal of ${goals.daily.water} glasses`,
                icon: 'droplets',
                category: 'water'
            });
        }
        
        // Milestone achievements
        const milestones = [5, 10, 15, 20];
        milestones.forEach(milestone => {
            if (totalGlasses >= milestone) {
                const today = new Date().toISOString().split('T')[0];
                const existingAchievements = this.dataManager.getAchievements();
                const alreadyEarned = existingAchievements.some(a => 
                    a.id === `water_${milestone}` && 
                    a.timestamp.startsWith(today)
                );
                
                if (!alreadyEarned) {
                    achievements.push({
                        id: `water_${milestone}`,
                        title: `${milestone} Glasses`,
                        description: `Drank ${milestone} glasses of water in one day`,
                        icon: 'droplets',
                        category: 'water'
                    });
                }
            }
        });
        
        // Add achievements
        achievements.forEach(achievement => {
            this.dataManager.addAchievement(achievement);
        });
        
        return achievements;
    }
    
    // Sleep Tracking
    logSleep(bedtime, wakeTime, quality = 'good') {
        const sleepDate = new Date(bedtime).toISOString().split('T')[0];
        
        // Calculate sleep duration in hours
        const bedtimeMs = new Date(bedtime).getTime();
        const wakeTimeMs = new Date(wakeTime).getTime();
        let durationMs = wakeTimeMs - bedtimeMs;
        
        // Handle sleep across midnight
        if (durationMs < 0) {
            durationMs += 24 * 60 * 60 * 1000; // Add 24 hours
        }
        
        const durationHours = durationMs / (1000 * 60 * 60);
        
        const sleepData = {
            bedtime: bedtime,
            wakeTime: wakeTime,
            duration: Math.round(durationHours * 10) / 10, // Round to 1 decimal
            quality: quality,
            date: sleepDate
        };
        
        this.dataManager.setSleepData(sleepDate, sleepData);
        
        // Check for sleep achievements
        this.checkSleepAchievements(durationHours, quality);
        
        // Dispatch sleep update event
        document.dispatchEvent(new CustomEvent('sleepUpdate', {
            detail: sleepData
        }));
        
        return sleepData;
    }
    
    // Get sleep data for a date
    getSleepData(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.dataManager.getSleepData(targetDate);
    }
    
    // Get sleep progress
    getSleepProgress(date = null) {
        const sleepData = this.getSleepData(date);
        const goals = this.dataManager.getGoals();
        const sleepGoal = goals.daily.sleep || 8;
        
        if (!sleepData) {
            return {
                current: 0,
                goal: sleepGoal,
                percentage: 0,
                quality: null
            };
        }
        
        return {
            current: sleepData.duration,
            goal: sleepGoal,
            percentage: Math.min((sleepData.duration / sleepGoal) * 100, 100),
            quality: sleepData.quality,
            bedtime: sleepData.bedtime,
            wakeTime: sleepData.wakeTime
        };
    }
    
    // Setup sleep reminders
    setupSleepReminders() {
        const settings = this.dataManager.getSettings();
        if (!settings.notifications.sleepReminders) return;
        
        // Set bedtime reminder (default 10 PM)
        const bedtimeHour = 22; // 10 PM
        const now = new Date();
        const bedtimeReminder = new Date();
        bedtimeReminder.setHours(bedtimeHour, 0, 0, 0);
        
        if (bedtimeReminder <= now) {
            bedtimeReminder.setDate(bedtimeReminder.getDate() + 1);
        }
        
        const timeUntilBedtime = bedtimeReminder.getTime() - now.getTime();
        
        const bedtimeReminderId = setTimeout(() => {
            this.sendSleepReminder();
            // Set up recurring reminder
            setInterval(() => this.sendSleepReminder(), 24 * 60 * 60 * 1000);
        }, timeUntilBedtime);
        
        this.sleepReminders.push(bedtimeReminderId);
    }
    
    // Send sleep reminder notification
    sendSleepReminder() {
        this.showNotification(
            'Bedtime Reminder 🌙',
            'Time to wind down for better sleep quality!',
            'sleep-reminder'
        );
    }
    
    // Check sleep achievements
    checkSleepAchievements(duration, quality) {
        const achievements = [];
        const goals = this.dataManager.getGoals();
        
        // Sleep goal achievement
        if (duration >= goals.daily.sleep) {
            achievements.push({
                id: 'daily_sleep_goal',
                title: 'Sleep Champion',
                description: `Got ${duration} hours of sleep, meeting your goal`,
                icon: 'moon',
                category: 'sleep'
            });
        }
        
        // Quality sleep achievement
        if (quality === 'excellent' && duration >= 7) {
            achievements.push({
                id: 'quality_sleep',
                title: 'Quality Rest',
                description: 'Achieved excellent sleep quality',
                icon: 'star',
                category: 'sleep'
            });
        }
        
        // Early bird achievement (if woke up before 7 AM)
        const now = new Date();
        if (now.getHours() < 7) {
            achievements.push({
                id: 'early_bird',
                title: 'Early Bird',
                description: 'Woke up before 7 AM',
                icon: 'sunrise',
                category: 'sleep'
            });
        }
        
        // Add achievements
        achievements.forEach(achievement => {
            this.dataManager.addAchievement(achievement);
        });
        
        return achievements;
    }
    
    // Health Calculations
    calculateBMI() {
        const profile = this.dataManager.getUserProfile();
        if (!profile.height || !profile.weight) return null;
        
        const heightInMeters = profile.height / 100;
        const bmi = profile.weight / (heightInMeters * heightInMeters);
        
        return {
            value: Math.round(bmi * 10) / 10,
            category: this.getBMICategory(bmi),
            healthyRange: this.getHealthyWeightRange(profile.height)
        };
    }
    
    // Get BMI category
    getBMICategory(bmi) {
        if (bmi < 18.5) return { name: 'Underweight', color: 'blue' };
        if (bmi < 25) return { name: 'Normal', color: 'green' };
        if (bmi < 30) return { name: 'Overweight', color: 'orange' };
        return { name: 'Obese', color: 'red' };
    }
    
    // Get healthy weight range for height
    getHealthyWeightRange(heightCm) {
        const heightM = heightCm / 100;
        const minWeight = Math.round(18.5 * heightM * heightM);
        const maxWeight = Math.round(24.9 * heightM * heightM);
        
        return { min: minWeight, max: maxWeight };
    }
    
    // Calculate BMR (Basal Metabolic Rate)
    calculateBMR() {
        const profile = this.dataManager.getUserProfile();
        if (!profile.age || !profile.height || !profile.weight || !profile.gender) return null;
        
        let bmr;
        if (profile.gender === 'male') {
            bmr = 88.362 + (13.397 * profile.weight) + (4.799 * profile.height) - (5.677 * profile.age);
        } else {
            bmr = 447.593 + (9.247 * profile.weight) + (3.098 * profile.height) - (4.330 * profile.age);
        }
        
        // Activity level multipliers
        const activityMultipliers = {
            sedentary: 1.2,
            light: 1.375,
            moderate: 1.55,
            active: 1.725,
            veryActive: 1.9
        };
        
        const multiplier = activityMultipliers[profile.activityLevel] || 1.55;
        const tdee = bmr * multiplier;
        
        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            activityLevel: profile.activityLevel,
            description: this.getBMRDescription(bmr, tdee)
        };
    }
    
    // Get BMR description
    getBMRDescription(bmr, tdee) {
        return {
            bmr: `Your body burns ${bmr} calories at rest`,
            tdee: `You need ${tdee} calories per day to maintain weight`,
            deficit: `Eat ${tdee - 500} calories daily to lose 1 lb/week`,
            surplus: `Eat ${tdee + 300} calories daily to gain weight`
        };
    }
    
    // Calculate ideal calorie intake based on goals
    calculateCalorieGoal(goalType = 'maintain') {
        const bmrData = this.calculateBMR();
        if (!bmrData) return null;
        
        const { tdee } = bmrData;
        
        switch (goalType) {
            case 'lose':
                return Math.round(tdee - 500); // 1 lb per week loss
            case 'gain':
                return Math.round(tdee + 300); // Gradual weight gain
            case 'maintain':
            default:
                return Math.round(tdee);
        }
    }
    
    // Heart Rate Zones (estimated based on age)
    getHeartRateZones() {
        const profile = this.dataManager.getUserProfile();
        if (!profile.age) return null;
        
        const maxHR = 220 - profile.age;
        
        return {
            resting: { min: 60, max: 100, name: 'Resting' },
            fatBurn: { min: Math.round(maxHR * 0.5), max: Math.round(maxHR * 0.7), name: 'Fat Burn' },
            cardio: { min: Math.round(maxHR * 0.7), max: Math.round(maxHR * 0.85), name: 'Cardio' },
            peak: { min: Math.round(maxHR * 0.85), max: maxHR, name: 'Peak' },
            maximum: maxHR
        };
    }
    
    // Body Fat Percentage (estimated using Navy method)
    estimateBodyFat(waistCm, neckCm, hipsCm = null) {
        const profile = this.dataManager.getUserProfile();
        if (!profile.height || !profile.gender) return null;
        
        let bodyFat;
        
        if (profile.gender === 'male') {
            bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waistCm - neckCm) + 0.15456 * Math.log10(profile.height)) - 450;
        } else {
            if (!hipsCm) return null;
            bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waistCm + hipsCm - neckCm) + 0.22100 * Math.log10(profile.height)) - 450;
        }
        
        return {
            percentage: Math.round(bodyFat * 10) / 10,
            category: this.getBodyFatCategory(bodyFat, profile.gender),
            healthyRange: this.getHealthyBodyFatRange(profile.gender)
        };
    }
    
    // Get body fat category
    getBodyFatCategory(bodyFat, gender) {
        const ranges = {
            male: [
                { max: 6, name: 'Essential', color: 'blue' },
                { max: 14, name: 'Athletes', color: 'green' },
                { max: 18, name: 'Fitness', color: 'green' },
                { max: 25, name: 'Average', color: 'orange' },
                { max: 100, name: 'Obese', color: 'red' }
            ],
            female: [
                { max: 14, name: 'Essential', color: 'blue' },
                { max: 21, name: 'Athletes', color: 'green' },
                { max: 25, name: 'Fitness', color: 'green' },
                { max: 32, name: 'Average', color: 'orange' },
                { max: 100, name: 'Obese', color: 'red' }
            ]
        };
        
        const genderRanges = ranges[gender] || ranges.male;
        const category = genderRanges.find(range => bodyFat <= range.max);
        
        return category || { name: 'Unknown', color: 'gray' };
    }
    
    // Get healthy body fat range
    getHealthyBodyFatRange(gender) {
        return gender === 'male' 
            ? { min: 10, max: 18 }
            : { min: 16, max: 25 };
    }
    
    // Show notification
    showNotification(title, body, tag = 'health') {
        if (!this.notificationPermission) return;
        
        try {
            const notification = new Notification(title, {
                body: body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: tag,
                requireInteraction: false,
                silent: false
            });
            
            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
            
            return notification;
        } catch (error) {
            console.error('Failed to show notification:', error);
        }
    }
    
    // Get health summary
    getHealthSummary() {
        const bmi = this.calculateBMI();
        const bmr = this.calculateBMR();
        const waterProgress = this.getWaterProgress();
        const sleepProgress = this.getSleepProgress();
        const heartRateZones = this.getHeartRateZones();
        
        return {
            bmi,
            bmr,
            waterProgress,
            sleepProgress,
            heartRateZones,
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Get weekly health trends
    getWeeklyHealthTrends() {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 6); // Last 7 days
        
        const trends = {
            water: [],
            sleep: [],
            dates: []
        };
        
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
            const dateStr = date.toISOString().split('T')[0];
            
            trends.dates.push(dateStr);
            
            // Water intake
            const waterData = this.dataManager.getWaterIntake(dateStr);
            trends.water.push(waterData.glasses || 0);
            
            // Sleep data
            const sleepData = this.getSleepData(dateStr);
            trends.sleep.push(sleepData ? sleepData.duration : 0);
        }
        
        return trends;
    }
    
    // Clear all reminders
    clearReminders() {
        this.waterReminders.forEach(id => clearTimeout(id));
        this.sleepReminders.forEach(id => clearTimeout(id));
        
        this.waterReminders = [];
        this.sleepReminders = [];
    }
    
    // Update notification settings
    updateNotificationSettings(settings) {
        this.clearReminders();
        
        if (settings.waterReminders) {
            this.setupWaterReminders();
        }
        
        if (settings.sleepReminders) {
            this.setupSleepReminders();
        }
    }
}

// Export for use in other modules
window.HealthManager = HealthManager;
