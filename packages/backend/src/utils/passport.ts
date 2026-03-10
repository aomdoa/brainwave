/**
 * @copyright 2026 David Shurgold <aomdoa@gmail.com>
 */
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { prisma } from '../utils/prisma'
import { config } from './config'
import logger from './logger'
import { OAuthProvider } from '@prisma/client'

const serviceLog = logger.child({ file: 'passport.ts' })

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: config.GOOGLE_CALLBACK_URL,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id
        const email = profile.emails?.[0]?.value
        const name = profile.displayName

        if (!email) {
          serviceLog.warn(`Received invalid email for googled id ${googleId}`)
          return done(new Error('Invalid email or password'))
        }

        const oauth = await prisma.userOAuth.findUnique({
          where: {
            provider_providerUserId: {
              provider: OAuthProvider.GOOGLE,
              providerUserId: googleId,
            },
          },
          include: { user: true },
        })

        if (oauth) {
          // existing user so return
          return done(null, oauth.user)
        }

        // create the user if needed
        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({ data: { email, name } })
        }

        await prisma.userOAuth.create({
          data: { userId: user.userId, provider: OAuthProvider.GOOGLE, providerUserId: googleId },
        })

        return done(null, user)
      } catch (err) {
        done(err)
      }
    }
  )
)

export default passport
