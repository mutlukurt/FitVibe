/**
 * Data Manager - Handles all data persistence and management
 */
class DataManager {
    constructor() {
        this.storageKeys = {
            USER_PROFILE: 'fittracker_user_profile',
            DAILY_ACTIVITIES: 'fittracker_daily_activities',
            WORKOUT_HISTORY: 'fittracker_workout_history',
            GOALS: 'fittracker_goals',
            ACHIEVEMENTS: 'fittracker_achievements',
            SETTINGS: 'fittracker_settings',
            WATER_INTAKE: 'fittracker_water_intake',
            SLEEP_DATA: 'fittracker_sleep_data'
        };
        
        this.initializeDefaultData();
    }
    
    // Initialize default data structures
    initializeDefaultData() {
        if (!this.getUserProfile()) {
            this.setUserProfile(this.getDefaultUserProfile());
        }
        
        if (!this.getGoals()) {
            this.setGoals(this.getDefaultGoals());
        }
        
        if (!this.getSettings()) {
            this.setSettings(this.getDefaultSettings());
        }
        
        if (!this.getAchievements()) {
            this.setAchievements([]);
        }
        
        // Initialize today's activities if not exists
        const today = new Date().toISOString().split('T')[0];
        if (!this.getDailyActivities(today)) {
            this.setDailyActivities(today, this.getDefaultDailyActivities());
        }
    }
    
    // Default data structures
    getDefaultUserProfile() {
        return {
            name: 'Mutlu Kurt',
            age: 30,
            gender: 'male',
            height: 175, // cm
            weight: 70, // kg
            activityLevel: 'moderate',
            joinDate: new Date().toISOString(),
            avatar: null
        };
    }
    
    getDefaultGoals() {
        return {
            daily: {
                steps: 10000,
                calories: 2500,
                distance: 10, // km
                activeMinutes: 60,
                water: 8, // glasses
                sleep: 8 // hours
            },
            weekly: {
                workouts: 5,
                weightLoss: 0.5 // kg
            }
        };
    }
    
    getDefaultSettings() {
        return {
            theme: 'dark',
            notifications: {
                workoutReminders: true,
                waterReminders: true,
                sleepReminders: true,
                achievementAlerts: true
            },
            units: {
                distance: 'km',
                weight: 'kg',
                temperature: 'celsius'
            },
            privacy: {
                shareAchievements: true,
                publicProfile: false
            }
        };
    }
    
    getDefaultDailyActivities() {
        return {
            steps: 0,
            calories: 0,
            distance: 0,
            activeMinutes: 0,
            water: 0,
            sleep: 0,
            workouts: [],
            heartRate: [],
            lastUpdated: new Date().toISOString()
        };
    }
    
    // User Profile Management
    getUserProfile() {
        return this.getFromStorage(this.storageKeys.USER_PROFILE);
    }
    
    setUserProfile(profile) {
        return this.setToStorage(this.storageKeys.USER_PROFILE, profile);
    }
    
    updateUserProfile(updates) {
        const currentProfile = this.getUserProfile();
        const updatedProfile = { ...currentProfile, ...updates };
        return this.setUserProfile(updatedProfile);
    }
    
    // Daily Activities Management
    getDailyActivities(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const allActivities = this.getFromStorage(this.storageKeys.DAILY_ACTIVITIES) || {};
        return allActivities[targetDate];
    }
    
    setDailyActivities(date, activities) {
        const allActivities = this.getFromStorage(this.storageKeys.DAILY_ACTIVITIES) || {};
        allActivities[date] = { ...activities, lastUpdated: new Date().toISOString() };
        return this.setToStorage(this.storageKeys.DAILY_ACTIVITIES, allActivities);
    }
    
    updateDailyActivity(activityType, value, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const currentActivities = this.getDailyActivities(targetDate) || this.getDefaultDailyActivities();
        currentActivities[activityType] = value;
        return this.setDailyActivities(targetDate, currentActivities);
    }
    
    incrementDailyActivity(activityType, increment, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const currentActivities = this.getDailyActivities(targetDate) || this.getDefaultDailyActivities();
        currentActivities[activityType] = (currentActivities[activityType] || 0) + increment;
        return this.setDailyActivities(targetDate, currentActivities);
    }
    
    // Workout History Management
    getWorkoutHistory() {
        return this.getFromStorage(this.storageKeys.WORKOUT_HISTORY) || [];
    }
    
    addWorkout(workout) {
        const history = this.getWorkoutHistory();
        const workoutWithId = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...workout
        };
        history.unshift(workoutWithId);
        
        // Keep only last 100 workouts
        if (history.length > 100) {
            history.splice(100);
        }
        
        this.setToStorage(this.storageKeys.WORKOUT_HISTORY, history);
        
        // Update daily activities
        const today = new Date().toISOString().split('T')[0];
        this.incrementDailyActivity('activeMinutes', workout.duration || 0, today);
        this.incrementDailyActivity('calories', workout.caloriesBurned || 0, today);
        
        return workoutWithId;
    }
    
    updateWorkout(workoutId, updates) {
        const history = this.getWorkoutHistory();
        const index = history.findIndex(w => w.id === workoutId);
        if (index !== -1) {
            history[index] = { ...history[index], ...updates };
            this.setToStorage(this.storageKeys.WORKOUT_HISTORY, history);
            return history[index];
        }
        return null;
    }
    
    deleteWorkout(workoutId) {
        const history = this.getWorkoutHistory();
        const filteredHistory = history.filter(w => w.id !== workoutId);
        this.setToStorage(this.storageKeys.WORKOUT_HISTORY, filteredHistory);
        return true;
    }
    
    // Goals Management
    getGoals() {
        return this.getFromStorage(this.storageKeys.GOALS);
    }
    
    setGoals(goals) {
        return this.setToStorage(this.storageKeys.GOALS, goals);
    }
    
    updateGoal(category, goalType, value) {
        const goals = this.getGoals();
        if (!goals[category]) goals[category] = {};
        goals[category][goalType] = value;
        return this.setGoals(goals);
    }
    
    // Achievements Management
    getAchievements() {
        return this.getFromStorage(this.storageKeys.ACHIEVEMENTS) || [];
    }
    
    addAchievement(achievement) {
        const achievements = this.getAchievements();
        const newAchievement = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            ...achievement
        };
        achievements.push(newAchievement);
        this.setToStorage(this.storageKeys.ACHIEVEMENTS, achievements);
        return newAchievement;
    }
    
    // Settings Management
    getSettings() {
        return this.getFromStorage(this.storageKeys.SETTINGS);
    }
    
    setSettings(settings) {
        return this.setToStorage(this.storageKeys.SETTINGS, settings);
    }
    
    updateSetting(category, key, value) {
        const settings = this.getSettings();
        if (!settings[category]) settings[category] = {};
        settings[category][key] = value;
        return this.setSettings(settings);
    }
    
    // Water Intake Management
    getWaterIntake(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const waterData = this.getFromStorage(this.storageKeys.WATER_INTAKE) || {};
        return waterData[targetDate] || { glasses: 0, logs: [] };
    }
    
    addWaterIntake(amount, date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const waterData = this.getFromStorage(this.storageKeys.WATER_INTAKE) || {};
        if (!waterData[targetDate]) {
            waterData[targetDate] = { glasses: 0, logs: [] };
        }
        
        waterData[targetDate].glasses += amount;
        waterData[targetDate].logs.push({
            amount,
            timestamp: new Date().toISOString()
        });
        
        this.setToStorage(this.storageKeys.WATER_INTAKE, waterData);
        this.updateDailyActivity('water', waterData[targetDate].glasses, targetDate);
        
        return waterData[targetDate];
    }
    
    // Sleep Data Management
    getSleepData(date = null) {
        const targetDate = date || new Date().toISOString().split('T')[0];
        const sleepData = this.getFromStorage(this.storageKeys.SLEEP_DATA) || {};
        return sleepData[targetDate];
    }
    
    setSleepData(date, sleepInfo) {
        const sleepData = this.getFromStorage(this.storageKeys.SLEEP_DATA) || {};
        sleepData[date] = sleepInfo;
        this.setToStorage(this.storageKeys.SLEEP_DATA, sleepData);
        this.updateDailyActivity('sleep', sleepInfo.duration, date);
        return sleepInfo;
    }
    
    // Analytics and Statistics
    getWeeklyStats(startDate = null) {
        const start = startDate ? new Date(startDate) : new Date();
        start.setDate(start.getDate() - start.getDay()); // Start of week
        
        const weekStats = {
            steps: [],
            calories: [],
            distance: [],
            activeMinutes: [],
            workouts: 0,
            totalSteps: 0,
            totalCalories: 0,
            totalDistance: 0,
            totalActiveMinutes: 0
        };
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = this.getDailyActivities(dateStr) || this.getDefaultDailyActivities();
            
            weekStats.steps.push(dayData.steps || 0);
            weekStats.calories.push(dayData.calories || 0);
            weekStats.distance.push(dayData.distance || 0);
            weekStats.activeMinutes.push(dayData.activeMinutes || 0);
            
            weekStats.totalSteps += dayData.steps || 0;
            weekStats.totalCalories += dayData.calories || 0;
            weekStats.totalDistance += dayData.distance || 0;
            weekStats.totalActiveMinutes += dayData.activeMinutes || 0;
            weekStats.workouts += dayData.workouts ? dayData.workouts.length : 0;
        }
        
        return weekStats;
    }
    
    getMonthlyStats(year = null, month = null) {
        const now = new Date();
        const targetYear = year || now.getFullYear();
        const targetMonth = month || now.getMonth();
        
        const daysInMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
        const monthStats = {
            days: [],
            steps: [],
            calories: [],
            distance: [],
            activeMinutes: [],
            workouts: 0,
            totalSteps: 0,
            totalCalories: 0,
            totalDistance: 0,
            totalActiveMinutes: 0,
            activeDays: 0
        };
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(targetYear, targetMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = this.getDailyActivities(dateStr) || this.getDefaultDailyActivities();
            
            monthStats.days.push(day);
            monthStats.steps.push(dayData.steps || 0);
            monthStats.calories.push(dayData.calories || 0);
            monthStats.distance.push(dayData.distance || 0);
            monthStats.activeMinutes.push(dayData.activeMinutes || 0);
            
            monthStats.totalSteps += dayData.steps || 0;
            monthStats.totalCalories += dayData.calories || 0;
            monthStats.totalDistance += dayData.distance || 0;
            monthStats.totalActiveMinutes += dayData.activeMinutes || 0;
            monthStats.workouts += dayData.workouts ? dayData.workouts.length : 0;
            
            if (dayData.steps > 0 || dayData.activeMinutes > 0) {
                monthStats.activeDays++;
            }
        }
        
        return monthStats;
    }
    
    // Streak Calculation
    getCurrentStreak() {
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 365; i++) { // Check up to a year
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = this.getDailyActivities(dateStr);
            
            if (dayData && (dayData.steps > 1000 || dayData.activeMinutes > 10)) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Data Import/Export
    exportData() {
        const data = {
            userProfile: this.getUserProfile(),
            dailyActivities: this.getFromStorage(this.storageKeys.DAILY_ACTIVITIES),
            workoutHistory: this.getWorkoutHistory(),
            goals: this.getGoals(),
            achievements: this.getAchievements(),
            settings: this.getSettings(),
            waterIntake: this.getFromStorage(this.storageKeys.WATER_INTAKE),
            sleepData: this.getFromStorage(this.storageKeys.SLEEP_DATA),
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            // Validate data structure
            if (!data.version || !data.exportDate) {
                throw new Error('Invalid data format');
            }
            
            // Import data
            if (data.userProfile) this.setUserProfile(data.userProfile);
            if (data.dailyActivities) this.setToStorage(this.storageKeys.DAILY_ACTIVITIES, data.dailyActivities);
            if (data.workoutHistory) this.setToStorage(this.storageKeys.WORKOUT_HISTORY, data.workoutHistory);
            if (data.goals) this.setGoals(data.goals);
            if (data.achievements) this.setToStorage(this.storageKeys.ACHIEVEMENTS, data.achievements);
            if (data.settings) this.setSettings(data.settings);
            if (data.waterIntake) this.setToStorage(this.storageKeys.WATER_INTAKE, data.waterIntake);
            if (data.sleepData) this.setToStorage(this.storageKeys.SLEEP_DATA, data.sleepData);
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
    
    // Clear all data
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
        this.initializeDefaultData();
    }
    
    // Health Calculations
    calculateBMI() {
        const profile = this.getUserProfile();
        if (!profile.height || !profile.weight) return null;
        
        const heightInMeters = profile.height / 100;
        const bmi = profile.weight / (heightInMeters * heightInMeters);
        
        return {
            value: Math.round(bmi * 10) / 10,
            category: this.getBMICategory(bmi)
        };
    }
    
    getBMICategory(bmi) {
        if (bmi < 18.5) return 'Underweight';
        if (bmi < 25) return 'Normal';
        if (bmi < 30) return 'Overweight';
        return 'Obese';
    }
    
    calculateBMR() {
        const profile = this.getUserProfile();
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
            tdee: Math.round(tdee)
        };
    }
    
    // Storage Helper Methods
    getFromStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error reading from storage:', error);
            return null;
        }
    }
    
    setToStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error writing to storage:', error);
            return false;
        }
    }
    
    // Data validation
    validateUserProfile(profile) {
        const errors = [];
        
        if (!profile.name || profile.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!profile.age || profile.age < 13 || profile.age > 120) {
            errors.push('Age must be between 13 and 120');
        }
        
        if (!profile.height || profile.height < 100 || profile.height > 250) {
            errors.push('Height must be between 100 and 250 cm');
        }
        
        if (!profile.weight || profile.weight < 30 || profile.weight > 300) {
            errors.push('Weight must be between 30 and 300 kg');
        }
        
        if (!['male', 'female', 'other'].includes(profile.gender)) {
            errors.push('Please select a valid gender');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    // Export all user data
    exportAllData() {
        return {
            profile: this.getUserProfile(),
            dailyActivities: this.getFromStorage(this.storageKeys.DAILY_ACTIVITIES),
            workoutHistory: this.getWorkoutHistory(),
            achievements: this.getAchievements(),
            settings: this.getSettings(),
            goals: this.getDailyGoals(),
            exportDate: new Date().toISOString()
        };
    }
    
    // Clear all user data
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }
    
    // Save settings (alias for setSettings)
    saveSettings(settings) {
        return this.setSettings(settings);
    }
    
    // Save Walk Session
    saveWalkSession(walkData) {
        const activities = this.getFromStorage(this.storageKeys.DAILY_ACTIVITIES) || {};
        const today = new Date().toISOString().split('T')[0];
        
        if (!activities[today]) {
            activities[today] = {
                steps: 0,
                distance: 0,
                calories: 0,
                activeMinutes: 0,
                water: 0,
                sleep: 0,
                workouts: [],
                walks: []
            };
        }
        
        // Add walk to today's activities
        activities[today].walks.push(walkData);
        
        // Update daily totals
        activities[today].steps += walkData.steps;
        activities[today].distance += walkData.distance;
        activities[today].calories += walkData.calories;
        activities[today].activeMinutes += Math.floor(walkData.duration / 60000);
        
        this.saveToStorage(this.storageKeys.DAILY_ACTIVITIES, activities);
        return walkData;
    }
    
    // Update User Profile
    updateUserProfile(profileData) {
        const currentProfile = this.getUserProfile();
        const updatedProfile = { ...currentProfile, ...profileData };
        this.saveToStorage(this.storageKeys.USER_PROFILE, updatedProfile);
        return updatedProfile;
    }
}

// Export for use in other modules
window.DataManager = DataManager;
