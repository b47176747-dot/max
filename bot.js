const { createClient } = require('bedrock-protocol');

const botOptions = {
    host: 'Bluelightmine.aternos.me',
    port: 51069,
    username: 'RealPlayer_AFK',
    offline: true,
    version: '1.26.20',
    device: { deviceOS: 1, deviceModel: 'Pixel 7' },
    skipPing: false
};

let movementInterval = null;

function startBot() {
    console.log('🔄 جاري محاولة إنشاء اتصال جديد...');

    // تنظيف أي عملية سابقة
    if (movementInterval) clearInterval(movementInterval);

    const client = createClient(botOptions);

    client.on('connect', () => {
        console.log('✅ تم الاتصال بنجاح!');
    });

    client.on('spawn', () => {
        console.log('🎮 البوت دخل العالم ويقوم بالحركة...');
        
        movementInterval = setInterval(() => {
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
                console.log('⚠️ تعذر إرسال الحركة.');
                clearInterval(movementInterval);
            }
        }, 30000);
    });

    // استخدام 'once' لضمان عدم تكرار النداء عند حدوث خطأ
    client.once('error', (err) => {
        console.log('⚠️ خطأ بروتوكول:', err.message);
        if (movementInterval) clearInterval(movementInterval);
        setTimeout(startBot, 60000);
    });

    client.once('kick', (packet) => {
        console.log('❌ تم الطرد:', packet.reason || 'Unknown');
        if (movementInterval) clearInterval(movementInterval);
        setTimeout(startBot, 60000);
    });

    client.once('close', () => {
        console.log('🔌 الاتصال انقطع، إعادة المحاولة في دقيقة...');
        if (movementInterval) clearInterval(movementInterval);
        setTimeout(startBot, 60000);
    });
}

// معالجة الأخطاء غير المتوقعة في مستوى العملية (Node.js Process)
process.on('uncaughtException', (err) => {
    console.log('🚨 خطأ غير متوقع:', err.message);
    setTimeout(startBot, 60000);
});

startBot();
