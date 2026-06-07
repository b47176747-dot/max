const bedrock = require('bedrock-protocol');

// إعدادات الاتصال بالسيرفر
const botOptions = {
  host: 'Bluelightmine.aternos.me', 
  port: 51069,                      
  username: 'RealPlayer_AFK',       
  offline: true,                    
  version: '1.21.130'               
};

let client = null;
let retryTimer = null;
let afkInterval = null;

let botRuntimeId = null;
let botPosition = { x: 0, y: 0, z: 0 };
let moveToggle = false; 

function startBot() {
  if (retryTimer) clearTimeout(retryTimer);
  if (afkInterval) clearInterval(afkInterval);
  
  console.log(`[اتصال] جاري الدخول إلى سيرفر البدروك...`);

  try {
    client = bedrock.createClient(botOptions);

    client.on('start_game', (packet) => {
      // قراءة المعرف وتحويله فوراً لـ BigInt صريح لتفادي أي خلط لاحقاً
      const rawId = packet.runtime_id || packet.entity_id;
      botRuntimeId = typeof rawId === 'bigint' ? rawId : BigInt(rawId);
      
      if (packet.player_position) {
        botPosition = { ...packet.player_position };
      } else if (packet.position) {
        botPosition = { ...packet.position };
      }
      
      console.log(`[معلومات] تم التعرف على معرف البوت بنجاح: ${botRuntimeId.toString()}`);
    });

    client.on('move_player', (packet) => {
      if (botRuntimeId) {
        const pId = packet.runtime_id || packet.entity_id;
        const compareId = typeof pId === 'bigint' ? pId : BigInt(pId);
        if (compareId === botRuntimeId) {
          botPosition = packet.position;
        }
      }
    });

    client.on('spawn', () => {
      console.log(`[+] دخل ${botOptions.username} إلى السيرفر وهو الآن مستقر!`);
      
      setTimeout(() => {
        startNaturalAFKLoop();
      }, 8000);
    });

    client.on('error', (err) => {
      console.error(`[تنبيه] حدث خطأ في الاتصال (${err.message})`);
      triggerRetry();
    });

    client.on('close', () => {
      console.log(`[!] انقطع الاتصال بالسيرفر.`);
      triggerRetry();
    });

    client.on('kick', (packet) => {
      console.log(`[-] تم طرد البوت. السبب: ${packet.reason || JSON.stringify(packet)}`);
      triggerRetry();
    });

  } catch (error) {
    console.error(`[خطأ غير متوقع]:`, error);
    triggerRetry();
  }
}

function startNaturalAFKLoop() {
  if (afkInterval) clearInterval(afkInterval);

  console.log(`[⚙️] تم تفعيل حلقة المشي الصارمة المتوافقة مع بنية البروتوكول.`);

  afkInterval = setInterval(() => {
    if (!client || !botRuntimeId) return;

    const randomYaw = Math.random() * 360;
    const randomPitch = (Math.random() * 20) - 10;

    moveToggle = !moveToggle;
    const offset = moveToggle ? 0.3 : -0.3;

    const naturalMovement = {
      x: botPosition.x + (Math.sin(randomYaw * Math.PI / 180) * offset),
      y: botPosition.y,
      z: botPosition.z + (Math.cos(randomYaw * Math.PI / 180) * offset)
    };

    try {
      // هنا قمنا بتقفيل وتعبئة كل المتغيرات التي قد تسبب حيرة للمكتبة لمنع الـ SizeOf error
      client.queue('move_player', {
        runtime_id: botRuntimeId,
        position: {
          x: parseFloat(naturalMovement.x) || 0.0,
          y: parseFloat(naturalMovement.y) || 0.0,
          z: parseFloat(naturalMovement.z) || 0.0
        },
        pitch: parseFloat(randomPitch) || 0.0,
        yaw: parseFloat(randomYaw) || 0.0,
        head_yaw: parseFloat(randomYaw) || 0.0,
        mode: 0, 
        on_ground: true,
        riding_runtime_id: 0n, 
        teleport_cause: 0,
        teleport_item_id: 0,
        tick: 0n
      });
    } catch (e) {
      console.error(`[!] فشل إرسال حزمة المشي التلقائي:`, e.message);
    }
  }, 6000); 
}

function triggerRetry() {
  if (afkInterval) clearInterval(afkInterval);
  
  if (client) {
    try { client.close(); } catch (e) {}
    client = null;
  }

  if (retryTimer) return;

  console.log(`⏳ سيتم إعادة المحاولة تلقائياً خلال 45 ثانية...`);
  retryTimer = setTimeout(() => {
    retryTimer = null;
    startBot();
  }, 45000);
}

startBot();
