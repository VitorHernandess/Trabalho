-- Criação das tabelas

-- Tabela de Usuários
CREATE TABLE Users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Atividades
CREATE TABLE Activities (
    activity_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tabela de Alertas
CREATE TABLE Alerts (
    alert_id INT PRIMARY KEY AUTO_INCREMENT,
    activity_id INT NOT NULL,
    time TIME NOT NULL,
    message VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (activity_id) REFERENCES Activities(activity_id) ON DELETE CASCADE
);

-- Tabela de Padrões de IA (para armazenar padrões de aprendizado)
CREATE TABLE AIPatterns (
    pattern_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pattern_type VARCHAR(50) NOT NULL,
    pattern_data JSON,
    frequency INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX idx_user_email ON Users(email);
CREATE INDEX idx_user_activities ON Activities(user_id);
CREATE INDEX idx_activity_alerts ON Alerts(activity_id);
CREATE INDEX idx_user_patterns ON AIPatterns(user_id, pattern_type);

-- Exemplos de inserção de dados
INSERT INTO Users (name, email, password_hash) VALUES
('João Silva', 'joao@email.com', 'hash123'),
('Maria Santos', 'maria@email.com', 'hash456');

INSERT INTO Activities (user_id, name, description) VALUES
(1, 'Tomar Remédio', 'Tomar remédio para pressão às 8h e 20h'),
(1, 'Exercícios', 'Fazer caminhada no parque'),
(2, 'Estudar', 'Estudar matemática das 14h às 16h');

INSERT INTO Alerts (activity_id, time, message) VALUES
(1, '08:00:00', 'Hora de tomar o remédio da manhã'),
(1, '20:00:00', 'Hora de tomar o remédio da noite'),
(2, '07:00:00', 'Hora de se preparar para a caminhada');

INSERT INTO AIPatterns (user_id, pattern_type, pattern_data, frequency) VALUES
(1, 'time_preference', '{"morning": ["08:00", "09:00"], "night": ["20:00"]}', 5),
(2, 'activity_type', '{"study": ["14:00", "16:00"]}', 3); 