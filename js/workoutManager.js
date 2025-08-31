/**
 * Workout Manager - Handles workout tracking and exercise database
 */
class WorkoutManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.currentWorkout = null;
        this.workoutTimer = null;
        this.restTimer = null;
        this.isWorkoutActive = false;
        this.isPaused = false;
        this.startTime = null;
        this.elapsedTime = 0;
        this.restStartTime = null;
        this.restDuration = 0;
        
        this.exerciseDatabase = this.initializeExerciseDatabase();
        this.workoutTemplates = this.initializeWorkoutTemplates();
    }
    
    // Exercise Database
    initializeExerciseDatabase() {
        return {
            strength: [
                {
                    id: 'push_up',
                    name: 'Push-ups',
                    category: 'strength',
                    muscleGroups: ['chest', 'triceps', 'shoulders'],
                    equipment: 'bodyweight',
                    instructions: 'Start in plank position, lower body until chest nearly touches floor, push back up',
                    caloriesPerMinute: 8,
                    difficulty: 'beginner'
                },
                {
                    id: 'squat',
                    name: 'Squats',
                    category: 'strength',
                    muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
                    equipment: 'bodyweight',
                    instructions: 'Stand with feet shoulder-width apart, lower hips back and down, return to standing',
                    caloriesPerMinute: 6,
                    difficulty: 'beginner'
                },
                {
                    id: 'deadlift',
                    name: 'Deadlifts',
                    category: 'strength',
                    muscleGroups: ['hamstrings', 'glutes', 'back'],
                    equipment: 'barbell',
                    instructions: 'Stand with feet hip-width apart, hinge at hips, lower weight, return to standing',
                    caloriesPerMinute: 10,
                    difficulty: 'intermediate'
                },
                {
                    id: 'bench_press',
                    name: 'Bench Press',
                    category: 'strength',
                    muscleGroups: ['chest', 'triceps', 'shoulders'],
                    equipment: 'barbell',
                    instructions: 'Lie on bench, lower bar to chest, press up to full extension',
                    caloriesPerMinute: 9,
                    difficulty: 'intermediate'
                },
                {
                    id: 'plank',
                    name: 'Plank',
                    category: 'strength',
                    muscleGroups: ['core', 'shoulders'],
                    equipment: 'bodyweight',
                    instructions: 'Hold body in straight line from head to heels, engage core',
                    caloriesPerMinute: 5,
                    difficulty: 'beginner'
                }
            ],
            cardio: [
                {
                    id: 'running',
                    name: 'Running',
                    category: 'cardio',
                    muscleGroups: ['legs', 'cardiovascular'],
                    equipment: 'none',
                    instructions: 'Maintain steady pace, focus on breathing rhythm',
                    caloriesPerMinute: 12,
                    difficulty: 'intermediate'
                },
                {
                    id: 'cycling',
                    name: 'Cycling',
                    category: 'cardio',
                    muscleGroups: ['legs', 'cardiovascular'],
                    equipment: 'bicycle',
                    instructions: 'Maintain consistent pedaling rhythm, adjust resistance as needed',
                    caloriesPerMinute: 10,
                    difficulty: 'beginner'
                },
                {
                    id: 'jumping_jacks',
                    name: 'Jumping Jacks',
                    category: 'cardio',
                    muscleGroups: ['full body', 'cardiovascular'],
                    equipment: 'bodyweight',
                    instructions: 'Jump feet apart while raising arms overhead, return to starting position',
                    caloriesPerMinute: 9,
                    difficulty: 'beginner'
                },
                {
                    id: 'burpees',
                    name: 'Burpees',
                    category: 'cardio',
                    muscleGroups: ['full body', 'cardiovascular'],
                    equipment: 'bodyweight',
                    instructions: 'Squat down, jump back to plank, do push-up, jump feet forward, jump up',
                    caloriesPerMinute: 15,
                    difficulty: 'advanced'
                }
            ],
            yoga: [
                {
                    id: 'sun_salutation',
                    name: 'Sun Salutation',
                    category: 'yoga',
                    muscleGroups: ['full body', 'flexibility'],
                    equipment: 'yoga mat',
                    instructions: 'Flow through mountain pose, forward fold, plank, cobra, downward dog',
                    caloriesPerMinute: 4,
                    difficulty: 'beginner'
                },
                {
                    id: 'warrior_pose',
                    name: 'Warrior Pose',
                    category: 'yoga',
                    muscleGroups: ['legs', 'core', 'balance'],
                    equipment: 'yoga mat',
                    instructions: 'Step one foot forward, bend front knee, extend arms overhead',
                    caloriesPerMinute: 3,
                    difficulty: 'beginner'
                },
                {
                    id: 'downward_dog',
                    name: 'Downward Dog',
                    category: 'yoga',
                    muscleGroups: ['shoulders', 'hamstrings', 'calves'],
                    equipment: 'yoga mat',
                    instructions: 'Form inverted V-shape, hands and feet on ground, hips lifted',
                    caloriesPerMinute: 3,
                    difficulty: 'beginner'
                }
            ],
            hiit: [
                {
                    id: 'hiit_circuit',
                    name: 'HIIT Circuit',
                    category: 'hiit',
                    muscleGroups: ['full body', 'cardiovascular'],
                    equipment: 'bodyweight',
                    instructions: 'High intensity intervals with short rest periods',
                    caloriesPerMinute: 18,
                    difficulty: 'advanced'
                },
                {
                    id: 'tabata',
                    name: 'Tabata',
                    category: 'hiit',
                    muscleGroups: ['full body', 'cardiovascular'],
                    equipment: 'bodyweight',
                    instructions: '20 seconds all-out effort, 10 seconds rest, repeat 8 times',
                    caloriesPerMinute: 20,
                    difficulty: 'advanced'
                }
            ]
        };
    }
    
    // Workout Templates
    initializeWorkoutTemplates() {
        return {
            'full_body_hiit': {
                name: 'Full Body HIIT',
                category: 'hiit',
                duration: 45,
                difficulty: 'intermediate',
                exercises: [
                    { exerciseId: 'burpees', duration: 30, rest: 15 },
                    { exerciseId: 'jumping_jacks', duration: 30, rest: 15 },
                    { exerciseId: 'push_up', reps: 15, rest: 30 },
                    { exerciseId: 'squat', reps: 20, rest: 30 },
                    { exerciseId: 'plank', duration: 45, rest: 60 }
                ]
            },
            'upper_body_strength': {
                name: 'Upper Body Strength',
                category: 'strength',
                duration: 60,
                difficulty: 'intermediate',
                exercises: [
                    { exerciseId: 'bench_press', sets: 3, reps: 10, rest: 90 },
                    { exerciseId: 'push_up', sets: 3, reps: 15, rest: 60 },
                    { exerciseId: 'plank', sets: 3, duration: 60, rest: 60 }
                ]
            },
            'morning_yoga': {
                name: 'Morning Yoga Flow',
                category: 'yoga',
                duration: 20,
                difficulty: 'beginner',
                exercises: [
                    { exerciseId: 'sun_salutation', sets: 5, rest: 15 },
                    { exerciseId: 'warrior_pose', duration: 60, rest: 15 },
                    { exerciseId: 'downward_dog', duration: 45, rest: 15 }
                ]
            },
            'cardio_blast': {
                name: 'Cardio Blast',
                category: 'cardio',
                duration: 30,
                difficulty: 'beginner',
                exercises: [
                    { exerciseId: 'jumping_jacks', duration: 60, rest: 30 },
                    { exerciseId: 'burpees', reps: 10, rest: 45 },
                    { exerciseId: 'running', duration: 300, rest: 60 }
                ]
            }
        };
    }
    
    // Get exercises by category
    getExercisesByCategory(category) {
        return this.exerciseDatabase[category] || [];
    }
    
    // Get exercise by ID
    getExerciseById(exerciseId) {
        for (const category in this.exerciseDatabase) {
            const exercise = this.exerciseDatabase[category].find(ex => ex.id === exerciseId);
            if (exercise) return exercise;
        }
        return null;
    }
    
    // Start a workout
    startWorkout(workoutData) {
        if (this.isWorkoutActive) {
            throw new Error('A workout is already in progress');
        }
        
        this.currentWorkout = {
            id: Date.now().toString(),
            name: workoutData.name || 'Custom Workout',
            category: workoutData.category || 'custom',
            startTime: new Date().toISOString(),
            exercises: workoutData.exercises || [],
            currentExerciseIndex: 0,
            completedExercises: [],
            totalCaloriesBurned: 0,
            notes: ''
        };
        
        this.isWorkoutActive = true;
        this.isPaused = false;
        this.startTime = Date.now();
        this.elapsedTime = 0;
        
        this.startWorkoutTimer();
        
        return this.currentWorkout;
    }
    
    // Start workout timer
    startWorkoutTimer() {
        this.workoutTimer = setInterval(() => {
            if (!this.isPaused) {
                this.elapsedTime = Date.now() - this.startTime;
                this.updateWorkoutDisplay();
            }
        }, 1000);
    }
    
    // Pause workout
    pauseWorkout() {
        if (!this.isWorkoutActive) return false;
        
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            // Pause timers
            if (this.workoutTimer) {
                clearInterval(this.workoutTimer);
                this.workoutTimer = null;
            }
            if (this.restTimer) {
                clearInterval(this.restTimer);
                this.restTimer = null;
            }
        } else {
            // Resume timers
            this.startTime = Date.now() - this.elapsedTime;
            this.startWorkoutTimer();
        }
        
        return this.isPaused;
    }
    
    // Complete current exercise
    completeExercise(exerciseData) {
        if (!this.currentWorkout) return false;
        
        const completedExercise = {
            ...exerciseData,
            completedAt: new Date().toISOString(),
            duration: exerciseData.duration || 0
        };
        
        this.currentWorkout.completedExercises.push(completedExercise);
        
        // Calculate calories burned for this exercise
        const exercise = this.getExerciseById(exerciseData.exerciseId);
        if (exercise && exerciseData.duration) {
            const caloriesBurned = (exercise.caloriesPerMinute * exerciseData.duration) / 60;
            this.currentWorkout.totalCaloriesBurned += caloriesBurned;
        }
        
        // Move to next exercise
        this.currentWorkout.currentExerciseIndex++;
        
        return true;
    }
    
    // Start rest timer
    startRestTimer(duration, callback) {
        this.restDuration = duration;
        this.restStartTime = Date.now();
        
        this.restTimer = setInterval(() => {
            const elapsed = (Date.now() - this.restStartTime) / 1000;
            const remaining = Math.max(0, duration - elapsed);
            
            if (callback) {
                callback(remaining, elapsed);
            }
            
            if (remaining <= 0) {
                this.stopRestTimer();
                if (callback) callback(0, duration);
            }
        }, 100);
        
        return this.restTimer;
    }
    
    // Stop rest timer
    stopRestTimer() {
        if (this.restTimer) {
            clearInterval(this.restTimer);
            this.restTimer = null;
        }
    }
    
    // End workout
    endWorkout(notes = '') {
        if (!this.isWorkoutActive) return null;
        
        // Stop all timers
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
        }
        this.stopRestTimer();
        
        // Finalize workout data
        const finalWorkout = {
            ...this.currentWorkout,
            endTime: new Date().toISOString(),
            duration: Math.floor(this.elapsedTime / 1000 / 60), // in minutes
            notes: notes,
            caloriesBurned: Math.round(this.currentWorkout.totalCaloriesBurned)
        };
        
        // Save to data manager
        const savedWorkout = this.dataManager.addWorkout(finalWorkout);
        
        // Reset state
        this.currentWorkout = null;
        this.isWorkoutActive = false;
        this.isPaused = false;
        this.elapsedTime = 0;
        this.startTime = null;
        
        // Check for achievements
        this.checkWorkoutAchievements(savedWorkout);
        
        return savedWorkout;
    }
    
    // Get current workout status
    getCurrentWorkout() {
        return this.currentWorkout;
    }
    
    // Check if workout is active
    isActive() {
        return this.isWorkoutActive;
    }
    
    // Get formatted elapsed time
    getFormattedElapsedTime() {
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    // Update workout display (to be called by UI)
    updateWorkoutDisplay() {
        if (!this.currentWorkout) return;
        
        const event = new CustomEvent('workoutUpdate', {
            detail: {
                workout: this.currentWorkout,
                elapsedTime: this.elapsedTime,
                formattedTime: this.getFormattedElapsedTime(),
                isPaused: this.isPaused
            }
        });
        
        document.dispatchEvent(event);
    }
    
    // Get workout templates
    getWorkoutTemplates() {
        return this.workoutTemplates;
    }
    
    // Get workout template by ID
    getWorkoutTemplate(templateId) {
        return this.workoutTemplates[templateId];
    }
    
    // Create custom workout
    createCustomWorkout(name, exercises) {
        return {
            name: name,
            category: 'custom',
            exercises: exercises,
            duration: this.estimateWorkoutDuration(exercises)
        };
    }
    
    // Estimate workout duration
    estimateWorkoutDuration(exercises) {
        let totalDuration = 0;
        
        exercises.forEach(exercise => {
            if (exercise.duration) {
                totalDuration += exercise.duration;
            } else if (exercise.sets && exercise.reps) {
                // Estimate 2 seconds per rep + rest time
                totalDuration += (exercise.sets * exercise.reps * 2) + (exercise.rest || 60);
            }
            
            if (exercise.rest) {
                totalDuration += exercise.rest;
            }
        });
        
        return Math.ceil(totalDuration / 60); // Convert to minutes
    }
    
    // Get workout history with filters
    getWorkoutHistory(filters = {}) {
        let history = this.dataManager.getWorkoutHistory();
        
        // Filter by category
        if (filters.category) {
            history = history.filter(workout => workout.category === filters.category);
        }
        
        // Filter by date range
        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            history = history.filter(workout => new Date(workout.startTime) >= startDate);
        }
        
        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            history = history.filter(workout => new Date(workout.startTime) <= endDate);
        }
        
        // Limit results
        if (filters.limit) {
            history = history.slice(0, filters.limit);
        }
        
        return history;
    }
    
    // Get workout statistics
    getWorkoutStats(period = 'week') {
        const history = this.getWorkoutHistory();
        const now = new Date();
        let startDate;
        
        switch (period) {
            case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(0);
        }
        
        const periodWorkouts = history.filter(workout => 
            new Date(workout.startTime) >= startDate
        );
        
        const stats = {
            totalWorkouts: periodWorkouts.length,
            totalDuration: periodWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
            totalCalories: periodWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
            averageDuration: 0,
            favoriteCategory: null,
            categoryBreakdown: {}
        };
        
        // Calculate averages
        if (stats.totalWorkouts > 0) {
            stats.averageDuration = Math.round(stats.totalDuration / stats.totalWorkouts);
        }
        
        // Category breakdown
        periodWorkouts.forEach(workout => {
            const category = workout.category || 'other';
            stats.categoryBreakdown[category] = (stats.categoryBreakdown[category] || 0) + 1;
        });
        
        // Find favorite category
        let maxCount = 0;
        for (const [category, count] of Object.entries(stats.categoryBreakdown)) {
            if (count > maxCount) {
                maxCount = count;
                stats.favoriteCategory = category;
            }
        }
        
        return stats;
    }
    
    // Check for workout achievements
    checkWorkoutAchievements(workout) {
        const achievements = [];
        
        // First workout achievement
        const history = this.dataManager.getWorkoutHistory();
        if (history.length === 1) {
            achievements.push({
                id: 'first_workout',
                title: 'Getting Started',
                description: 'Complete your first workout',
                icon: 'play',
                category: 'milestone'
            });
        }
        
        // Duration achievements
        if (workout.duration >= 60) {
            achievements.push({
                id: 'hour_warrior',
                title: 'Hour Warrior',
                description: 'Complete a workout lasting 1 hour or more',
                icon: 'clock',
                category: 'duration'
            });
        }
        
        // Calorie achievements
        if (workout.caloriesBurned >= 500) {
            achievements.push({
                id: 'calorie_crusher',
                title: 'Calorie Crusher',
                description: 'Burn 500+ calories in a single workout',
                icon: 'flame',
                category: 'calories'
            });
        }
        
        // Streak achievements
        const streak = this.getWorkoutStreak();
        if (streak === 7) {
            achievements.push({
                id: 'week_warrior',
                title: 'Week Warrior',
                description: 'Work out 7 days in a row',
                icon: 'trophy',
                category: 'streak'
            });
        }
        
        // Add achievements to data manager
        achievements.forEach(achievement => {
            this.dataManager.addAchievement(achievement);
        });
        
        return achievements;
    }
    
    // Get workout streak
    getWorkoutStreak() {
        const history = this.dataManager.getWorkoutHistory();
        if (history.length === 0) return 0;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let streak = 0;
        let checkDate = new Date(today);
        
        for (let i = 0; i < 365; i++) { // Check up to a year
            const dayWorkouts = history.filter(workout => {
                const workoutDate = new Date(workout.startTime);
                workoutDate.setHours(0, 0, 0, 0);
                return workoutDate.getTime() === checkDate.getTime();
            });
            
            if (dayWorkouts.length > 0) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        
        return streak;
    }
    
    // Get personal records
    getPersonalRecords() {
        const history = this.dataManager.getWorkoutHistory();
        
        const records = {
            longestWorkout: null,
            mostCaloriesBurned: null,
            mostWorkoutsInWeek: 0,
            currentStreak: this.getWorkoutStreak(),
            totalWorkouts: history.length,
            totalDuration: history.reduce((sum, w) => sum + (w.duration || 0), 0),
            totalCalories: history.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
        };
        
        // Find longest workout
        history.forEach(workout => {
            if (!records.longestWorkout || workout.duration > records.longestWorkout.duration) {
                records.longestWorkout = workout;
            }
        });
        
        // Find most calories burned
        history.forEach(workout => {
            if (!records.mostCaloriesBurned || workout.caloriesBurned > records.mostCaloriesBurned.caloriesBurned) {
                records.mostCaloriesBurned = workout;
            }
        });
        
        // Calculate most workouts in a week
        const weeklyWorkouts = {};
        history.forEach(workout => {
            const date = new Date(workout.startTime);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            weeklyWorkouts[weekKey] = (weeklyWorkouts[weekKey] || 0) + 1;
        });
        
        records.mostWorkoutsInWeek = Math.max(...Object.values(weeklyWorkouts), 0);
        
        return records;
    }
}

// Export for use in other modules
window.WorkoutManager = WorkoutManager;
