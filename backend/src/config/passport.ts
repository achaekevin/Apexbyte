import passport from 'passport';
import {
  Strategy as GoogleStrategy,
  Profile as GoogleProfile,
} from 'passport-google-oauth20';
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from 'passport-github2';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import prisma from './database';
import logger from './logger';

// JWT Strategy
const jwtOptions: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!,
};

passport.use(
  new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GoogleProfile,
        done: any
      ) => {
        try {
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails?.[0].value },
                { providerId: profile.id, provider: 'GOOGLE' },
              ],
            },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0].value!,
                firstName: profile.name?.givenName || 'User',
                lastName: profile.name?.familyName || '',
                avatar: profile.photos?.[0].value,
                provider: 'GOOGLE',
                providerId: profile.id,
                isVerified: true,
              },
            });
          } else if (!user.providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'GOOGLE',
                providerId: profile.id,
                isVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: GitHubProfile,
        done: any
      ) => {
        try {
          let user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: profile.emails?.[0].value },
                { providerId: profile.id, provider: 'GITHUB' },
              ],
            },
          });

          if (!user) {
            const nameParts = profile.displayName?.split(' ') || ['User'];
            user = await prisma.user.create({
              data: {
                email: profile.emails?.[0].value!,
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                avatar: profile.photos?.[0].value,
                provider: 'GITHUB',
                providerId: profile.id,
                isVerified: true,
              },
            });
          } else if (!user.providerId) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                provider: 'GITHUB',
                providerId: profile.id,
                isVerified: true,
              },
            });
          }

          return done(null, user);
        } catch (error) {
          logger.error('GitHub OAuth error:', error);
          return done(error, false);
        }
      }
    )
  );
}

export default passport;
