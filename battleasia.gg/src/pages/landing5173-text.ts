export type LandingLocale = 'EN' | 'BN' | 'ZH' | 'HI' | 'UR';

export const LANDING_LANG: Record<LandingLocale, string> = {
  EN: 'en',
  BN: 'bn',
  ZH: 'zh',
  HI: 'hi',
  UR: 'ur',
};

export function readLandingLocale(): LandingLocale {
  try {
    const raw = localStorage.getItem('ba-lang');
    if (raw === 'bn') return 'BN';
    if (raw === 'zh') return 'ZH';
    if (raw === 'hi') return 'HI';
    if (raw === 'ur') return 'UR';
  } catch {
    /* keep English */
  }
  return 'EN';
}

type Copy = Record<string, string>;

export const landingText: Record<LandingLocale, Copy> = {
  EN: {
    home: 'Home', about: 'About', play: 'Play', rules: 'Rules', signin: 'Sign in', signup: 'Join', arena: 'Enter arena',
    eyebrow: 'Mobile tournament arena for South Asia', lead: 'Your next clutch is worth more. Compete in mobile tournaments, earn BAC coins, and make your name count.',
    download: 'Download APK', players: 'Players online', matches: 'Matches today', seats: 'Seats filled', pulse: 'Arena pulse',
    joins: "Today's joins", totalmatches: 'Total matches', ongoing: 'Ongoing now', winnings: 'Total winnings',
    high: 'High prize', live: 'Live / ongoing', games: 'Pick your game', gamesub: 'One arena. The games your squad already plays.',
    aboutTitle: 'Built for the next generation of champions.', aboutLead: 'Battle Asia is a tournament arena built around the way South Asia plays: on mobile, with friends, and always for something worth winning.',
    modes: 'Find your format', faq: 'The details matter.', support: 'Need a hand? We’re right here.', supportCopy: 'Our player support team is one message away.',
    payments: 'Payments', fair: 'Fair play', rooms: 'Rooms', account: 'Account', trust: 'Secure login', fairplay: 'Fair play', payouts: 'Real payouts',
    open: 'open matches', soon: 'Coming soon', promo: 'The next match could be yours', create: 'Create account', continue: 'Continue', verify: 'Verify email',
    send: 'Send code', resend: 'Resend code', password: 'Password', email: 'Email address', remember: 'Remember me', forgot: 'Forgot password?',
    createAccount: 'Create account', enterEmail: 'Enter your email', otpHelp: 'Enter the six-digit code we sent to', username: 'In-game username', gameId: 'PUBG / Game ID',
    phone: 'Phone number', server: 'Game server', terms: 'I agree to the Terms of Service and Privacy Policy', help: 'Support',
  },
  BN: {
    home: 'হোম', about: 'পরিচিতি', play: 'খেলুন', rules: 'নিয়ম', signin: 'সাইন ইন', signup: 'যোগ দিন', arena: 'এরিনায় যান',
    eyebrow: 'দক্ষিণ এশিয়ার এরিনা', lead: 'আপনার পরের ক্লাচের মূল্য আছে। মোবাইল টুর্নামেন্টে খেলুন, BAC কয়েন জিতুন, নিজের নাম তৈরি করুন।',
    download: 'APK ডাউনলোড', players: 'অনলাইনে খেলোয়াড়', matches: 'আজকের ম্যাচ', seats: 'আসন পূর্ণ', pulse: 'এরিনার স্পন্দন',
    joins: 'আজকের যোগদান', totalmatches: 'মোট ম্যাচ', ongoing: 'চলমান', winnings: 'মোট জয়',
    high: 'বড় পুরস্কার', live: 'লাইভ / চলমান', games: 'আপনার যুদ্ধক্ষেত্র বেছে নিন', gamesub: 'একটি এরিনা। আপনার স্কোয়াডের পরিচিত গেম।',
    aboutTitle: 'আগামী চ্যাম্পিয়নদের জন্য তৈরি।', aboutLead: 'BATTLE ASIA দক্ষিণ এশিয়ার খেলার ধরন—মোবাইলে, বন্ধুদের সঙ্গে, জয়ের লক্ষ্য নিয়ে—একে কেন্দ্র করে তৈরি একটি টুর্নামেন্ট এরিনা।',
    modes: 'আপনার ফরম্যাট বেছে নিন', faq: 'বিস্তারিত গুরুত্বপূর্ণ।', support: 'সাহায্য দরকার? আমরা আছি।', supportCopy: 'আমাদের প্লেয়ার সাপোর্ট টিম এক বার্তাই দূরে।',
    payments: 'পেমেন্ট', fair: 'ফেয়ার প্লে', rooms: 'রুম', account: 'অ্যাকাউন্ট', trust: 'নিরাপদ লগইন', fairplay: 'ফেয়ার প্লে', payouts: 'আসল পুরস্কার',
    open: 'টি ম্যাচ খোলা', soon: 'শীঘ্রই আসছে', promo: 'পরের ম্যাচটি হতে পারে আপনার', create: 'অ্যাকাউন্ট তৈরি', continue: 'চালিয়ে যান', verify: 'ইমেইল যাচাই',
    send: 'কোড পাঠান', resend: 'আবার কোড পাঠান', password: 'পাসওয়ার্ড', email: 'ইমেইল ঠিকানা', remember: 'মনে রাখুন', forgot: 'পাসওয়ার্ড ভুলে গেছেন?',
    createAccount: 'অ্যাকাউন্ট তৈরি', enterEmail: 'ইমেইল লিখুন', otpHelp: 'পাঠানো ছয় সংখ্যার কোড লিখুন', username: 'গেমের ইউজারনেম', gameId: 'PUBG / গেম আইডি',
    phone: 'ফোন নম্বর', server: 'গেম সার্ভার', terms: 'আমি সেবার শর্তাবলী ও গোপনীয়তা নীতিতে সম্মত', help: 'সহায়তা',
  },
  ZH: {
    home: '首页', about: '关于', play: '开玩', rules: '规则', signin: '登录', signup: '加入', arena: '进入赛场',
    eyebrow: '南亚手游锦标赛场', lead: '下一次残局更有价值。参加手游锦标赛，赢取 BAC，让名字被记住。',
    download: '下载 APK', players: '在线玩家', matches: '今日比赛', seats: '已入座', pulse: '赛场脉搏',
    joins: '今日加入', totalmatches: '比赛总数', ongoing: '进行中', winnings: '总奖金',
    high: '高额奖金', live: '直播 / 进行中', games: '选择你的游戏', gamesub: '一个赛场。你们小队已经在玩的游戏。',
    aboutTitle: '为下一代冠军而建。', aboutLead: 'Battle Asia 按南亚的玩法而建：在手机上，和朋友一起，为值得赢的东西而战。',
    modes: '选择你的赛制', faq: '细节很重要。', support: '需要帮助？我们就在这里。', supportCopy: '玩家支持团队离你只有一条消息。',
    payments: '支付', fair: '公平竞技', rooms: '房间', account: '账户', trust: '安全登录', fairplay: '公平竞技', payouts: '真实奖金',
    open: '场比赛开放', soon: '即将推出', promo: '下一场比赛可能属于你', create: '创建账户', continue: '继续', verify: '验证邮箱',
    send: '发送验证码', resend: '重新发送', password: '密码', email: '邮箱地址', remember: '记住我', forgot: '忘记密码？',
    createAccount: '创建账户', enterEmail: '输入邮箱', otpHelp: '输入我们发送的六位验证码', username: '游戏内用户名', gameId: 'PUBG / 游戏 ID',
    phone: '手机号', server: '游戏服务器', terms: '我同意服务条款和隐私政策', help: '支持',
  },
  HI: {
    home: 'होम', about: 'परिचय', play: 'खेलें', rules: 'नियम', signin: 'साइन इन', signup: 'जुड़ें', arena: 'एरीना में जाएं',
    eyebrow: 'दक्षिण एशिया का मोबाइल टूर्नामेंट एरीना', lead: 'आपकी अगली क्लच की कीमत है। मोबाइल टूर्नामेंट खेलें, BAC जीतें, और अपना नाम बनाएं।',
    download: 'APK डाउनलोड', players: 'ऑनलाइन खिलाड़ी', matches: 'आज के मैच', seats: 'भरी सीटें', pulse: 'एरीना पल्स',
    joins: 'आज के जुड़ाव', totalmatches: 'कुल मैच', ongoing: 'अभी चल रहे', winnings: 'कुल जीत',
    high: 'बड़ा इनाम', live: 'लाइव / चल रहा', games: 'अपना गेम चुनें', gamesub: 'एक एरीना। वही गेम जो आपकी स्क्वाड पहले से खेलती है।',
    aboutTitle: 'अगली पीढ़ी के चैंपियन के लिए।', aboutLead: 'Battle Asia दक्षिण एशिया के खेलने के तरीके पर बना है: मोबाइल पर, दोस्तों के साथ, और जीतने लायक चीज़ के लिए।',
    modes: 'अपना फॉर्मैट चुनें', faq: 'बारीकियाँ मायने रखती हैं।', support: 'मदद चाहिए? हम यहीं हैं।', supportCopy: 'हमारी प्लेयर सपोर्ट टीम एक मैसेज दूर है।',
    payments: 'भुगतान', fair: 'फेयर प्ले', rooms: 'रूम', account: 'अकाउंट', trust: 'सुरक्षित लॉगिन', fairplay: 'फेयर प्ले', payouts: 'असली भुगतान',
    open: 'मैच खुले', soon: 'जल्द आ रहा है', promo: 'अगला मैच आपका हो सकता है', create: 'अकाउंट बनाएं', continue: 'आगे बढ़ें', verify: 'ईमेल सत्यापित करें',
    send: 'कोड भेजें', resend: 'कोड फिर भेजें', password: 'पासवर्ड', email: 'ईमेल पता', remember: 'याद रखें', forgot: 'पासवर्ड भूल गए?',
    createAccount: 'अकाउंट बनाएं', enterEmail: 'अपना ईमेल लिखें', otpHelp: 'भेजा गया छह अंकों का कोड डालें', username: 'इन-गेम यूज़रनेम', gameId: 'PUBG / गेम आईडी',
    phone: 'फोन नंबर', server: 'गेम सर्वर', terms: 'मैं सेवा की शर्तें और गोपनीयता नीति मानता हूँ', help: 'सहायता',
  },
  UR: {
    home: 'ہوم', about: 'تعارف', play: 'کھیلیں', rules: 'قواعد', signin: 'سائن اِن', signup: 'شامل ہوں', arena: 'ایرینا میں جائیں',
    eyebrow: 'جنوبی ایشیا کا موبائل ٹورنامنٹ ایرینا', lead: 'آپ کی اگلی کلچ کی قیمت ہے۔ موبائل ٹورنامنٹ کھیلیں، BAC جیتیں، اور اپنا نام بنائیں۔',
    download: 'APK ڈاؤن لوڈ', players: 'آن لائن کھلاڑی', matches: 'آج کے میچ', seats: 'بھری نشستیں', pulse: 'ایرینا پلس',
    joins: 'آج کی شمولیت', totalmatches: 'کل میچ', ongoing: 'ابھی جاری', winnings: 'کل جیت',
    high: 'بڑا انعام', live: 'لائیو / جاری', games: 'اپنا گیم چنیں', gamesub: 'ایک ایرینا۔ وہی گیمز جو آپ کا سکواڈ پہلے سے کھیلتا ہے۔',
    aboutTitle: 'اگلی نسل کے چیمپئنز کے لیے۔', aboutLead: 'Battle Asia جنوبی ایشیا کے کھیلنے کے انداز پر بنا ہے: موبائل پر، دوستوں کے ساتھ، اور جیتنے کے قابل انعام کے لیے۔',
    modes: 'اپنا فارمیٹ چنیں', faq: 'تفصیل اہم ہے۔', support: 'مدد چاہیے؟ ہم یہیں ہیں۔', supportCopy: 'ہماری پلیئر سپورٹ ٹیم ایک پیغام کی دوری پر ہے۔',
    payments: 'ادائیگی', fair: 'فیئر پلے', rooms: 'روم', account: 'اکاؤنٹ', trust: 'محفوظ لاگ اِن', fairplay: 'فیئر پلے', payouts: 'اصل ادائیگی',
    open: 'میچ کھلے', soon: 'جلد آ رہا ہے', promo: 'اگلا میچ آپ کا ہو سکتا ہے', create: 'اکاؤنٹ بنائیں', continue: 'آگے بڑھیں', verify: 'ای میل کی تصدیق',
    send: 'کوڈ بھیجیں', resend: 'کوڈ دوبارہ بھیجیں', password: 'پاس ورڈ', email: 'ای میل پتہ', remember: 'یاد رکھیں', forgot: 'پاس ورڈ بھول گئے؟',
    createAccount: 'اکاؤنٹ بنائیں', enterEmail: 'اپنا ای میل لکھیں', otpHelp: 'بھیجا گیا چھ ہندسوں کا کوڈ درج کریں', username: 'ان گیم یوزرنیم', gameId: 'PUBG / گیم آئی ڈی',
    phone: 'فون نمبر', server: 'گیم سرور', terms: 'میں سروس کی شرائط اور رازداری کی پالیسی مانتا ہوں', help: 'مدد',
  },
};
