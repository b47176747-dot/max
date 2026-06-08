const { createClient } = require('bedrock-protocol');

function startBot() {
    console.log('🔄 محاولة الاتصال بـ Bluelightmine...');
    
    const client = createClient({
        host: 'Bluelightmine.aternos.me',
        port: 51069,
        username: 'RealPlayer_AFK',
        offline: true,
        version: '1.26.20',
        device: {
            deviceOS: 1, // Android
            deviceModel: 'Pixel 7'
        }
    });

    client.on('connect', () => console.log('✅ تم الاتصال بنجاح!'));

    client.on('spawn', () => {
        console.log('🎮 البوت دخل العالم! يقوم الآن بالتفاعل...');
        
        // نظام الحركة العشوائية المدمج
        setInterval(() => {
            client.write('player_auth_input', {
                pitch: Math.random() * 90 - 45,
                yaw: Math.random() * 360 - 180,
                position: { x: 0, y: 0, z: 0 },
                moveVector: { x: (Math.random() - 0.5) * 0.1, z: (Math.random() - 0.5) * 0.1 },
                inputMode: 0, playMode: 0, interactionMode: 0,
                transaction: { type: 0 }
            });
        }, 30000); 
    });

    client.on('kick', (packet) => {
        console.log('❌ تم الطرد. السبب:', packet.reason || 'Silent Disconnect');
        setTimeout(startBot, 60000); // إعادة المحاولة بعد دقيقة
    });

    client.on('error', (err) => console.log('⚠️ خطأ:', err.message));
}

startBot();
