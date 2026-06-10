const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
const options = {
    host: 'Bluelightmine.aternos.me',        // ضع هنا الآيبي الخاص بسيرفرك (بدون بورت)
    port: 51069,                   // البورت الافتراضي لبيدروك
    username: 'BedrockBot',        // اسم البوت
    version: '1.21.20',            // الإصدار المطلوب بدقة
    offline: true                  // اجعلها true إذا كان السيرفر مكرك، أو false إذا كان يحتاج حساب إكس بوكس رسمي
};

function createBot() {
    console.log("جاري تشغيل البوت والاتصال بسيرفر بيدروك...");

    try {
        const client = bedrock.createClient(options);

        client.on('join', () => {
            console.log("تم دخول البوت إلى سيرفر البيدروك بنجاح وهو الآن داخل العالم!");
            
            // للبقاء نشطاً ومنع الطرد (Anti-AFK)
            // بروتوكول البيدروك يحافظ على الاتصال تلقائياً، ولكن سنطبع رسالة كل دقيقة للتأكد من عمله
            setInterval(() => {
                console.log("البوت مستقر وخلال حالة الاتصال المستمر...");
            }, 60000);
        });

        client.on('text', (packet) => {
            // طباعة الشات في الـ Actions للاطمئنان على البوت
            if (packet.message) {
                console.log(`[شات السيرفر]: ${packet.message}`);
            }
        });

        client.on('close', () => {
            console.log("تم فصل البوت عن السيرفر. جاري إعادة الاتصال بعد 15 ثانية...");
            setTimeout(createBot, 15000);
        });

        client.on('error', (err) => {
            console.log("حدث خطأ في الاتصال: ", err.message);
        });

    } catch (error) {
        console.log("فشل في إنشاء العميل، جاري المحاولة مجدداً...", error.message);
        setTimeout(createBot, 15000);
    }
}

createBot();
