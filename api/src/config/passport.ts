import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

// 配置 Google OAuth 策略
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleCallbackURL = process.env.NODE_ENV === 'production'
  ? process.env.GOOGLE_CALLBACK_URL
  : process.env.GOOGLE_CALLBACK_URL_DEV;

if (!googleClientId || !googleClientSecret || !googleCallbackURL) {
  console.warn('⚠️  Google OAuth 配置缺失，Google 登录功能将不可用');
} else {
  console.log('✅ Google OAuth 配置已加载');
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: googleCallbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          // 查找或创建用户
          let user = await User.findOne({ googleId: profile.id });

          if (!user) {
            // 检查是否已存在相同邮箱的用户
            user = await User.findOne({ email });
            
            if (user) {
              // 更新现有用户的 googleId
              user.googleId = profile.id;
              user.avatar = profile.photos?.[0]?.value || user.avatar;
              user.lastLoginAt = new Date();
              await user.save();
            } else {
              // 创建新用户
              user = await User.create({
                email,
                name: profile.displayName || 'User',
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
                vipLevel: 0,
                credits: 10, // 新用户赠送 10 点数
                totalCredits: 10,
                lastLoginAt: new Date()
              });
            }
          } else {
            // 更新最后登录时间
            user.lastLoginAt = new Date();
            await user.save();
          }

          done(null, user);
        } catch (error) {
          done(error as Error);
        }
      }
    )
  );
}

export default passport;
