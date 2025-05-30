// Gerenciamento de usuários
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    }

    register(name, email, password) {
        if (this.users.some(user => user.email === email)) {
            throw new Error('Email já cadastrado');
        }

        const user = {
            id: Date.now().toString(),
            name,
            email,
            password,
            activities: []
        };

        this.users.push(user);
        this.saveUsers();
        return user;
    }

    login(email, password) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (!user) {
            throw new Error('Credenciais inválidas');
        }

        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    updateCurrentUser() {
        if (this.currentUser) {
            const updatedUser = this.users.find(u => u.id === this.currentUser.id);
            this.currentUser = updatedUser;
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        }
    }
}

// Gerenciamento de atividades
class ActivityManager {
    constructor(userManager) {
        this.userManager = userManager;
    }

    addActivity(name, description) {
        const activity = {
            id: Date.now().toString(),
            name,
            description,
            timestamp: new Date().toISOString()
        };

        const userIndex = this.userManager.users.findIndex(u => u.id === this.userManager.currentUser.id);
        if (userIndex !== -1) {
            if (!this.userManager.users[userIndex].activities) {
                this.userManager.users[userIndex].activities = [];
            }
            this.userManager.users[userIndex].activities.push(activity);
            this.userManager.saveUsers();
            this.userManager.updateCurrentUser();
        }

        return activity;
    }

    getActivities() {
        return this.userManager.currentUser.activities || [];
    }

    deleteActivity(activityId) {
        const userIndex = this.userManager.users.findIndex(u => u.id === this.userManager.currentUser.id);
        if (userIndex !== -1) {
            this.userManager.users[userIndex].activities = 
                this.userManager.users[userIndex].activities.filter(a => a.id !== activityId);
            this.userManager.saveUsers();
            this.userManager.updateCurrentUser();
        }
    }
}

// Assistente IA com Hugging Face
class AIAssistant {
    constructor(activityManager) {
        this.activityManager = activityManager;
        this.API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill";
        this.API_TOKEN = "YOUR_HUGGING_FACE_API_TOKEN"; // Substitua pelo seu token
    }

    async processQuery(query) {
        try {
            // Primeiro, verifica se a pergunta está relacionada às atividades
            const activityResponse = this.checkActivityContext(query);
            if (activityResponse) {
                return activityResponse;
            }

            // Se não estiver relacionada às atividades, usa o modelo do Hugging Face
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${this.API_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ inputs: query }),
            });

            const result = await response.json();
            return result[0].generated_text;
        } catch (error) {
            console.error("Erro ao processar a pergunta:", error);
            return "Desculpe, tive um problema ao processar sua pergunta. Pode tentar novamente?";
        }
    }

    checkActivityContext(query) {
        query = query.toLowerCase();
        const activities = this.activityManager.getActivities();

        // Verifica se a pergunta está relacionada a horários
        if (query.includes('horário') || query.includes('hora')) {
            return this.suggestTime(query);
        }

        // Verifica se a pergunta está relacionada a alertas
        if (query.includes('lembrete') || query.includes('alerta')) {
            return this.suggestAlert(query);
        }

        // Procura por atividades relacionadas
        const relevantActivities = activities.filter(activity => 
            activity.name.toLowerCase().includes(query) || 
            activity.description.toLowerCase().includes(query)
        );

        if (relevantActivities.length > 0) {
            const activity = relevantActivities[0];
            return `Encontrei uma atividade relacionada: "${activity.name}". 
                    A descrição é: ${activity.description}. 
                    Posso te ajudar com mais informações sobre ela?`;
        }

        return null; // Retorna null para usar o modelo do Hugging Face
    }

    suggestTime(query) {
        const activities = this.activityManager.getActivities();
        const timeRegex = /\d{1,2}h|\d{1,2}:\d{2}/g;
        const times = activities
            .map(a => a.description.match(timeRegex))
            .filter(Boolean)
            .flat();

        if (times.length > 0) {
            return `Com base nas suas atividades, você costuma agendar tarefas para: ${times.join(', ')}. 
                    Gostaria de configurar um alerta para algum desses horários?`;
        }

        const now = new Date();
        const currentHour = now.getHours();
        let suggestedTime;

        if (currentHour < 12) {
            suggestedTime = "9:00";
        } else if (currentHour < 18) {
            suggestedTime = "14:00";
        } else {
            suggestedTime = "20:00";
        }

        return `Que tal configurar um alerta para ${suggestedTime}? 
                É um bom horário para atividades neste período do dia.`;
    }

    suggestAlert(query) {
        const activities = this.activityManager.getActivities();
        if (activities.length > 0) {
            const recentActivity = activities[activities.length - 1];
            return `Vi que sua atividade mais recente é "${recentActivity.name}". 
                    Quer configurar um alerta para ela? 
                    Clique no botão 'Alerta' na atividade.`;
        }
        return "Você pode configurar alertas para qualquer atividade. Primeiro, crie uma atividade e depois clique no botão 'Alerta'.";
    }
}

// Gerenciamento de alertas
class AlertManager {
    constructor() {
        this.alerts = JSON.parse(localStorage.getItem('alerts')) || [];
        this.checkAlerts();
    }

    addAlert(time, message) {
        const alert = {
            id: Date.now().toString(),
            time,
            message,
            active: true
        };

        this.alerts.push(alert);
        this.saveAlerts();
        return alert;
    }

    checkAlerts() {
        setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

            this.alerts.forEach(alert => {
                if (alert.active && alert.time === currentTime) {
                    this.triggerAlert(alert);
                    alert.active = false;
                }
            });

            this.saveAlerts();
        }, 30000);
    }

    triggerAlert(alert) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Lembrete de Atividade', {
                body: alert.message
            });
        } else {
            alert(`Lembrete: ${alert.message}`);
        }
    }

    saveAlerts() {
        localStorage.setItem('alerts', JSON.stringify(this.alerts));
    }
}

// Inicialização e eventos
document.addEventListener('DOMContentLoaded', () => {
    const userManager = new UserManager();
    const activityManager = new ActivityManager(userManager);
    const aiAssistant = new AIAssistant(activityManager);
    const alertManager = new AlertManager();

    // Solicitar permissão para notificações
    if ('Notification' in window) {
        Notification.requestPermission();
    }

    // Função para atualizar a interface
    function updateUI() {
        const authContainer = document.getElementById('auth-container');
        const mainContainer = document.getElementById('main-container');
        const userNameSpan = document.getElementById('user-name');

        if (userManager.currentUser) {
            authContainer.style.display = 'none';
            mainContainer.style.display = 'block';
            userNameSpan.textContent = userManager.currentUser.name;
            renderActivities();
        } else {
            authContainer.style.display = 'block';
            mainContainer.style.display = 'none';
        }
    }

    // Renderizar grade de atividades
    function renderActivities() {
        const activitiesGrid = document.getElementById('activities-grid');
        const activities = activityManager.getActivities();

        if (activities.length === 0) {
            activitiesGrid.innerHTML = `
                <div class="col-12 text-center mt-4">
                    <p class="text-muted">Você ainda não tem atividades. Clique em "Nova Atividade" para começar!</p>
                </div>
            `;
            return;
        }

        activitiesGrid.innerHTML = activities.map(activity => `
            <div class="activity-card fade-in">
                <h5>${activity.name}</h5>
                <p>${activity.description}</p>
                <div class="timestamp">${new Date(activity.timestamp).toLocaleString()}</div>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-warning" onclick="showAlertModal('${activity.id}')">
                        <i class="fas fa-bell"></i> Alerta
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteActivity('${activity.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Função para mostrar/ocultar overlay
    function toggleOverlay(show) {
        document.getElementById('overlay').style.display = show ? 'block' : 'none';
    }

    // Eventos dos novos botões
    document.getElementById('new-activity-btn').addEventListener('click', () => {
        document.getElementById('activity-form-container').style.display = 'block';
        toggleOverlay(true);
    });

    document.getElementById('close-activity-form').addEventListener('click', () => {
        document.getElementById('activity-form-container').style.display = 'none';
        toggleOverlay(false);
    });

    document.getElementById('toggle-ai-btn').addEventListener('click', () => {
        const aiContainer = document.getElementById('ai-assistant-container');
        if (aiContainer.style.display === 'none') {
            aiContainer.style.display = 'block';
            toggleOverlay(true);
            document.getElementById('chat-messages').innerHTML += `
                <div class="message ai-message fade-in">
                    Olá! Como posso ajudar você hoje?
                </div>
            `;
        } else {
            aiContainer.style.display = 'none';
            toggleOverlay(false);
        }
    });

    document.getElementById('close-ai-assistant').addEventListener('click', () => {
        document.getElementById('ai-assistant-container').style.display = 'none';
        toggleOverlay(false);
    });

    // Eventos de formulários
    document.getElementById('register-form').addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            userManager.register(
                document.getElementById('register-name').value,
                document.getElementById('register-email').value,
                document.getElementById('register-password').value
            );
            alert('Registro realizado com sucesso!');
            document.getElementById('login-tab').click();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        try {
            userManager.login(
                document.getElementById('login-email').value,
                document.getElementById('login-password').value
            );
            updateUI();
        } catch (error) {
            alert(error.message);
        }
    });

    document.getElementById('activity-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('activity-name').value;
        const description = document.getElementById('activity-description').value;
        
        activityManager.addActivity(name, description);
        renderActivities();
        
        document.getElementById('activity-form').reset();
        document.getElementById('activity-form-container').style.display = 'none';
        toggleOverlay(false);
    });

    document.getElementById('ai-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('ai-input');
        const query = input.value;
        
        if (query.trim()) {
            const chatMessages = document.getElementById('chat-messages');
            
            // Adicionar mensagem do usuário
            chatMessages.innerHTML += `
                <div class="message user-message fade-in">
                    ${query}
                </div>
            `;

            // Adicionar indicador de digitação
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'message ai-message fade-in typing-indicator';
            typingIndicator.textContent = 'Digitando...';
            chatMessages.appendChild(typingIndicator);

            // Processar a resposta da IA
            try {
                const response = await aiAssistant.processQuery(query);
                chatMessages.removeChild(typingIndicator);
                chatMessages.innerHTML += `
                    <div class="message ai-message fade-in">
                        ${response}
                    </div>
                `;
            } catch (error) {
                chatMessages.removeChild(typingIndicator);
                chatMessages.innerHTML += `
                    <div class="message ai-message fade-in error">
                        Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.
                    </div>
                `;
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
            input.value = '';
        }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
        userManager.logout();
        updateUI();
    });

    // Configuração do modal de alerta
    window.showAlertModal = (activityId) => {
        const activity = activityManager.getActivities().find(a => a.id === activityId);
        if (activity) {
            const modal = new bootstrap.Modal(document.getElementById('alertModal'));
            document.getElementById('alert-message').value = `Lembrete: ${activity.name}`;
            
            document.getElementById('save-alert').onclick = () => {
                const time = document.getElementById('alert-time').value;
                const message = document.getElementById('alert-message').value;
                
                if (time && message) {
                    alertManager.addAlert(time, message);
                    modal.hide();
                    alert('Alerta configurado com sucesso!');
                }
            };
            
            modal.show();
        }
    };

    window.deleteActivity = (activityId) => {
        if (confirm('Tem certeza que deseja excluir esta atividade?')) {
            activityManager.deleteActivity(activityId);
            renderActivities();
        }
    };

    // Fechar containers ao clicar no overlay
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('activity-form-container').style.display = 'none';
        document.getElementById('ai-assistant-container').style.display = 'none';
        toggleOverlay(false);
    });

    // Inicializar UI
    updateUI();
}); 