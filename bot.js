const { createClient } = require('bedrock-protocol');

function startBot() {
    const client = createClient({
        host: 'Bluelightmine.aternos.me',
        port: 51069,
        username: 'RealPlayer_AFK',
        offline: true,
        // نستخدم رقم إصدار ثابت يعمل مع معظم سيرفرات أترنوس
        version: '1.20.0' 
    });

    client.on('connect', () => console.log('تم الاتصال!'));
    
    // الأهم: منع إغلاق البوت عند حدوث خطأ في حزمة واحدة
    client.on('error', (err) => {
        console.log('خطأ عابر، البوت مستمر...');
    });

    client.on('kick', (reason) => {
        console.log('تم الطرد، إعادة المحاولة بعد 60 ثانية...');
        setTimeout(startBot, 60000);
    });
}

startBot();
