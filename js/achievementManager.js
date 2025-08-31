/**
 * Achievement Manager - Handles achievement system, badges, and streaks
 */
class AchievementManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.achievementDefinitions = this.initializeAchievements();
        this.streakData = this.initializeStreakData();
        
        this.setupAchievementListeners();
    }
    
    // Initialize achievement definitions
    initializeAchievements() {
        return {
            // Step achievements
            steps: {
                'first_steps': {
                    title: 'First Steps',
                    description: 'Take your first 100 steps',
                    icon: 'footprints',
                    category: 'steps',
                    requirement: 100,
                    points: 10
                },
                'thousand_steps': {
                    title: '1K Steps',
                    description: 'Walk 1,000 steps in a day',
                    icon: 'footprints',
                    category: 'steps',
                    requirement: 1000,
                    points: 20
                },
                'five_k_steps': {
                    title: '5K Walker',
                    description: 'Walk 5,000 steps in a day',
                    icon: 'footprints',
                    category: 'steps',
                    requirement: 5000,
                    points: 50
                },
                'ten_k_steps': {
                    title: '10K Champion',
                    description: 'Walk 10,000 steps in a day',
                    icon: 'target',
                    category: 'steps',
                    requirement: 10000,
                    points: 100
                },
                'twenty_k_steps': {
                    title: 'Step Master',
                    description: 'Walk 20,000 steps in a day',
                    icon: 'award',
                    category: 'steps',
                    requirement: 20000,
                    points: 200
                }
            },
            
            // Workout achievements
            workouts: {
                'first_workout': {
                    title: 'Getting Started',
                    description: 'Complete your first workout',
                    icon: 'play',
                    category: 'workouts',
                    requirement: 1,
                    points: 25
                },
                'workout_warrior': {
                    title: 'Workout Warrior',
                    description: 'Complete 10 workouts',
                    icon: 'dumbbell',
                    category: 'workouts',
                    requirement: 10,
                    points: 100
                },
                'fitness_fanatic': {
                    title: 'Fitness Fanatic',
                    description: 'Complete 50 workouts',
                    icon: 'trophy',
                    category: 'workouts',
                    requirement: 50,
                    points: 500
                },
                'marathon_trainer': {
                    title: 'Marathon Trainer',
                    description: 'Work out for 60 minutes in a single session',
                    icon: 'clock',
                    category: 'workouts',
                    requirement: 60,
                    points: 150
                },
                'calorie_crusher': {
                    title: 'Calorie Crusher',
                    description: 'Burn 500+ calories in one workout',
                    icon: 'flame',
                    category: 'workouts',
                    requirement: 500,
                    points: 100
                }
            },
            
            // Streak achievements
            streaks: {
                'three_day_streak': {
                    title: '3-Day Streak',
                    description: 'Stay active for 3 consecutive days',
                    icon: 'calendar',
                    category: 'streaks',
                    requirement: 3,
                    points: 50
                },
                'week_warrior': {
                    title: 'Week Warrior',
                    description: 'Stay active for 7 consecutive days',
                    icon: 'calendar-check',
                    category: 'streaks',
                    requirement: 7,
                    points: 150
                },
                'month_master': {
                    title: 'Month Master',
                    description: 'Stay active for 30 consecutive days',
                    icon: 'star',
                    category: 'streaks',
                    requirement: 30,
                    points: 500
                }
            },
            
            // Health achievements
            health: {
                'hydration_hero': {
                    title: 'Hydration Hero',
                    description: 'Drink 8 glasses of water in a day',
                    icon: 'droplets',
                    category: 'health',
                    requirement: 8,
                    points: 30
                },
                'sleep_champion': {
                    title: 'Sleep Champion',
                    description: 'Get 8+ hours of sleep',
                    icon: 'moon',
                    category: 'health',
                    requirement: 8,
                    points: 40
                },
                'health_tracker': {
                    title: 'Health Tracker',
                    description: 'Log health data for 7 consecutive days',
                    icon: 'heart',
                    category: 'health',
                    requirement: 7,
                    points: 100
                }
            },
            
            // Goal achievements
            goals: {
                'goal_getter': {
                    title: 'Goal Getter',
                    description: 'Achieve all daily goals in one day',
                    icon: 'target',
                    category: 'goals',
                    requirement: 1,
                    points: 100
                },
                'consistency_king': {
                    title: 'Consistency King',
                    description: 'Meet daily goals for 7 consecutive days',
                    icon: 'crown',
                    category: 'goals',
                    requirement: 7,
                    points: 300
                },
                'overachiever': {
                    title: 'Overachiever',
                    description: 'Exceed all daily goals by 50%',
                    icon: 'trending-up',
                    category: 'goals',
                    requirement: 1.5,
                    points: 200
                }
            },
            
            // Social achievements
            social: {
                'sharing_is_caring': {
                    title: 'Sharing is Caring',
                    description: 'Share your first achievement',
                    icon: 'share',
                    category: 'social',
                    requirement: 1,
                    points: 25
                },
                'motivator': {
                    title: 'Motivator',
                    description: 'Encourage 10 friends',
                    icon: 'users',
                    category: 'social',
                    requirement: 10,
                    points: 100
                }
            },
            
            // Special achievements
            special: {
                'early_bird': {
                    title: 'Early Bird',
                    description: 'Complete a workout before 7 AM',
                    icon: 'sunrise',
                    category: 'special',
                    requirement: 1,
                    points: 75
                },
                'night_owl': {
                    title: 'Night Owl',
                    description: 'Complete a workout after 9 PM',
                    icon: 'moon',
                    category: 'special',
                    requirement: 1,
                    points: 75
                },
                'weekend_warrior': {
                    title: 'Weekend Warrior',
                    description: 'Work out on both Saturday and Sunday',
                    icon: 'calendar',
                    category: 'special',
                    requirement: 2,
                    points: 100
                },
                'perfectionist': {
                    title: 'Perfectionist',
                    description: 'Complete a workout with 100% accuracy',
                    icon: 'check-circle',
                    category: 'special',
                    requirement: 1,
                    points: 150
                }
            }
        };
    }
    
    // Initialize streak tracking data
    initializeStreakData() {
        return {
            current: 0,
            longest: 0,
            lastActiveDate: null,
            streakType: 'activity' // activity, workout, steps, etc.
        };
    }
    
    // Setup achievement listeners
    setupAchievementListeners() {
        // Listen for step updates
        document.addEventListener('stepUpdate', (e) => {
            this.checkStepAchievements(e.detail.currentSteps);
        });
        
        // Listen for workout completions
        document.addEventListener('workoutComplete', (e) => {
            this.checkWorkoutAchievements(e.detail);
        });
        
        // Listen for health updates
        document.addEventListener('waterUpdate', (e) => {
            this.checkHealthAchievements('water', e.detail.glasses);
        });
        
        document.addEventListener('sleepUpdate', (e) => {
            this.checkHealthAchievements('sleep', e.detail.duration);
        });
        
        // Daily check for goal achievements
        this.scheduleGoalChecks();
    }
    
    // Check step-based achievements
    checkStepAchievements(stepCount) {
        const stepAchievements = this.achievementDefinitions.steps;
        const earnedAchievements = [];
        
        Object.entries(stepAchievements).forEach(([id, achievement]) => {
            if (stepCount >= achievement.requirement) {
                if (this.awardAchievement(id, achievement)) {
                    earnedAchievements.push({ id, ...achievement });
                }
            }
        });
        
        return earnedAchievements;
    }
    
    // Check workout-based achievements
    checkWorkoutAchievements(workoutData) {
        const workoutAchievements = this.achievementDefinitions.workouts;
        const earnedAchievements = [];
        
        // Check duration-based achievements
        if (workoutData.duration >= 60) {
            const achievement = workoutAchievements.marathon_trainer;
            if (this.awardAchievement('marathon_trainer', achievement)) {
                earnedAchievements.push({ id: 'marathon_trainer', ...achievement });
            }
        }
        
        // Check calorie-based achievements
        if (workoutData.caloriesBurned >= 500) {
            const achievement = workoutAchievements.calorie_crusher;
            if (this.awardAchievement('calorie_crusher', achievement)) {
                earnedAchievements.push({ id: 'calorie_crusher', ...achievement });
            }
        }
        
        // Check total workout count achievements
        const totalWorkouts = this.dataManager.getWorkoutHistory().length;
        Object.entries(workoutAchievements).forEach(([id, achievement]) => {
            if (['first_workout', 'workout_warrior', 'fitness_fanatic'].includes(id)) {
                if (totalWorkouts >= achievement.requirement) {
                    if (this.awardAchievement(id, achievement)) {
                        earnedAchievements.push({ id, ...achievement });
                    }
                }
            }
        });
        
        // Check time-based achievements
        const workoutHour = new Date(workoutData.startTime).getHours();
        if (workoutHour < 7) {
            const achievement = this.achievementDefinitions.special.early_bird;
            if (this.awardAchievement('early_bird', achievement)) {
                earnedAchievements.push({ id: 'early_bird', ...achievement });
            }
        } else if (workoutHour >= 21) {
            const achievement = this.achievementDefinitions.special.night_owl;
            if (this.awardAchievement('night_owl', achievement)) {
                earnedAchievements.push({ id: 'night_owl', ...achievement });
            }
        }
        
        return earnedAchievements;
    }
    
    // Check health-based achievements
    checkHealthAchievements(type, value) {
        const healthAchievements = this.achievementDefinitions.health;
        const earnedAchievements = [];
        
        if (type === 'water' && value >= 8) {
            const achievement = healthAchievements.hydration_hero;
            if (this.awardAchievement('hydration_hero', achievement)) {
                earnedAchievements.push({ id: 'hydration_hero', ...achievement });
            }
        }
        
        if (type === 'sleep' && value >= 8) {
            const achievement = healthAchievements.sleep_champion;
            if (this.awardAchievement('sleep_champion', achievement)) {
                earnedAchievements.push({ id: 'sleep_champion', ...achievement });
            }
        }
        
        return earnedAchievements;
    }
    
    // Check goal-based achievements
    checkGoalAchievements() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        const goals = this.dataManager.getGoals();
        const earnedAchievements = [];
        
        if (!activities || !goals) return earnedAchievements;
        
        // Check if all daily goals are met
        const goalsMet = [
            activities.steps >= goals.daily.steps,
            activities.calories >= goals.daily.calories,
            activities.distance >= goals.daily.distance,
            activities.activeMinutes >= goals.daily.activeMinutes
        ];
        
        if (goalsMet.every(met => met)) {
            const achievement = this.achievementDefinitions.goals.goal_getter;
            if (this.awardAchievement('goal_getter', achievement)) {
                earnedAchievements.push({ id: 'goal_getter', ...achievement });
            }
        }
        
        // Check if goals are exceeded by 50%
        const goalsExceeded = [
            activities.steps >= goals.daily.steps * 1.5,
            activities.calories >= goals.daily.calories * 1.5,
            activities.distance >= goals.daily.distance * 1.5,
            activities.activeMinutes >= goals.daily.activeMinutes * 1.5
        ];
        
        if (goalsExceeded.every(exceeded => exceeded)) {
            const achievement = this.achievementDefinitions.goals.overachiever;
            if (this.awardAchievement('overachiever', achievement)) {
                earnedAchievements.push({ id: 'overachiever', ...achievement });
            }
        }
        
        return earnedAchievements;
    }
    
    // Check streak achievements
    checkStreakAchievements() {
        const currentStreak = this.updateActivityStreak();
        const streakAchievements = this.achievementDefinitions.streaks;
        const earnedAchievements = [];
        
        Object.entries(streakAchievements).forEach(([id, achievement]) => {
            if (currentStreak >= achievement.requirement) {
                if (this.awardAchievement(id, achievement)) {
                    earnedAchievements.push({ id, ...achievement });
                }
            }
        });
        
        return earnedAchievements;
    }
    
    // Update activity streak
    updateActivityStreak() {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        
        // Consider active if user has steps > 1000 OR active minutes > 10
        const isActiveToday = (activities.steps > 1000) || (activities.activeMinutes > 10);
        
        if (isActiveToday) {
            if (this.streakData.lastActiveDate === this.getYesterday()) {
                // Continue streak
                this.streakData.current++;
            } else if (this.streakData.lastActiveDate === today) {
                // Already counted today
                return this.streakData.current;
            } else {
                // Start new streak
                this.streakData.current = 1;
            }
            
            this.streakData.lastActiveDate = today;
            
            // Update longest streak
            if (this.streakData.current > this.streakData.longest) {
                this.streakData.longest = this.streakData.current;
            }
            
            // Save streak data
            localStorage.setItem('fitness_streak_data', JSON.stringify(this.streakData));
        }
        
        return this.streakData.current;
    }
    
    // Get yesterday's date string
    getYesterday() {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString().split('T')[0];
    }
    
    // Award achievement
    awardAchievement(id, achievement) {
        const existingAchievements = this.dataManager.getAchievements();
        
        // Check if already earned (for daily achievements, check if earned today)
        const today = new Date().toISOString().split('T')[0];
        const alreadyEarned = existingAchievements.some(a => {
            if (achievement.category === 'steps' || achievement.category === 'health' || achievement.category === 'goals') {
                // Daily achievements - check if earned today
                return a.id === id && a.timestamp.startsWith(today);
            } else {
                // One-time achievements
                return a.id === id;
            }
        });
        
        if (alreadyEarned) {
            return false;
        }
        
        // Award the achievement
        const newAchievement = {
            id: id,
            title: achievement.title,
            description: achievement.description,
            icon: achievement.icon,
            category: achievement.category,
            points: achievement.points,
            timestamp: new Date().toISOString()
        };
        
        this.dataManager.addAchievement(newAchievement);
        
        // Show achievement notification
        this.showAchievementNotification(newAchievement);
        
        // Update user points
        this.addPoints(achievement.points);
        
        return true;
    }
    
    // Add points to user profile
    addPoints(points) {
        const profile = this.dataManager.getUserProfile();
        const currentPoints = profile.points || 0;
        
        this.dataManager.updateUserProfile({
            points: currentPoints + points
        });
        
        // Check for level up
        this.checkLevelUp(currentPoints + points);
    }
    
    // Check for level up
    checkLevelUp(totalPoints) {
        const currentLevel = this.getLevel(totalPoints - this.getLastLevelPoints(totalPoints));
        const newLevel = this.getLevel(totalPoints);
        
        if (newLevel > currentLevel) {
            this.showLevelUpNotification(newLevel);
        }
    }
    
    // Calculate level based on points
    getLevel(points) {
        // Level formula: level = floor(sqrt(points / 100)) + 1
        return Math.floor(Math.sqrt(points / 100)) + 1;
    }
    
    // Get points needed for current level
    getLastLevelPoints(points) {
        const level = this.getLevel(points);
        return Math.pow(level - 1, 2) * 100;
    }
    
    // Get points needed for next level
    getNextLevelPoints(points) {
        const level = this.getLevel(points);
        return Math.pow(level, 2) * 100;
    }
    
    // Show achievement notification
    showAchievementNotification(achievement) {
        // Create achievement notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">
                    <i data-lucide="${achievement.icon}"></i>
                </div>
                <div class="achievement-text">
                    <h4>Achievement Unlocked!</h4>
                    <h5>${achievement.title}</h5>
                    <p>${achievement.description}</p>
                    <div class="achievement-points">+${achievement.points} points</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Initialize Lucide icons
        if (window.lucide) {
            lucide.createIcons();
        }
        
        // Show notification with animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
        
        // Play achievement sound (if available)
        this.playAchievementSound();
    }
    
    // Show level up notification
    showLevelUpNotification(newLevel) {
        const notification = document.createElement('div');
        notification.className = 'level-up-notification';
        notification.innerHTML = `
            <div class="level-up-content">
                <div class="level-up-icon">
                    <i data-lucide="star"></i>
                </div>
                <div class="level-up-text">
                    <h4>Level Up!</h4>
                    <h5>Level ${newLevel}</h5>
                    <p>Congratulations on reaching a new level!</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        if (window.lucide) {
            lucide.createIcons();
        }
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 6000);
        
        this.playLevelUpSound();
    }
    
    // Play achievement sound
    playAchievementSound() {
        try {
            // Create a simple achievement sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            // Fallback: no sound if Web Audio API is not available
            console.log('Achievement sound not available');
        }
    }
    
    // Play level up sound
    playLevelUpSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // More elaborate sound for level up
            oscillator.frequency.setValueAtTime(261.63, audioContext.currentTime); // C4
            oscillator.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.15); // E4
            oscillator.frequency.setValueAtTime(392.00, audioContext.currentTime + 0.3); // G4
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime + 0.45); // C5
            
            gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.8);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.8);
        } catch (error) {
            console.log('Level up sound not available');
        }
    }
    
    // Get user's achievement summary
    getAchievementSummary() {
        const achievements = this.dataManager.getAchievements();
        const profile = this.dataManager.getUserProfile();
        const totalPoints = profile.points || 0;
        const level = this.getLevel(totalPoints);
        
        // Group achievements by category
        const byCategory = achievements.reduce((acc, achievement) => {
            if (!acc[achievement.category]) {
                acc[achievement.category] = [];
            }
            acc[achievement.category].push(achievement);
            return acc;
        }, {});
        
        // Calculate completion percentage for each category
        const totalPossible = Object.keys(this.achievementDefinitions).reduce((total, category) => {
            return total + Object.keys(this.achievementDefinitions[category]).length;
        }, 0);
        
        return {
            totalAchievements: achievements.length,
            totalPossible: totalPossible,
            completionPercentage: Math.round((achievements.length / totalPossible) * 100),
            totalPoints: totalPoints,
            level: level,
            nextLevelPoints: this.getNextLevelPoints(totalPoints),
            currentStreak: this.streakData.current,
            longestStreak: this.streakData.longest,
            byCategory: byCategory,
            recentAchievements: achievements.slice(-5).reverse() // Last 5 achievements
        };
    }
    
    // Get available achievements (not yet earned)
    getAvailableAchievements() {
        const earnedAchievements = this.dataManager.getAchievements();
        const earnedIds = earnedAchievements.map(a => a.id);
        const available = [];
        
        Object.entries(this.achievementDefinitions).forEach(([category, achievements]) => {
            Object.entries(achievements).forEach(([id, achievement]) => {
                if (!earnedIds.includes(id)) {
                    available.push({
                        id,
                        category,
                        ...achievement,
                        progress: this.getAchievementProgress(id, achievement)
                    });
                }
            });
        });
        
        return available.sort((a, b) => b.progress - a.progress);
    }
    
    // Get progress towards a specific achievement
    getAchievementProgress(id, achievement) {
        const today = new Date().toISOString().split('T')[0];
        const activities = this.dataManager.getDailyActivities(today);
        const workoutHistory = this.dataManager.getWorkoutHistory();
        
        switch (achievement.category) {
            case 'steps':
                return Math.min((activities.steps || 0) / achievement.requirement, 1);
            
            case 'workouts':
                if (id === 'first_workout' || id === 'workout_warrior' || id === 'fitness_fanatic') {
                    return Math.min(workoutHistory.length / achievement.requirement, 1);
                }
                return 0;
            
            case 'streaks':
                return Math.min(this.streakData.current / achievement.requirement, 1);
            
            case 'health':
                if (id === 'hydration_hero') {
                    const waterData = this.dataManager.getWaterIntake(today);
                    return Math.min((waterData.glasses || 0) / achievement.requirement, 1);
                }
                if (id === 'sleep_champion') {
                    const sleepData = this.dataManager.getSleepData(today);
                    return sleepData ? Math.min(sleepData.duration / achievement.requirement, 1) : 0;
                }
                return 0;
            
            default:
                return 0;
        }
    }
    
    // Schedule daily goal checks
    scheduleGoalChecks() {
        // Check goals at the end of each day
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        
        const timeUntilEndOfDay = endOfDay.getTime() - now.getTime();
        
        setTimeout(() => {
            this.checkGoalAchievements();
            this.checkStreakAchievements();
            
            // Schedule for next day
            setInterval(() => {
                this.checkGoalAchievements();
                this.checkStreakAchievements();
            }, 24 * 60 * 60 * 1000); // Every 24 hours
        }, timeUntilEndOfDay);
    }
    
    // Share achievement
    shareAchievement(achievementId) {
        const achievement = this.dataManager.getAchievements().find(a => a.id === achievementId);
        if (!achievement) return false;
        
        const shareText = `🏆 I just earned the "${achievement.title}" achievement in FitTracker! ${achievement.description}`;
        
        if (navigator.share) {
            // Use native sharing if available
            navigator.share({
                title: 'FitTracker Achievement',
                text: shareText,
                url: window.location.href
            }).catch(console.error);
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                // Show notification that text was copied
                document.dispatchEvent(new CustomEvent('showNotification', {
                    detail: { message: 'Achievement copied to clipboard!', type: 'success' }
                }));
            }).catch(console.error);
        }
        
        // Award sharing achievement
        const sharingAchievement = this.achievementDefinitions.social.sharing_is_caring;
        this.awardAchievement('sharing_is_caring', sharingAchievement);
        
        return true;
    }
    
    // Reset achievements (for testing or user request)
    resetAchievements() {
        localStorage.removeItem('fitness_achievements');
        localStorage.removeItem('fitness_streak_data');
        this.streakData = this.initializeStreakData();
        
        // Update user points
        this.dataManager.updateUserProfile({ points: 0 });
    }
}

// Export for use in other modules
window.AchievementManager = AchievementManager;
