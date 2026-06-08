const { createClient } = require('bedrock-protocol');

const botOptions = {
    host: 'Bluelightmine.aternos.me',
    port: 51069,
    username: 'RealPlayer_AFK',
    offline: true,
    version: '1.26.20',
    device: {
        deviceOS: 1,
        deviceModel: 'Pixel 7'
    },
    skipPing: false
};

function startBot() {
    console.log('🔄 جاري الاتصال بـ Bluelightmine...');
    
    let client;
    try {
        client = createClient(botOptions);
    } catch (e) {
        console.log('⚠️ خطأ في إنشاء العميل، إعادة المحاولة بعد 30 ثانية...');
        setTimeout(startBot, 30000);
        return;
    }

    client.on('connect', () => {
        console.log('✅ تم الاتصال بنجاح!');
    });

    client.on('spawn', () => {
        console.log('🎮 البوت دخل العالم!');
        
        const movementInterval = setInterval(() => {
            if (client) {
                try {
                    client.write('player_auth_input', {
                        pitch: Math.random() * 90 - 45,
                        yaw: Math.random() * 360 - 180,
                        position: { x: 0, y: 0, z: 0 },
                        moveVector: { x: (Math.random() - 0.5) * 0.1, z: (Math.random() - 0.5) * 0.1 },
                        inputMode: 0,
                        playMode: 0,
                        interactionMode: 0,
                        transaction: { type: 0 }
                    });
                } catch (err) {
                    clearInterval(movementInterval);
                }
            }
        }, 30000);
    });

    // التعامل مع الأخطاء التي تمنع الاتصال (مثل السيرفر المغلق)
    client.on('error', (err) => {
        console.log('⚠️ خطأ بروتوكول (غالباً السيرفر مغلق):', err.message);
        // لا نقوم بإنهاء البرنامج، بل نعيد الاتصال بعد فترة
        setTimeout(startBot, 60000);
    });

    client.on('kick', (packet) => {
        console.log('❌ تم الطرد. السبب:', packet.reason || 'Silent Disconnect');
        setTimeout(startBot, 60000);
    });

    // إغلاق العميل بشكل آمن عند حدوث قطع
    client.on('close', () => {
        console.log('🔌 الاتصال مغلق، إعادة المحاولة بعد 60 ثانية...');
        setTimeout(startBot, 60000);
    });
}

// البدء
startBot();
