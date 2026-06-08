const bedrock = require('bedrock-protocol');

const botOptions = {
  host: 'Bluelightmine.aternos.me', 
  port: 51069,                  
  username: 'RealPlayer_AFK',        
  offline: true,
  // إزالة سطر version للسماح للاكتشاف التلقائي
  skipPing: false // السماح للبوت بسؤال السيرفر عن نسخته قبل الاتصال
};

let client = null;
let retryTimer = null;

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  
  console.log(`[اتصال] جاري محاولة اكتشاف إصدار السيرفر والدخول...`);

  try {
    client = bedrock.createClient(botOptions);

    client.on('connect', () => {
      console.log(`[+] تم الاتصال بنجاح ببروتوكول السيرفر.`);
    });

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} وبدأ وضع الخمول الآمن.`);
    });

    client.on('error', (err) => {
      // فلترة الخطأ لتجنب تكرار سجلات غير مفهومة
      console.error(`[تنبيه] خطأ في البروتوكول: ${err.message}`);
      triggerRetry();
    });

    client.on('close', () => {
      console.log(`[!] انقطع الاتصال.`);
      triggerRetry();
    });

    client.on('kick', (packet) => {
      console.log(`[-] تم الطرد. السبب: ${packet.message || packet.reason || 'غير معروف'}`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ في التنفيذ]:`, error);
    triggerRetry();
  }
}

function triggerRetry() {
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }
  
  if (retryTimer) return;

  console.log(`⏳ ننتظر 60 ثانية لإعادة المحاولة...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 60000);
}

startBot();
