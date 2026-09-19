export type MailLocale = 'en' | 'bn' | 'zh' | 'hi' | 'ur';

export type AuthMailType = 'signup' | 'reset' | 'admin_login';
export type OpsMailKind =
  | 'deposit_approved'
  | 'deposit_rejected'
  | 'withdraw_complete'
  | 'withdraw_reject'
  | 'match_starting';

type AuthCopy = { subject: string; intro: string; ttl: string };
type OpsCopy = { subject: string; intro: string };

const AUTH: Record<MailLocale, Record<AuthMailType, AuthCopy>> = {
  en: {
    signup: { subject: 'Verify your BattleAsia email', intro: 'Use this code to verify your BattleAsia account:', ttl: '15 minutes' },
    reset: { subject: 'BattleAsia password reset code', intro: 'Use this code to reset your BattleAsia password:', ttl: '15 minutes' },
    admin_login: { subject: 'BattleAsia admin login code', intro: 'Use this code to complete your admin sign in:', ttl: '10 minutes' },
  },
  bn: {
    signup: { subject: 'BattleAsia ইমেইল ভেরিফাই করুন', intro: 'অ্যাকাউন্ট ভেরিফাই করতে এই কোড ব্যবহার করুন:', ttl: '১৫ মিনিট' },
    reset: { subject: 'BattleAsia পাসওয়ার্ড রিসেট কোড', intro: 'পাসওয়ার্ড রিসেট করতে এই কোড ব্যবহার করুন:', ttl: '১৫ মিনিট' },
    admin_login: { subject: 'BattleAsia অ্যাডমিন লগইন কোড', intro: 'অ্যাডমিন সাইন ইন শেষ করতে এই কোড ব্যবহার করুন:', ttl: '১০ মিনিট' },
  },
  zh: {
    signup: { subject: '验证你的 BattleAsia 邮箱', intro: '使用此验证码完成 BattleAsia 账户验证：', ttl: '15 分钟' },
    reset: { subject: 'BattleAsia 密码重置验证码', intro: '使用此验证码重置密码：', ttl: '15 分钟' },
    admin_login: { subject: 'BattleAsia 管理员登录验证码', intro: '使用此验证码完成管理员登录：', ttl: '10 分钟' },
  },
  hi: {
    signup: { subject: 'BattleAsia ईमेल वेरिफाई करें', intro: 'अकाउंट वेरिफाई करने के लिए यह कोड इस्तेमाल करें:', ttl: '15 मिनट' },
    reset: { subject: 'BattleAsia पासवर्ड रीसेट कोड', intro: 'पासवर्ड रीसेट करने के लिए यह कोड इस्तेमाल करें:', ttl: '15 मिनट' },
    admin_login: { subject: 'BattleAsia एडमिन लॉगिन कोड', intro: 'एडमिन साइन इन पूरा करने के लिए यह कोड इस्तेमाल करें:', ttl: '10 मिनट' },
  },
  ur: {
    signup: { subject: 'BattleAsia ای میل تصدیق کریں', intro: 'اکاؤنٹ تصدیق کے لیے یہ کوڈ استعمال کریں:', ttl: '15 منٹ' },
    reset: { subject: 'BattleAsia پاس ورڈ ری سیٹ کوڈ', intro: 'پاس ورڈ ری سیٹ کے لیے یہ کوڈ استعمال کریں:', ttl: '15 منٹ' },
    admin_login: { subject: 'BattleAsia ایڈمن لاگ ان کوڈ', intro: 'ایڈمن سائن ان مکمل کرنے کے لیے یہ کوڈ استعمال کریں:', ttl: '10 منٹ' },
  },
};

const OPS: Record<MailLocale, Record<OpsMailKind, OpsCopy>> = {
  en: {
    deposit_approved: { subject: 'BattleAsia — Deposit approved', intro: 'Your BAC deposit was approved and credited.' },
    deposit_rejected: { subject: 'BattleAsia — Deposit rejected', intro: 'Your BAC deposit was rejected.' },
    withdraw_complete: { subject: 'BattleAsia — Withdrawal complete', intro: 'Your withdrawal was completed.' },
    withdraw_reject: { subject: 'BattleAsia — Withdrawal rejected', intro: 'Your withdrawal was rejected.' },
    match_starting: { subject: 'BattleAsia — Match starting', intro: 'Your match is starting. Open the room now.' },
  },
  bn: {
    deposit_approved: { subject: 'BattleAsia — ডিপোজিট অ্যাপ্রুভড', intro: 'আপনার BAC ডিপোজিট অ্যাপ্রুভ ও ক্রেডিট হয়েছে।' },
    deposit_rejected: { subject: 'BattleAsia — ডিপোজিট রিজেক্ট', intro: 'আপনার BAC ডিপোজিট রিজেক্ট হয়েছে।' },
    withdraw_complete: { subject: 'BattleAsia — উইথড্র সম্পন্ন', intro: 'আপনার উইথড্র সম্পন্ন হয়েছে।' },
    withdraw_reject: { subject: 'BattleAsia — উইথড্র রিজেক্ট', intro: 'আপনার উইথড্র রিজেক্ট হয়েছে।' },
    match_starting: { subject: 'BattleAsia — ম্যাচ শুরু', intro: 'আপনার ম্যাচ শুরু হচ্ছে। এখন রুম খুলুন।' },
  },
  zh: {
    deposit_approved: { subject: 'BattleAsia — 充值已通过', intro: '你的 BAC 充值已通过并到账。' },
    deposit_rejected: { subject: 'BattleAsia — 充值被拒绝', intro: '你的 BAC 充值被拒绝。' },
    withdraw_complete: { subject: 'BattleAsia — 提现完成', intro: '你的提现已完成。' },
    withdraw_reject: { subject: 'BattleAsia — 提现被拒绝', intro: '你的提现被拒绝。' },
    match_starting: { subject: 'BattleAsia — 比赛即将开始', intro: '比赛即将开始。请立即打开房间。' },
  },
  hi: {
    deposit_approved: { subject: 'BattleAsia — डिपॉजिट अप्रूव्ड', intro: 'आपका BAC डिपॉजिट अप्रूव होकर क्रेडिट हो गया।' },
    deposit_rejected: { subject: 'BattleAsia — डिपॉजिट रिजेक्ट', intro: 'आपका BAC डिपॉजिट रिजेक्ट हुआ।' },
    withdraw_complete: { subject: 'BattleAsia — विड्रॉ पूरा', intro: 'आपका विड्रॉ पूरा हो गया।' },
    withdraw_reject: { subject: 'BattleAsia — विड्रॉ रिजेक्ट', intro: 'आपका विड्रॉ रिजेक्ट हुआ।' },
    match_starting: { subject: 'BattleAsia — मैच शुरू', intro: 'आपका मैच शुरू हो रहा है। अभी रूम खोलें।' },
  },
  ur: {
    deposit_approved: { subject: 'BattleAsia — ڈپازٹ منظور', intro: 'آپ کا BAC ڈپازٹ منظور ہو کر کریڈٹ ہو گیا۔' },
    deposit_rejected: { subject: 'BattleAsia — ڈپازٹ مسترد', intro: 'آپ کا BAC ڈپازٹ مسترد ہو گیا۔' },
    withdraw_complete: { subject: 'BattleAsia — ودڈرا مکمل', intro: 'آپ کا ودڈرا مکمل ہو گیا۔' },
    withdraw_reject: { subject: 'BattleAsia — ودڈرا مسترد', intro: 'آپ کا ودڈرا مسترد ہو گیا۔' },
    match_starting: { subject: 'BattleAsia — میچ شروع', intro: 'آپ کا میچ شروع ہو رہا ہے۔ اب روم کھولیں۔' },
  },
};

const FOOT: Record<MailLocale, string> = {
  en: 'support@battleasia.gg · If you did not request this, ignore the email.',
  bn: 'support@battleasia.gg · আপনি না চেয়ে থাকলে এই মেইল ইগনোর করুন।',
  zh: 'support@battleasia.gg · 如非本人操作，请忽略此邮件。',
  hi: 'support@battleasia.gg · आपने यह नहीं माँगा तो ईमेल अनदेखा करें।',
  ur: 'support@battleasia.gg · اگر آپ نے یہ نہیں مانگا تو ای میل نظر انداز کریں۔',
};

const EXPIRES: Record<MailLocale, string> = {
  en: 'Expires in',
  bn: 'মেয়াদ',
  zh: '有效期',
  hi: 'समय सीमा',
  ur: 'میعاد',
};

export function pickMailLocale(raw?: string | string[] | null): MailLocale {
  const value = Array.isArray(raw) ? raw[0] : raw || '';
  const id = value.toLowerCase().split(',')[0].trim().slice(0, 2);
  if (id === 'bn' || id === 'zh' || id === 'hi' || id === 'ur') return id;
  return 'en';
}

export function authMailCopy(locale: MailLocale, type: AuthMailType) {
  return AUTH[locale][type];
}

export function opsMailCopy(locale: MailLocale, kind: OpsMailKind) {
  return OPS[locale][kind];
}

export function mailFoot(locale: MailLocale) {
  return FOOT[locale];
}

export function mailExpiresLabel(locale: MailLocale) {
  return EXPIRES[locale];
}
