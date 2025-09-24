// player.js - Sistema completo del jugador
(function() {
    // Configuración del canvas y contexto
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // Variables del juego
    let gameWidth = canvas.width;
    let gameHeight = canvas.height;
    
    // Estado del jugador
    const player = {
        x: gameWidth / 2,
        y: gameHeight / 2,
        width: 40,
        height: 40,
        speed: 5,
        color: '#4ecca3',
        health: 100,
        maxHealth: 100,
        isMoving: false,
        moveDirection: { x: 0, y: 0 },
        lastDirection: { x: 1, y: 0 } // Para la dirección del disparo
    };
    
    // Sistema de proyectiles
    const projectiles = [];
    const projectileSpeed = 8;
    
    // Sistema de partículas
    const particles = [];
    
    // Estados de teclas
    const keys = {};
    
    // Inicialización del juego
    function init() {
        // Configurar event listeners
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        canvas.addEventListener('click', handleShoot);
        
        // Ajustar tamaño del canvas si es necesario
        window.addEventListener('resize', handleResize);
        handleResize();
        
        // Iniciar el bucle del juego
        requestAnimationFrame(gameLoop);
        
        console.log('Jugador inicializado correctamente');
    }
    
    // Manejo de redimensionado
    function handleResize() {
        const container = document.getElementById('gameContainer');
        if (container) {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
            gameWidth = canvas.width;
            gameHeight = canvas.height;
            
            // Asegurar que el jugador esté dentro de los límites
            player.x = Math.max(player.width/2, Math.min(gameWidth - player.width/2, player.x));
            player.y = Math.max(player.height/2, Math.min(gameHeight - player.height/2, player.y));
        }
    }
    
    // Manejo de entrada de teclado
    function handleKeyDown(e) {
        keys[e.key.toLowerCase()] = true;
        
        // Prevenir comportamiento por defecto para teclas de juego
        if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
            e.preventDefault();
        }
    }
    
    function handleKeyUp(e) {
        keys[e.key.toLowerCase()] = false;
    }
    
    // Manejo de disparo con clic
    function handleShoot(e) {
        const rect = canvas.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Calcular dirección del disparo
        const dx = clickX - player.x;
        const dy = clickY - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Crear proyectil
            projectiles.push({
                x: player.x,
                y: player.y,
                dx: dx / distance * projectileSpeed,
                dy: dy / distance * projectileSpeed,
                radius: 5,
                color: '#ff9a3c',
                life: 100 // Tiempo de vida en frames
            });
            
            // Efecto de partículas al disparar
            createShootParticles(player.x, player.y, dx/distance, dy/distance);
        }
    }
    
    // Crear partículas de disparo
    function createShootParticles(x, y, dirX, dirY) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.atan2(dirY, dirX) + (Math.random() - 0.5) * 0.5;
            const speed = 2 + Math.random() * 3;
            
            particles.push({
                x: x,
                y: y,
                dx: Math.cos(angle) * speed,
                dy: Math.sin(angle) * speed,
                radius: 2 + Math.random() * 3,
                color: `hsl(${30 + Math.random() * 10}, 100%, 60%)`,
                life: 20 + Math.random() * 10
            });
        }
    }
    
    // Actualizar lógica del juego
    function update() {
        // Reiniciar dirección de movimiento
        player.moveDirection.x = 0;
        player.moveDirection.y = 0;
        player.isMoving = false;
        
        // Movimiento con WASD o flechas
        if (keys['w'] || keys['arrowup']) {
            player.moveDirection.y = -1;
            player.isMoving = true;
            player.lastDirection.y = -1;
            player.lastDirection.x = 0;
        }
        if (keys['s'] || keys['arrowdown']) {
            player.moveDirection.y = 1;
            player.isMoving = true;
            player.lastDirection.y = 1;
            player.lastDirection.x = 0;
        }
        if (keys['a'] || keys['arrowleft']) {
            player.moveDirection.x = -1;
            player.isMoving = true;
            player.lastDirection.x = -1;
            player.lastDirection.y = 0;
        }
        if (keys['d'] || keys['arrowright']) {
            player.moveDirection.x = 1;
            player.isMoving = true;
            player.lastDirection.x = 1;
            player.lastDirection.y = 0;
        }
        
        // Movimiento diagonal (normalizar)
        if (player.moveDirection.x !== 0 && player.moveDirection.y !== 0) {
            player.moveDirection.x *= 0.707; // 1/√2
            player.moveDirection.y *= 0.707;
        }
        
        // Aplicar movimiento
        player.x += player.moveDirection.x * player.speed;
        player.y += player.moveDirection.y * player.speed;
        
        // Mantener al jugador dentro de los límites
        player.x = Math.max(player.width/2, Math.min(gameWidth - player.width/2, player.x));
        player.y = Math.max(player.height/2, Math.min(gameHeight - player.height/2, player.y));
        
        // Actualizar proyectiles
        for (let i = projectiles.length - 1; i >= 0; i--) {
            const p = projectiles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
            
            // Eliminar proyectiles que salen de pantalla o expiran
            if (p.x < -p.radius || p.x > gameWidth + p.radius || 
                p.y < -p.radius || p.y > gameHeight + p.radius || 
                p.life <= 0) {
                projectiles.splice(i, 1);
            }
        }
        
        // Actualizar partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.dx;
            p.y += p.dy;
            p.life--;
            p.radius *= 0.97; // Reducir tamaño gradualmente
            
            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
        
        // Habilidad especial con espacio
        if (keys[' ']) {
            // Aquí puedes agregar una habilidad especial
            // Por ejemplo, un ataque en área o dash
        }
    }
    
    // Renderizar el juego
    function render() {
        // Limpiar canvas
        ctx.fillStyle = '#16213e';
        ctx.fillRect(0, 0, gameWidth, gameHeight);
        
        // Dibujar una cuadrícula de fondo
        drawGrid();
        
        // Dibujar proyectiles
        for (const p of projectiles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Efecto de estela
            ctx.beginPath();
            ctx.arc(p.x - p.dx, p.y - p.dy, p.radius * 0.7, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 154, 60, 0.5)';
            ctx.fill();
        }
        
        // Dibujar partículas
        for (const p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        }
        
        // Dibujar jugador
        ctx.save();
        ctx.translate(player.x, player.y);
        
        // Efecto de movimiento
        if (player.isMoving) {
            const wave = Math.sin(Date.now() / 100) * 3;
            ctx.translate(0, wave);
        }
        
        // Cuerpo del jugador
        ctx.fillStyle = player.color;
        ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
        
        // Detalles del jugador
        ctx.fillStyle = '#355c7d';
        ctx.fillRect(-player.width/2 + 5, -player.height/2 + 5, player.width - 10, player.height - 10);
        
        // Indicador de dirección
        ctx.fillStyle = '#f8b500';
        ctx.beginPath();
        ctx.arc(player.lastDirection.x * (player.width/2 + 5), player.lastDirection.y * (player.height/2 + 5), 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
        
        // Dibujar barra de salud
        drawHealthBar();
        
        // Dibujar información de debug
        drawDebugInfo();
    }
    
    // Dibujar cuadrícula de fondo
    function drawGrid() {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        
        // Líneas verticales
        for (let x = 0; x < gameWidth; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, gameHeight);
            ctx.stroke();
        }
        
        // Líneas horizontales
        for (let y = 0; y < gameHeight; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(gameWidth, y);
            ctx.stroke();
        }
    }
    
    // Dibujar barra de salud
    function drawHealthBar() {
        const barWidth = 200;
        const barHeight = 20;
        const x = 20;
        const y = 20;
        
        // Fondo de la barra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Salud actual
        const healthPercent = player.health / player.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#4ecca3' : healthPercent > 0.25 ? '#ff9a3c' : '#ff6b6b';
        ctx.fillRect(x, y, barWidth * healthPercent, barHeight);
        
        // Borde
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);
        
        // Texto de salud
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`Salud: ${player.health}/${player.maxHealth}`, x, y + barHeight + 20);
    }
    
    // Dibujar información de debug
    function drawDebugInfo() {
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`Posición: (${Math.round(player.x)}, ${Math.round(player.y)})`, 20, gameHeight - 60);
        ctx.fillText(`Proyectiles: ${projectiles.length}`, 20, gameHeight - 40);
        ctx.fillText(`Partículas: ${particles.length}`, 20, gameHeight - 20);
    }
    
    // Bucle principal del juego
    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
    
    // Iniciar el juego cuando el documento esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Hacer que el jugador sea accesible globalmente para futuras expansiones
    window.PlayerGame = {
        player,
        projectiles,
        particles,
        addProjectile: function(proj) {
            projectiles.push(proj);
        },
        addParticles: function(partArray) {
            particles.push(...partArray);
        }
    };
})();
