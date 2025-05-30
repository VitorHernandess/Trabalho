// Simulação do banco de dados usando localStorage

class Database {
    constructor() {
        this.initializeDatabase();
    }

    // Inicializa as tabelas se não existirem
    initializeDatabase() {
        if (!localStorage.getItem('db_users')) {
            localStorage.setItem('db_users', '[]');
            localStorage.setItem('db_activities', '[]');
            localStorage.setItem('db_alerts', '[]');
            localStorage.setItem('db_ai_patterns', '[]');
            this.current_id = {
                users: 1,
                activities: 1,
                alerts: 1,
                patterns: 1
            };
            localStorage.setItem('db_current_id', JSON.stringify(this.current_id));
        } else {
            this.current_id = JSON.parse(localStorage.getItem('db_current_id'));
        }
    }

    // Funções auxiliares
    getNextId(table) {
        const id = this.current_id[table]++;
        localStorage.setItem('db_current_id', JSON.stringify(this.current_id));
        return id;
    }

    // CRUD Usuários
    createUser(name, email, password_hash) {
        const users = JSON.parse(localStorage.getItem('db_users'));
        if (users.some(u => u.email === email)) {
            throw new Error('Email já cadastrado');
        }

        const user = {
            user_id: this.getNextId('users'),
            name,
            email,
            password_hash,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        users.push(user);
        localStorage.setItem('db_users', JSON.stringify(users));
        return user;
    }

    getUser(userId) {
        const users = JSON.parse(localStorage.getItem('db_users'));
        return users.find(u => u.user_id === userId);
    }

    getUserByEmail(email) {
        const users = JSON.parse(localStorage.getItem('db_users'));
        return users.find(u => u.email === email);
    }

    updateUser(userId, data) {
        const users = JSON.parse(localStorage.getItem('db_users'));
        const index = users.findIndex(u => u.user_id === userId);
        if (index === -1) return null;

        users[index] = {
            ...users[index],
            ...data,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem('db_users', JSON.stringify(users));
        return users[index];
    }

    deleteUser(userId) {
        const users = JSON.parse(localStorage.getItem('db_users'));
        const activities = JSON.parse(localStorage.getItem('db_activities'));
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));
        const patterns = JSON.parse(localStorage.getItem('db_ai_patterns'));

        // Cascade delete
        const userActivities = activities.filter(a => a.user_id === userId);
        const activityIds = userActivities.map(a => a.activity_id);

        // Remove alertas das atividades
        const newAlerts = alerts.filter(a => !activityIds.includes(a.activity_id));
        localStorage.setItem('db_alerts', JSON.stringify(newAlerts));

        // Remove atividades
        const newActivities = activities.filter(a => a.user_id !== userId);
        localStorage.setItem('db_activities', JSON.stringify(newActivities));

        // Remove padrões de IA
        const newPatterns = patterns.filter(p => p.user_id !== userId);
        localStorage.setItem('db_ai_patterns', JSON.stringify(newPatterns));

        // Remove usuário
        const newUsers = users.filter(u => u.user_id !== userId);
        localStorage.setItem('db_users', JSON.stringify(newUsers));
    }

    // CRUD Atividades
    createActivity(userId, name, description) {
        const activities = JSON.parse(localStorage.getItem('db_activities'));
        const activity = {
            activity_id: this.getNextId('activities'),
            user_id: userId,
            name,
            description,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        activities.push(activity);
        localStorage.setItem('db_activities', JSON.stringify(activities));
        return activity;
    }

    getActivities(userId) {
        const activities = JSON.parse(localStorage.getItem('db_activities'));
        return activities.filter(a => a.user_id === userId);
    }

    updateActivity(activityId, data) {
        const activities = JSON.parse(localStorage.getItem('db_activities'));
        const index = activities.findIndex(a => a.activity_id === activityId);
        if (index === -1) return null;

        activities[index] = {
            ...activities[index],
            ...data,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem('db_activities', JSON.stringify(activities));
        return activities[index];
    }

    deleteActivity(activityId) {
        const activities = JSON.parse(localStorage.getItem('db_activities'));
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));

        // Remove alertas da atividade
        const newAlerts = alerts.filter(a => a.activity_id !== activityId);
        localStorage.setItem('db_alerts', JSON.stringify(newAlerts));

        // Remove atividade
        const newActivities = activities.filter(a => a.activity_id !== activityId);
        localStorage.setItem('db_activities', JSON.stringify(newActivities));
    }

    // CRUD Alertas
    createAlert(activityId, time, message) {
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));
        const alert = {
            alert_id: this.getNextId('alerts'),
            activity_id: activityId,
            time,
            message,
            is_active: true,
            created_at: new Date().toISOString()
        };

        alerts.push(alert);
        localStorage.setItem('db_alerts', JSON.stringify(alerts));
        return alert;
    }

    getAlerts(activityId) {
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));
        return alerts.filter(a => a.activity_id === activityId);
    }

    updateAlert(alertId, data) {
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));
        const index = alerts.findIndex(a => a.alert_id === alertId);
        if (index === -1) return null;

        alerts[index] = { ...alerts[index], ...data };
        localStorage.setItem('db_alerts', JSON.stringify(alerts));
        return alerts[index];
    }

    deleteAlert(alertId) {
        const alerts = JSON.parse(localStorage.getItem('db_alerts'));
        const newAlerts = alerts.filter(a => a.alert_id !== alertId);
        localStorage.setItem('db_alerts', JSON.stringify(newAlerts));
    }

    // CRUD Padrões de IA
    createAIPattern(userId, patternType, patternData) {
        const patterns = JSON.parse(localStorage.getItem('db_ai_patterns'));
        const pattern = {
            pattern_id: this.getNextId('patterns'),
            user_id: userId,
            pattern_type: patternType,
            pattern_data: patternData,
            frequency: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        patterns.push(pattern);
        localStorage.setItem('db_ai_patterns', JSON.stringify(patterns));
        return pattern;
    }

    getAIPatterns(userId, patternType = null) {
        const patterns = JSON.parse(localStorage.getItem('db_ai_patterns'));
        return patterns.filter(p => 
            p.user_id === userId && 
            (patternType ? p.pattern_type === patternType : true)
        );
    }

    updateAIPattern(patternId, data) {
        const patterns = JSON.parse(localStorage.getItem('db_ai_patterns'));
        const index = patterns.findIndex(p => p.pattern_id === patternId);
        if (index === -1) return null;

        patterns[index] = {
            ...patterns[index],
            ...data,
            frequency: (patterns[index].frequency || 0) + 1,
            updated_at: new Date().toISOString()
        };

        localStorage.setItem('db_ai_patterns', JSON.stringify(patterns));
        return patterns[index];
    }

    deleteAIPattern(patternId) {
        const patterns = JSON.parse(localStorage.getItem('db_ai_patterns'));
        const newPatterns = patterns.filter(p => p.pattern_id !== patternId);
        localStorage.setItem('db_ai_patterns', JSON.stringify(newPatterns));
    }
}

// Exporta a instância do banco de dados
const db = new Database();
export default db; 